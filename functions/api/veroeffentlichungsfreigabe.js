import {
  buildPublicationReferenceCode,
  buildPublicationReleaseDocument
} from "../lib/publication-release-confirmation.js";
import { syncPublicationReleaseToAirtable } from "../lib/airtable-publication-release.js";

const MAX_PUBLIC_BODY_CHARS = 18000;
const MAX_INTERNAL_BODY_CHARS = 1200000;
const MAX_EVIDENCE_BYTES = 750 * 1024;
const DECLARATION_VERSION = "VF-2026-08-02-05";
const DECLARATION_STAND = "02.08.2026";

const CHANNELS = {
  website: "Werkfotos auf der Luderbein-Website",
  socialMedia: "Social Media",
  digitalPortfolio: "Digitales Portfolio",
  printedMaterials: "Gedruckte Referenz- und Werbemittel"
};

const ADDITIONS = {
  projectStory: "Entstehung, Entwicklung und Herstellung",
  eventPhotos: "Fotos einer Übergabe oder Veranstaltung"
};

const ATTRIBUTION = {
  named: "Nennung des Kunden oder Auftraggebers",
  anonymous: "Nur anonymisierte Veröffentlichung"
};

const PERSON_STATUS = {
  "none-visible": "Keine Personen erkennbar",
  "original-authorized":
    "Personen dürfen im Original gezeigt werden; erforderliche Zustimmungen und Berechtigung wurden bestätigt",
  "anonymized-only": "Personen dürfen nur verpixelt oder anonymisiert gezeigt werden"
};

const CONFIRMATION_CHANNELS = {
  website: "Website",
  whatsapp: "WhatsApp",
  email: "E-Mail"
};

const EVIDENCE_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

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
  const allowed = String(env.ALLOWED_ORIGIN || "").trim();
  const base = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization"
  };

  if (allowed) {
    return origin === allowed
      ? {
          ...base,
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin"
        }
      : base;
  }

  return origin
    ? {
        ...base,
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin"
      }
    : base;
}

function normalizeText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeMultilineText(value, maxLength) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isClearlyAmbiguousConfirmation(value) {
  return /^(?:h+m+|m+h+m+|m+m+)[.!?…]*$/i.test(String(value || "").replace(/\s+/g, ""));
}

function getBearerToken(request) {
  const raw = request.headers.get("authorization") || "";
  return raw.startsWith("Bearer ") ? raw.slice(7).trim() : "";
}

function expectedAdminToken(env) {
  return String(env.RIGHTS_ADMIN_TOKEN || env.PINBOARD_ADMIN_TOKEN || "").trim();
}

function isAdminRequest(request, env) {
  const expected = expectedAdminToken(env);
  return !!expected && getBearerToken(request) === expected;
}

function buildSnapshot() {
  return {
    title: "Veröffentlichungsfreigabe",
    version: DECLARATION_VERSION,
    stand: DECLARATION_STAND,
    channels: CHANNELS,
    additions: ADDITIONS,
    attribution: ATTRIBUTION,
    personStatus: PERSON_STATUS,
    rights:
      "Einfache, nicht ausschließliche und auf die aktiv gewählten Nutzungsarten sowie das bezeichnete Projekt begrenzte Nutzungsrechte; keine Übertragung des Urheberrechts.",
    withdrawal:
      "Freiwillig und für die Zukunft widerrufbar. Bis zum Widerruf erfolgte Nutzungen bleiben unberührt. Bereits hergestellte Drucksachen können nicht zurückgerufen werden."
  };
}

