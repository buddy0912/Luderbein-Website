const MAX_BODY_CHARS = 12000;
const MAX_NAME_CHARS = 120;
const MAX_EMAIL_CHARS = 200;
const MAX_REFERENCE_CHARS = 120;
const MAX_NOTE_CHARS = 500;

const DECLARATION_VERSION = "REK-2026-03-25";
const DECLARATION_STAND = "25.03.2026";
const CHECKBOX_TEXTS = [
  "Ich versichere, dass ich über alle erforderlichen Rechte, Nutzungsrechte, Zustimmungen und Erlaubnisse an den von mir übermittelten Vorlagen verfüge und dass Luderbein diese zur Ausführung meines konkreten Auftrags verwenden darf.",
  "Ich räume Luderbein ein einfaches, nicht übertragbares und ausschließlich auf die Durchführung dieses konkreten Auftrags beschränktes Nutzungsrecht an den übermittelten Vorlagen ein.",
  "Ich bestätige, dass durch die beauftragte Nutzung nach meinem Kenntnisstand keine Rechte Dritter verletzt werden und dass ich Luderbein von Ansprüchen Dritter freistelle, soweit diese auf einer von mir zu vertretenden fehlenden Berechtigung beruhen."
];
const SUPPLEMENT_TEXT =
  "Luderbein ist nicht verpflichtet, die Rechtslage umfassend zu prüfen, ist jedoch berechtigt, bei rechtlichen Zweifeln Nachweise anzufordern oder Aufträge abzulehnen.";
