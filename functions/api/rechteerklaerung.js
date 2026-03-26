import { buildConfirmationDocument, buildReferenceCode } from "../lib/rights-confirmation.js";

const MAX_BODY_CHARS = 12000;
const MAX_NAME_CHARS = 120;
const MAX_EMAIL_CHARS = 200;
const MAX_REFERENCE_CHARS = 120;
const MAX_NOTE_CHARS = 500;
const ADMIN_HEADER = "authorization";

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
        "Access-Control-Allow-Headers": "content-type, authorization"
      };
    }
    return {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization"
      }
    : {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getBearerToken(request) {
  const raw = request.headers.get(ADMIN_HEADER) || "";
  const prefix = "Bearer ";
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : "";
}

function getExpectedAdminToken(env) {
  return String(env.RIGHTS_ADMIN_TOKEN || env.PINBOARD_ADMIN_TOKEN || "").trim();
}

function isAdminRequest(request, env) {
  const expected = getExpectedAdminToken(env);
  return !!expected && getBearerToken(request) === expected;
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

function mapListRow(row) {
  return {
    id: row.id,
    referenceCode: row.reference_code || buildReferenceCode(row.id, row.created_at),
    createdAt: row.created_at,
    name: row.contact_name,
    email: row.contact_email,
    reference: row.reference || "",
    archiveStorage: row.archive_storage || "d1",
    hasStoredArchive: row.archive_storage === "r2" && !!row.archive_key,
    hasPdfRebuild: true
  };
}

function buildDocumentPayloadFromRow(row) {
  const snapshot = safeJsonParse(row.declaration_snapshot) || {};
  const checkboxes = Array.isArray(snapshot.checkboxes) && snapshot.checkboxes.length === 3
    ? snapshot.checkboxes
    : CHECKBOX_TEXTS;

  return {
    id: row.id,
    referenceCode: row.reference_code || buildReferenceCode(row.id, row.created_at),
    createdAt: row.created_at,
    name: row.contact_name,
    email: row.contact_email,
    reference: row.reference || "",
    note: row.note || "",
    declarationVersion: row.declaration_version || snapshot.version || DECLARATION_VERSION,
    declarationStand: snapshot.stand || DECLARATION_STAND,
    checkboxes,
    supplement: snapshot.supplement || SUPPLEMENT_TEXT
  };
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS rights_confirmations (
        id TEXT PRIMARY KEY,
        reference_code TEXT,
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

  await addColumnIfMissing(db, existingColumns, "reference_code", "TEXT");
  await addColumnIfMissing(db, existingColumns, "confirmation_filename", "TEXT");
  await addColumnIfMissing(db, existingColumns, "confirmation_media_type", "TEXT");
  await addColumnIfMissing(db, existingColumns, "confirmation_text", "TEXT");
  await addColumnIfMissing(db, existingColumns, "archive_storage", "TEXT");
  await addColumnIfMissing(db, existingColumns, "archive_key", "TEXT");
  await addColumnIfMissing(db, existingColumns, "archived_at", "TEXT");

  const missingReferenceRows = await db
    .prepare(
      `SELECT id, created_at
       FROM rights_confirmations
       WHERE reference_code IS NULL OR reference_code = ''
       ORDER BY created_at ASC
       LIMIT 500`
    )
    .all();

  if (Array.isArray(missingReferenceRows.results)) {
    for (const row of missingReferenceRows.results) {
      const referenceCode = buildReferenceCode(row.id, row.created_at);
      await db
        .prepare(`UPDATE rights_confirmations SET reference_code = ? WHERE id = ?`)
        .bind(referenceCode, row.id)
        .run();
    }
  }

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

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_rights_confirmations_reference_code_created_at
       ON rights_confirmations(reference_code, created_at DESC)`
    )
    .run();
}

async function archiveConfirmation(env, referenceCode, document, createdAt) {
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
  const key = `rights-confirmations/${year}/${month}/${referenceCode}.pdf`;

  try {
    await bucket.put(key, document.pdfBytes, {
      httpMetadata: {
        contentType: document.mediaType,
        contentDisposition: `attachment; filename="${document.filename}"`
      },
      customMetadata: {
        confirmation_reference: referenceCode,
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

async function loadAdminList(db) {
  const result = await db
    .prepare(
      `SELECT id, reference_code, contact_name, contact_email, reference, created_at, archive_storage, archive_key
       FROM rights_confirmations
       ORDER BY created_at DESC
       LIMIT 250`
    )
    .all();

  return Array.isArray(result.results) ? result.results.map(mapListRow) : [];
}

async function loadEntryByReference(db, reference) {
  const raw = normalizeText(reference, 80);
  const normalized = raw.toUpperCase();
  if (!raw) return null;

  const result = await db
    .prepare(
      `SELECT *
       FROM rights_confirmations
       WHERE reference_code = ? OR id = ? OR id = ?
       LIMIT 1`
    )
    .bind(normalized, raw, raw.toLowerCase())
    .first();

  return result || null;
}

async function handleAdminGet(context, cors) {
  const { request, env } = context;
  if (!getExpectedAdminToken(env)) {
    return json({ error: "Admin-Token ist serverseitig nicht gesetzt." }, 500, cors);
  }

  if (!isAdminRequest(request, env)) {
    return json({ error: "Nicht autorisiert." }, 401, cors);
  }

  const url = new URL(request.url);
  const mode = (url.searchParams.get("mode") || "list").trim();

  if (mode === "list") {
    const entries = await loadAdminList(env.PINBOARD_DB);
    return json({ entries }, 200, cors);
  }

  const reference = url.searchParams.get("reference") || "";
  const row = await loadEntryByReference(env.PINBOARD_DB, reference);

  if (!row) {
    return json({ error: "Eintrag nicht gefunden." }, 404, cors);
  }

  const payload = buildDocumentPayloadFromRow(row);
  const document = buildConfirmationDocument(payload);

  if (mode === "pdf") {
    return new Response(document.pdfBytes, {
      status: 200,
      headers: {
        ...cors,
        "content-type": document.mediaType,
        "content-disposition": `attachment; filename="${document.filename}"`,
        "cache-control": "no-store"
      }
    });
  }

  if (mode === "detail") {
    return json(
      {
        entry: {
          id: row.id,
          referenceCode: payload.referenceCode,
          createdAt: row.created_at,
          name: row.contact_name,
          email: row.contact_email,
          reference: row.reference || "",
          note: row.note || "",
          declarationVersion: payload.declarationVersion,
          declarationStand: payload.declarationStand,
          checkboxes: payload.checkboxes,
          supplement: payload.supplement,
          confirmationText: row.confirmation_text || document.textContent,
          confirmationFilename: row.confirmation_filename || document.filename,
          archiveStorage: row.archive_storage || "d1",
          archiveKey: row.archive_key || null,
          archivedAt: row.archived_at || null,
          hasStoredArchive: row.archive_storage === "r2" && !!row.archive_key
        }
      },
      200,
      cors
    );
  }

  return json({ error: "Unbekannter Admin-Modus." }, 400, cors);
}

async function handlePublicGet(context, cors) {
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
  const referenceCode = buildReferenceCode(id, createdAt);
  const snapshot = JSON.stringify(buildDeclarationSnapshot());
  const document = buildConfirmationDocument({
    id,
    referenceCode,
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
  const archive = await archiveConfirmation(env, referenceCode, document, createdAt);

  await env.PINBOARD_DB.prepare(
    `INSERT INTO rights_confirmations (
      id, reference_code, contact_name, contact_email, reference, note,
      declaration_version, declaration_snapshot,
      checkbox_1, checkbox_2, checkbox_3,
      created_at, notified_at,
      confirmation_filename, confirmation_media_type, confirmation_text,
      archive_storage, archive_key, archived_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      referenceCode,
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
      referenceCode,
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
      if (!env.PINBOARD_DB) {
        return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
      }

      await ensureSchema(env.PINBOARD_DB);
      const url = new URL(request.url);
      const mode = (url.searchParams.get("mode") || "").trim();

      if (mode) {
        return await handleAdminGet(context, cors);
      }

      return await handlePublicGet(context, cors);
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
