// =========================================================
// Cloudflare Pages Function: /api/chat  (Workers AI only)
// Datei: /functions/api/chat.js
//
// Voraussetzung (Cloudflare Pages Projekt):
// - Einstellungen → Bindungen → Workers AI
// - Variablenname/Binding: AI
//
// Optional:
// - ALLOWED_ORIGIN (Text): eigene Domain, wenn du CORS hart machen willst.
//   Für pages.dev/Preview lieber leer lassen.
// =========================================================

const MAX_BODY_CHARS = 12000;
const MAX_MESSAGES = 16;
const MAX_CONTENT_CHARS = 1400;

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
  try { return JSON.parse(s); } catch { return null; }
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
    "Du bist „LuderBot“, der Website-Chat von Luderbein. Sprache: Deutsch.",
    "Stil: frech, direkt, aber professionell, elegant und hilfreich.",
    "",
    "SCOPE (WICHTIG): Du bist NUR für Luderbein + nahe Themen zuständig:",
    "- Individuelle Schwibbögen",
    "- Lampenbau/Leuchten (Werkstatt, Sonderanfertigung)",
    "- Lasergravur & Laserschnitt: Holz, Metall, Schiefer, Acryl, Glas",
    "- Custom / Sonderbau",
    "- 3D-Druck (wenn passend zum Projekt)",
    "- Tools: Kalkulator/Generator auf der Website",
    "",
    "OFF-TOPIC GUARD:",
    "Wenn jemand nach Politik, Geschichte (z.B. 30jähriger Krieg), Medizin, Jura, Promis, Random-Wissen fragt:",
    "-> Antworte kurz: Du bist auf Luderbein/Gravur/Laser spezialisiert und lenke zurück.",
    "",
    "FAKTEN:",
    "- Erkläre Gravur korrekt: Bei Luderbein hauptsächlich Lasergravur/Laserbearbeitung (kein Stempel/Schlagen).",
    "- Keine Preise/Lieferzeiten erfinden. Wenn unklar: sag das und frag nach.",
    "",
    "Ablauf pro Antwort:",
    "1) Kurz helfen/erklären.",
    "2) Max. 2 gezielte Rückfragen (Material/Produkt/Größe/Stückzahl/Motiv/Deadline).",
    "3) Wenn genug Infos: eine klare Empfehlung + nächster Schritt (Anfrage).",
    "",
    "Antwortformat (STRICT): Gib NUR gültiges JSON aus:",
    '{ "reply": "Text", "suggestion": { "subject": "...", "mailBody": "...", "whatsappText": "..." } }',
    "Wenn noch nicht genug Infos: suggestion weglassen oder nur minimal füllen.",
    "Am Ende von reply (wenn möglich) eine Zeile beginnen mit: ANFRAGE_DRAFT: ...",
  ].join("\n");
}

async function runWithFallbackModels(env, payload) {
  let lastErr = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      return await env.AI.run(model, payload);
    } catch (err) {
      lastErr = err;
      const msg = err?.message ? err.message : String(err);
      if (/model|not found|unknown/i.test(msg)) continue;
      throw err;
    }
  }
  throw lastErr || new Error("No Workers AI model available");
}

function inferSubjectFromText(text) {
  const t = (text || "").toLowerCase();
  const material =
    t.includes("schiefer") ? "Schiefer" :
    (t.includes("metall") || t.includes("edelstahl") || t.includes("alu")) ? "Metall" :
    t.includes("acryl") ? "Acryl" :
    t.includes("glas") ? "Glas" :
    t.includes("holz") ? "Holz" :
    (t.includes("lampe") || t.includes("leuchte")) ? "Lampenbau" :
    (t.includes("schwibbogen") || t.includes("schwibbögen")) ? "Schwibbogen" :
    (t.includes("3d") || t.includes("druck")) ? "3D-Druck" :
    "Luderbein";

  const item =
    t.includes("plakette") ? "Plakette" :
    t.includes("schlüssel") ? "Schlüsselanhänger" :
    t.includes("schild") ? "Schild" :
    t.includes("gedenk") ? "Gedenkstück" :
    t.includes("generator") || t.includes("kalkulator") ? "Kalkulator" :
    "Anfrage";

  return `Luderbein Anfrage – ${material} – ${item}`;
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

  if ((env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== env.ALLOWED_ORIGIN.trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, { ...cors });
    }
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    return json(
      {
        error: "missing_workers_ai_binding",
        detail: "Workers AI Binding fehlt. Cloudflare Pages → Einstellungen → Bindungen → Workers AI, Variablenname: AI"
      },
      500,
      { ...cors }
    );
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
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
      temperature: 0.35,
      max_tokens: 520
    });

    const text = String(result?.response || result?.result || result || "").trim();
    const parsed = safeJsonParse(text);

    if (parsed && typeof parsed === "object" && typeof parsed.reply === "string") {
      // Falls suggestion fehlt, minimal ergänzen
      if (!parsed.suggestion) {
        const convo = userMessages.map(m => `${m.role}: ${m.content}`).join("\n");
        parsed.suggestion = {
          subject: inferSubjectFromText(convo),
          mailBody: `Hi Luderbein,\n\nich möchte anfragen:\n\n${convo}\n\nViele Grüße`,
          whatsappText: `Hi! Kurze Anfrage:\n\n${convo}`
        };
      }
      return json(parsed, 200, { ...cors });
    }

    // Fallback wenn Modell kein JSON liefert
    const convo = userMessages.map(m => `${m.role}: ${m.content}`).join("\n");
    return json(
      {
        reply: text || "Kurz Blackout. Nochmal?",
        suggestion: {
          subject: inferSubjectFromText(convo),
          mailBody: `Hi Luderbein,\n\nich möchte anfragen:\n\n${convo}\n\nViele Grüße`,
          whatsappText: `Hi! Kurze Anfrage:\n\n${convo}`
        }
      },
      200,
      { ...cors }
    );
  } catch (err) {
    return json(
      { error: "workers_ai_error", detail: err?.message || String(err) },
      502,
      { ...cors }
    );
  }
}