async function addColumnIfMissing(db, existingColumns, name, definition) {
  if (existingColumns.has(name)) return;
  await db
    .prepare(`ALTER TABLE publication_release_confirmations ADD COLUMN ${name} ${definition}`)
    .run();
  existingColumns.add(name);
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS publication_release_confirmations (
        id TEXT PRIMARY KEY,
        reference_code TEXT NOT NULL,
        form_type TEXT NOT NULL,
        project_key TEXT,
        project_title TEXT NOT NULL,
        principal_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        contact_role TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        reference TEXT,
        note TEXT,
        website INTEGER NOT NULL,
        social_media INTEGER NOT NULL,
        digital_portfolio INTEGER NOT NULL,
        printed_materials INTEGER NOT NULL,
        attribution TEXT NOT NULL,
        project_story INTEGER NOT NULL,
        event_photos INTEGER NOT NULL,
        rights_authority INTEGER NOT NULL,
        person_status TEXT NOT NULL,
        voluntary_confirmation INTEGER NOT NULL,
        accuracy_confirmation INTEGER NOT NULL,
        privacy_acknowledgement INTEGER NOT NULL,
        declaration_version TEXT NOT NULL,
        declaration_snapshot TEXT NOT NULL,
        created_at TEXT NOT NULL,
        confirmation_filename TEXT NOT NULL,
        confirmation_media_type TEXT NOT NULL,
        confirmation_text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        updated_at TEXT,
        confirmed_at TEXT,
        confirmation_channel TEXT,
        customer_confirmation_text TEXT,
        confirmation_context TEXT,
        confirmation_assessed INTEGER NOT NULL DEFAULT 0,
        request_text TEXT,
        evidence_filename TEXT,
        evidence_media_type TEXT,
        evidence_content_base64 TEXT,
        airtable_record_id TEXT,
        airtable_sync_status TEXT,
        airtable_synced_at TEXT
      )`
    )
    .run();

  const tableInfo = await db
    .prepare("PRAGMA table_info(publication_release_confirmations)")
    .all();
  const columns = new Set(
    Array.isArray(tableInfo.results) ? tableInfo.results.map((column) => column.name) : []
  );

  await addColumnIfMissing(db, columns, "status", "TEXT NOT NULL DEFAULT 'confirmed'");
  await addColumnIfMissing(db, columns, "updated_at", "TEXT");
  await addColumnIfMissing(db, columns, "confirmed_at", "TEXT");
  await addColumnIfMissing(db, columns, "confirmation_channel", "TEXT");
  await addColumnIfMissing(db, columns, "customer_confirmation_text", "TEXT");
  await addColumnIfMissing(db, columns, "confirmation_context", "TEXT");
  await addColumnIfMissing(db, columns, "confirmation_assessed", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, columns, "request_text", "TEXT");
  await addColumnIfMissing(db, columns, "evidence_filename", "TEXT");
  await addColumnIfMissing(db, columns, "evidence_media_type", "TEXT");
  await addColumnIfMissing(db, columns, "evidence_content_base64", "TEXT");
  await addColumnIfMissing(db, columns, "airtable_record_id", "TEXT");
  await addColumnIfMissing(db, columns, "airtable_sync_status", "TEXT");
  await addColumnIfMissing(db, columns, "airtable_synced_at", "TEXT");

  await db
    .prepare(
      `UPDATE publication_release_confirmations
       SET updated_at = COALESCE(updated_at, created_at),
           confirmed_at = CASE
             WHEN status = 'confirmed' THEN COALESCE(confirmed_at, created_at)
             ELSE confirmed_at
           END,
           confirmation_channel = CASE
             WHEN status = 'confirmed' THEN COALESCE(confirmation_channel, 'website')
             ELSE confirmation_channel
           END
       WHERE updated_at IS NULL
          OR (status = 'confirmed' AND (confirmed_at IS NULL OR confirmation_channel IS NULL))`
    )
    .run();

  await db
    .prepare(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_publication_release_reference
       ON publication_release_confirmations(reference_code)`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_publication_release_created_at
       ON publication_release_confirmations(created_at DESC)`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_publication_release_status_updated
       ON publication_release_confirmations(status, updated_at DESC)`
    )
    .run();
}

function readSelection(body, labels) {
  return Object.entries(labels)
    .filter(([key]) => body[key] === true)
    .map(([, label]) => label);
}

