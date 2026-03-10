const MAX_BODY_CHARS = 10000;
const MAX_MESSAGE_CHARS = 4000;
const MAX_NICKNAME_CHARS = 80;
const MAX_EMAIL_CHARS = 200;
const ADMIN_HEADER = "authorization";

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
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization"
      };
    }
    return {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization"
      }
    : {
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization"
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

function isValidEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requiresApproval(env) {
  return String(env.PINBOARD_PUBLIC_REQUIRES_APPROVAL || "").trim().toLowerCase() === "true";
}

function getBearerToken(request) {
  const raw = request.headers.get(ADMIN_HEADER) || "";
  const prefix = "Bearer ";
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : "";
}

function isAdminRequest(request, env) {
  const expected = String(env.PINBOARD_ADMIN_TOKEN || "").trim();
  return !!expected && getBearerToken(request) === expected;
}

function mapRow(row) {
  return {
    id: row.id,
    nickname: row.nickname || "Anonym",
    message: row.message,
    createdAt: row.created_at,
    reply: row.reply_message
      ? {
          author: row.reply_author || "Luderbein",
          message: row.reply_message
        }
      : null
  };
}

async function sendResendNotification(env, payload) {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const to = String(env.PINBOARD_NOTIFY_TO || "").trim();
  const from = String(env.PINBOARD_EMAIL_FROM || "").trim();

  if (!apiKey || !to || !from) {
    throw new Error("PINBOARD_EMAIL_NOT_CONFIGURED");
  }

  const visibilityText = payload.visibility === "public" ? "öffentlich" : "nicht öffentlich";
  const statusText =
    payload.status === "pending_public"
      ? "wartet auf Freigabe"
      : payload.status === "published"
        ? "veröffentlicht"
        : "nur intern";

  const lines = [
    "Neue Pinnwand-Einsendung",
    "",
    `Sichtbarkeit: ${visibilityText}`,
    `Status: ${statusText}`,
    `Nickname: ${payload.nickname || "Anonym"}`,
    `E-Mail: ${payload.email || "nicht angegeben"}`,
    `Zeitpunkt: ${payload.createdAt}`,
    "",
    "Beitrag:",
    payload.message
  ];

  const body = {
    from,
    to: [to],
    subject: `Neue Pinnwand-Einsendung (${visibilityText})`,
    text: lines.join("\n"),
    reply_to: payload.email ? [payload.email] : undefined
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RESEND_${response.status}:${errorText}`);
  }
}

async function loadPublishedPosts(db) {
  const result = await db
    .prepare(
      `SELECT id, nickname, message, created_at, reply_author, reply_message
       FROM pinboard_posts
       WHERE visibility = 'public' AND status = 'published'
       ORDER BY COALESCE(published_at, created_at) ASC
       LIMIT 100`
    )
    .all();

  return Array.isArray(result.results) ? result.results.map(mapRow) : [];
}

async function loadPendingPosts(db) {
  const result = await db
    .prepare(
      `SELECT id, visibility, status, nickname, email, message, created_at
       FROM pinboard_posts
       WHERE status = 'pending_public'
       ORDER BY created_at DESC
       LIMIT 100`
    )
    .all();

  return Array.isArray(result.results) ? result.results : [];
}

async function handleGet(context, cors) {
  const { env, request } = context;
  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  if (isAdminRequest(request, env)) {
    const pending = await loadPendingPosts(env.PINBOARD_DB);
    return json({ pending }, 200, cors);
  }

  const posts = await loadPublishedPosts(env.PINBOARD_DB);
  return json({ posts }, 200, cors);
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

  const message = normalizeMultilineText(body.message, MAX_MESSAGE_CHARS);
  const nickname = normalizeText(body.nickname, MAX_NICKNAME_CHARS);
  const email = normalizeText(body.email, MAX_EMAIL_CHARS).toLowerCase();
  const visibility = body.visibility === "internal" ? "internal" : "public";

  if (!message) {
    return json({ error: "Beitrag fehlt." }, 400, cors);
  }

  if (!isValidEmail(email)) {
    return json({ error: "Ungültige E-Mail-Adresse." }, 400, cors);
  }

  const status =
    visibility === "internal"
      ? "internal"
      : requiresApproval(env)
        ? "pending_public"
        : "published";

  const createdAt = new Date().toISOString();
  const publishedAt = status === "published" ? createdAt : null;
  const id = crypto.randomUUID();

  await env.PINBOARD_DB.prepare(
    `INSERT INTO pinboard_posts (
      id, visibility, status, nickname, email, message, created_at, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      visibility,
      status,
      nickname || null,
      email || null,
      message,
      createdAt,
      publishedAt
    )
    .run();

  let notificationSent = false;
  let notificationError = "";

  try {
    await sendResendNotification(env, {
      id,
      visibility,
      status,
      nickname,
      email,
      message,
      createdAt
    });
    notificationSent = true;
    await env.PINBOARD_DB.prepare(
      `UPDATE pinboard_posts SET notified_at = ? WHERE id = ?`
    )
      .bind(new Date().toISOString(), id)
      .run();
  } catch (error) {
    notificationError = error instanceof Error ? error.message : "MAIL_SEND_FAILED";
  }

  return json(
    {
      ok: true,
      notificationSent,
      notificationError: notificationSent ? null : notificationError,
      post:
        status === "published"
          ? {
              id,
              nickname: nickname || "Anonym",
              message,
              createdAt,
              reply: null
            }
          : null,
      visibility,
      status
    },
    201,
    cors
  );
}

async function handlePatch(context, cors) {
  const { request, env } = context;
  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  if (!isAdminRequest(request, env)) {
    return json({ error: "Nicht autorisiert." }, 401, cors);
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return json({ error: "Body konnte nicht gelesen werden." }, 400, cors);
  }

  const body = safeJsonParse(raw);
  if (!body || typeof body !== "object") {
    return json({ error: "Ungültiges JSON." }, 400, cors);
  }

  const id = normalizeText(body.id, 80);
  const status = body.status === "published" ? "published" : body.status === "internal" ? "internal" : "";
  const replyMessage = normalizeMultilineText(body.replyMessage, MAX_MESSAGE_CHARS);
  const replyAuthor = normalizeText(body.replyAuthor || "Luderbein", 80);

  if (!id || !status) {
    return json({ error: "id oder status fehlt." }, 400, cors);
  }

  const publishedAt = status === "published" ? new Date().toISOString() : null;

  await env.PINBOARD_DB.prepare(
    `UPDATE pinboard_posts
     SET status = ?, published_at = ?, reply_author = ?, reply_message = ?
     WHERE id = ?`
  )
    .bind(status, publishedAt, replyMessage ? replyAuthor : null, replyMessage || null, id)
    .run();

  return json({ ok: true }, 200, cors);
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
    if (request.method === "GET") {
      return await handleGet(context, cors);
    }

    if (request.method === "POST") {
      return await handlePost(context, cors);
    }

    if (request.method === "PATCH") {
      return await handlePatch(context, cors);
    }

    return json({ error: "Methode nicht erlaubt." }, 405, cors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return json({ error: message }, 500, cors);
  }
}
