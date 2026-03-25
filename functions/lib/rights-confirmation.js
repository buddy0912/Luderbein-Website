const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN_X = 56;
const PDF_HEADER_Y = 786;
const PDF_BODY_START_Y = 754;
const PDF_BODY_FONT_SIZE = 11;
const PDF_BODY_LINE_HEIGHT = 14;
const PDF_MAX_BODY_LINES = 44;
const PDF_WRAP_WIDTH = 88;

function normalizePdfText(value) {
  return String(value || "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "?");
}

function escapePdfText(value) {
  return normalizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function encodeLatin1(value) {
  const normalized = normalizePdfText(value);
  const bytes = new Uint8Array(normalized.length);
  for (let i = 0; i < normalized.length; i += 1) {
    bytes[i] = normalized.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function sanitizeFilenameDate(createdAt) {
  return String(createdAt || "")
    .slice(0, 19)
    .replace(/[:T]/g, "-")
    .replace(/Z$/, "")
    .replace(/-$/, "");
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
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxWidth) {
      current = `${current} ${word}`;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function buildWrappedParagraphs(lines) {
  const wrapped = [];

  for (const line of lines) {
    if (!line) {
      wrapped.push("");
      continue;
    }

    const maxWidth = line.startsWith("   ") ? PDF_WRAP_WIDTH - 6 : PDF_WRAP_WIDTH;
    wrapped.push(...wrapLine(line, maxWidth));
  }

  return wrapped;
}

function chunkLines(lines, size) {
  const chunks = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }
  return chunks.length ? chunks : [[]];
}

function buildPdfContentStream(title, pageLines, pageNumber, pageCount) {
  const operations = [];

  operations.push("BT");
  operations.push("/F2 16 Tf");
  operations.push(`1 0 0 1 ${PDF_MARGIN_X} ${PDF_HEADER_Y} Tm`);
  operations.push(`(${escapePdfText(title)}) Tj`);
  operations.push("ET");

  operations.push("BT");
  operations.push(`/F1 ${PDF_BODY_FONT_SIZE} Tf`);
  operations.push(`${PDF_BODY_LINE_HEIGHT} TL`);
  operations.push(`1 0 0 1 ${PDF_MARGIN_X} ${PDF_BODY_START_Y} Tm`);

  if (pageLines.length) {
    operations.push(`(${escapePdfText(pageLines[0])}) Tj`);
    for (let index = 1; index < pageLines.length; index += 1) {
      operations.push("T*");
      operations.push(`(${escapePdfText(pageLines[index])}) Tj`);
    }
  }

  operations.push("ET");

  operations.push("BT");
  operations.push("/F1 9 Tf");
  operations.push(`1 0 0 1 ${PDF_MARGIN_X} 34 Tm`);
  operations.push(`(Seite ${pageNumber} von ${pageCount}) Tj`);
  operations.push("ET");

  return operations.join("\n");
}

function buildPdf(title, lines) {
  const wrappedLines = buildWrappedParagraphs(lines);
  const pages = chunkLines(wrappedLines, PDF_MAX_BODY_LINES);
  const objects = [];

  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogObjectId = addObject("");
  const pagesObjectId = addObject("");
  const fontRegularObjectId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldObjectId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageObjectIds = [];

  for (let index = 0; index < pages.length; index += 1) {
    const stream = buildPdfContentStream(title, pages[index], index + 1, pages.length);
    const streamBytes = encodeLatin1(stream);
    const contentObjectId = addObject(
      `<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`
    );
    const pageObjectId = addObject(
      `<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularObjectId} 0 R /F2 ${fontBoldObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );
    pageObjectIds.push(pageObjectId);
  }

  objects[catalogObjectId - 1] = `<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`;
  objects[pagesObjectId - 1] = `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] >>`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return encodeLatin1(pdf);
}

export function buildConfirmationDocument(payload) {
  const title = "Bestätigung Rechteerklärung für Kundenvorlagen";
  const displayDate = formatDisplayDate(payload.createdAt);
  const filename = `rechteerklaerung-${sanitizeFilenameDate(payload.createdAt)}-${payload.id}.pdf`;

  const lines = [
    `Bestätigungs-ID: ${payload.id}`,
    `Datum/Uhrzeit: ${displayDate} (Europe/Berlin)`,
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    `Referenz / Auftragsnummer / Betreff: ${payload.reference || "nicht angegeben"}`,
    `Notiz / Zuordnung: ${payload.note || "nicht angegeben"}`,
    `Versionskennung / Stand: ${payload.declarationVersion} / ${payload.declarationStand}`,
    "",
    "Bestätigte Punkte:",
    `1. ${payload.checkboxes[0]}`,
    `2. ${payload.checkboxes[1]}`,
    `3. ${payload.checkboxes[2]}`,
    "",
    payload.supplement,
    "",
    "Hinweis: Diese Bestätigung bezieht sich ausschließlich auf den konkret betroffenen Auftrag."
  ];

  const textContent = [title, "", ...lines].join("\n");
  const pdfBytes = buildPdf(title, lines);

  return {
    title,
    filename,
    mediaType: "application/pdf",
    textContent,
    pdfBytes,
    pdfBase64: bytesToBase64(pdfBytes)
  };
}
