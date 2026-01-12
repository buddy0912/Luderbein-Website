// Cloudflare Pages Function: /api/chat (Workers AI)
// Voraussetzung: Cloudflare Pages → Einstellungen → Bindungen → Workers AI mit Binding-Name "AI"

const MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_BODY_CHARS = 12000;
const MAX_MESSAGES = 14;
const MAX_CONTENT_CHARS = 1200;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function clampMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .slice(-MAX_MESSAGES)
    .map((m) => {
      const role = (m && m.role) || "user";
      const content = String((m && m.content) || "").slice(0, MAX_CONTENT_CHARS);
      if (!content.trim()) return null;
      if (!["user", "assistant"].includes(role)) return null;
      return { role, content };
    })
    .filter(Boolean);
}

function systemPrompt() {
  return [
    "Du bist „LuderBot“, der Website-Chat von Luderbein (Gravur/Laser).",
    "Ton: frech, unangepasst – aber professionell, elegant, liebevoll.",
    "Ziel: Besucher schnell zu einer klaren Anfrage führen.",
    "Regeln:",
    "- Erfinde KEINE Preise/Lieferzeiten/technische Grenzen. Wenn unklar: sag es & frag kurz nach (max 1 Frage).",
    "- Keine sensiblen Daten erfragen.",
    "",
    "Antworte ausschließlich als gültiges JSON:",
    '{ "reply": "Text", "suggestion": { "subject": "...", "mailBody": "...", "whatsappText": "..." } }',
    "suggestion nur ausgeben, wenn genug Infos da sind.",
  ].join("\n");
}

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, cors);
  }

  // Body lesen
  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return json({ error: "Body konnte nicht gelesen werden." }, 400, cors);
  }

  if (raw.length > MAX_BODY_CHARS) {
    return json({ error: "Payload zu groß." }, 413, cors);
  }

  const body = safeJsonParse(raw || "{}");
  if (!body || !Array.isArray(body.messages)) {
    return json({ error: "Bitte JSON senden: { messages: [...] }" }, 400, cors);
  }

  const msgs = clampMessages(body.
