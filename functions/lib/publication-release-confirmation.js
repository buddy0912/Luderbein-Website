import { buildTextPdfDocument } from "./rights-confirmation.js";

function formatDisplayDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
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

function listOrFallback(values, fallback) {
  return Array.isArray(values) && values.length ? values : [fallback];
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
  const subtitle = `Version 1.0 - Referenzcode ${payload.referenceCode}`;
  const selectedContent = listOrFallback(payload.selectedContent, "keine Auswahl");
  const selectedChannels = listOrFallback(payload.selectedChannels, "keine Auswahl");

  const lines = [
    `STATUS: ${isPrepared ? "Kundenbestätigung ausstehend" : "Bestätigt"}`,
    `Referenzcode: ${payload.referenceCode}`,
    `Textversion: ${payload.declarationVersion} / Stand ${payload.declarationStand}`,
    `Vorbereitet am: ${formatDisplayDate(payload.createdAt)} (Europe/Berlin)`,
    "",
    "1  KUNDE & PROJEKT",
    `Kunde / Auftraggeber: ${payload.principalName}`,
    `Projekt / Werkstück: ${payload.projectTitle}`,
    `Auftragsnummer / Rechnungsnummer: ${payload.reference}`,
    `Name in Druckbuchstaben: ${payload.contactName}`,
    `Funktion: ${payload.contactRole || "nicht angegeben"}`,
    `E-Mail: ${payload.email}`,
    "",
    "2  FREIGEGEBENES MATERIAL",
    payload.materialDescription,
    "",
    "3  WAS DARF GEZEIGT WERDEN?",
    ...selectedContent.map((label) => `- ${label}`),
    "",
    "4  WO DARF VERÖFFENTLICHT WERDEN?",
    ...selectedChannels.map((label) => `- ${label}`),
    "",
    "5  BEZEICHNUNG",
    `Bezeichnung: ${payload.attributionLabel}`,
    `Kurze sachliche Projektbeschreibung: ${payload.projectDescriptionAllowed ? "erlaubt" : "nicht freigegeben"}`,
    `Nicht nennen: ${payload.designationExclusions || "keine Angabe"}`,
    "",
    "6  SICHTBARE ANGABEN",
    payload.visibleInfoLabel,
    "",
    "7  PERSONEN AUF BILDERN ODER VIDEOS",
    payload.personStatusLabel,
    `Minderjährige: ${payload.minorsAuthorized ? "Zustimmung der gesetzlichen Vertretung liegt vor" : "nicht bestätigt / nicht zutreffend"}`,
    `Zusatz / Einschränkung: ${payload.personRestrictions || "keine Angabe"}`,
    "",
    "8  BESONDERE WÜNSCHE ODER EINSCHRÄNKUNGEN",
    payload.note || "keine Angabe",
    "",
    "9  FREIGABE",
    "Ich bestätige die oben ausgewählten Freigaben.",
    "Ausgewählt ist freigegeben; nicht ausgewählt ist nicht freigegeben.",
    isPrepared
      ? "Dieses Dokument ist noch keine bestätigte Freigabe."
      : "Name und digitale Bestätigung genügen; keine Unterschrift nötig.",
    "\f",
    "HINWEISE & DATENSCHUTZ - VERSION 1.0",
    "",
    "1  UMFANG DER FREIGABE",
    "Die Freigabe gilt ausschließlich für das bezeichnete Projekt, das freigegebene Material und die ausgewählten Nutzungen. Luderbein Gravur erhält einfache, nicht ausschließliche und auf dieses Projekt begrenzte Nutzungsrechte. Eine Übertragung des Urheberrechts erfolgt nicht.",
    "",
    "2  FREIWILLIGKEIT & WIDERRUF",
    "Die Freigabe ist freiwillig und hat keinen Einfluss auf Angebot, Auftrag oder Preis. Sie kann jederzeit mit Wirkung für die Zukunft per E-Mail an luderbein_gravur@icloud.com widerrufen werden. Bis zum Widerruf erfolgte rechtmäßige Nutzungen bleiben unberührt.",
    "",
    "3  ZULÄSSIGE BEARBEITUNG",
    "Das freigegebene Material darf für die gewählten Nutzungen zugeschnitten, größenangepasst, technisch optimiert, komprimiert, umgewandelt und in Beiträgen oder Präsentationen angeordnet werden. Nicht freigegebene Angaben oder Personen dürfen unkenntlich gemacht werden. Das Werkstück darf dabei nicht irreführend verändert werden.",
    "",
    "4  PERSONEN & ZUSTIMMUNGEN",
    "Erkennbare Personen dürfen nur im freigegebenen Umfang veröffentlicht werden. Wird bestätigt, dass Personen gezeigt werden dürfen, müssen die erforderlichen Zustimmungen vorliegen. Bei Minderjährigen ist die Zustimmung der gesetzlichen Vertretung notwendig.",
    "",
    "5  KUNDENSEITIGE INHALTE & RECHTE",
    "Bei kundenseitig bereitgestellten Fotos, Grafiken, Logos, Wappen, Texten oder anderen geschützten Inhalten bestätigt die freigebende Person ihre Berechtigung für die ausgewählten Veröffentlichungen.",
    "",
    "6  DATENSCHUTZ",
    "Die Angaben werden zur Zuordnung des Projekts, zur Dokumentation der Auswahl und zum Nachweis der Freigabe verarbeitet. Der vollständige Nachweis wird in der geschützten Luderbein-Auftragsverwaltung dokumentiert; eine Arbeitskopie wird nach Bestätigung in Airtable gespeichert. Weitere Informationen stehen in der aktuellen Datenschutzerklärung von Luderbein Gravur.",
    "",
    isPrepared ? "EINFACHE BESTÄTIGUNGSFRAGE" : "DOKUMENTIERTE BESTÄTIGUNG",
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
    !isPrepared && payload.evidenceName
      ? `Zusätzlicher Nachweis hinterlegt: ${payload.evidenceName}`
      : ""
  ];

  const filenameProject = safeFilenamePart(payload.projectTitle) || "projekt";
  const filename = `${
    isPrepared ? "veroeffentlichungsfreigabe-vorbereitet" : "veroeffentlichungsfreigabe-bestaetigt"
  }-${filenameProject}-${payload.referenceCode}.pdf`;

  return {
    ...buildTextPdfDocument({ title, subtitle, lines, filename }),
    referenceCode: payload.referenceCode
  };
}
