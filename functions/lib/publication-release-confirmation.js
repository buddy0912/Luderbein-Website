import { buildTextPdfDocument } from "./rights-confirmation.js";

function formatDisplayDate(createdAt) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return String(createdAt || "");

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Berlin"
  }).format(date);
}

function safeFilenamePart(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function buildPublicationReferenceCode(id, createdAt) {
  const compactId = String(id || "").replace(/-/g, "").toUpperCase();
  const datePart = String(createdAt || "").slice(2, 10).replace(/-/g, "") || "000000";
  return `VF-${datePart}-${compactId.slice(0, 8)}`;
}

export function buildPublicationReleaseDocument(payload) {
  const isPrepared = payload.status === "prepared";
  const title = isPrepared
    ? "Vorbereitete Veröffentlichungsfreigabe"
    : "Bestätigte Veröffentlichungsfreigabe";
  const subtitle = `Referenzcode ${payload.referenceCode}`;
  const selectedChannels = payload.selectedChannels.length
    ? payload.selectedChannels
    : ["keine Auswahl"];
  const selectedAdditions = payload.selectedAdditions.length
    ? payload.selectedAdditions
    : ["keine zusätzlichen Inhalte"];

  const lines = [
    `Status: ${
      isPrepared
        ? "Von Luderbein vorbereitet - Kundenbestätigung ausstehend"
        : "Bestätigt"
    }`,
    `Referenzcode: ${payload.referenceCode}`,
    `Vorbereitet am: ${formatDisplayDate(payload.createdAt)} (Europe/Berlin)`,
    `Textversion: ${payload.declarationVersion} / Stand ${payload.declarationStand}`,
    "",
    `Projekt: ${payload.projectTitle}`,
    `Kunde / Auftraggeber: ${payload.principalName}`,
    `Freigebende Person: ${payload.contactName}`,
    `Funktion / Rolle: ${payload.contactRole || "nicht angegeben"}`,
    `E-Mail: ${payload.email}`,
    `Rechnungsnummer / Auftragsreferenz: ${payload.reference}`,
    `Einschränkung / Hinweis: ${payload.note || "nicht angegeben"}`,
    "",
    "Aktiv freigegebene Veröffentlichungskanäle:",
    ...selectedChannels.map((label) => `- ${label}`),
    "",
    `Darstellung des Auftraggebers: ${payload.attributionLabel}`,
    "",
    "Zusätzliche freigegebene Inhalte:",
    ...selectedAdditions.map((label) => `- ${label}`),
    "",
    `Erkennbare Personen: ${payload.personStatusLabel}`,
    "",
    "\f",
    isPrepared ? "Mit der Zustimmung werden bestätigt:" : "Bestätigt wurde:",
    "- Berechtigung zu den erforderlichen Rechten an kundenseitig gelieferten Bestandteilen.",
    "- Freiwilligkeit und Widerrufsmöglichkeit für die Zukunft.",
    "- Richtigkeit der Angaben und Vertretungsberechtigung.",
    "- Kenntnisnahme der Datenschutzhinweise zur Dokumentation.",
    "",
    "Rechteumfang:",
    "Einfache, nicht ausschließliche Nutzungsrechte ausschließlich für die aktiv gewählten Nutzungsarten",
    "und inhaltlich begrenzt auf das bezeichnete Projekt. Das Urheberrecht wird nicht übertragen.",
    "",
    "Widerruf:",
    "Die Freigabe kann mit Wirkung für die Zukunft gegenüber Luderbein widerrufen werden.",
    "Bis zum Widerruf erfolgte Nutzungen bleiben unberührt. Bereits hergestellte Drucksachen können",
    "nicht zurückgerufen werden; beherrschbare digitale Veröffentlichungen werden nach Prüfung angepasst.",
    "",
    isPrepared ? "Einfache Bestätigungsfrage:" : "Dokumentierte Kundenbestätigung:",
    isPrepared
      ? "Darf Luderbein das oben beschriebene Projekt im angegebenen Umfang veröffentlichen?"
      : `Bestätigungsweg: ${payload.confirmationChannelLabel || "Website"}`,
    isPrepared
      ? "Eine eindeutige zustimmende Antwort im Zusammenhang mit dieser Anfrage genügt."
      : `Bestätigt am: ${formatDisplayDate(payload.confirmedAt || payload.createdAt)} (Europe/Berlin)`,
    isPrepared
      ? "Ein unklarer Hinweis oder eine ausweichende Antwort gilt nicht als Bestätigung."
      : `Antwort im Wortlaut: ${payload.confirmationText || "Aktive Bestätigung über das Website-Formular."}`,
    !isPrepared && payload.confirmationContext
      ? `Dokumentierter Abfragekontext: ${payload.confirmationContext}`
      : "",
    !isPrepared
      ? "Luderbein hat die Antwort im dargestellten Zusammenhang als eindeutig zustimmend dokumentiert."
      : "",
    !isPrepared && payload.evidenceName
      ? `Zusätzlicher Nachweis hinterlegt: ${payload.evidenceName}`
      : "",
    "",
    isPrepared
      ? "Dieses Dokument ist noch keine bestätigte Freigabe."
      : "Eine handschriftliche Unterschrift ist für diesen dokumentierten Bestätigungsvorgang nicht erforderlich."
  ];

  const filenameProject = safeFilenamePart(payload.projectTitle) || "projekt";
  const filename = `${
    isPrepared ? "veroeffentlichungsfreigabe-vorbereitet" : "veroeffentlichungsfreigabe-bestaetigt"
  }-${filenameProject}-${payload.referenceCode}.pdf`;

  return {
    ...buildTextPdfDocument({
      title,
      subtitle,
      lines,
      filename
    }),
    referenceCode: payload.referenceCode
  };
}
