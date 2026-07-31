import {
  buildPublicationReferenceCode,
  buildPublicationReleaseDocument
} from "../lib/publication-release-confirmation.js";

const MAX_BODY_CHARS = 20000;
const MAX_NAME_CHARS = 120;
const MAX_EMAIL_CHARS = 200;
const MAX_SHORT_CHARS = 160;
const MAX_NOTE_CHARS = 600;
const DECLARATION_VERSION = "VF-ENTWURF-2026-07-31";
const DECLARATION_STAND = "31.07.2026";

const PROJECTS = {
  general: null,
  "nachtwaechter-luderboegen-annaberg-buchholz": {
    projectTitle: "Nachtwächter-Luderbögen für die Stadt Annaberg-Buchholz",
    clientName: "Stadt Annaberg-Buchholz"
  }
};

const OPTION_DEFINITIONS = [
  ["website", "Werkfotos auf der Luderbein-Website"],
  ["socialMedia", "Veröffentlichung auf Social-Media-Kanälen von Luderbein"],
  ["digitalPortfolio", "Aufnahme in das digitale Portfolio von Luderbein"],
  ["printMaterials", "Nutzung in gedruckten Referenz- und Werbemitteln von Luderbein"],
  ["nameClient", "Nennung des Kunden oder Auftraggebers"],
  ["anonymous", "Anonymisierte Veröffentlichung ohne Nennung des Kunden oder Auftraggebers"],
  ["projectStory", "Beschreibung der Projektgeschichte und Darstellung als Referenzprojekt"],
  ["eventPhotos", "Fotos einer Übergabe oder Veranstaltung"]
];

const CONFIRMATION_TEXTS = [
  "Ich erteile die oben ausgewählten Freigaben freiwillig. Die Erteilung ist keine Voraussetzung für die Auftragsabwicklung; eine Ablehnung hat keine Nachteile für den Auftrag.",
  "Ich bestätige, dass ich, soweit Fotografien, Logos, Wappen, Texte oder sonstige Bestandteile kundenseitig bereitgestellt werden, zur Einräumung der erforderlichen einfachen Nutzungsrechte und Erlaubnisse im ausgewählten Umfang berechtigt bin.",
  "Soweit auf freigegebenem Material Personen erkennbar sind, liegen die für die ausgewählten Veröffentlichungen erforderlichen Zustimmungen vor; andernfalls enthält das Material keine erkennbaren Personen.",
  "Ich willige in die Verarbeitung meiner Formulardaten zur Dokumentation und zum Nachweis dieser Freigabe ein. Die Datenschutzhinweise und die Möglichkeit des jederzeitigen Widerrufs mit Wirkung für die Zukunft habe ich zur Kenntnis genommen."
];
const SCOPE_TEXT =
  "Für die aktiv ausgewählten Nutzungen wird Luderbein ein einfaches, nicht ausschließliches und auf diese Zwecke begrenztes Nutzungsrecht an den freigegebenen Bestandteilen eingeräumt. Es umfasst die technisch erforderliche Vervielfältigung, Format- und Größenanpassung sowie die Bereitstellung über die ausgewählten Kanäle. Eine pauschale Übertragung des Urheberrechts ist damit nicht verbunden.";
const WITHDRAWAL_TEXT =
  "Ein Widerruf wirkt für die Zukunft. Die Rechtmäßigkeit bereits erfolgter Verarbeitungen bleibt unberührt. Nach Eingang werden künftige Nutzungen eingestellt und bestehende Online-Veröffentlichungen geprüft; bereits hergestellte Drucksachen können nicht in jedem Fall zurückgerufen werden.";

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
    "Access-Control-Allow-Headers": "content-type"
  };

  if (!origin) return base;
  if (allowed && origin !== allowed) return {};
  return { ...base, "Access-Control-Allow-Origin": origin, Vary: "Origin" };
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

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function asBoolean(value) {
  return value === true;
}

