import fs from "fs";
import path from "path";

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

const htmlFiles = walk(repoRoot).filter((f) => f.endsWith(".html"));

// absolute internal URLs: href="/..." or src="/..."
const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;

// script/css tags for duplicate detection
const scriptSrcRegex = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
const cssHrefRegex = /<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;

const duplicateLoads = [];
const absoluteRootLinks = [];

for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
  const content = read(file);

  // ---- duplicates (scripts) ----
  {
    const seen = new Map();
    let m;
    while ((m = scriptSrcRegex.exec(content)) !== null) {
      const src = (m[1] || "").trim();
      if (!src) continue;
      seen.set(src, (seen.get(src) || 0) + 1);
    }
    for (const [k, count] of seen.entries()) {
      if (count > 1) duplicateLoads.push({ file: relFile, type: "script", url: k, count });
    }
  }

  // ---- duplicates (css) ----
  {
    const seen = new Map();
    let m;
    while ((m = cssHrefRegex.exec(content)) !== null) {
      const href = (m[1] || "").trim();
      if (!href) continue;
      seen.set(href, (seen.get(href) || 0) + 1);
    }
    for (const [k, count] of seen.entries()) {
      if (count > 1) duplicateLoads.push({ file: relFile, type: "css", url: k, count });
    }
  }

  // ---- absolute root paths (subpath risk) ----
  {
    let m;
    while ((m = urlRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url) continue;

      // ignore protocol-relative
      if (url.startsWith("//")) continue;

      // Root-absolute links are OK for pages.dev root, risky for future subpath.
      if (url.startsWith("/")) {
        absoluteRootLinks.push({ file: relFile, url });
      }
    }
  }
}

// Report only (exit 0)
if (duplicateLoads.length) {
  console.log("⚠️ Duplicate loads found (can cause weird JS/CSS behavior):");
  for (const x of duplicateLoads) {
    console.log(`- ${x.file}: ${x.type} loaded ${x.count}x -> ${x.url}`);
  }
  console.log("");
} else {
  console.log("✅ No duplicate <script src> or stylesheet <link> loads found.");
}

if (absoluteRootLinks.length) {
  const total = absoluteRootLinks.length;
  const examples = absoluteRootLinks.slice(0, 25);

  console.log("ℹ️ Absolute root paths detected (OK for pages.dev root, risk for future subpath hosting):");
  console.log(`   Found ${total} occurrences. Examples:`);
  for (const x of examples) {
    console.log(`- ${x.file} -> ${x.url}`);
  }
  if (total > examples.length) console.log(`   ...and ${total - examples.length} more`);
  console.log("");
} else {
  console.log("✅ No absolute root paths found (unusual for this setup).");
}

console.log("✅ Hygiene check completed (report-only).");
process.exit(0);
