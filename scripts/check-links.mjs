import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * ✅ Robust repo root detection (works no matter where Actions runs from)
 * scripts/check-links.mjs  -> repo root is one level up from /scripts
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function toPosix(p) {
  return p.replaceAll("\\", "/");
}

/**
 * Normalize weird dash/minus characters in URLs/paths to plain "-"
 * This prevents false "missing" due to Unicode dashes that look identical.
 */
function normalizeDashes(s) {
  if (!s) return s;
  return s.replace(
    /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE63\uFF0D]/g,
    "-"
  );
}

/**
 * Walk repo and return absolute paths for all files.
 */
function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip common noise
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
 * Finds the actual on-disk path by matching each segment case-insensitively.
 * Returns null if no match exists.
 * If matched, returns { actualRel, hasCaseMismatch }.
 */
function findCaseInsensitiveMatch(relPath) {
  const parts = toPosix(relPath).split("/").filter(Boolean);
  let curAbs = repoRoot;
  const actualParts = [];
  let hasCaseMismatch = false;

  for (const partRaw of parts) {
    const part = partRaw;
    let entries;
    try {
      entries = fs.readdirSync(curAbs, { withFileTypes: true });
    } catch {
      return null;
    }

    const match = entries.find((e) => e.name.toLowerCase() === part.toLowerCase());
    if (!match) return null;

    if (match.name !== part) hasCaseMismatch = true;

    actualParts.push(match.name);
    curAbs = path.join(curAbs, match.name);
  }

  const actualRel = toPosix(actualParts.join("/"));
  if (!fs.existsSync(path.join(repoRoot, actualRel))) return null;

  return { actualRel, hasCaseMismatch };
}

/**
 * Resolve an internal absolute URL ("/...") to a repo-relative target file path.
 * Also supports "directory without trailing slash" by checking .../index.html as fallback.
 */
function resolveInternal(url) {
  const clean = url.split("#")[0].split("?")[0];

  if (clean === "/") {
    return { url: clean, target: "index.html", fallbackTarget: null };
  }

  // /foo/ -> foo/index.html
  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { url: clean, target, fallbackTarget: null };
  }

  // /foo -> foo (file) OR foo/index.html (dir fallback)
  const target = clean.replace(/^\//, "");
  const fallbackTarget = target + "/index.html";
  return { url: clean, target, fallbackTarget };
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
 * Process a single internal URL and record missing/case-mismatch/warnings.
 */
function checkOneTarget({ fromFile, url, kind }, state) {
  if (!url) return;

  // Ignore protocol-relative
  if (url.startsWith("//")) return;

  // Normalize unicode dashes
  const normalizedUrl = normalizeDashes(url);

  const { target, fallbackTarget } = resolveInternal(normalizedUrl);

  // 1) exact match exists
  if (existsRel(target)) return;

  // 2) case-insensitive match exists but case mismatch -> fail
  const ci = findCaseInsensitiveMatch(target);
  if (ci && ci.actualRel && ci.hasCaseMismatch) {
    state.caseMismatch.push({
      from: fromFile,
      kind,
      url,
      expected: target,
      actual: ci.actualRel,
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

  // 4) case-insensitive match for fallback target
  if (fallbackTarget) {
    const ciFallback = findCaseInsensitiveMatch(fallbackTarget);
    if (ciFallback && ciFallback.actualRel && ciFallback.hasCaseMismatch) {
      state.caseMismatch.push({
        from: fromFile,
        kind,
        url,
        expected: fallbackTarget,
        actual: ciFallback.actualRel,
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

// Match only absolute internal URLs: href="/..." or src="/..."
const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;

// Match internal reel JSON sources: data-reel-src="/assets/..."
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  caseMismatch: [],
  trailingSlashWarnings: [],
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
  for (const c of collisions) {
    console.error(`- ${c.paths.join("  |  ")}`);
  }
  console.error("");
}

if (state.caseMismatch.length) {
  failed = true;
  console.error("❌ Case mismatch in internal targets:");
  for (const x of state.caseMismatch) {
    console.error(`- [${x.kind}] ${x.from} -> ${x.url}`);
    console.error(`  expected: ${x.expected}`);
    console.error(`  actual:   ${x.actual}`);
  }
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

if (state.trailingSlashWarnings.length) {
  console.log("⚠️ Links to directories without trailing slash:");
  for (const x of state.trailingSlashWarnings) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url} (suggest: ${x.suggestion}, resolves to: ${x.resolvesTo})`);
  }
  console.log("");
}

if (failed) {
  process.exit(1);
} else {
  console.log("✅ All internal targets exist (href/src + data-reel-src) and no case issues found.");
}
