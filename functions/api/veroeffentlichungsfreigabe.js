import {
  buildPublicationReferenceCode,
  buildPublicationReleaseDocument
} from "../lib/publication-release-confirmation.js";
import { syncPublicationReleaseToAirtable } from "../lib/airtable-publication-release.js";

const MAX_PUBLIC_BODY_CHARS = 18000;
const MAX_INTERNAL_BODY_CHARS = 1200000;
const MAX_EVIDENCE_BYTES = 750 * 1024;
const DECLARATION_VERSION = "VF-1.0-2026-08-08";
const DECLARATION_STAND = "08.08.2026";

const CONTENT = {
  finishedWork: "Fertiges Werkstück",
  detailShots: "Detailaufnahmen",
  creationProcess: "Entstehung und Herstellung",
  handoverPresentation: "Übergabe oder Präsentation",
  customerProvidedMedia: "Vom Kunden bereitgestellte Bilder / Videos"
};

const CHANNELS = {
  websitePortfolio: "Website & Online-Portfolio",
  instagram: "Instagram: Beiträge, Storys, Reels",
  facebook: "Facebook: Beiträge, Storys, Videos",
  whatsappStatus: "WhatsApp-Status",
  digitalReference: "Digitales Referenzportfolio / Präsentation",
  printedReferences: "Gedruckte Referenz- & Werbemittel"
};

const ATTRIBUTION = {
  named: "Mit Name / Bezeichnung",
  anonymous: "Ohne Nennung des Kunden"
};

const VISIBLE_INFO = {
  none: "Keine persönlichen Angaben sichtbar",
  all: "Alle sichtbaren Namen, Daten oder Widmungen dürfen gezeigt werden",
  specified: "Nur bestimmte Angaben zeigen; alle übrigen zuordenbaren Angaben unkenntlich machen oder ausschneiden"
};

