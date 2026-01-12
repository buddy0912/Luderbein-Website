// DATEI: /functions/api/chat.js
// Cloudflare Pages Function: POST /api/chat
// Uses Workers AI binding: env.AI (Dashboard Binding Name: "AI")

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function pickUserMessages(body) {
  // Accept multiple shapes to be robust against frontend variants
  // 1) { messages: [{role, content}, ...] }
  // 2) { message: "..." }
  // 3) { text: "..." }
  if (body && Array.isArray(body.messages)) {
    const cleaned = body.messages
      .filter((m) => m && typeof m.content === "string")
      .map((m) => {
        const role =
          m.role === "assistant" || m.role === "system" ? m.role : "user";
        return { role, content: String(m.content) };
      });
    if (cleaned.length) return cleaned;
  }

  const single =
    (body && typeof body.message === "string" && body.message) ||
    (body && typeof body.text === "string" && body.text) ||
    null;

  if (single) return [{ role: "user", content: single }];
  return null;
}

export async function onRequest({ request, env }) {
  const cors = corsHeaders(request);

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // Only POST
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, cors);
  }

  // Ensure Workers AI binding exists
  if (!env || !env.AI || typeof env.AI.run !== "function") {
    return json(
      { error: "workers_ai_not_bound", hint: 'Add Pages Binding: Workers AI, Name "AI".' },
      500,
      cors
    );
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_json" }, 400, cors);
  }

  const incoming = pickUserMessages(body);
  if (!incoming) {
    return json({ error: "missing_message" }, 400, cors);
  }

  // System prompt (optional via env var)
  const systemPrompt =
    (env.AI_SYSTEM_PROMPT && String(env.AI_SYSTEM_PROMPT)) ||
    [
      "Du bist „LuderBot“ von Luderbein (Gravur/Werkstatt).",
      "Stil: frech, unangepasst, aber professionell und hilfreich.",
      "Kurz & klar antworten. Wenn Infos fehlen: gezielt 1–2 Rückfragen.",
      "Keine falschen Versprechen, keine Preise erfinden.",
      "Ziel: Nutzer zur sauberen Anfrage führen (Material, Motiv, Größe, Stückzahl, Deadline).",
    ].join(" ");

  // Keep context small & safe
  const messages = [{ role: "system", content: systemPrompt }, ...incoming].slice(-20);

  const model = (env.AI_MODEL && String(env.AI_MODEL)) || DEFAULT_MODEL;

  try {
    const out = await env.AI.run(model, {
      messages,
      temperature: 0.6,
      max_tokens: 450,
    });

    // Cloudflare models usually return { response: "..." }, but we accept variants.
    const reply =
      out?.response ||
      out?.result?.response ||
      out?.choices?.[0]?.message?.content ||
      out?.output?.[0]?.text ||
      "";

    if (!reply) {
      return json({ error: "empty_response", raw: out }, 502, cors);
    }

    // Return multiple common shapes so your frontend almost certainly understands it.
    return json(
      {
        reply,
        message: reply,
        choices: [{ message: { role: "assistant", content: reply } }],
        model,
      },
      200,
      cors
    );
  } catch (err) {
    const status = err?.status || err?.statusCode || 500;
    const msg = err?.message ? String(err.message) : String(err);

    // If Cloudflare rate-limits you, keep 429 so you can show a friendly UI message.
    const http = status === 429 ? 429 : 500;

    return json(
      { error: "workers_ai_error", status: http, message: msg },
      http,
      cors
    );
  }
}
