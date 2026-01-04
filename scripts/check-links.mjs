import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Repo-Root stabil bestimmen:
 * scripts/check-links.mjs  -> repoRoot = ../ (also Projektwurzel)
 * Dadurch egal, ob Actions in repoRoot oder in /scripts startet.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

console.log("check-links.mjs repoRoot =", repoRoot);

/** Walk repo and return absolute paths for all files. */
function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function existsRel(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function readUtf8(absPath) {
  return fs.readFileSync(absPath, "utf8");
}

/**
 * Resolve "/foo" to repo-relative target:
 * - "/" -> "index.html"
 * - "/dir/" -> "dir/index.html"
 * - "/file.ext" -> "file.ext"
 * Additionally try "/file.ext/index.html" fallback (in case it's a dir-link).
 */
function resolveInternal(url) {
  const clean = url.split("#")[0].split("?")[0];

  if (clean === "/") {
    return { url: clean, target: "index.html", fallback: null };
  }

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { url: clean, target, fallback: null };
  }

  const target = clean.replace(/^\//, "");
  const fallback = target + "/index.html";
  return { url: clean, target, fallback };
}

/** Extract internal href/src="/..." and data-reel-src="/..." */
const hrefSrcRe = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
const reelRe = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const allFilesAbs = walkFiles(repoRoot);
const htmlFilesAbs = allFilesAbs.filter((p) => p.endsWith(".html"));

const missing = [];
const trailingDirNoSlash = []; // optional warning

function checkUrl(fromRel, kind, url) {
  if (!url.startsWith("/")) return;
  if (url.startsWith("//")) return; // external-ish

  const { target, fallback } = resolveInternal(url);

  // OK if exact exists
  if (existsRel(target)) return;

  // OK if it’s actually a dir-link without slash that has index.html
  if (fallback && existsRel(fallback)) {
    trailingDirNoSlash.push({ fromRel, kind, url, suggestion: url + "/" });
    return;
  }

  missing.push({ fromRel, kind, url, expected: target, alsoTried: fallback });
}

for (const abs of htmlFilesAbs) {
  const rel = path.relative(repoRoot, abs).replaceAll("\\", "/");
  const content = readUtf8(abs);

  let m;
  while ((m = hrefSrcRe.exec(content)) !== null) {
    checkUrl(rel, "href/src", m[1]);
  }
  while ((m = reelRe.exec(content)) !== null) {
    checkUrl(rel, "data-reel-src", m[1]);
  }
}

// Report
if (missing.length) {
  console.error("❌ Missing internal targets:");
  for (const x of missing) {
    const extra = x.alsoTried ? ` (also tried: ${x.alsoTried})` : "";
    console.error(
      `- [${x.kind}] ${x.fromRel} -> ${x.url} (expected: ${x.expected})${extra}`
    );
  }
  process.exit(1);
}

// Warnings only (do not fail)
if (trailingDirNoSlash.length) {
  console.log("⚠️ Links to directories without trailing slash:");
  for (const x of trailingDirNoSlash) {
    console.log(`- [${x.kind}] ${x.fromRel} -> ${x.url} (suggest: ${x.suggestion})`);
  }
}

console.log("✅ All internal targets exist (href/src + data-reel-src).");