const MAIL_CONFIG_ERROR = "RIGHTS_EMAIL_NOT_CONFIGURED";
const MAIL_DELIVERY_ERROR = "RIGHTS_EMAIL_DELIVERY_FAILED";

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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      };
    }
    return {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    : {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildDeclarationSnapshot() {
  return {
    title: "Rechteerklärung für Kundenvorlagen",
    version: DECLARATION_VERSION,
    stand: DECLARATION_STAND,
    checkboxes: CHECKBOX_TEXTS,
    supplement: SUPPLEMENT_TEXT
  };
}

function createMailError(code, message, details = {}) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function isConfiguredEmailFrom(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return false;

  const angleAddressMatch = normalized.match(/<([^<>]+)>/);
  if (angleAddressMatch) {
    return isValidEmail(angleAddressMatch[1].trim());
  }

  return isValidEmail(normalized);
}

function getNotificationConfig(env) {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const to = String(env.RIGHTS_NOTIFY_TO || env.PINBOARD_NOTIFY_TO || "").trim();
  const from = String(env.RIGHTS_EMAIL_FROM || env.PINBOARD_EMAIL_FROM || "").trim();
  const missing = [];

  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!to) missing.push("RIGHTS_NOTIFY_TO oder PINBOARD_NOTIFY_TO");
  if (!from) {
    missing.push("RIGHTS_EMAIL_FROM oder PINBOARD_EMAIL_FROM");
  } else if (!isConfiguredEmailFrom(from)) {
    missing.push("RIGHTS_EMAIL_FROM/PINBOARD_EMAIL_FROM mit gueltiger Absenderadresse");
  }

  if (missing.length) {
    throw createMailError(
      MAIL_CONFIG_ERROR,
      `Mail-Konfiguration unvollstaendig: ${missing.join(", ")}`,
      { missing }
    );
  }

  return { apiKey, to, from };
}

function buildNotificationResult(error) {
  const code = error && typeof error === "object" ? error.code : "";

  if (code === MAIL_CONFIG_ERROR) {
    return {
      sent: false,
      status: "config_error",
      message:
        "Bestätigung wurde gespeichert. Die interne E-Mail-Benachrichtigung ist derzeit nicht vollständig konfiguriert."
    };
  }

  return {
    sent: false,
    status: "send_failed",
    message:
      "Bestätigung wurde gespeichert. Die interne E-Mail-Benachrichtigung konnte intern nicht abgeschlossen werden."
  };
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS rights_confirmations (
        id TEXT PRIMARY KEY,
        contact_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        reference TEXT,
        note TEXT,
        declaration_version TEXT NOT NULL,
        declaration_snapshot TEXT NOT NULL,
        checkbox_1 INTEGER NOT NULL,
        checkbox_2 INTEGER NOT NULL,
        checkbox_3 INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        notified_at TEXT
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_rights_confirmations_created_at
       ON rights_confirmations(created_at DESC)`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_rights_confirmations_email_created_at
       ON rights_confirmations(contact_email, created_at DESC)`
    )
    .run();
}

async function sendResendNotification(env, payload) {
  const { apiKey, to, from } = getNotificationConfig(env);

  const lines = [
    "Neue online bestätigte Rechteerklärung",
    "",
    `Bestätigung-ID: ${payload.id}`,
    `Zeitpunkt: ${payload.createdAt}`,
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    `Referenz: ${payload.reference || "nicht angegeben"}`,
    `Zuordnung: ${payload.note || "nicht angegeben"}`,
    `Textfassung: ${payload.declarationVersion} (Stand ${DECLARATION_STAND})`,
    "",
    "Bestätigte Erklärungen:",
    `1. ${CHECKBOX_TEXTS[0]}`,
    `2. ${CHECKBOX_TEXTS[1]}`,
    `3. ${CHECKBOX_TEXTS[2]}`,
    "",
    SUPPLEMENT_TEXT
  ];

  const body = {
    from,
    to: [to],
    subject: `Rechteerklärung bestätigt: ${payload.reference || payload.name}`,
    text: lines.join("\n"),
    reply_to: payload.email ? [payload.email] : undefined
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `rights-confirmation-${payload.id}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createMailError(
      MAIL_DELIVERY_ERROR,
      `Resend-Antwort ${response.status}`,
      {
        status: response.status,
        responseText: errorText.slice(0, 1000)
      }
    );
  }
}

async function handleGet(context, cors) {
  const { env } = context;
  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  await ensureSchema(env.PINBOARD_DB);
  return json(
    {
      ok: true,
      declarationVersion: DECLARATION_VERSION,
      declarationStand: DECLARATION_STAND
    },
    200,
    cors
  );
}

async function handlePost(context, cors) {
  const { request, env } = context;
  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  await ensureSchema(env.PINBOARD_DB);

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

  const name = normalizeText(body.name, MAX_NAME_CHARS);
  const email = normalizeText(body.email, MAX_EMAIL_CHARS).toLowerCase();
  const reference = normalizeText(body.reference, MAX_REFERENCE_CHARS);
  const note = normalizeMultilineText(body.note, MAX_NOTE_CHARS);

  const checkbox1 = body.checkbox1 === true;
  const checkbox2 = body.checkbox2 === true;
  const checkbox3 = body.checkbox3 === true;

  if (!name) {
    return json({ error: "Name fehlt." }, 400, cors);
  }

  if (!email || !isValidEmail(email)) {
    return json({ error: "Gültige E-Mail-Adresse fehlt." }, 400, cors);
  }

  if (!checkbox1 || !checkbox2 || !checkbox3) {
    return json({ error: "Bitte alle Pflichtbestätigungen aktiv bestätigen." }, 400, cors);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const snapshot = JSON.stringify(buildDeclarationSnapshot());

  await env.PINBOARD_DB.prepare(
    `INSERT INTO rights_confirmations (
      id, contact_name, contact_email, reference, note,
      declaration_version, declaration_snapshot,
      checkbox_1, checkbox_2, checkbox_3,
      created_at, notified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      name,
      email,
      reference || null,
      note || null,
      DECLARATION_VERSION,
      snapshot,
      1,
      1,
      1,
      createdAt,
      null
    )
    .run();

  let notification = {
    sent: false,
    status: "not_attempted",
    message: "Interne E-Mail-Benachrichtigung wurde nicht ausgeführt."
  };

  try {
    await sendResendNotification(env, {
      id,
      name,
      email,
      reference,
      note,
      declarationVersion: DECLARATION_VERSION,
      createdAt
    });
    notification = {
      sent: true,
      status: "sent",
      message: "Interne E-Mail-Benachrichtigung wurde gesendet."
    };
    await env.PINBOARD_DB.prepare(
      `UPDATE rights_confirmations SET notified_at = ? WHERE id = ?`
    )
      .bind(new Date().toISOString(), id)
      .run();
  } catch (error) {
    notification = buildNotificationResult(error);
    const message = error instanceof Error ? error.message : "Unbekannter Mailfehler";
    const code = error && typeof error === "object" && error.code ? error.code : "UNKNOWN_MAIL_ERROR";
    const details =
      error && typeof error === "object" && error.details ? JSON.stringify(error.details) : "";

    console.error(
      `[rechteerklaerung] mail notification failed for ${id}: ${code} ${message}${details ? ` ${details}` : ""}`
    );
  }

  return json(
    {
      ok: true,
      id,
      createdAt,
      declarationVersion: DECLARATION_VERSION,
      declarationStand: DECLARATION_STAND,
      notification
    },
    201,
    cors
  );
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

    return json({ error: "Methode nicht erlaubt." }, 405, cors);
  } catch (error) {
    const code = error && typeof error === "object" ? error.code : "";
    if (code === MAIL_CONFIG_ERROR) {
      return json(
        {
          error:
            "Mail-Konfiguration unvollständig. Bitte Cloudflare-Environment-Variablen für Resend und Empfänger prüfen."
        },
        500,
        cors
      );
    }

    console.error("[rechteerklaerung] request failed", error);
    return json(
      { error: "Interner Fehler. Bitte später erneut versuchen." },
      500,
      cors
    );
  }
}
