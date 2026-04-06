const MAX_BODY_CHARS = 12000;
const MAX_REASON_CHARS = 80;
const MAX_MESSAGE_CHARS = 1000;

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
        Vary: "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
    }
    return {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    : {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeMultilineText(value, maxLength) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, maxLength);
}

async function ensureSchema(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS preview_feedback_reports (
      id TEXT PRIMARY KEY,
      reason_key TEXT NOT NULL,
      reason_label TEXT NOT NULL,
      message TEXT,
      summary_json TEXT,
      page_path TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    )`
  ).run();

  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_preview_feedback_reports_created_at
     ON preview_feedback_reports(created_at DESC)`
  ).run();
}

async function handlePost(context, cors) {
  const { request, env } = context;
  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return json({ error: "Body konnte nicht gelesen werden." }, 400, cors);
  }

  if (!raw.trim()) {
    return json({ error: "Body fehlt." }, 400, cors);
  }

  if (raw.length > MAX_BODY_CHARS) {
    return json({ error: "Payload zu groß." }, 413, cors);
  }

  const body = safeJsonParse(raw);
  if (!body || typeof body !== "object") {
    return json({ error: "Ungültiges JSON." }, 400, cors);
  }

  const reasonKey = normalizeText(body.reasonKey, MAX_REASON_CHARS);
  const reasonLabel = normalizeText(body.reasonLabel, MAX_REASON_CHARS);
  const message = normalizeMultilineText(body.message, MAX_MESSAGE_CHARS);
  const pagePath = normalizeText(body.pagePath || "/tools/vorschau/", 160);
  const userAgent = normalizeText(request.headers.get("user-agent") || "", 400);
  const summaryJson = typeof body.summary === "object" && body.summary
    ? JSON.stringify(body.summary)
    : null;

  if (!reasonKey || !reasonLabel) {
    return json({ error: "Grund fehlt." }, 400, cors);
  }

  await ensureSchema(env.PINBOARD_DB);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await env.PINBOARD_DB.prepare(
    `INSERT INTO preview_feedback_reports (
      id, reason_key, reason_label, message, summary_json, page_path, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    reasonKey,
    reasonLabel,
    message || null,
    summaryJson,
    pagePath,
    userAgent || null,
    createdAt
  ).run();

  return json({ ok: true, id, createdAt }, 201, cors);
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if ((env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== env.ALLOWED_ORIGIN.trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, cors);
    }
  }

  try {
    if (request.method === "POST") {
      return await handlePost(context, cors);
    }
    return json({ error: "Methode nicht erlaubt." }, 405, cors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return json({ error: message }, 500, cors);
  }
}