function normalizeRelease(body, requireEmail) {
  const release = {
    formType: body.formType === "project" ? "project" : "general",
    projectKey: normalizeText(body.projectKey, 120),
    projectTitle: normalizeText(body.projectTitle, 180),
    principalName: normalizeText(body.principalName, 180),
    contactName: normalizeText(body.contactName, 120),
    contactRole: normalizeText(body.contactRole, 120),
    email: normalizeText(body.email, 200).toLowerCase(),
    reference: normalizeText(body.reference, 120),
    note: normalizeMultilineText(body.note, 600),
    attribution: ATTRIBUTION[body.attribution] ? body.attribution : "",
    personStatus: PERSON_STATUS[body.personStatus] ? body.personStatus : "",
    selection: {
      website: body.website === true,
      socialMedia: body.socialMedia === true,
      digitalPortfolio: body.digitalPortfolio === true,
      printedMaterials: body.printedMaterials === true,
      projectStory: body.projectStory === true,
      eventPhotos: body.eventPhotos === true
    }
  };

  release.selectedChannels = readSelection(release.selection, CHANNELS);
  release.selectedAdditions = readSelection(release.selection, ADDITIONS);

  if (!release.projectTitle || !release.principalName) {
    return { error: "Projekt und Auftraggeber fehlen." };
  }
  if (!release.reference) {
    return { error: "Rechnungsnummer oder Auftragsreferenz fehlt." };
  }
  if (!release.contactName) {
    return { error: "Bitte die bestätigende Person eintragen." };
  }
  if (requireEmail && (!release.email || !validEmail(release.email))) {
    return { error: "Eine gültige E-Mail-Adresse fehlt." };
  }
  if (release.email && !validEmail(release.email)) {
    return { error: "Die angegebene E-Mail-Adresse ist ungültig." };
  }
  if (!release.selectedChannels.length) {
    return { error: "Bitte mindestens einen Veröffentlichungskanal aktiv auswählen." };
  }
  if (!release.attribution) {
    return { error: "Bitte die namentliche oder anonymisierte Darstellung aktiv auswählen." };
  }
  if (!release.personStatus) {
    return { error: "Bitte den Status zu erkennbaren Personen aktiv auswählen." };
  }

  return { release };
}

function buildRequestText(release, referenceCode) {
  const lines = [
    "Veröffentlichungsfreigabe für ein Kundenprojekt",
    "",
    `Projekt: ${release.projectTitle}`,
    `Kunde / Auftraggeber: ${release.principalName}`,
    `Auftragsreferenz: ${release.reference}`,
    `Referenzcode: ${referenceCode}`,
    `Textversion: ${DECLARATION_VERSION}`,
    "",
    "Vorgesehene Veröffentlichungskanäle:",
    ...release.selectedChannels.map((label) => `- ${label}`),
    "",
    `Darstellung des Auftraggebers: ${ATTRIBUTION[release.attribution]}`,
    `Erkennbare Personen: ${PERSON_STATUS[release.personStatus]}`,
    `Zusätzliche Inhalte: ${
      release.selectedAdditions.length ? release.selectedAdditions.join(", ") : "keine"
    }`,
    `Einschränkung / Hinweis: ${release.note || "keine"}`,
    "",
    "Bitte prüfen Sie die beigefügte vorbereitete Freigabe.",
    "Darf Luderbein das oben beschriebene Projekt im angegebenen Umfang veröffentlichen?",
    "Eine eindeutige zustimmende Antwort im Zusammenhang mit dieser Anfrage genügt."
  ];

  return lines.join("\n");
}

function documentPayload(release, values) {
  return {
    id: values.id,
    referenceCode: values.referenceCode,
    createdAt: values.createdAt,
    confirmedAt: values.confirmedAt || "",
    status: values.status,
    projectTitle: release.projectTitle,
    principalName: release.principalName,
    contactName: release.contactName,
    contactRole: release.contactRole,
    email: release.email || "nicht angegeben",
    reference: release.reference,
    note: release.note,
    selectedChannels: release.selectedChannels,
    selectedAdditions: release.selectedAdditions,
    attributionLabel: ATTRIBUTION[release.attribution],
    personStatusLabel: PERSON_STATUS[release.personStatus],
    declarationVersion: DECLARATION_VERSION,
    declarationStand: DECLARATION_STAND,
    confirmationChannelLabel: CONFIRMATION_CHANNELS[values.confirmationChannel] || "",
    confirmationText: values.confirmationText || "",
    confirmationContext: values.confirmationContext || "",
    evidenceName: values.evidenceName || ""
  };
}

