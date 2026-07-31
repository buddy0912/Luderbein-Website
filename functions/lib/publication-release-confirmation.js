const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN_X = 50;
const PDF_HEADER_Y = 790;
const PDF_BODY_START_Y = 726;
const PDF_BODY_FONT_SIZE = 10;
const PDF_BODY_LINE_HEIGHT = 13;
const PDF_MAX_BODY_LINES = 48;
const PDF_WRAP_WIDTH = 94;

function normalizePdfText(value) {
  return String(value || "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "?");
}

function encodeLatin1(value) {
  const normalized = normalizePdfText(value);
  const bytes = new Uint8Array(normalized.length);
  for (let index = 0; index < normalized.length; index += 1) {
    bytes[index] = normalized.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function textToPdfHex(value) {
  const bytes = encodeLatin1(value);
  let hex = "";
  for (let index = 0; index < bytes.length; index += 1) {
    hex += bytes[index].toString(16).padStart(2, "0").toUpperCase();
  }
  return `<${hex}>`;
}

function sanitizeFilenameToken(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDisplayDate(createdAt) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return String(createdAt || "");

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Berlin"
  }).format(date);
}

function wrapLine(line, maxWidth) {
  const source = String(line || "").trim();
  if (!source) return [""];
  const words = source.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (!current || `${current} ${word}`.length <= maxWidth) {
      current = current ? `${current} ${word}` : word;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function chunkLines(lines, size) {
  const chunks = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }
  return chunks.length ? chunks : [[]];
}

function buildPdfContentStream(title, subtitle, pageLines, pageNumber, pageCount) {
  const operations = [
    "BT",
    "/F2 14 Tf",
    `1 0 0 1 ${PDF_MARGIN_X} ${PDF_HEADER_Y} Tm`,
    `${textToPdfHex(title)} Tj`,
    "ET",
    "BT",
    "/F1 10 Tf",
    `1 0 0 1 ${PDF_MARGIN_X} ${PDF_HEADER_Y - 20} Tm`,
    `${textToPdfHex(subtitle)} Tj`,
    "ET",
    "BT",
    `/F1 ${PDF_BODY_FONT_SIZE} Tf`,
    `${PDF_BODY_LINE_HEIGHT} TL`,
    `1 0 0 1 ${PDF_MARGIN_X} ${PDF_BODY_START_Y} Tm`
  ];

  if (pageLines.length) {
    operations.push(`${textToPdfHex(pageLines[0])} Tj`);
    for (let index = 1; index < pageLines.length; index += 1) {
      operations.push("T*", `${textToPdfHex(pageLines[index])} Tj`);
    }
  }

  operations.push(
    "ET",
    "BT",
    "/F1 9 Tf",
    `1 0 0 1 ${PDF_MARGIN_X} 32 Tm`,
    `${textToPdfHex(`Seite ${pageNumber} von ${pageCount}`)} Tj`,
    "ET"
  );
  return operations.join("\n");
}

function buildPdf(title, subtitle, lines) {
  const wrappedLines = lines.flatMap(function (line) {
    return wrapLine(line, PDF_WRAP_WIDTH);
  });
  const pages = chunkLines(wrappedLines, PDF_MAX_BODY_LINES);
  const objects = [];
  const addObject = function (content) {
    objects.push(content);
    return objects.length;
  };

  const catalogObjectId = addObject("");
  const pagesObjectId = addObject("");
  const fontRegularObjectId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  );
  const fontBoldObjectId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  );
  const pageObjectIds = [];

  pages.forEach(function (pageLines, index) {
    const stream = buildPdfContentStream(title, subtitle, pageLines, index + 1, pages.length);
    const contentObjectId = addObject(
      `<< /Length ${encodeLatin1(stream).length} >>\nstream\n${stream}\nendstream`
    );
    pageObjectIds.push(
      addObject(
        `<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularObjectId} 0 R /F2 ${fontBoldObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
      )
    );
  });

  objects[catalogObjectId - 1] = `<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`;
  objects[pagesObjectId - 1] = `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
    .map(function (id) {
      return `${id} 0 R`;
    })
    .join(" ")}] >>`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];

  objects.forEach(function (object, index) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return encodeLatin1(pdf);
}

export function buildPublicationReferenceCode(id, createdAt) {
  const compactId = String(id || "").replace(/-/g, "").toUpperCase();
  const datePart = String(createdAt || "").slice(2, 10).replace(/-/g, "") || "000000";
  return `VF-${datePart}-${compactId.slice(0, 8)}`;
}

export function buildPublicationReleaseDocument(payload) {
  const title = "Veröffentlichungs- und Nutzungsfreigabe";
  const subtitle = payload.projectTitle;
  const referenceCode =
    payload.referenceCode || buildPublicationReferenceCode(payload.id, payload.createdAt);
  const filename = `veroeffentlichungsfreigabe-${sanitizeFilenameToken(referenceCode)}.pdf`;
  const optionLines = payload.options.map(function (option) {
    return `[${option.granted ? "JA" : "NEIN"}] ${option.label}`;
  });
  const lines = [
    `Projekt: ${payload.projectTitle}`,
    `Auftraggeber / Kunde: ${payload.clientName}`,
    `Referenz-ID: ${referenceCode}`,
    `Technische ID: ${payload.id}`,
    `Datum/Uhrzeit: ${formatDisplayDate(payload.createdAt)} (Europe/Berlin)`,
    `Freigebende Person: ${payload.name}`,
    `Organisation: ${payload.organization || "nicht angegeben"}`,
    `Funktion / Vertretungsbefugnis: ${payload.role}`,
    `E-Mail: ${payload.email}`,
    `Versionskennung / Stand: ${payload.declarationVersion} / ${payload.declarationStand}`,
    "",
    "Einzeln ausgewählte Nutzungen:",
    ...optionLines,
    "",
    "Umfang des eingeräumten Rechts:",
    payload.scopeText,
    "",
    "Pflichtbestätigungen:",
    ...payload.confirmations.map(function (text, index) {
      return `${index + 1}. ${text}`;
    }),
    "",
    `Optionale Notiz: ${payload.note || "nicht angegeben"}`,
    "",
    "Widerruf:",
    payload.withdrawalText,
    "Der Widerruf kann auf derselben Seite mit Referenz-ID und E-Mail-Adresse erklärt werden.",
    "",
    "ENTWURF: Fachliche rechtliche Prüfung und Freigabe stehen aus."
  ];
  const textContent = [title, subtitle, "", ...lines].join("\n");
  const pdfBytes = buildPdf(title, subtitle, lines);

  return {
    title,
    referenceCode,
    filename,
    mediaType: "application/pdf",
    textContent,
    pdfBytes,
    pdfBase64: bytesToBase64(pdfBytes)
  };
}
