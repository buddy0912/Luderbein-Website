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
  const title = "Bestätigung Veröffentlichungsfreigabe";
  const subtitle = `Referenzcode ${payload.referenceCode}`;
  const selectedChannels = payload.selectedChannels.length
    ? payload.selectedChannels
    : ["keine Auswahl"];
  const selectedAdditions = payload.selectedAdditions.length
    ? payload.selectedAdditions
    : ["keine zusätzlichen Inhalte"];

  const lines = [
    `Referenzcode: ${payload.referenceCode}`,
    `Datum/Uhrzeit: ${formatDisplayDate(payload.createdAt)} (Europe/Berlin)`,
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
    "Bestätigungen:",
    "- Berechtigung zu den erforderlichen Rechten an kundenseitig gelieferten Bestandteilen bestätigt.",
    "- Freiwilligkeit und Widerrufsmöglichkeit für die Zukunft bestätigt.",
    "- Richtigkeit der Angaben und Vertretungsberechtigung bestätigt.",
    "- Datenschutzhinweise zur Dokumentation zur Kenntnis genommen.",
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
    "Diese Bestätigung wurde digital durch aktive Auswahl und Absenden des Online-Formulars abgegeben.",
    "Eine handschriftliche Eingabe ist für diesen digitalen Bestätigungsvorgang nicht erforderlich."
  ];

  const filenameProject = safeFilenamePart(payload.projectTitle) || "projekt";
  const filename = `veroeffentlichungsfreigabe-${filenameProject}-${payload.referenceCode}.pdf`;

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
