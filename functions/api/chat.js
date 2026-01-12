DATEI: /functions/api/chat.js

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.AI) {
      return json(
        {
          ok: false,
          error: "missing_workers_ai_binding",
          hint:
            "Cloudflare Pages → Einstellungen → Bindungen: Workers AI hinzufügen und als Variablenname exakt 'AI' setzen (für die passende Umgebung: Produktion/Vorschau).",
        },
        500
      );
    }

    const body = await safeJson(request);
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    const userMsgs = incoming
      .filter((m) => m && typeof m === "object" && typeof m.content === "string")
      .map((m) => ({
        role: normalizeRole(m.role),
        content: String(m.content).slice(0, 2000),
      }))
      .slice(-12);

    if (userMsgs.length === 0) {
      return json(
        {
          ok: false,
          error: "bad_request",
          hint: "Body muss JSON mit { messages: [{role, content}, ...] } sein.",
        },
        400
      );
    }

    const system = {
      role: "system",
      content:
        "Du bist 'LuderBot' von Luderbein (Gravur/Werkstatt). Ton: frech, unangepasst, provozierend – aber professionell, elegant, liebevoll. " +
        "Hilf bei Materialwahl (Holz/Metall/Schiefer/Acryl/Glas), Motiven, Dateiformaten, Pflege/Versiegelung, Lieferzeit, grober Preiseinschätzung. " +
        "Wenn Infos fehlen: stelle 1–3 kurze Rückfragen. Keine Halluzinationen. Keine rechtlichen Versprechen. " +
        "Antworte kurz & klar. Wenn passend: schlage am Ende eine WhatsApp- oder Mail-Anfrageformulierung vor.",
    };

    // Model: wenn OPENAI_MODEL auf ein @cf/... gesetzt ist, nutzen wir das; sonst Default.
    const model =
      typeof env.OPENAI_MODEL === "string" && env.OPENAI_MODEL.startsWith("@cf/")
        ? env.OPENAI_MODEL
        : "@cf/meta/llama-3.1-8b-instruct";

    const messages = [system, ...userMsgs];

    const result = await env.AI.run(model, { messages });

    const reply =
      typeof result === "string"
        ? result
        : typeof result?.response === "string"
        ? result.response
        : typeof result?.result === "string"
        ? result.result
        : typeof result?.text === "string"
        ? result.text
        : JSON.stringify(result);

    return json({
      ok: true,
      provider: "cloudflare_workers_ai",
      model,
      reply,
      // extra Keys, damit dein Frontend ziemlich sicher was findet:
      content: reply,
      message: reply,
      text: reply,
    });
  } catch (err) {
    return json(
      {
        ok: false,
        error: "server_error",
        details: String(err?.message || err),
      },
      500
    );
  }
}

function normalizeRole(role) {
  const r = String(role || "").toLowerCase();
  if (r === "assistant" || r === "system" || r === "user") return r;
  return "user";
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: corsHeaders(),
  });
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
