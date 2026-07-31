import {
  buildPublicationReferenceCode,
  buildPublicationReleaseDocument
} from "../lib/publication-release-confirmation.js";
import { syncPublicationReleaseToAirtable } from "../lib/airtable-publication-release.js";
import { sendPublicationReleaseNotification } from "../lib/publication-release-notification.js";

const MAX_BODY_CHARS = 18000;
const DECLARATION_VERSION = "VF-2026-07-31-04";
const DECLARATION_STAND = "31.07.2026";

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

  if (allowed) {
    return origin === allowed
      ? {
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "content-type"
        }
      : {};
  }

  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type"
      }
    : {};
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
        confirmation_text TEXT NOT NULL
      )`
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
}

function readSelection(body, labels) {
  return Object.entries(labels)
    .filter(([key]) => body[key] === true)
    .map(([, label]) => label);
}

async function handlePost(request, env, cors) {
  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  const raw = await request.text();
  if (!raw.trim()) return json({ error: "Body fehlt." }, 400, cors);
  if (raw.length > MAX_BODY_CHARS) return json({ error: "Payload zu groß." }, 413, cors);

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Ungültiges JSON." }, 400, cors);
  }

  if (normalizeText(body.websiteField, 100)) {
    return json({ ok: true }, 201, cors);
  }

  const formType = body.formType === "project" ? "project" : "general";
  const projectKey = normalizeText(body.projectKey, 120);
  const projectTitle = normalizeText(body.projectTitle, 180);
  const principalName = normalizeText(body.principalName, 180);
  const contactName = normalizeText(body.contactName, 120);
  const contactRole = normalizeText(body.contactRole, 120);
  const email = normalizeText(body.email, 200).toLowerCase();
  const reference = normalizeText(body.reference, 120);
  const note = normalizeMultilineText(body.note, 600);
  const selectedChannels = readSelection(body, CHANNELS);
  const selectedAdditions = readSelection(body, ADDITIONS);
  const attribution = ATTRIBUTION[body.attribution] ? body.attribution : "";
  const personStatus = PERSON_STATUS[body.personStatus] ? body.personStatus : "";

  if (!projectTitle || !principalName) {
    return json({ error: "Projekt und Auftraggeber fehlen." }, 400, cors);
  }
  if (!reference) {
    return json({ error: "Rechnungsnummer oder Auftragsreferenz fehlt." }, 400, cors);
  }
  if (!contactName) {
    return json({ error: "Bitte den eigenen Namen eintragen." }, 400, cors);
  }
  if (!email || !validEmail(email)) {
    return json({ error: "Eine gültige E-Mail-Adresse fehlt." }, 400, cors);
  }
  if (!selectedChannels.length) {
    return json({ error: "Bitte mindestens einen Veröffentlichungskanal aktiv auswählen." }, 400, cors);
  }
  if (!attribution) {
    return json({ error: "Bitte die namentliche oder anonymisierte Darstellung aktiv auswählen." }, 400, cors);
  }
  if (!personStatus) {
    return json({ error: "Bitte den Status zu erkennbaren Personen aktiv auswählen." }, 400, cors);
  }
  if (
    body.rightsAuthority !== true ||
    body.voluntaryConfirmation !== true ||
    body.accuracyConfirmation !== true ||
    body.privacyAcknowledgement !== true
  ) {
    return json({ error: "Bitte alle erforderlichen Bestätigungen aktiv abgeben." }, 400, cors);
  }

  await ensureSchema(env.PINBOARD_DB);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const referenceCode = buildPublicationReferenceCode(id, createdAt);
  const document = buildPublicationReleaseDocument({
    id,
    referenceCode,
    createdAt,
    projectTitle,
    principalName,
    contactName,
    contactRole,
    email,
    reference,
    note,
    selectedChannels,
    selectedAdditions,
    attributionLabel: ATTRIBUTION[attribution],
    personStatusLabel: PERSON_STATUS[personStatus],
    declarationVersion: DECLARATION_VERSION,
    declarationStand: DECLARATION_STAND
  });

  await env.PINBOARD_DB.prepare(
    `INSERT INTO publication_release_confirmations (
      id, reference_code, form_type, project_key, project_title, principal_name,
      contact_name, contact_role, contact_email, reference, note,
      website, social_media, digital_portfolio, printed_materials,
      attribution, project_story, event_photos, rights_authority, person_status,
      voluntary_confirmation, accuracy_confirmation, privacy_acknowledgement,
      declaration_version, declaration_snapshot, created_at,
      confirmation_filename, confirmation_media_type, confirmation_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      referenceCode,
      formType,
      projectKey || null,
      projectTitle,
      principalName,
      contactName,
      contactRole,
      email,
      reference || null,
      note || null,
      body.website === true ? 1 : 0,
      body.socialMedia === true ? 1 : 0,
      body.digitalPortfolio === true ? 1 : 0,
      body.printedMaterials === true ? 1 : 0,
      attribution,
      body.projectStory === true ? 1 : 0,
      body.eventPhotos === true ? 1 : 0,
      1,
      personStatus,
      1,
      1,
      1,
      DECLARATION_VERSION,
      JSON.stringify(buildSnapshot()),
      createdAt,
      document.filename,
      document.mediaType,
      document.textContent
  )
    .run();

  let airtableSync = { status: "not_configured" };
  try {
    airtableSync = await syncPublicationReleaseToAirtable(env, {
      id,
      referenceCode,
      reference,
      projectTitle,
      principalName,
      contactName,
      contactRole,
      email,
      note,
      attribution,
      personStatus,
      declarationVersion: DECLARATION_VERSION,
      createdAt,
      selection: {
        website: body.website === true,
        socialMedia: body.socialMedia === true,
        digitalPortfolio: body.digitalPortfolio === true,
        printedMaterials: body.printedMaterials === true,
        projectStory: body.projectStory === true,
        eventPhotos: body.eventPhotos === true
      }
    });
  } catch (error) {
    console.error(
      "[veroeffentlichungsfreigabe] Airtable sync failed",
      error instanceof Error ? error.message : "AIRTABLE_SYNC_FAILED"
    );
    airtableSync = { status: "failed" };
  }

  let notification = { status: "not_configured" };
  try {
    notification = await sendPublicationReleaseNotification(env, {
      referenceCode,
      reference,
      projectTitle,
      principalName,
      contactName,
      contactRole,
      email,
      note,
      createdAt,
      selectedChannels,
      selectedAdditions,
      attributionLabel: ATTRIBUTION[attribution],
      personStatusLabel: PERSON_STATUS[personStatus],
      declarationVersion: DECLARATION_VERSION,
      airtableSyncStatus: airtableSync.status
    });
  } catch (error) {
    console.error(
      "[veroeffentlichungsfreigabe] notification failed",
      error instanceof Error ? error.message : "NOTIFICATION_FAILED"
    );
    notification = { status: "failed" };
  }

  return json(
    {
      ok: true,
      referenceCode,
      createdAt,
      declarationVersion: DECLARATION_VERSION,
      airtableSyncStatus: airtableSync.status,
      airtableNotificationStatus: airtableSync.notificationStatus || "not_configured",
      notificationStatus: notification.status,
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

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (String(env.ALLOWED_ORIGIN || "").trim()) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== String(env.ALLOWED_ORIGIN).trim()) {
      return json({ error: "Origin nicht erlaubt." }, 403, cors);
    }
  }

  try {
    if (request.method === "GET") {
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
    if (request.method === "POST") {
      return await handlePost(request, env, cors);
    }
    return json({ error: "Methode nicht erlaubt." }, 405, cors);
  } catch (error) {
    console.error("[veroeffentlichungsfreigabe] request failed", error);
    return json({ error: "Interner Fehler. Bitte später erneut versuchen." }, 500, cors);
  }
}