function buildSnapshot(projectTitle, clientName) {
  return {
    title: "Veröffentlichungs- und Nutzungsfreigabe",
    projectTitle,
    clientName,
    version: DECLARATION_VERSION,
    stand: DECLARATION_STAND,
    draft: true,
    options: OPTION_DEFINITIONS.map(function ([key, label]) {
      return { key, label };
    }),
    confirmations: CONFIRMATION_TEXTS,
    scope: SCOPE_TEXT,
    withdrawal: WITHDRAWAL_TEXT
  };
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS publication_release_confirmations (
        id TEXT PRIMARY KEY,
        reference_code TEXT NOT NULL UNIQUE,
        release_kind TEXT NOT NULL,
        project_key TEXT NOT NULL,
        project_title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        organization TEXT,
        contact_role TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        note TEXT,
        declaration_version TEXT NOT NULL,
        declaration_snapshot TEXT NOT NULL,
        option_website INTEGER NOT NULL,
        option_social_media INTEGER NOT NULL,
        option_digital_portfolio INTEGER NOT NULL,
        option_print_materials INTEGER NOT NULL,
        option_name_client INTEGER NOT NULL,
        option_anonymous INTEGER NOT NULL,
        option_project_story INTEGER NOT NULL,
        option_event_photos INTEGER NOT NULL,
        rights_authority INTEGER NOT NULL,
        persons_consent INTEGER NOT NULL,
        release_confirmed INTEGER NOT NULL,
        privacy_consent INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        withdrawn_at TEXT,
        confirmation_filename TEXT NOT NULL,
        confirmation_media_type TEXT NOT NULL,
        confirmation_text TEXT NOT NULL,
        archive_storage TEXT NOT NULL,
        archive_key TEXT,
        archived_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_publication_releases_created_at
       ON publication_release_confirmations(created_at DESC)`
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_publication_releases_email
       ON publication_release_confirmations(contact_email, created_at DESC)`
    )
    .run();
}

async function archiveConfirmation(env, referenceCode, document, createdAt) {
  const archivedAt = new Date().toISOString();
  const bucket = env.RIGHTS_ARCHIVE_BUCKET;
  if (!bucket || typeof bucket.put !== "function") {
    return { storage: "d1", key: null, archivedAt };
  }

  const year = String(createdAt).slice(0, 4) || "unknown";
  const month = String(createdAt).slice(5, 7) || "00";
  const key = `publication-releases/${year}/${month}/${referenceCode}.pdf`;

  try {
    await bucket.put(key, document.pdfBytes, {
      httpMetadata: {
        contentType: document.mediaType,
        contentDisposition: `attachment; filename="${document.filename}"`
      },
      customMetadata: {
        confirmation_reference: referenceCode,
        declaration_version: DECLARATION_VERSION,
        declaration_type: "publication-release"
      }
    });
    return { storage: "r2", key, archivedAt };
  } catch (error) {
    console.error("[veroeffentlichungsfreigabe] r2 archive failed", error);
    return { storage: "d1", key: null, archivedAt };
  }
}

