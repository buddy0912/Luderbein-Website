import fs from "fs";
import path from "path";
import crypto from "crypto";

const repoRoot = process.cwd();

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractHeader(html) {
  const m = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/i);
  return m ? m[0] : null;
}

function normalize(s) {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

const indexPath = path.join(repoRoot, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("❌ index.html not found in repo root.");
  process.exit(1);
}

const indexHtml = read(indexPath);
const indexHeader = extractHeader(indexHtml);

if (!indexHeader) {
  console.error("❌ <header> not found in index.html.");
  process.exit(1);
}

const indexNorm = normalize(indexHeader);
const indexHash = hash(indexNorm);

// “Must-have” Marker für das Dropdown/JS/CSS (damit’s nicht wie das alte Schiefer-Chaos wird)
const requiredMarkers = [
  "wrap nav",          // Layout wrapper
  "data-nav-toggle",   // Burger / toggle
  "data-nav",          // nav binding
  "data-navdrop",      // dropdown binding
  "navdrop__sum",      // dropdown trigger (wie in index.html)
  "navdrop__panel",    // dropdown panel (wie in index.html)
];

const htmlFiles = walk(repoRoot).filter((f) => {
  const lf = f.toLowerCase();
  return (
    lf.endsWith(".html") &&
    !f.includes(`${path.sep}.github${path.sep}`) &&
    !f.includes(`${path.sep}assets${path.sep}`)
  );
});

const missingHeader = [];
const missingMarkers = [];
const differs = [];

for (const file of htmlFiles) {
  const rel = path.relative(repoRoot, file).replaceAll("\\", "/");
  const html = read(file);
  const hdr = extractHeader(html);

  if (!hdr) {
    missingHeader.push(rel);
    continue;
  }

  const hdrNorm = normalize(hdr);
  const hdrHash = hash(hdrNorm);

  // Marker Check (nur Warnung, außer <header> fehlt komplett)
  const markerMissing = requiredMarkers.filter((m) => !hdrNorm.includes(m));
  if (markerMissing.length) {
    missingMarkers.push({ file: rel, missing: markerMissing });
  }

  // Exakt-gleich Check (nur Reporting)
  if (hdrHash !== indexHash) {
    differs.push(rel);
  }
}

// Hard fail NUR wenn <header> fehlt (das ist meistens wirklich kaputt)
if (missingHeader.length) {
  console.error("❌ Header check failed: <header> missing in:");
  for (const f of missingHeader) console.error(`- ${f}`);
  process.exit(1);
}

// Alles andere ist Warning/Report
if (missingMarkers.length) {
  console.log("⚠️ Some pages likely use a different header/dropdown structure (markers missing):");
  for (const x of missingMarkers) {
    console.log(`- ${x.file} (missing: ${x.missing.join(", ")})`);
  }
  console.log("");
}

if (differs.length) {
  console.log("ℹ️ Pages where <header> is not byte-identical to index.html (report only):");
  for (const f of differs) console.log(`- ${f}`);
  console.log("");
}

console.log("✅ Header check completed (no missing <header>).");
process.exit(0);