function releaseFromRow(row) {
  const selection = {
    website: row.website === 1,
    socialMedia: row.social_media === 1,
    digitalPortfolio: row.digital_portfolio === 1,
    printedMaterials: row.printed_materials === 1,
    projectStory: row.project_story === 1,
    eventPhotos: row.event_photos === 1
  };

  return {
    formType: row.form_type,
    projectKey: row.project_key || "",
    projectTitle: row.project_title,
    principalName: row.principal_name,
    contactName: row.contact_name,
    contactRole: row.contact_role || "",
    email: row.contact_email || "",
    reference: row.reference || "",
    note: row.note || "",
    attribution: row.attribution,
    personStatus: row.person_status,
    selection,
    selectedChannels: readSelection(selection, CHANNELS),
    selectedAdditions: readSelection(selection, ADDITIONS)
  };
}

function mapListRow(row) {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    confirmedAt: row.confirmed_at || "",
    status: row.status,
    projectTitle: row.project_title,
    principalName: row.principal_name,
    contactName: row.contact_name,
    reference: row.reference || "",
    confirmationChannel: row.confirmation_channel || "",
    airtableSyncStatus: row.airtable_sync_status || "not_configured"
  };
}

function mapDetailRow(row) {
  const release = releaseFromRow(row);
  return {
    ...mapListRow(row),
    projectKey: release.projectKey,
    contactRole: release.contactRole,
    email: release.email,
    note: release.note,
    selection: release.selection,
    selectedChannels: release.selectedChannels,
    selectedAdditions: release.selectedAdditions,
    attribution: release.attribution,
    attributionLabel: ATTRIBUTION[release.attribution] || "",
    personStatus: release.personStatus,
    personStatusLabel: PERSON_STATUS[release.personStatus] || "",
    declarationVersion: row.declaration_version,
    requestText: row.request_text || "",
    confirmationText: row.customer_confirmation_text || "",
    confirmationContext: row.confirmation_context || "",
    confirmationAssessed: row.confirmation_assessed === 1,
    evidenceName: row.evidence_filename || "",
    evidenceMediaType: row.evidence_media_type || "",
    hasEvidence: !!row.evidence_content_base64
  };
}

async function parseBody(request, maxChars) {
  const raw = await request.text();
  if (!raw.trim()) return { error: "Body fehlt.", status: 400 };
  if (raw.length > maxChars) return { error: "Payload zu groß.", status: 413 };

  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: "Ungültiges JSON.", status: 400 };
  }
}

function validateEvidence(value) {
  if (!value) return { evidence: null };

  const filename = normalizeText(value.filename, 160);
  const mediaType = normalizeText(value.mediaType, 100).toLowerCase();
  const contentBase64 = String(value.contentBase64 || "").replace(/\s+/g, "");

  if (!filename || !EVIDENCE_MEDIA_TYPES.has(mediaType) || !contentBase64) {
    return { error: "Der optionale Nachweis ist ungültig." };
  }

  const estimatedBytes = Math.floor((contentBase64.length * 3) / 4);
  if (estimatedBytes > MAX_EVIDENCE_BYTES) {
    return { error: "Der optionale Nachweis darf höchstens 750 KB groß sein." };
  }

  return {
    evidence: {
      filename,
      mediaType,
      contentBase64
    }
  };
}

