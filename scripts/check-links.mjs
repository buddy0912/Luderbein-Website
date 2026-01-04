// /scripts/check-links.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- helpers ---
function safeDecode(u) {
  try {
    return decodeURI(u);
  } catch {
    return u;
  }
}

function normalizeDashes(s) {
  // normalize “fancy dashes” to plain hyphen-minus
  return s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
}

function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 25; i++) {
    if (
      fs.existsSync(path.join(dir, "assets")) ||
      fs.existsSync(path.join(dir, "index.html")) ||
      fs.existsSync(path.join(dir, "package.json")) ||
      fs.existsSync(path.join(dir, ".github"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir, "..");
}

// ✅ strongest root in GitHub Actions:
const repoRoot =
  (process.env.GITHUB_WORKSPACE && fs.existsSync(process.env.GITHUB_WORKSPACE))
    ? process.env.GITHUB_WORKSPACE
    : findRepoRoot(__dirname);

console.log(`check-links.mjs repoRoot = ${repoRoot}`);

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
  const clean = relPath.replace(/^\/+/, "");
  return fs.existsSync(path.join(repoRoot, clean));
}

/**
 * Finds the actual on-disk path by matching each segment case-insensitively.
 * Returns null if no match exists.
 * If matched, returns { actualRel, hasCaseMismatch }.
 */
function findCaseInsensitiveMatch(relPath) {
  const clean = relPath.replace(/^\/+/, "");
  const parts = clean.split("/").filter(Boolean);
  let curAbs = repoRoot;
  let actualParts = [];
  let hasCaseMismatch = false;

  for (const part of parts) {
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

  const actualRel = actualParts.join("/");
  if (!fs.existsSync(path.join(repoRoot, actualRel))) return null;

  return { actualRel, hasCaseMismatch };
}

/**
 * Resolve an internal absolute URL ("/...") to a repo-relative target file path.
 */
function resolveInternal(url) {
  const decoded = safeDecode(url);
  const clean = decoded.split("#")[0].split("?")[0];

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
 * Detect case-insensitive collisions in the repo (two paths differ only by case).
 */
function detectCaseCollisions(allRelFiles) {
  const map = new Map();
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
  url = normalizeDashes(url);
  if (url.startsWith("//")) return;
  if (!url.startsWith("/")) return;

  const { target, fallbackTarget } = resolveInternal(url);

  if (existsRel(target)) return;

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

  state.missing.push({
    from: fromFile,
    kind,
    url,
    expected: target,
    alsoTried: fallbackTarget,
  });
}

// --- Main scan ---
const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => path.relative(repoRoot, f).replaceAll("\\", "/"));

const collisions = detectCaseCollisions(allFilesRel);
const htmlFiles = allFilesAbs.filter((f) => f.endsWith(".html"));

const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  caseMismatch: [],
  trailingSlashWarnings: [],
};

for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
  const content = read(file);

  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    checkOneTarget({ fromFile: relFile, url: m[1], kind: "href/src" }, state);
  }

  while ((m = dataReelSrcRegex.exec(content)) !== null) {
    checkOneTarget({ fromFile: relFile, url: m[1], kind: "data-reel-src" }, state);
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
    console.log(
      `- [${x.kind}] ${x.from} -> ${x.url} (suggest: ${x.suggestion}, resolves to: ${x.resolvesTo})`
    );
  }
  console.log("");
}

if (failed) process.exit(1);
console.log("✅ All internal targets exist (href/src + data-reel-src) and no case issues found.");