async function handleGrant(body, env, cors) {
  const projectKey = normalizeText(body.projectKey || "general", 100);
  if (!Object.prototype.hasOwnProperty.call(PROJECTS, projectKey)) {
    return json({ error: "Unbekannte Projektzuordnung." }, 400, cors);
  }

  const fixedProject = PROJECTS[projectKey];
  const projectTitle = fixedProject
    ? fixedProject.projectTitle
    : normalizeText(body.projectTitle, MAX_SHORT_CHARS);
  const clientName = fixedProject
    ? fixedProject.clientName
    : normalizeText(body.clientName, MAX_SHORT_CHARS);
  const name = normalizeText(body.name, MAX_NAME_CHARS);
  const organization = normalizeText(body.organization, MAX_SHORT_CHARS);
  const role = normalizeText(body.role, MAX_SHORT_CHARS);
  const email = normalizeText(body.email, MAX_EMAIL_CHARS).toLowerCase();
  const note = normalizeMultilineText(body.note, MAX_NOTE_CHARS);
  const selections = body.selections && typeof body.selections === "object" ? body.selections : {};
  const optionValues = Object.fromEntries(
    OPTION_DEFINITIONS.map(function ([key]) {
      return [key, asBoolean(selections[key])];
    })
  );

  if (!projectTitle || !clientName || !name || !role || !email || !isValidEmail(email)) {
    return json(
      { error: "Projekt, Auftraggeber, Name, Funktion und gültige E-Mail-Adresse sind erforderlich." },
      400,
      cors
    );
  }

  if (
    !optionValues.website &&
    !optionValues.socialMedia &&
    !optionValues.digitalPortfolio &&
    !optionValues.printMaterials
  ) {
    return json({ error: "Bitte mindestens einen Veröffentlichungskanal auswählen." }, 400, cors);
  }

  if (optionValues.nameClient === optionValues.anonymous) {
    return json(
      { error: "Bitte entweder Namensnennung oder anonymisierte Veröffentlichung auswählen." },
      400,
      cors
    );
  }

  const rightsAuthority = asBoolean(body.rightsAuthority);
  const personsConsent = asBoolean(body.personsConsent);
  const releaseConfirmed = asBoolean(body.releaseConfirmed);
  const privacyConsent = asBoolean(body.privacyConsent);

  if (!rightsAuthority || !personsConsent || !releaseConfirmed || !privacyConsent) {
    return json({ error: "Bitte alle vier Pflichtbestätigungen aktiv bestätigen." }, 400, cors);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const referenceCode = buildPublicationReferenceCode(id, createdAt);
  const options = OPTION_DEFINITIONS.map(function ([key, label]) {
    return { key, label, granted: optionValues[key] };
  });
  const snapshot = buildSnapshot(projectTitle, clientName);
  const document = buildPublicationReleaseDocument({
    id,
    referenceCode,
    createdAt,
    projectTitle,
    clientName,
    name,
    organization,
    role,
    email,
    note,
    declarationVersion: DECLARATION_VERSION,
    declarationStand: DECLARATION_STAND,
    options,
    confirmations: CONFIRMATION_TEXTS,
    scopeText: SCOPE_TEXT,
    withdrawalText: WITHDRAWAL_TEXT
  });
  const archive = await archiveConfirmation(env, referenceCode, document, createdAt);

  await env.PINBOARD_DB.prepare(
    `INSERT INTO publication_release_confirmations (
      id, reference_code, release_kind, project_key, project_title, client_name,
      contact_name, organization, contact_role, contact_email, note,
      declaration_version, declaration_snapshot,
      option_website, option_social_media, option_digital_portfolio, option_print_materials,
      option_name_client, option_anonymous, option_project_story, option_event_photos,
      rights_authority, persons_consent, release_confirmed, privacy_consent,
      created_at, withdrawn_at,
      confirmation_filename, confirmation_media_type, confirmation_text,
      archive_storage, archive_key, archived_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      referenceCode,
      fixedProject ? "project" : "general",
      projectKey,
      projectTitle,
      clientName,
      name,
      organization || null,
      role,
      email,
      note || null,
      DECLARATION_VERSION,
      JSON.stringify(snapshot),
      Number(optionValues.website),
      Number(optionValues.socialMedia),
      Number(optionValues.digitalPortfolio),
      Number(optionValues.printMaterials),
      Number(optionValues.nameClient),
      Number(optionValues.anonymous),
      Number(optionValues.projectStory),
      Number(optionValues.eventPhotos),
      1,
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
      referenceCode,
      createdAt,
      declarationVersion: DECLARATION_VERSION,
      declarationStand: DECLARATION_STAND,
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

async function handleWithdrawal(body, env, cors) {
  const referenceCode = normalizeText(body.referenceCode, 80).toUpperCase();
  const email = normalizeText(body.email, MAX_EMAIL_CHARS).toLowerCase();
  if (!referenceCode || !email || !isValidEmail(email)) {
    return json({ error: "Referenz-ID und gültige E-Mail-Adresse sind erforderlich." }, 400, cors);
  }

  const withdrawnAt = new Date().toISOString();
  await env.PINBOARD_DB.prepare(
    `UPDATE publication_release_confirmations
     SET withdrawn_at = COALESCE(withdrawn_at, ?)
     WHERE reference_code = ? AND contact_email = ?`
  )
    .bind(withdrawnAt, referenceCode, email)
    .run();

  return json(
    {
      ok: true,
      message:
        "Der Widerruf wurde entgegengenommen. Bei übereinstimmender Referenz und E-Mail-Adresse wird die Freigabe für die Zukunft als widerrufen markiert."
    },
    202,
    cors
  );
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const allowed = String(env.ALLOWED_ORIGIN || "").trim();
  const origin = request.headers.get("Origin") || "";
  if (allowed && origin && origin !== allowed) {
    return json({ error: "Origin nicht erlaubt." }, 403, cors);
  }

  if (!env.PINBOARD_DB) {
    return json({ error: "PINBOARD_DB fehlt." }, 500, cors);
  }

  try {
    await ensureSchema(env.PINBOARD_DB);

    if (request.method === "GET") {
      return json(
        {
          ok: true,
          declarationVersion: DECLARATION_VERSION,
          declarationStand: DECLARATION_STAND,
          draft: true
        },
        200,
        cors
      );
    }

    if (request.method !== "POST") {
      return json({ error: "Methode nicht erlaubt." }, 405, cors);
    }

    const raw = await request.text();
    if (!raw.trim()) return json({ error: "Body fehlt." }, 400, cors);
    if (raw.length > MAX_BODY_CHARS) return json({ error: "Payload zu groß." }, 413, cors);
    const body = safeJsonParse(raw);
    if (!body || typeof body !== "object") {
      return json({ error: "Ungültiges JSON." }, 400, cors);
    }

    return body.action === "withdraw"
      ? await handleWithdrawal(body, env, cors)
      : await handleGrant(body, env, cors);
  } catch (error) {
    console.error("[veroeffentlichungsfreigabe] request failed", error);
    return json({ error: "Interner Fehler. Bitte später erneut versuchen." }, 500, cors);
  }
}