async function saveAirtableResult(db, id, syncResult) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE publication_release_confirmations
       SET airtable_record_id = ?,
           airtable_sync_status = ?,
           airtable_synced_at = ?,
           updated_at = ?
       WHERE id = ?`
    )
    .bind(
      syncResult.recordId || null,
      syncResult.status,
      syncResult.status === "synced" ? now : null,
      now,
      id
    )
    .run();
}

async function syncConfirmedRelease(env, release, values) {
  try {
    return await syncPublicationReleaseToAirtable(env, {
      id: values.id,
      referenceCode: values.referenceCode,
      reference: release.reference,
      projectTitle: release.projectTitle,
      principalName: release.principalName,
      contactName: release.contactName,
      contactRole: release.contactRole,
      email: release.email,
      note: release.note,
      attribution: release.attribution,
      personStatus: release.personStatus,
      declarationVersion: DECLARATION_VERSION,
      createdAt: values.createdAt,
      confirmedAt: values.confirmedAt,
      confirmationChannel: values.confirmationChannel,
      confirmationText: values.confirmationText,
      selection: release.selection
    });
  } catch (error) {
    console.error(
      "[veroeffentlichungsfreigabe] Airtable sync failed",
      error instanceof Error ? error.message : "AIRTABLE_SYNC_FAILED"
    );
    return { status: "failed" };
  }
}

async function insertRelease(db, release, values, document, requestText) {
  await db
    .prepare(
      `INSERT INTO publication_release_confirmations (
        id, reference_code, form_type, project_key, project_title, principal_name,
        contact_name, contact_role, contact_email, reference, note,
        website, social_media, digital_portfolio, printed_materials,
        attribution, project_story, event_photos, rights_authority, person_status,
        voluntary_confirmation, accuracy_confirmation, privacy_acknowledgement,
        declaration_version, declaration_snapshot, created_at,
        confirmation_filename, confirmation_media_type, confirmation_text,
        status, updated_at, confirmed_at, confirmation_channel,
        customer_confirmation_text, confirmation_context, confirmation_assessed,
        request_text, airtable_sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      values.id,
      values.referenceCode,
      release.formType,
      release.projectKey || null,
      release.projectTitle,
      release.principalName,
      release.contactName,
      release.contactRole,
      release.email,
      release.reference,
      release.note || null,
      release.selection.website ? 1 : 0,
      release.selection.socialMedia ? 1 : 0,
      release.selection.digitalPortfolio ? 1 : 0,
      release.selection.printedMaterials ? 1 : 0,
      release.attribution,
      release.selection.projectStory ? 1 : 0,
      release.selection.eventPhotos ? 1 : 0,
      values.status === "confirmed" ? 1 : 0,
      release.personStatus,
      values.status === "confirmed" ? 1 : 0,
      values.status === "confirmed" ? 1 : 0,
      values.status === "confirmed" ? 1 : 0,
      DECLARATION_VERSION,
      JSON.stringify(buildSnapshot()),
      values.createdAt,
      document.filename,
      document.mediaType,
      document.textContent,
      values.status,
      values.createdAt,
      values.confirmedAt || null,
      values.confirmationChannel || null,
      values.confirmationText || null,
      values.confirmationContext || null,
      values.status === "confirmed" ? 1 : 0,
      requestText || null,
      "not_configured"
    )
    .run();
}

