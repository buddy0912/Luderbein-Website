import { buildConfirmationDocument } from "../lib/rights-confirmation.js";

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

async function addColumnIfMissing(db, existingColumns, name, definition) {
  if (existingColumns.has(name)) return;
  await db.prepare(`ALTER TABLE rights_confirmations ADD COLUMN ${name} ${definition}`).run();
  existingColumns.add(name);
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
        notified_at TEXT,
        confirmation_filename TEXT,
        confirmation_media_type TEXT,
        confirmation_text TEXT,
        archive_storage TEXT,
        archive_key TEXT,
        archived_at TEXT
      )`
    )
    .run();

  const tableInfo = await db.prepare("PRAGMA table_info(rights_confirmations)").all();
  const existingColumns = new Set(
    Array.isArray(tableInfo.results) ? tableInfo.results.map((column) => column.name) : []
  );

  await addColumnIfMissing(db, existingColumns, "confirmation_filename", "TEXT");
  await addColumnIfMissing(db, existingColumns, "confirmation_media_type", "TEXT");
  await addColumnIfMissing(db, existingColumns, "confirmation_text", "TEXT");
  await addColumnIfMissing(db, existingColumns, "archive_storage", "TEXT");
  await addColumnIfMissing(db, existingColumns, "archive_key", "TEXT");
  await addColumnIfMissing(db, existingColumns, "archived_at", "TEXT");

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

async function archiveConfirmation(env, recordId, document, createdAt) {
  const archivedAt = new Date().toISOString();
  const bucket = env.RIGHTS_ARCHIVE_BUCKET;

  if (!bucket || typeof bucket.put !== "function") {
    return {
      storage: "d1",
      key: null,
      archivedAt
    };
  }

  const year = String(createdAt || "").slice(0, 4) || "unknown";
  const month = String(createdAt || "").slice(5, 7) || "00";
  const key = `rights-confirmations/${year}/${month}/${recordId}.pdf`;

  try {
    await bucket.put(key, document.pdfBytes, {
      httpMetadata: {
        contentType: document.mediaType,
        contentDisposition: `attachment; filename="${document.filename}"`
      },
      customMetadata: {
        confirmation_id: recordId,
        declaration_version: DECLARATION_VERSION
      }
    });

    return {
      storage: "r2",
      key,
      archivedAt
    };
  } catch (error) {
    console.error("[rechteerklaerung] r2 archive failed", error);
    return {
      storage: "d1",
      key: null,
      archivedAt
    };
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
  const document = buildConfirmationDocument({
    id,
    createdAt,
    name,
    email,
    reference,
    note,
    declarationVersion: DECLARATION_VERSION,
    declarationStand: DECLARATION_STAND,
    checkboxes: CHECKBOX_TEXTS,
    supplement: SUPPLEMENT_TEXT
  });
  const archive = await archiveConfirmation(env, id, document, createdAt);

  await env.PINBOARD_DB.prepare(
    `INSERT INTO rights_confirmations (
      id, contact_name, contact_email, reference, note,
      declaration_version, declaration_snapshot,
      checkbox_1, checkbox_2, checkbox_3,
      created_at, notified_at,
      confirmation_filename, confirmation_media_type, confirmation_text,
      archive_storage, archive_key, archived_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      null,
      document.filename,
      document.mediaType,
      document.textContent,
      archive.storage,
      archive.key,
      archive.archivedAt
    )
    .run();

  return json(
    {
      ok: true,
      id,
      createdAt,
      declarationVersion: DECLARATION_VERSION,
      declarationStand: DECLARATION_STAND,
      download: {
        filename: document.filename,
        mediaType: document.mediaType,
        contentBase64: document.pdfBase64
      },
      archive: {
        storage: archive.storage,
        key: archive.key,
        archivedAt: archive.archivedAt
      }
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
    console.error("[rechteerklaerung] request failed", error);
    return json(
      { error: "Interner Fehler. Bitte später erneut versuchen." },
      500,
      cors
    );
  }
}
