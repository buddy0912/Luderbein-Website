import fs from "fs";
import path from "path";
import crypto from "crypto";

const repoRoot = process.cwd();

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip common folders
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

const htmlFiles = walk(repoRoot).filter(
  (f) =>
    f.toLowerCase().endsWith(".html") &&
    !f.includes(`${path.sep}.github${path.sep}`) &&
    !f.includes(`${path.sep}assets${path.sep}`)
);

const mismatches = [];
const missing = [];

for (const file of htmlFiles) {
  const rel = path.relative(repoRoot, file).replaceAll("\\", "/");
  const html = read(file);
  const hdr = extractHeader(html);

  if (!hdr) {
    missing.push(rel);
    continue;
  }

  const h = hash(normalize(hdr));
  if (h !== indexHash) {
    mismatches.push({ file: rel, headerHash: h });
  }
}

if (missing.length || mismatches.length) {
  console.error("❌ Header consistency check failed.");
  if (missing.length) {
    console.error("\nMissing <header> in:");
    for (const f of missing) console.error(`- ${f}`);
  }
  if (mismatches.length) {
    console.error("\nHeader differs from index.html in:");
    for (const x of mismatches) console.error(`- ${x.file}`);
  }
  process.exit(1);
}

console.log("✅ All HTML files use the same <header> as index.html.");