async function handlePublicSubmission(request, env, cors) {
  const parsed = await parseBody(request, MAX_PUBLIC_BODY_CHARS);
  if (parsed.error) return json({ error: parsed.error }, parsed.status, cors);
  const { body } = parsed;

  if (normalizeText(body.websiteField, 100)) {
    return json({ ok: true }, 201, cors);
  }

  const normalized = normalizeRelease(body, true);
  if (normalized.error) return json({ error: normalized.error }, 400, cors);
  if (
    body.rightsAuthority !== true ||
    body.voluntaryConfirmation !== true ||
    body.accuracyConfirmation !== true ||
    body.privacyAcknowledgement !== true
  ) {
    return json({ error: "Bitte alle erforderlichen Bestätigungen aktiv abgeben." }, 400, cors);
  }

  const release = normalized.release;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const referenceCode = buildPublicationReferenceCode(id, createdAt);
  const confirmationText = "Aktive Bestätigung über das öffentliche Website-Formular.";
  const confirmationContext =
    "Die bestätigende Person hat die konkrete Auswahl im öffentlichen Formular geprüft und verbindlich abgesendet.";
  const values = {
    id,
    referenceCode,
    createdAt,
    confirmedAt: createdAt,
    status: "confirmed",
    confirmationChannel: "website",
    confirmationText,
    confirmationContext
  };
  const document = buildPublicationReleaseDocument(documentPayload(release, values));

  await ensureSchema(env.PINBOARD_DB);
  await insertRelease(env.PINBOARD_DB, release, values, document, confirmationContext);

  const airtableSync = await syncConfirmedRelease(env, release, values);
  await saveAirtableResult(env.PINBOARD_DB, id, airtableSync);

  return json(
    {
      ok: true,
      referenceCode,
      createdAt,
      confirmedAt: createdAt,
      status: "confirmed",
      declarationVersion: DECLARATION_VERSION,
      airtableSyncStatus: airtableSync.status,
      download: {
        filename: document.filename,
        mediaType: document.mediaType,
        contentBase64: document.pdfBase64
      }
    },
    201,
    cors
  );
}

async function handlePrepare(request, env, cors) {
  const parsed = await parseBody(request, MAX_PUBLIC_BODY_CHARS);
  if (parsed.error) return json({ error: parsed.error }, parsed.status, cors);

  const normalized = normalizeRelease(parsed.body, false);
  if (normalized.error) return json({ error: normalized.error }, 400, cors);

  const release = {
    ...normalized.release,
    formType: "internal-prepared"
  };
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const referenceCode = buildPublicationReferenceCode(id, createdAt);
  const requestText = buildRequestText(release, referenceCode);
  const values = {
    id,
    referenceCode,
    createdAt,
    status: "prepared"
  };
  const document = buildPublicationReleaseDocument(documentPayload(release, values));

  await ensureSchema(env.PINBOARD_DB);
  await insertRelease(env.PINBOARD_DB, release, values, document, requestText);

  return json(
    {
      ok: true,
      referenceCode,
      createdAt,
      status: "prepared",
      declarationVersion: DECLARATION_VERSION,
      airtableSyncStatus: "not_started",
      requestText,
      download: {
        filename: document.filename,
        mediaType: document.mediaType,
        contentBase64: document.pdfBase64
      }
    },
    201,
    cors
  );
}

