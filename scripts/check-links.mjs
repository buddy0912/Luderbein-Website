import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * scripts/check-links.mjs
 * - repoRoot robust (independent of process.cwd in Actions)
 * - tolerant matching for Unicode-Dashes (no renames needed)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function toPosix(p) {
  return p.replaceAll("\\", "/");
}

// Normalize all dash variants to plain "-"
function normalizeDashes(s) {
  if (!s) return s;
  return s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE63\uFF0D]/g, "-");
}

function normKey(s) {
  return normalizeDashes(String(s)).toLowerCase();
}

/**
 * Walk repo and return absolute paths for all files.
 */
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

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function existsRel(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

/**
 * Match a path segment-by-segment ignoring case AND dash variants.
 * Returns:
 *  - null if not found
 *  - { actualRel, hasMismatch } if found
 */
function findLooseMatch(relPath) {
  const parts = toPosix(relPath).split("/").filter(Boolean);

  let curAbs = repoRoot;
  const actualParts = [];
  let hasMismatch = false;

  for (const part of parts) {
    let entries;
    try {
      entries = fs.readdirSync(curAbs, { withFileTypes: true });
    } catch {
      return null;
    }

    const want = normKey(part);
    const match = entries.find((e) => normKey(e.name) === want);
    if (!match) return null;

    if (match.name !== part) hasMismatch = true;

    actualParts.push(match.name);
    curAbs = path.join(curAbs, match.name);
  }

  const actualRel = toPosix(actualParts.join("/"));
  if (!fs.existsSync(path.join(repoRoot, actualRel))) return null;

  return { actualRel, hasMismatch };
}

/**
 * Detect case-insensitive collisions in the repo (two paths differ only by case).
 */
function detectCaseCollisions(allRelFiles) {
  const map = new Map(); // lower -> [actual...]
  for (const p of allRelFiles) {
    const k = p.toLowerCase();
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(p);
  }
  const collisions = [];
  for (const [, arr] of map.entries()) {
    if (arr.length > 1) collisions.push({ paths: arr });
  }
  return collisions;
}

/**
 * Resolve internal absolute URL ("/...") to repo-relative target file.
 */
function resolveInternal(url) {
  const clean = url.split("#")[0].split("?")[0];

  if (clean === "/") {
    return { url: clean, target: "index.html", fallbackTarget: null };
  }

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { url: clean, target, fallbackTarget: null };
  }

  const target = clean.replace(/^\//, "");
  const fallbackTarget = target + "/index.html";
  return { url: clean, target, fallbackTarget };
}

/**
 * Check a single link target.
 */
function checkOneTarget({ fromFile, url, kind }, state) {
  if (!url) return;
  if (url.startsWith("//")) return;

  // normalize dash variants in URL itself
  const normalizedUrl = normalizeDashes(url);

  const { target, fallbackTarget } = resolveInternal(normalizedUrl);

  // 1) exact exists
  if (existsRel(target)) return;

  // 2) loose match exists (case/dash mismatch) -> DO NOT fail, just warn (keeps checks green)
  const loose = findLooseMatch(target);
  if (loose) {
    state.looseWarnings.push({
      from: fromFile,
      kind,
      url,
      expected: target,
      actual: loose.actualRel,
    });
    return;
  }

  // 3) /dir (no slash) but /dir/index.html exists -> warn only
  if (fallbackTarget && existsRel(fallbackTarget)) {
    state.trailingSlashWarnings.push({
      from: fromFile,
      kind,
      url,
      suggestion: "/" + target + "/",
      resolvesTo: fallbackTarget,
    });
    return;
  }

  // 4) loose match for fallbackTarget
  if (fallbackTarget) {
    const looseFb = findLooseMatch(fallbackTarget);
    if (looseFb) {
      state.looseWarnings.push({
        from: fromFile,
        kind,
        url,
        expected: fallbackTarget,
        actual: looseFb.actualRel,
      });
      return;
    }
  }

  // 5) missing
  state.missing.push({
    from: fromFile,
    kind,
    url,
    expected: target,
    alsoTried: fallbackTarget,
  });
}

// --- Main scan ---
console.log("check-links.mjs repoRoot =", repoRoot);

const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => toPosix(path.relative(repoRoot, f)));

const collisions = detectCaseCollisions(allFilesRel);

const htmlFiles = allFilesAbs.filter((f) => f.endsWith(".html"));

const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  trailingSlashWarnings: [],
  looseWarnings: [],
};

for (const file of htmlFiles) {
  const relFile = toPosix(path.relative(repoRoot, file));
  const content = read(file);

  // href/src
  {
    let m;
    while ((m = urlRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url || !url.startsWith("/")) continue;
      checkOneTarget({ fromFile: relFile, url, kind: "href/src" }, state);
    }
  }

  // data-reel-src
  {
    let m;
    while ((m = dataReelSrcRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url || !url.startsWith("/")) continue;
      checkOneTarget({ fromFile: relFile, url, kind: "data-reel-src" }, state);
    }
  }
}

// --- Reporting ---
let failed = false;

if (collisions.length) {
  failed = true;
  console.error("❌ Case-insensitive path collisions found:");
  for (const c of collisions) console.error(`- ${c.paths.join("  |  ")}`);
  console.error("");
}

if (state.missing.length) {
  failed = true;
  console.error("❌ Missing internal targets:");
  for (const x of state.missing) {
    const extra = x.alsoTried ? ` (also tried: ${x.alsoTried})` : "";
    console.error(`- [${x.kind}] ${x.from} -> ${x.url} (expected: ${x.expected})${extra}`);
  }
  console.error("");
}

if (state.looseWarnings.length) {
  console.log("⚠️ Found targets via tolerant match (case/dash mismatch tolerated):");
  for (const x of state.looseWarnings) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url}`);
    console.log(`  expected: ${x.expected}`);
    console.log(`  actual:   ${x.actual}`);
  }
  console.log("");
}

if (state.trailingSlashWarnings.length) {
  console.log("⚠️ Links to directories without trailing slash:");
  for (const x of state.trailingSlashWarnings) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url} (suggest: ${x.suggestion}, resolves to: ${x.resolvesTo})`);
  }
  console.log("");
}

if (failed) process.exit(1);
console.log("✅ All internal targets exist (href/src + data-reel-src).");