const PERSON_STATUS = {
  "none-visible": "Keine Personen erkennbar",
  "not-publish": "Erkennbare Personen nicht veröffentlichen",
  "original-authorized":
    "Erkennbare Personen dürfen gezeigt werden; erforderliche Zustimmungen liegen vor",
  "anonymized-only": "Erkennbare Personen unkenntlich machen"
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
    content: CONTENT,
    channels: CHANNELS,
    attribution: ATTRIBUTION,
    visibleInfo: VISIBLE_INFO,
    personStatus: PERSON_STATUS,
    rights:
      "Einfache, nicht ausschließliche und auf das bezeichnete Projekt, das freigegebene Material und die ausgewählten Nutzungen begrenzte Nutzungsrechte; keine Übertragung des Urheberrechts.",
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
        material_description TEXT,
        finished_work INTEGER,
        detail_shots INTEGER,
        creation_process INTEGER,
        handover_presentation INTEGER,
        customer_provided_media INTEGER,
        shown_other_text TEXT,
        website_portfolio INTEGER,
        instagram INTEGER,
        facebook INTEGER,
        whatsapp_status INTEGER,
        digital_reference INTEGER,
        printed_references INTEGER,
        destination_other_text TEXT,
        attribution_name TEXT,
        project_description_allowed INTEGER,
        designation_exclusions TEXT,
        visible_info_status TEXT,
        visible_info_details TEXT,
        minors_authorized INTEGER,
        person_restrictions TEXT,
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
  await addColumnIfMissing(db, columns, "material_description", "TEXT");
  await addColumnIfMissing(db, columns, "finished_work", "INTEGER");
  await addColumnIfMissing(db, columns, "detail_shots", "INTEGER");
  await addColumnIfMissing(db, columns, "creation_process", "INTEGER");
  await addColumnIfMissing(db, columns, "handover_presentation", "INTEGER");
  await addColumnIfMissing(db, columns, "customer_provided_media", "INTEGER");
  await addColumnIfMissing(db, columns, "shown_other_text", "TEXT");
  await addColumnIfMissing(db, columns, "website_portfolio", "INTEGER");
  await addColumnIfMissing(db, columns, "instagram", "INTEGER");
  await addColumnIfMissing(db, columns, "facebook", "INTEGER");
  await addColumnIfMissing(db, columns, "whatsapp_status", "INTEGER");
  await addColumnIfMissing(db, columns, "digital_reference", "INTEGER");
  await addColumnIfMissing(db, columns, "printed_references", "INTEGER");
  await addColumnIfMissing(db, columns, "destination_other_text", "TEXT");
  await addColumnIfMissing(db, columns, "attribution_name", "TEXT");
  await addColumnIfMissing(db, columns, "project_description_allowed", "INTEGER");
  await addColumnIfMissing(db, columns, "designation_exclusions", "TEXT");
  await addColumnIfMissing(db, columns, "visible_info_status", "TEXT");
  await addColumnIfMissing(db, columns, "visible_info_details", "TEXT");
  await addColumnIfMissing(db, columns, "minors_authorized", "INTEGER");
  await addColumnIfMissing(db, columns, "person_restrictions", "TEXT");

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

function normalizeRelease(body) {
  const release = {
    formType: body.formType === "project" ? "project" : "general",
    projectKey: normalizeText(body.projectKey, 120),
    projectTitle: normalizeText(body.projectTitle, 180),
    principalName: normalizeText(body.principalName, 180),
    contactName: normalizeText(body.contactName, 120),
    contactRole: normalizeText(body.contactRole, 120),
    email: normalizeText(body.email, 200).toLowerCase(),
    reference: normalizeText(body.reference, 120),
    materialDescription: normalizeMultilineText(body.materialDescription, 1000),
    note: normalizeMultilineText(body.note, 1000),
    shownOtherText: normalizeText(body.shownOtherText, 300),
    destinationOtherText: normalizeText(body.destinationOtherText, 300),
    attribution: ATTRIBUTION[body.attribution] ? body.attribution : "",
    attributionName: normalizeText(body.attributionName, 180),
    projectDescriptionAllowed: body.projectDescriptionAllowed === true,
    designationExclusions: normalizeText(body.designationExclusions, 400),
    visibleInfoStatus: VISIBLE_INFO[body.visibleInfoStatus] ? body.visibleInfoStatus : "",
    visibleInfoDetails: normalizeText(body.visibleInfoDetails, 500),
    personStatus: PERSON_STATUS[body.personStatus] ? body.personStatus : "",
    minorsAuthorized: body.minorsAuthorized === true,
    personRestrictions: normalizeText(body.personRestrictions, 500),
    selection: {
      finishedWork: body.finishedWork === true,
      detailShots: body.detailShots === true,
      creationProcess: body.creationProcess === true,
      handoverPresentation: body.handoverPresentation === true,
      customerProvidedMedia: body.customerProvidedMedia === true,
      websitePortfolio: body.websitePortfolio === true,
      instagram: body.instagram === true,
      facebook: body.facebook === true,
      whatsappStatus: body.whatsappStatus === true,
      digitalReference: body.digitalReference === true,
      printedReferences: body.printedReferences === true
    }
  };

  release.selectedContent = readSelection(release.selection, CONTENT);
  if (release.shownOtherText) release.selectedContent.push(`Sonstiges: ${release.shownOtherText}`);
  release.selectedChannels = readSelection(release.selection, CHANNELS);
  if (release.destinationOtherText) {
    release.selectedChannels.push(`Weitere Nutzung: ${release.destinationOtherText}`);
  }
  release.attributionLabel =
    release.attribution === "named" && release.attributionName
      ? `${ATTRIBUTION.named}: ${release.attributionName}`
      : ATTRIBUTION[release.attribution] || "";
  release.visibleInfoLabel = VISIBLE_INFO[release.visibleInfoStatus] || "";
  if (release.visibleInfoStatus === "specified" && release.visibleInfoDetails) {
    release.visibleInfoLabel += `: ${release.visibleInfoDetails}`;
  }
  release.personStatusLabel = PERSON_STATUS[release.personStatus] || "";

  if (!release.projectTitle || !release.principalName) {
    return { error: "Projekt und Auftraggeber fehlen." };
  }
  if (!release.reference) {
    return { error: "Rechnungsnummer oder Auftragsreferenz fehlt." };
  }
  if (!release.contactName) {
    return { error: "Bitte die bestätigende Person eintragen." };
  }
  if (release.email && !validEmail(release.email)) {
    return { error: "Die angegebene E-Mail-Adresse ist ungültig." };
  }
  if (!release.materialDescription) {
    return { error: "Bitte das freigegebene Material eindeutig beschreiben." };
  }
  if (!release.selectedContent.length) {
    return { error: "Bitte mindestens einen freigegebenen Inhalt auswählen." };
  }
  if (!release.selectedChannels.length) {
    return { error: "Bitte mindestens einen Veröffentlichungsort auswählen." };
  }
  if (!release.attribution) {
    return { error: "Bitte die Bezeichnung des Kunden festlegen." };
  }
  if (release.attribution === "named" && !release.attributionName) {
    return { error: "Bitte den freigegebenen Namen oder die Bezeichnung eintragen." };
  }
  if (!release.visibleInfoStatus) {
    return { error: "Bitte den Umgang mit sichtbaren Angaben festlegen." };
  }
  if (release.visibleInfoStatus === "specified" && !release.visibleInfoDetails) {
    return { error: "Bitte die erlaubten sichtbaren Angaben eintragen." };
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
    `Freigegebenes Material: ${release.materialDescription}`,
    "",
    "Was gezeigt werden darf:",
    ...release.selectedContent.map((label) => `- ${label}`),
    "",
    "Wo veröffentlicht werden darf:",
    ...release.selectedChannels.map((label) => `- ${label}`),
    "",
    `Bezeichnung: ${release.attributionLabel}`,
    `Kurze sachliche Projektbeschreibung: ${release.projectDescriptionAllowed ? "erlaubt" : "nicht freigegeben"}`,
    `Nicht nennen: ${release.designationExclusions || "keine Angabe"}`,
    `Sichtbare Angaben: ${release.visibleInfoLabel}`,
    `Personen: ${release.personStatusLabel}`,
    `Minderjährige: ${release.minorsAuthorized ? "Zustimmung der gesetzlichen Vertretung liegt vor" : "nicht bestätigt / nicht zutreffend"}`,
    `Zusatz zu Personen: ${release.personRestrictions || "keine Angabe"}`,
    `Besondere Wünsche oder Einschränkungen: ${release.note || "keine Angabe"}`,
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
    materialDescription: release.materialDescription,
    note: release.note,
    selectedContent: release.selectedContent,
    selectedChannels: release.selectedChannels,
    attributionLabel: release.attributionLabel,
    projectDescriptionAllowed: release.projectDescriptionAllowed,
    designationExclusions: release.designationExclusions,
    visibleInfoLabel: release.visibleInfoLabel,
    personStatusLabel: release.personStatusLabel,
    minorsAuthorized: release.minorsAuthorized,
    personRestrictions: release.personRestrictions,
    declarationVersion: DECLARATION_VERSION,
    declarationStand: DECLARATION_STAND,
    confirmationChannelLabel: CONFIRMATION_CHANNELS[values.confirmationChannel] || "",
    confirmationText: values.confirmationText || "",
    confirmationContext: values.confirmationContext || "",
    evidenceName: values.evidenceName || ""
  };
}

function releaseFromRow(row) {
  const isV1 = row.material_description !== null && row.material_description !== undefined;
  const selection = {
    finishedWork: isV1 ? row.finished_work === 1 : true,
    detailShots: isV1 ? row.detail_shots === 1 : false,
    creationProcess: isV1 ? row.creation_process === 1 : row.project_story === 1,
    handoverPresentation: isV1 ? row.handover_presentation === 1 : row.event_photos === 1,
    customerProvidedMedia: isV1 ? row.customer_provided_media === 1 : false,
    websitePortfolio: isV1 ? row.website_portfolio === 1 : row.website === 1,
    instagram: isV1 ? row.instagram === 1 : false,
    facebook: isV1 ? row.facebook === 1 : false,
    whatsappStatus: isV1 ? row.whatsapp_status === 1 : false,
    digitalReference: isV1 ? row.digital_reference === 1 : row.digital_portfolio === 1,
    printedReferences: isV1 ? row.printed_references === 1 : row.printed_materials === 1
  };

  const selectedContent = isV1
    ? readSelection(selection, CONTENT)
    : [
        "Fertiges Kundenprojekt (Altbestand)",
        ...(row.project_story === 1 ? ["Entstehung, Entwicklung und Herstellung"] : []),
        ...(row.event_photos === 1 ? ["Fotos einer Übergabe oder Veranstaltung"] : [])
      ];
  if (isV1 && row.shown_other_text) selectedContent.push(`Sonstiges: ${row.shown_other_text}`);

  const selectedChannels = isV1
    ? readSelection(selection, CHANNELS)
    : [
        ...(row.website === 1 ? ["Werkfotos auf der Luderbein-Website"] : []),
        ...(row.social_media === 1 ? ["Social Media (Altbestand)"] : []),
        ...(row.digital_portfolio === 1 ? ["Digitales Portfolio"] : []),
        ...(row.printed_materials === 1 ? ["Gedruckte Referenz- und Werbemittel"] : [])
      ];
  if (isV1 && row.destination_other_text) {
    selectedChannels.push(`Weitere Nutzung: ${row.destination_other_text}`);
  }

  const attribution = row.attribution;
  const attributionName = row.attribution_name || "";
  const attributionLabel = isV1
    ? attribution === "named" && attributionName
      ? `${ATTRIBUTION.named}: ${attributionName}`
      : ATTRIBUTION[attribution] || ""
    : attribution === "named"
      ? "Nennung des Kunden oder Auftraggebers (Altbestand)"
      : "Nur anonymisierte Veröffentlichung (Altbestand)";
  const visibleInfoStatus = row.visible_info_status || "";
  const visibleInfoLabel = isV1
    ? `${VISIBLE_INFO[visibleInfoStatus] || "nicht festgelegt"}${
        visibleInfoStatus === "specified" && row.visible_info_details
          ? `: ${row.visible_info_details}`
          : ""
      }`
    : "In der damaligen Textversion nicht separat erfasst";

  return {
    formType: row.form_type,
    projectKey: row.project_key || "",
    projectTitle: row.project_title,
    principalName: row.principal_name,
    contactName: row.contact_name,
    contactRole: row.contact_role || "",
    email: row.contact_email || "",
    reference: row.reference || "",
    materialDescription: row.material_description || "In der damaligen Textversion nicht separat erfasst",
    note: row.note || "",
    shownOtherText: row.shown_other_text || "",
    destinationOtherText: row.destination_other_text || "",
    attribution,
    attributionName,
    attributionLabel,
    projectDescriptionAllowed: row.project_description_allowed === 1,
    designationExclusions: row.designation_exclusions || "",
    visibleInfoStatus,
    visibleInfoDetails: row.visible_info_details || "",
    visibleInfoLabel,
    personStatus: row.person_status,
    personStatusLabel: PERSON_STATUS[row.person_status] || row.person_status || "nicht festgelegt",
    minorsAuthorized: row.minors_authorized === 1,
    personRestrictions: row.person_restrictions || "",
    selection,
    selectedContent,
    selectedChannels
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
    materialDescription: release.materialDescription,
    note: release.note,
    selection: release.selection,
    selectedContent: release.selectedContent,
    selectedChannels: release.selectedChannels,
    attribution: release.attribution,
    attributionName: release.attributionName,
    attributionLabel: release.attributionLabel,
    projectDescriptionAllowed: release.projectDescriptionAllowed,
    designationExclusions: release.designationExclusions,
    visibleInfoStatus: release.visibleInfoStatus,
    visibleInfoLabel: release.visibleInfoLabel,
    personStatus: release.personStatus,
    personStatusLabel: release.personStatusLabel,
    minorsAuthorized: release.minorsAuthorized,
    personRestrictions: release.personRestrictions,
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
      materialDescription: release.materialDescription,
      attribution: release.attribution,
      attributionName: release.attributionName,
      projectDescriptionAllowed: release.projectDescriptionAllowed,
      designationExclusions: release.designationExclusions,
      visibleInfoStatus: release.visibleInfoStatus,
      visibleInfoDetails: release.visibleInfoDetails,
      personStatus: release.personStatus,
      minorsAuthorized: release.minorsAuthorized,
      personRestrictions: release.personRestrictions,
      shownOtherText: release.shownOtherText,
      destinationOtherText: release.destinationOtherText,
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
      release.selection.websitePortfolio ? 1 : 0,
      release.selection.instagram || release.selection.facebook || release.selection.whatsappStatus ? 1 : 0,
      release.selection.digitalReference ? 1 : 0,
      release.selection.printedReferences ? 1 : 0,
      release.attribution,
      release.selection.creationProcess ? 1 : 0,
      release.selection.handoverPresentation ? 1 : 0,
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

  await db
    .prepare(
      `UPDATE publication_release_confirmations
       SET material_description = ?,
           finished_work = ?, detail_shots = ?, creation_process = ?,
           handover_presentation = ?, customer_provided_media = ?, shown_other_text = ?,
           website_portfolio = ?, instagram = ?, facebook = ?, whatsapp_status = ?,
           digital_reference = ?, printed_references = ?, destination_other_text = ?,
           attribution_name = ?, project_description_allowed = ?, designation_exclusions = ?,
           visible_info_status = ?, visible_info_details = ?, minors_authorized = ?,
           person_restrictions = ?
       WHERE id = ?`
    )
    .bind(
      release.materialDescription,
      release.selection.finishedWork ? 1 : 0,
      release.selection.detailShots ? 1 : 0,
      release.selection.creationProcess ? 1 : 0,
      release.selection.handoverPresentation ? 1 : 0,
      release.selection.customerProvidedMedia ? 1 : 0,
      release.shownOtherText || null,
      release.selection.websitePortfolio ? 1 : 0,
      release.selection.instagram ? 1 : 0,
      release.selection.facebook ? 1 : 0,
      release.selection.whatsappStatus ? 1 : 0,
      release.selection.digitalReference ? 1 : 0,
      release.selection.printedReferences ? 1 : 0,
      release.destinationOtherText || null,
      release.attributionName || null,
      release.projectDescriptionAllowed ? 1 : 0,
      release.designationExclusions || null,
      release.visibleInfoStatus,
      release.visibleInfoDetails || null,
      release.minorsAuthorized ? 1 : 0,
      release.personRestrictions || null,
      values.id
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

  const normalized = normalizeRelease(body);
  if (normalized.error) return json({ error: normalized.error }, 400, cors);
  if (body.finalConfirmation !== true) {
    return json({ error: "Bitte die ausgewählte Freigabe aktiv bestätigen." }, 400, cors);
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

  const normalized = normalizeRelease(parsed.body);
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