async function handleConfirm(request, env, cors) {
  const parsed = await parseBody(request, MAX_INTERNAL_BODY_CHARS);
  if (parsed.error) return json({ error: parsed.error }, parsed.status, cors);
  const body = parsed.body;

  const referenceCode = normalizeText(body.referenceCode, 80);
  const confirmationChannel = CONFIRMATION_CHANNELS[body.confirmationChannel]
    ? body.confirmationChannel
    : "";
  const confirmationText = normalizeMultilineText(body.confirmationText, 2000);
  const confirmationContext = normalizeMultilineText(body.confirmationContext, 5000);
  const confirmedAtInput = normalizeText(body.confirmedAt, 80);
  const confirmedDate = new Date(confirmedAtInput);

  if (!referenceCode) return json({ error: "Referenzcode fehlt." }, 400, cors);
  if (!confirmationChannel || confirmationChannel === "website") {
    return json({ error: "Bitte WhatsApp oder E-Mail als Bestätigungsweg wählen." }, 400, cors);
  }
  if (!confirmationText) {
    return json({ error: "Bitte die Kundenantwort im Wortlaut dokumentieren." }, 400, cors);
  }
  if (isClearlyAmbiguousConfirmation(confirmationText)) {
    return json(
      { error: "Ein unklarer Hinweis wie „Hm“ ist keine eindeutige Zustimmung." },
      400,
      cors
    );
  }
  if (body.confirmationAssessed !== true) {
    return json({ error: "Bitte die eindeutige Zustimmung im dargestellten Kontext prüfen." }, 400, cors);
  }
  if (Number.isNaN(confirmedDate.getTime())) {
    return json({ error: "Datum und Uhrzeit der Bestätigung fehlen." }, 400, cors);
  }

  const checkedEvidence = validateEvidence(body.evidence);
  if (checkedEvidence.error) return json({ error: checkedEvidence.error }, 400, cors);
  const evidence = checkedEvidence.evidence;

  await ensureSchema(env.PINBOARD_DB);
  const row = await env.PINBOARD_DB
    .prepare(
      `SELECT *
       FROM publication_release_confirmations
       WHERE reference_code = ?
       LIMIT 1`
    )
    .bind(referenceCode)
    .first();

  if (!row) return json({ error: "Vorbereitete Freigabe nicht gefunden." }, 404, cors);
  if (row.status === "revoked") {
    return json({ error: "Eine widerrufene Freigabe kann nicht bestätigt werden." }, 409, cors);
  }
  if (row.status === "confirmed") {
    return json(
      { error: "Diese Freigabe wurde bereits bestätigt und nicht erneut übertragen." },
      409,
      cors
    );
  }

  const release = releaseFromRow(row);
  const confirmedAt = confirmedDate.toISOString();
  const context = confirmationContext || row.request_text || "";
  const values = {
    id: row.id,
    referenceCode: row.reference_code,
    createdAt: row.created_at,
    confirmedAt,
    status: "confirmed",
    confirmationChannel,
    confirmationText,
    confirmationContext: context,
    evidenceName: evidence?.filename || row.evidence_filename || ""
  };
  const document = buildPublicationReleaseDocument(documentPayload(release, values));
  const updatedAt = new Date().toISOString();

  await env.PINBOARD_DB
    .prepare(
      `UPDATE publication_release_confirmations
       SET status = 'confirmed',
           updated_at = ?,
           confirmed_at = ?,
           confirmation_channel = ?,
           customer_confirmation_text = ?,
           confirmation_context = ?,
           confirmation_assessed = 1,
           evidence_filename = ?,
           evidence_media_type = ?,
           evidence_content_base64 = ?,
           rights_authority = 1,
           voluntary_confirmation = 1,
           accuracy_confirmation = 1,
           privacy_acknowledgement = 1,
           confirmation_filename = ?,
           confirmation_media_type = ?,
           confirmation_text = ?
       WHERE id = ?`
    )
    .bind(
      updatedAt,
      confirmedAt,
      confirmationChannel,
      confirmationText,
      context,
      evidence?.filename || row.evidence_filename || null,
      evidence?.mediaType || row.evidence_media_type || null,
      evidence?.contentBase64 || row.evidence_content_base64 || null,
      document.filename,
      document.mediaType,
      document.textContent,
      row.id
    )
    .run();

  const airtableSync = await syncConfirmedRelease(env, release, values);
  await saveAirtableResult(env.PINBOARD_DB, row.id, airtableSync);

  return json({
    ok: true,
    referenceCode,
    createdAt: row.created_at,
    confirmedAt,
    status: "confirmed",
    declarationVersion: DECLARATION_VERSION,
    airtableSyncStatus: airtableSync.status,
    download: {
      filename: document.filename,
      mediaType: document.mediaType,
      contentBase64: document.pdfBase64
    }
  }, 200, cors);
}

async function handleList(env, cors) {
  await ensureSchema(env.PINBOARD_DB);
  const result = await env.PINBOARD_DB
    .prepare(
      `SELECT id, reference_code, created_at, updated_at, confirmed_at, status,
              project_title, principal_name, contact_name, reference,
              confirmation_channel, airtable_sync_status
       FROM publication_release_confirmations
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 200`
    )
    .all();

  return json({
    ok: true,
    entries: Array.isArray(result.results) ? result.results.map(mapListRow) : []
  }, 200, cors);
}

