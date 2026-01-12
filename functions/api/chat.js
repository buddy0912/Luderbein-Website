export async function onRequest(context) {
  const { request, env } = context;

  // CORS (für gleiche Domain reicht das; offen ist ok, weil nur POST)
  const cors = {
    "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors,
    });
  }

  // Workers AI Binding vorhanden?
  if (!env?.AI || typeof env.AI.run !== "function") {
    return new Response(
      JSON.stringify({
        error: "missing_workers_ai_binding",
        hint:
          "Cloudflare Pages → Einstellungen → Bindungen: Workers AI hinzufügen und Variablenname exakt 'AI' setzen (Produktion + Vorschau).",
      }),
      { status: 500, headers: cors }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_json" }), {
      status: 400,
      headers: cors,
    });
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter((m) => m && typeof m.content === "string")
    .map((m) => ({
      role: ["user", "assistant"].includes(String(m.role)) ? String(m.role) : "user",
      content: String(m.content).slice(0, 1500),
    }))
    .slice(-12);

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "no_messages" }), {
      status: 400,
      headers: cors,
    });
  }

  const system = {
    role: "system",
    content:
      "Du bist „LuderBot“ von Luderbein (Gravur/Werkstatt). Ton: frech, unangepasst, provozierend – aber professionell, elegant, liebevoll. " +
      "Ziel: Besucher schnell zu einer sauberen Anfrage führen. " +
      "Erfinde keine Preise/Lieferzeiten. Wenn Infos fehlen: max 1 kurze Rückfrage. " +
      "Wenn genug Infos da sind: kurze Zusammenfassung + Vorschlag für WhatsApp/Mail-Text.",
  };

  const model = "@cf/meta/llama-3.1-8b-instruct";

  try {
    const result = await env.AI.run(model, {
      messages: [system, ...messages],
      temperature: 0.4,
      max_tokens: 450,
    });

    const reply =
      typeof result?.response === "string"
        ? result.response
        : typeof result === "string"
        ? result
        : JSON.stringify(result);

    return new Response(JSON.stringify({ reply }), { status: 200, headers: cors });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "ai_error", detail: String(e?.message || e) }),
      { status: 502, headers: cors }
    );
  }
}
