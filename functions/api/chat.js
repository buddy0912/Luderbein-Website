// =========================================================
// Cloudflare Pages Function: /api/chat  (Workers AI Version)
// Datei: /functions/api/chat.js
//
// Voraussetzung:
// - In Cloudflare Pages unter "Einstellungen → Bindungen" ein AI-Binding anlegen:
//   Name: AI
//
// Kein OpenAI Key nötig.
// =========================================================

const MAX_BODY_CHARS = 12000;
const MAX_MESSAGES = 14;
const MAX_CONTENT_CHARS = 1200;

// Workers AI Modell (klein & flott)
const CF_MODEL = "@cf/meta/llama-3.1-8b-instruct";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGIN || "").trim();

  if (allowed) {
    if (origin === allowed) {
      return {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
    }
    return {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    : {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
}

function clampMessages(messages) {
  if (!Array.isArray(messages)) return [];
  const sliced = messages.slice(-MAX_MESSAGES);

  return sliced
    .map((m) => {
      const role = (m && m.role) || "user";
      const content = String((m && m.content) || "").slice(0, MAX_CONTENT_CHARS);
      if (!content.trim()) return null;
      if (!["user", "assistant"].includes(role)) return null;
      return { role, content };
    })
    .filter(Boolean);
}

function buildSystemPrompt() {
  return [
    "Du bist „LuderBot“, der Website-Chat von Luderbein (urban/industrial, frech aber professionell).",
    "Ziel: Besucher in unter 1 Minute zu einer klaren Anfrage führen.",
    "Regeln:",
    "- Erfinde KEINE Preise/Lieferzeiten/technische Limits. Wenn unsicher: sag es & frag kurz nach.",
    "- Maximal 1 Rückfrage pro Antwort.",
    "- Keine sensiblen Daten erfragen. Wenn Nutzer sowas sendet: kurz warnen.",
    "",
    "Produktfokus: Schlüsselanhänger (Holz/Metall), Geschenksets (4mm Pappel-Box), Schiefer (Foto + Text/Symbole).",
    "",
    "Antworte ausschließlich als gültiges JSON im Format:",
    '{ "reply": "Text", "suggestion": { "subject": "...", "mailBody": "...", "whatsappText": "..." } }',
    "suggestion nur ausgeben, wenn genug Infos da sind."
  ].join("\n");
}

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch (_) { return null; }
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...cors } });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, { ...cors });
  }

  // ALLOWED_ORIGIN optional (Preview lieber leer lassen)
  if ((env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== env.ALLOWED_ORIGIN.trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, { ...cors });
    }
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch (_) {
    return json({ error: "Body konnte nicht gelesen werden." }, 400, { ...cors });
  }

  if (raw.length > MAX_BODY_CHARS) {
    return json({ error: "Payload zu groß." }, 413, { ...cors });
  }

  const body = safeJsonParse(raw || "{}");
  if (!body || !Array.isArray(body.messages)) {
    return json({ error: "Bitte JSON senden: { messages: [...] }" }, 400, { ...cors });
  }

  const userMessages = clampMessages(body.messages);
  if (userMessages.length === 0) {
    return json({ error: "Keine Nachrichten gefunden." }, 400, { ...cors });
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    return json(
      { error: "Workers AI Binding fehlt. In Cloudflare Pages unter Einstellungen → Bindungen AI=AI anlegen." },
      500,
      { ...cors }
    );
  }

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...userMessages
  ];

  try {
    const result = await env.AI.run(CF_MODEL, {
      messages,
      temperature: 0.4,
      max_tokens: 450
    });

    // Workers AI liefert meist { response: "..." }
    const text = String(result?.response || result?.result || result || "").trim();
    const parsed = safeJsonParse(text);

    if (parsed && typeof parsed === "object" && typeof parsed.reply === "string") {
      return json(parsed, 200, { ...cors });
    }

    // Fallback wenn Modell kein JSON liefert
    return json({ reply: text || "Ich hab kurz geschluckt. Nochmal?" }, 200, { ...cors });
  } catch (err) {
    return json(
      { error: "ai_error", detail: err?.message || String(err) },
      502,
      { ...cors }
    );
  }
}
