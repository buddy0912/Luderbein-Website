const MAX_BODY_SIZE = 16 * 1024;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;

function jsonResponse(payload, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((msg) => msg && typeof msg === "object")
    .map((msg) => ({
      role: msg.role,
      content: typeof msg.content === "string" ? msg.content.trim() : "",
    }))
    .filter((msg) => ["user", "assistant"].includes(msg.role) && msg.content);
}

function parseSuggestion(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const whatsappText = typeof suggestion.whatsappText === "string" ? suggestion.whatsappText.trim() : "";
  const mailSubject = typeof suggestion.mailSubject === "string" ? suggestion.mailSubject.trim() : "";
  const mailBody = typeof suggestion.mailBody === "string" ? suggestion.mailBody.trim() : "";
  if (!whatsappText && !mailSubject && !mailBody) return null;
  return {
    ...(whatsappText ? { whatsappText } : null),
    ...(mailSubject ? { mailSubject } : null),
    ...(mailBody ? { mailBody } : null),
  };
}

export async function onRequest({ request, env }) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || origin || "*";

  if (env.ALLOWED_ORIGIN && origin && env.ALLOWED_ORIGIN !== origin) {
    return jsonResponse(
      { error: "Origin not allowed" },
      { status: 403, headers: corsHeaders(env.ALLOWED_ORIGIN) }
    );
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(allowedOrigin),
        "Cache-Control": "no-store",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders(allowedOrigin) }
    );
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse(
      { error: "Missing API key" },
      { status: 500, headers: corsHeaders(allowedOrigin) }
    );
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (_) {
    return jsonResponse(
      { error: "Invalid body" },
      { status: 400, headers: corsHeaders(allowedOrigin) }
    );
  }

  if (rawBody.length > MAX_BODY_SIZE) {
    return jsonResponse(
      { error: "Payload too large" },
      { status: 413, headers: corsHeaders(allowedOrigin) }
    );
  }

  let payload;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch (_) {
    return jsonResponse(
      { error: "Invalid JSON" },
      { status: 400, headers: corsHeaders(allowedOrigin) }
    );
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    return jsonResponse(
      { error: "Message required" },
      { status: 400, headers: corsHeaders(allowedOrigin) }
    );
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    return jsonResponse(
      { error: "Message too long" },
      { status: 400, headers: corsHeaders(allowedOrigin) }
    );
  }

  const history = sanitizeHistory(payload.history);
  if (history.length > MAX_MESSAGES) {
    return jsonResponse(
      { error: "Too many messages" },
      { status: 400, headers: corsHeaders(allowedOrigin) }
    );
  }

  const systemPrompt =
    "Du bist LuderBot, ein freundlicher KI-Assistent für Luderbein Gravur. " +
    "Antworte kurz, hilfreich und auf Deutsch. " +
    "Wenn die Person eine Anfrage oder Kontakt wünscht, liefere eine optionale suggestion. " +
    "Antworte ausschließlich als JSON-Objekt mit den Schlüsseln reply (string) und optional suggestion. " +
    "suggestion darf whatsappText, mailSubject und mailBody enthalten.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const model = env.OPENAI_MODEL || "gpt-4o-mini";

  let apiResponse;
  try {
    apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 500,
      }),
    });
  } catch (_) {
    return jsonResponse(
      { error: "Upstream request failed" },
      { status: 502, headers: corsHeaders(allowedOrigin) }
    );
  }

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    return jsonResponse(
      { error: "OpenAI error", detail: errorText.slice(0, 500) },
      { status: apiResponse.status, headers: corsHeaders(allowedOrigin) }
    );
  }

  let data;
  try {
    data = await apiResponse.json();
  } catch (_) {
    return jsonResponse(
      { error: "Invalid upstream response" },
      { status: 502, headers: corsHeaders(allowedOrigin) }
    );
  }

  const content = data?.choices?.[0]?.message?.content || "";
  let reply = content;
  let suggestion = null;

  if (content) {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
        suggestion = parseSuggestion(parsed.suggestion);
      }
    } catch (_) {
      reply = content.trim();
    }
  }

  if (!reply) {
    return jsonResponse(
      { error: "Empty response" },
      { status: 502, headers: corsHeaders(allowedOrigin) }
    );
  }

  const responsePayload = { reply };
  if (suggestion) responsePayload.suggestion = suggestion;

  return jsonResponse(responsePayload, { headers: corsHeaders(allowedOrigin) });
}
