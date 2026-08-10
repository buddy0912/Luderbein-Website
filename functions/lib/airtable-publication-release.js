const DEFAULT_BASE_ID = "appv7YqLyKbEqN87V";
const DEFAULT_TABLE_ID = "tblTAzo5wBT1rQCew";

const FIELD_IDS = {
  referenceCode: "fldUpsJGjQmF07ee5",
  reference: "fldLQ1MBHiXvEkQdM",
  projectTitle: "fldwF9Z1lufzfr1f4",
  principalName: "fldNhY3f8Xw4qiwBu",
  contactName: "fldm5U4SROqllpVmh",
  contactRole: "fldqMcqjRWPPuot7W",
  email: "fldax5Nfxxd43j5vw",
  channels: "fldyLnjUUzHZwfbBV",
  attribution: "fldCybx8LdEJ6Z0hG",
  additions: "fldgFa3BZoommi8KX",
  personStatus: "fldoeDejV5uQLbTXM",
  note: "fldL0IW1yTU4qKc7b",
  declarationVersion: "fldAjCsmMdCSH3XBw",
  createdAt: "fldf2S0t9hcNftjPD",
  d1Id: "fld4AG9P9uDn5D3qd",
  status: "fldL2C45ryjkPRjG6",
  confirmationChannel: "fldCCErHR56DTbhPQ",
  confirmationText: "fld5ls2yhatEyf60o"
};

const CHANNEL_VALUES = {
  websitePortfolio: "Website",
  instagram: "Social Media",
  facebook: "Social Media",
  whatsappStatus: "Social Media",
  digitalReference: "Digitales Portfolio",
  printedReferences: "Gedruckte Materialien"
};

const ATTRIBUTION_VALUES = {
  named: "Kunde darf genannt werden",
  anonymous: "Nur anonymisiert"
};

const ADDITION_VALUES = {
  creationProcess: "Entstehung, Entwicklung und Herstellung",
  handoverPresentation: "Übergabe / Veranstaltung"
};

const PERSON_VALUES = {
  "none-visible": "Keine Personen erkennbar",
  "original-authorized": "Originaldarstellung erlaubt",
  "anonymized-only": "Nur verpixelt / anonymisiert"
};

const CONFIRMATION_CHANNEL_VALUES = {
  website: "Website",
  whatsapp: "WhatsApp",
  email: "E-Mail"
};

const VISIBLE_INFO_NOTE_VALUES = {
  none: "Keine persönlichen Angaben sichtbar",
  all: "Alle sichtbaren Namen, Daten oder Widmungen dürfen gezeigt werden",
  specified: "Nur bestimmte Angaben; Rest unkenntlich machen"
};

const PERSON_NOTE_VALUES = {
  "none-visible": "Keine Personen erkennbar",
  "not-publish": "Erkennbare Personen nicht veröffentlichen",
  "original-authorized": "Erkennbare Personen dürfen gezeigt werden; Zustimmungen liegen vor",
  "anonymized-only": "Erkennbare Personen unkenntlich machen"
};

function activeValues(selection, labels) {
  return [...new Set(Object.entries(labels)
    .filter(([key]) => selection[key] === true)
    .map(([, label]) => label))];
}

function buildWorkingNote(payload) {
  const selectedContent = [
    payload.selection.finishedWork && "Fertiges Werkstück",
    payload.selection.detailShots && "Detailaufnahmen",
    payload.selection.creationProcess && "Entstehung und Herstellung",
    payload.selection.handoverPresentation && "Übergabe oder Präsentation",
    payload.selection.customerProvidedMedia && "Vom Kunden bereitgestellte Bilder / Videos",
    payload.shownOtherText && `Sonstiges: ${payload.shownOtherText}`
  ].filter(Boolean);
  const lines = [
    `Freigegebenes Material: ${payload.materialDescription}`,
    `Was gezeigt werden darf: ${selectedContent.join(", ")}`,
    `Bezeichnung: ${ATTRIBUTION_VALUES[payload.attribution]}${payload.attributionName ? ` (${payload.attributionName})` : ""}`,
    `Kurze Projektbeschreibung: ${payload.projectDescriptionAllowed ? "erlaubt" : "nicht freigegeben"}`,
    `Nicht nennen: ${payload.designationExclusions || "keine Angabe"}`,
    `Sichtbare Angaben: ${VISIBLE_INFO_NOTE_VALUES[payload.visibleInfoStatus] || payload.visibleInfoStatus}${payload.visibleInfoDetails ? ` (${payload.visibleInfoDetails})` : ""}`,
    `Personen: ${PERSON_NOTE_VALUES[payload.personStatus] || payload.personStatus}`,
    `Minderjährige: ${payload.minorsAuthorized ? "Zustimmung liegt vor" : "nicht bestätigt / nicht zutreffend"}`,
    `Zusatz Personen: ${payload.personRestrictions || "keine Angabe"}`,
    `Weitere Nutzung: ${payload.destinationOtherText || "keine Angabe"}`,
    `Besondere Wünsche: ${payload.note || "keine Angabe"}`
  ];
  return lines.join("\n").slice(0, 9000);
}

export async function syncPublicationReleaseToAirtable(env, payload) {
  const token = String(env.AIRTABLE_TOKEN || "").trim();
  if (!token) return { status: "not_configured" };

  const baseId = String(env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID).trim();
  const tableId = String(env.AIRTABLE_TABLE_ID || DEFAULT_TABLE_ID).trim();
  if (!/^app[a-zA-Z0-9]{14}$/.test(baseId) || !/^tbl[a-zA-Z0-9]{14}$/.test(tableId)) {
    throw new Error("AIRTABLE_CONFIG_INVALID");
  }

  const fields = {
    [FIELD_IDS.referenceCode]: payload.referenceCode,
    [FIELD_IDS.reference]: payload.reference,
    [FIELD_IDS.projectTitle]: payload.projectTitle,
    [FIELD_IDS.principalName]: payload.principalName,
    [FIELD_IDS.contactName]: payload.contactName,
    [FIELD_IDS.channels]: activeValues(payload.selection, CHANNEL_VALUES),
    [FIELD_IDS.attribution]: ATTRIBUTION_VALUES[payload.attribution],
    [FIELD_IDS.additions]: activeValues(payload.selection, ADDITION_VALUES),
    [FIELD_IDS.personStatus]: PERSON_VALUES[payload.personStatus],
    [FIELD_IDS.declarationVersion]: payload.declarationVersion,
    [FIELD_IDS.createdAt]: payload.confirmedAt || payload.createdAt,
    [FIELD_IDS.d1Id]: payload.id,
    [FIELD_IDS.status]: "Bestätigt",
    [FIELD_IDS.confirmationChannel]:
      CONFIRMATION_CHANNEL_VALUES[payload.confirmationChannel] || "Website",
    [FIELD_IDS.confirmationText]:
      payload.confirmationText || "Aktive Bestätigung über das öffentliche Website-Formular."
  };

  if (payload.contactRole) fields[FIELD_IDS.contactRole] = payload.contactRole;
  if (payload.email) fields[FIELD_IDS.email] = payload.email;
  fields[FIELD_IDS.note] = buildWorkingNote(payload);

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      performUpsert: {
        fieldsToMergeOn: [FIELD_IDS.referenceCode]
      },
      records: [{ fields }],
      typecast: false
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`AIRTABLE_${response.status}`);

  const recordId = data?.records?.[0]?.id;
  if (!recordId) throw new Error("AIRTABLE_RESPONSE_INVALID");

  return {
    status: "synced",
    recordId
  };
}
