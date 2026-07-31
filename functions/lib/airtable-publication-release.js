const DEFAULT_BASE_ID = "appv7YqLyKbEqN87V";
const DEFAULT_TABLE_ID = "tblTAzo5wBT1rQCew";
const DEFAULT_NOTIFICATION_USER_ID = "usrynklT5tRc7chHf";

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
  notificationUser: "fldezxd27sSxuYUye"
};

const CHANNEL_VALUES = {
  website: "Website",
  socialMedia: "Social Media",
  digitalPortfolio: "Digitales Portfolio",
  printedMaterials: "Gedruckte Materialien"
};

const ATTRIBUTION_VALUES = {
  named: "Kunde darf genannt werden",
  anonymous: "Nur anonymisiert"
};

const ADDITION_VALUES = {
  projectStory: "Entstehung, Entwicklung und Herstellung",
  eventPhotos: "Übergabe / Veranstaltung"
};

const PERSON_VALUES = {
  "none-visible": "Keine Personen erkennbar",
  "original-authorized": "Originaldarstellung erlaubt",
  "anonymized-only": "Nur verpixelt / anonymisiert"
};

function activeValues(selection, labels) {
  return Object.entries(labels)
    .filter(([key]) => selection[key] === true)
    .map(([, label]) => label);
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
    [FIELD_IDS.email]: payload.email,
    [FIELD_IDS.channels]: activeValues(payload.selection, CHANNEL_VALUES),
    [FIELD_IDS.attribution]: ATTRIBUTION_VALUES[payload.attribution],
    [FIELD_IDS.additions]: activeValues(payload.selection, ADDITION_VALUES),
    [FIELD_IDS.personStatus]: PERSON_VALUES[payload.personStatus],
    [FIELD_IDS.declarationVersion]: payload.declarationVersion,
    [FIELD_IDS.createdAt]: payload.createdAt,
    [FIELD_IDS.d1Id]: payload.id
  };

  if (payload.contactRole) fields[FIELD_IDS.contactRole] = payload.contactRole;
  if (payload.note) fields[FIELD_IDS.note] = payload.note;

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      records: [{ fields }],
      typecast: false
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`AIRTABLE_${response.status}`);

  const recordId = data?.records?.[0]?.id;
  if (!recordId) throw new Error("AIRTABLE_RESPONSE_INVALID");

  const notificationUserId = String(
    env.AIRTABLE_NOTIFICATION_USER_ID || DEFAULT_NOTIFICATION_USER_ID
  ).trim();
  let notificationStatus = "not_configured";

  if (/^usr[a-zA-Z0-9]{14}$/.test(notificationUserId)) {
    const notificationResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            [FIELD_IDS.notificationUser]: { id: notificationUserId }
          },
          typecast: false
        })
      }
    );

    notificationStatus = notificationResponse.ok ? "assigned" : "failed";
  }

  return {
    status: "synced",
    recordId,
    notificationStatus
  };
}