async function findReleaseRow(env, referenceCode) {
  await ensureSchema(env.PINBOARD_DB);
  return env.PINBOARD_DB
    .prepare(
      `SELECT *
       FROM publication_release_confirmations
       WHERE reference_code = ?
       LIMIT 1`
    )
    .bind(referenceCode)
    .first();
}

async function handleDetail(env, referenceCode, cors) {
  const row = await findReleaseRow(env, referenceCode);
  if (!row) return json({ error: "Freigabe nicht gefunden." }, 404, cors);
  return json({ ok: true, entry: mapDetailRow(row) }, 200, cors);
}

async function handlePdf(env, referenceCode, stage, cors) {
  const row = await findReleaseRow(env, referenceCode);
  if (!row) return json({ error: "Freigabe nicht gefunden." }, 404, cors);

  const release = releaseFromRow(row);
  const requestedStatus =
    stage === "prepared" ? "prepared" : stage === "confirmed" ? "confirmed" : row.status;
  if (requestedStatus === "confirmed" && row.status !== "confirmed") {
    return json({ error: "Die Freigabe wurde noch nicht bestätigt." }, 409, cors);
  }

  const document = buildPublicationReleaseDocument(
    documentPayload(release, {
      id: row.id,
      referenceCode: row.reference_code,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at || "",
      status: requestedStatus,
      confirmationChannel: row.confirmation_channel || "",
      confirmationText: row.customer_confirmation_text || "",
      confirmationContext: row.confirmation_context || "",
      evidenceName: row.evidence_filename || ""
    })
  );

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

async function handleEvidence(env, referenceCode, cors) {
  const row = await findReleaseRow(env, referenceCode);
  if (!row) return json({ error: "Freigabe nicht gefunden." }, 404, cors);
  if (!row.evidence_content_base64 || !row.evidence_media_type) {
    return json({ error: "Kein zusätzlicher Nachweis hinterlegt." }, 404, cors);
  }

  const binary = atob(row.evidence_content_base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      ...cors,
      "content-type": row.evidence_media_type,
      "content-disposition": `attachment; filename="${normalizeText(
        row.evidence_filename || "nachweis",
        160
      ).replace(/[^A-Za-z0-9._-]+/g, "-")}"`,
      "cache-control": "no-store"
    }
  });
}

async function handleAdminGet(request, env, cors, mode) {
  const url = new URL(request.url);
  const referenceCode = normalizeText(url.searchParams.get("reference"), 80);

  if (mode === "list") return handleList(env, cors);
  if (mode === "detail") return handleDetail(env, referenceCode, cors);
  if (mode === "pdf") {
    return handlePdf(env, referenceCode, url.searchParams.get("stage") || "", cors);
  }
  if (mode === "evidence") return handleEvidence(env, referenceCode, cors);
  return json({ error: "Unbekannter interner Modus." }, 400, cors);
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  if (String(env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== String(env.ALLOWED_ORIGIN).trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, cors);
    }
  }

  try {
    const internalMode = ["prepare", "confirm", "list", "detail", "pdf", "evidence"].includes(mode);
    if (internalMode && !isAdminRequest(request, env)) {
      return json({ error: "Nicht autorisiert." }, 401, cors);
    }

    if (request.method === "GET" && internalMode) {
      return await handleAdminGet(request, env, cors, mode);
    }

    if (request.method === "GET") {
      return json({
        ok: true,
        declarationVersion: DECLARATION_VERSION,
        declarationStand: DECLARATION_STAND
      }, 200, cors);
    }

    if (request.method === "POST" && mode === "prepare") {
      return await handlePrepare(request, env, cors);
    }

    if (request.method === "POST" && mode === "confirm") {
      return await handleConfirm(request, env, cors);
    }

    if (request.method === "POST" && !mode) {
      return await handlePublicSubmission(request, env, cors);
    }

    return json({ error: "Methode nicht erlaubt." }, 405, cors);
  } catch (error) {
    console.error("[veroeffentlichungsfreigabe] request failed", error);
    return json({ error: "Interner Fehler. Bitte später erneut versuchen." }, 500, cors);
  }
}
