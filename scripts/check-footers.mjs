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

function extractFooter(html) {
  const m = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i);
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
const indexFooter = extractFooter(indexHtml);

if (!indexFooter) {
  console.error("❌ <footer> not found in index.html.");
  process.exit(1);
}

const indexNorm = normalize(indexFooter);
const indexHash = hash(indexNorm);

// “Must-have” Marker: die zwei Rechtliches-Links (damit nix verschwindet)
const requiredMarkers = [
  "/rechtliches/impressum.html",
  "/rechtliches/datenschutz.html",
];

const htmlFiles = walk(repoRoot).filter((f) => {
  const lf = f.toLowerCase();
  return (
    lf.endsWith(".html") &&
    !f.includes(`${path.sep}.github${path.sep}`) &&
    !f.includes(`${path.sep}assets${path.sep}`)
  );
});

const missingFooter = [];
const missingMarkers = [];
const differs = [];

for (const file of htmlFiles) {
  const rel = path.relative(repoRoot, file).replaceAll("\\", "/");
  const html = read(file);
  const ftr = extractFooter(html);

  if (!ftr) {
    missingFooter.push(rel);
    continue;
  }

  const ftrNorm = normalize(ftr);
  const ftrHash = hash(ftrNorm);

  const markerMissing = requiredMarkers.filter((m) => !ftrNorm.includes(m));
  if (markerMissing.length) {
    missingMarkers.push({ file: rel, missing: markerMissing });
  }

  if (ftrHash !== indexHash) {
    differs.push(rel);
  }
}

// Hard fail nur wenn <footer> fehlt
if (missingFooter.length) {
  console.error("❌ Footer check failed: <footer> missing in:");
  for (const f of missingFooter) console.error(`- ${f}`);
  process.exit(1);
}

if (missingMarkers.length) {
  console.log("⚠️ Some pages likely use a different footer (required links missing):");
  for (const x of missingMarkers) {
    console.log(`- ${x.file} (missing: ${x.missing.join(", ")})`);
  }
  console.log("");
}

if (differs.length) {
  console.log("ℹ️ Pages where <footer> is not byte-identical to index.html (report only):");
  for (const f of differs) console.log(`- ${f}`);
  console.log("");
}

console.log("✅ Footer check completed (no missing <footer>).");
process.exit(0);
