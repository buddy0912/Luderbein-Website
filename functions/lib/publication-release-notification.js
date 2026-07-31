function readableList(values) {
  return values.length ? values.join(", ") : "keine";
}

export async function sendPublicationReleaseNotification(env, payload) {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const to = String(
    env.PUBLICATION_RELEASE_NOTIFY_TO || env.PINBOARD_NOTIFY_TO || ""
  ).trim();
  const from = String(
    env.PUBLICATION_RELEASE_EMAIL_FROM || env.PINBOARD_EMAIL_FROM || ""
  ).trim();

  if (!apiKey || !to || !from) return { status: "not_configured" };

  const lines = [
    "Neue Veröffentlichungsfreigabe",
    "",
    `Referenzcode: ${payload.referenceCode}`,
    `Auftragsreferenz: ${payload.reference}`,
    `Projekt: ${payload.projectTitle}`,
    `Kunde: ${payload.principalName}`,
    `Name: ${payload.contactName}`,
    `Funktion / Rolle: ${payload.contactRole || "nicht angegeben"}`,
    `E-Mail: ${payload.email}`,
    `Bestätigt am: ${payload.createdAt}`,
    "",
    `Kanäle: ${readableList(payload.selectedChannels)}`,
    `Darstellung: ${payload.attributionLabel}`,
    `Zusätzliche Inhalte: ${readableList(payload.selectedAdditions)}`,
    `Personen: ${payload.personStatusLabel}`,
    `Hinweis: ${payload.note || "keiner"}`,
    "",
    `Textversion: ${payload.declarationVersion}`,
    `Airtable-Übertragung: ${payload.airtableSyncStatus}`
  ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Neue Veröffentlichungsfreigabe: ${payload.reference}`,
      text: lines.join("\n"),
      reply_to: [payload.email]
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`RESEND_${response.status}`);

  return {
    status: "sent",
    id: data?.id || ""
  };
}
