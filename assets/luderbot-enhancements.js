// /assets/luderbot-enhancements.js
// Verbesserungen für LuderBot: Consent-Text, Share-Buttons, API-Payload-Fix

(() => {
  "use strict";

  const WHATSAPP_NUMBER = "491725925858";
  const CONTACT_EMAIL = "luderbein_gravur@icloud.com";
  const TRANSCRIPT_KEY = "luderbot_transcript_v2";
  const SUGGESTION_KEY = "luderbot_suggestion_v1";
  const CONSENT_TEXT =
    "Ich stimme zu, dass meine Nachricht an Cloudflare Workers AI übermittelt wird.";

  function safeJsonParse(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  function loadTranscript() {
    const raw = localStorage.getItem(TRANSCRIPT_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    if (parsed && Array.isArray(parsed.messages)) return parsed;
    return { messages: [] };
  }

  function saveTranscript(t) {
    localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(t));
  }

  function loadSuggestion() {
    const raw = localStorage.getItem(SUGGESTION_KEY);
    return raw ? safeJsonParse(raw) : null;
  }

  function saveSuggestion(suggestion) {
    if (suggestion) {
      localStorage.setItem(SUGGESTION_KEY, JSON.stringify(suggestion));
    }
  }

  function trimMessages(msgs, max = 30) {
    if (!Array.isArray(msgs)) return [];
    return msgs
      .map((m) => ({
        role: m?.role,
        content: typeof m?.content === "string" ? m.content.trim() : ""
      }))
      .filter((m) => m.content)
      .slice(-max);
  }

  function transcriptToText(messages) {
    const lines = [];
    for (const m of messages || []) {
      if (!m?.content) continue;
      const role =
        m.role === "assistant" ? "LuderBot" : m.role === "user" ? "Du" : "System";
      if (role === "System") continue;
      lines.push(`${role}: ${String(m.content).trim()}`);
    }
    return lines.join("\n");
  }

  function inferSubject(messagesText) {
    const t = (messagesText || "").toLowerCase();
    const material =
      t.includes("schiefer") ? "Schiefer" :
      (t.includes("metall") || t.includes("edelstahl") || t.includes("alu")) ? "Metall" :
      t.includes("acryl") ? "Acryl" :
      t.includes("glas") ? "Glas" :
      t.includes("holz") ? "Holz" :
      (t.includes("3d") || t.includes("druck")) ? "3D-Druck" :
      (t.includes("lampe") || t.includes("lampen")) ? "Lampenbau" :
      (t.includes("schwibbogen") || t.includes("schwibbögen")) ? "Schwibbogen" :
      "Luderbein";

    const item =
      t.includes("plakette") ? "Plakette" :
      t.includes("schlüssel") ? "Schlüsselanhänger" :
      t.includes("schild") ? "Schild" :
      t.includes("gedenk") ? "Gedenkstück" :
      t.includes("box") ? "Box" :
      t.includes("generator") || t.includes("kalkulator") ? "Kalkulator" :
      "Anfrage";

    return `Luderbein Anfrage – ${material} – ${item}`;
  }

  function openWhatsApp(text) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.location.href = url;
  }

  function openMail(subject, body) {
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function setConsentText() {
    const labels = Array.from(document.querySelectorAll(".lb-chat-consent"));
    for (const node of labels) {
      if ((node.textContent || "").includes("übermittelt")) {
        node.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            child.textContent = ` ${CONSENT_TEXT}`;
          }
        });
      }
    }
  }

  function findShareButtons() {
    const waBtn = document.querySelector("[data-action=\"wa\"]");
    const mailBtn = document.querySelector("[data-action=\"mail\"]");
    return { waBtn, mailBtn };
  }

  function resolveSuggestionPayload() {
    const stored = loadSuggestion();
    if (stored && (stored.whatsappText || stored.mailBody)) return stored;
    const transcript = loadTranscript();
    const chatText = transcriptToText(transcript.messages);
    return {
      subject: inferSubject(chatText),
      mailBody: chatText,
      whatsappText: chatText
    };
  }

  async function handleShare(mode) {
    const suggestion = resolveSuggestionPayload();
    const chatText = suggestion.mailBody || suggestion.whatsappText || "";
    const preface =
      "Hi! Ich war gerade auf luderbein-gravur.pages.dev und möchte anfragen.\n" +
      "(Text automatisch aus LuderBot)\n\n";
    const payload = preface + (chatText || "— (noch keine Chat-Historie gefunden) —");
    const subject = suggestion.subject || inferSubject(payload);
    await copyToClipboard(payload);

    if (mode === "wa") openWhatsApp(payload);
    else openMail(subject, payload);
  }

  function wireShareButtons() {
    const { waBtn, mailBtn } = findShareButtons();
    if (!waBtn || !mailBtn) return;

    const onClick = (mode) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleShare(mode);
    };

    waBtn.addEventListener("click", onClick("wa"), { passive: false });
    mailBtn.addEventListener("click", onClick("mail"), { passive: false });
  }

  function installFetchShim() {
    if (!window.fetch || window.__luderbotEnhancementsInstalled) return;
    window.__luderbotEnhancementsInstalled = true;

    const origFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
      try {
        const url = typeof input === "string" ? input : input?.url || "";
        const isChat = url.includes("/api/chat");
        if (isChat && (init?.method || "GET").toUpperCase() === "POST") {
          const raw = typeof init.body === "string" ? init.body : "";
          const data = raw ? safeJsonParse(raw) : null;
          if (data && Array.isArray(data.messages)) {
            const transcript = loadTranscript();
            transcript.messages = trimMessages(data.messages, 40);
            saveTranscript(transcript);
          }
        }
      } catch {
        // ignore
      }

      const response = await origFetch(input, init);
      try {
        const url = typeof input === "string" ? input : input?.url || "";
        if (url.includes("/api/chat")) {
          const cloned = response.clone();
          const data = await cloned.json().catch(() => null);
          if (data?.suggestion) saveSuggestion(data.suggestion);
        }
      } catch {
        // ignore
      }
      return response;
    };
  }

  function boot() {
    installFetchShim();
    setConsentText();
    wireShareButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
