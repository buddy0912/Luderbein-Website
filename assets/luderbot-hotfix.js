// /assets/luderbot-hotfix.js
// Hotfix: Consent-Text auf Cloudflare Workers AI setzen, Share-Buttons verdrahten,
// und Chat-Historie für WhatsApp/Mail nutzen.

(() => {
  "use strict";

  const WHATSAPP_NUMBER = "491725925858";
  const CONTACT_EMAIL = "luderbein_gravur@icloud.com";
  const STORAGE_KEY = "luderbot_transcript_v1";

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function loadTranscript() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    if (parsed && Array.isArray(parsed.messages)) return parsed;
    return { messages: [] };
  }

  function saveTranscript(t) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  }

  function trimMessages(msgs, max = 30) {
    if (!Array.isArray(msgs)) return [];
    const filtered = msgs.filter(m => m && typeof m.content === "string" && m.content.trim());
    return filtered.slice(-max);
  }

  function transcriptToText(messages) {
    const lines = [];
    for (const m of messages || []) {
      if (!m?.content) continue;
      const role = m.role === "assistant" ? "LuderBot" : (m.role === "user" ? "Du" : "System");
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
    const all = Array.from(document.querySelectorAll("label, span, p, div"));
    const node = all.find(n => (n.textContent || "").includes("übermittelt wird"));
    if (node) {
      node.textContent = "Ich stimme zu, dass meine Nachricht zur Verarbeitung an Cloudflare Workers AI übermittelt wird.";
      return true;
    }
    return false;
  }

  function findButtonByText(txt) {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns.find(b => (b.textContent || "").trim() === txt) || null;
  }

  function wireShareButtons() {
    const waBtn = findButtonByText("WhatsApp übernehmen");
    const mailBtn = findButtonByText("Mail übernehmen");
    if (!waBtn || !mailBtn) return false;

    waBtn.type = "button";
    mailBtn.type = "button";

    const handler = async (mode) => {
      const t = loadTranscript();
      const chatText = transcriptToText(t.messages);
      const subject = inferSubject(chatText);

      const preface =
        `Hi! Ich war gerade auf luderbein-gravur.pages.dev und möchte anfragen.\n` +
        `(Text automatisch aus LuderBot)\n\n`;

      const payload = preface + (chatText || "— (noch keine Chat-Historie gefunden) —");
      const copied = await copyToClipboard(payload);

      const btn = mode === "wa" ? waBtn : mailBtn;
      const old = btn.textContent;
      btn.textContent = copied ? "Kopiert ✓" : "Öffne…";
      setTimeout(() => { btn.textContent = old; }, 1200);

      if (mode === "wa") openWhatsApp(payload);
      else openMail(subject, payload);
    };

    waBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      handler("wa");
    }, { passive: false });

    mailBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      handler("mail");
    }, { passive: false });

    return true;
  }

  function installFetchShim() {
    if (!window.fetch || window.__luderbotFetchShimInstalled) return;
    window.__luderbotFetchShimInstalled = true;

    const origFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
      try {
        const url = typeof input === "string" ? input : (input && input.url) ? input.url : "";
        const isChat = url.includes("/api/chat");

        if (isChat && (init?.method || "GET").toUpperCase() === "POST" && typeof init.body === "string") {
          const data = safeJsonParse(init.body);
          if (data && Array.isArray(data.messages)) {
            const transcript = loadTranscript();
            transcript.messages = trimMessages(data.messages, 40);
            saveTranscript(transcript);
          }
        }
      } catch {
        // ignore
      }
      return origFetch(input, init);
    };
  }

  function boot() {
    installFetchShim();

    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      const ok1 = setConsentText();
      const ok2 = wireShareButtons();
      if ((ok1 && ok2) || tries > 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
