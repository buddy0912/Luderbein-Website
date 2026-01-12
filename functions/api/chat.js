// =========================================================
// Cloudflare Pages Function: /api/chat  (Workers AI)
// Datei: /functions/api/chat.js
//
// Voraussetzung (Cloudflare Pages Projekt):
// - Einstellungen → Bindungen → Hinzufügen → Workers AI
// - Variablenname: AI
//
// Kein OpenAI Key nötig.
// Optional: ALLOWED_ORIGIN (nur für eigene Domain; pages.dev/Preview lieber leer lassen)
// =========================================================

const MAX_BODY_CHARS = 12000;
const MAX_MESSAGES = 14;
const MAX_CONTENT_CHARS = 1200;

// Wir probieren mehrere Modelle (falls eins in deinem Account/Region nicht verfügbar ist)
const MODEL_CANDIDATES = [
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/meta/llama-3-8b-instruct",
  "@cf/meta/llama-2-7b-chat-int8"
];

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

  // Wenn ALLOWED_ORIGIN gesetzt: nur exakt dieser Origin.
  // Wenn nicht gesetzt: Origin dynamisch erlauben (praktisch für Preview).
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

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (_) {
    return null;
  }
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
    "",
    "Regeln:",
    "- Erfinde KEINE Preise/Lieferzeiten/technische Limits. Wenn unsicher: sag es und stell genau 1 Rückfrage.",
    "- Keine sensiblen Daten erfragen (Adresse, Zahlungsdaten etc.).",
    "",
    "Produktfokus: Schlüsselanhänger (Holz/Metall), Geschenksets (4mm Pappel-Box), Schiefer (Foto + Text/Symbole).",
    "",
    "Antworte als gültiges JSON:",
    '{ "reply": "Text", "suggestion": { "subject": "...", "mailBody": "...", "whatsappText": "..." } }',
    "„suggestion“ nur ausgeben, wenn genug Infos da sind."
  ].join("\n");
}

async function runWithFallbackModels(env, payload) {
  let lastErr = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      return await env.AI.run(model, payload);
    } catch (err) {
      lastErr = err;
      const msg = (err && err.message) ? err.message : String(err);
      // Wenn Modell nicht existiert/gesperrt: nächstes versuchen
      if (/model|not found|unknown/i.test(msg)) continue;
      // Sonst: echter Fehler → raus
      throw err;
    }
  }
  throw lastErr || new Error("No Workers AI model available");
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

  // Wenn ALLOWED_ORIGIN gesetzt ist und nicht passt → blocken
  if ((env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== env.ALLOWED_ORIGIN.trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, { ...cors });
    }
  }

  // Workers AI Binding vorhanden?
  if (!env.AI || typeof env.AI.run !== "function") {
    return json(
      {
        error: "missing_workers_ai_binding",
        detail:
          "Workers AI Binding fehlt. Cloudflare Pages: Einstellungen → Bindungen → Hinzufügen → Workers AI, Variablenname: AI"
      },
      500,
      { ...cors }
    );
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

  const messages = [{ role: "system", content: buildSystemPrompt() }, ...userMessages];

  try {
    const result = await runWithFallbackModels(env, {
      messages,
      temperature: 0.4,
      max_tokens: 450
    });

    const text = String(result?.response || result?.result || result || "").trim();
    const parsed = safeJsonParse(text);

    if (parsed && typeof parsed === "object" && typeof parsed.reply === "string") {
      return json(parsed, 200, { ...cors });
    }

    // Fallback, falls Modell kein JSON liefert
    return json({ reply: text || "Kurz Blackout. Nochmal?" }, 200, { ...cors });
  } catch (err) {
    return json(
      { error: "workers_ai_error", detail: err?.message || String(err) },
      502,
      { ...cors }
    );
  }
}
