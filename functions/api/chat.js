const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_PAYLOAD_BYTES = 8000;
const MAX_MESSAGE_CHARS = 1200;
const MAX_HISTORY_MESSAGES = 8;

function buildHeaders(origin) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(origin),
  });
}

function limitHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && typeof entry.content === "string" && typeof entry.role === "string")
    .filter((entry) => ["user", "assistant", "system"].includes(entry.role))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, MAX_MESSAGE_CHARS),
    }));
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "";
  const corsOrigin = allowedOrigin || origin || "*";

  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return jsonResponse({ error: "forbidden_origin" }, 403, allowedOrigin);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildHeaders(corsOrigin) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, corsOrigin);
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: "missing_openai_api_key" }, 500, corsOrigin);
  }

  const contentLength = parseInt(request.headers.get("Content-Length") || "0", 10);
  if (contentLength && contentLength > MAX_PAYLOAD_BYTES) {
    return jsonResponse({ error: "payload_too_large" }, 413, corsOrigin);
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (_) {
    return jsonResponse({ error: "invalid_body" }, 400, corsOrigin);
  }

  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return jsonResponse({ error: "payload_too_large" }, 413, corsOrigin);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch (_) {
    return jsonResponse({ error: "invalid_json" }, 400, corsOrigin);
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    return jsonResponse({ error: "message_required" }, 400, corsOrigin);
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    return jsonResponse({ error: "message_too_long" }, 400, corsOrigin);
  }

  const history = limitHistory(payload.history);

  const systemPrompt =
    "Du bist LuderBot, ein freundlicher Assistent für Luderbein. Antworte kurz, klar und hilfreich. " +
    "Antworte IMMER als JSON-Objekt mit dem Schlüssel 'reply' (String) und optional 'suggestion' (Objekt mit 'text'). " +
    "Nutze 'suggestion.text' nur, wenn ein konkreter Text für WhatsApp oder E-Mail sinnvoll ist.";

  const model = (env.OPENAI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

  let openAiResponse;
  try {
    openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });
  } catch (_) {
    return jsonResponse({ error: "openai_unreachable" }, 502, corsOrigin);
  }

  if (!openAiResponse.ok) {
    return jsonResponse({ error: "openai_error", status: openAiResponse.status }, 502, corsOrigin);
  }

  let data;
  try {
    data = await openAiResponse.json();
  } catch (_) {
    return jsonResponse({ error: "openai_invalid_response" }, 502, corsOrigin);
  }

  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return jsonResponse({ error: "empty_response" }, 502, corsOrigin);
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    return jsonResponse({ reply: content }, 200, corsOrigin);
  }

  const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
  const suggestionText = parsed?.suggestion?.text;
  const suggestion = typeof suggestionText === "string" && suggestionText.trim()
    ? { text: suggestionText.trim() }
    : undefined;

  if (!reply) {
    return jsonResponse({ reply: content }, 200, corsOrigin);
  }

  return jsonResponse({ reply, ...(suggestion ? { suggestion } : {}) }, 200, corsOrigin);
}
