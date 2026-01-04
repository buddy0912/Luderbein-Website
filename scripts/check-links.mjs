import fs from "fs";
import path from "path";

/**
 * Robust repo root detection:
 * - In GitHub Actions / local runs, cwd may be repo root OR /scripts
 * - We auto-correct if cwd is inside /scripts or if index.html is one level up.
 */
function detectRepoRoot() {
  const cwd = process.cwd();

  const isRepoRoot = (dir) => fs.existsSync(path.join(dir, "index.html"));
  const isScriptsDir = (dir) => path.basename(dir).toLowerCase() === "scripts";

  // If we're inside /scripts, repo root is parent
  if (isScriptsDir(cwd) && isRepoRoot(path.resolve(cwd, ".."))) {
    return path.resolve(cwd, "..");
  }

  // If cwd isn't repo root but parent is, use parent
  if (!isRepoRoot(cwd) && isRepoRoot(path.resolve(cwd, ".."))) {
    return path.resolve(cwd, "..");
  }

  return cwd;
}

const repoRoot = detectRepoRoot();

/**
 * Normalize for comparing path segments:
 * - decode %xx
 * - unicode normalize
 * - remove zero-width + soft hyphen
 * - map dash variants to "-"
 */
function normSeg(input) {
  let s = String(input ?? "");

  try { s = decodeURIComponent(s); } catch {}
  s = s.normalize("NFKC");

  // remove soft hyphen + zero width + BOM
  s = s.replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, "");

  // map dash variants to ASCII hyphen-minus
  s = s.replace(
    /[\u2010\u2011\u2012\u2013\u2014\u2212\u2043\uFE58\uFE63\uFF0D]/g,
    "-"
  );

  return s.trim();
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
 * Match each segment by normalized comparison (fixes dash/hidden-char issues).
 * Returns null if no match exists.
 */
function findNormalizedMatch(relPath) {
  const partsRaw = relPath.split("/").filter(Boolean);
  const partsNorm = partsRaw.map(normSeg);

  let curAbs = repoRoot;
  let actualParts = [];

  for (let i = 0; i < partsNorm.length; i++) {
    const want = partsNorm[i];

    let entries;
    try {
      entries = fs.readdirSync(curAbs, { withFileTypes: true });
    } catch {
      return null;
    }

    const match = entries.find((e) => normSeg(e.name) === want);
    if (!match) return null;

    actualParts.push(match.name);
    curAbs = path.join(curAbs, match.name);
  }

  const actualRel = actualParts.join("/");
  if (!fs.existsSync(path.join(repoRoot, actualRel))) return null;
  return { actualRel };
}

/**
 * Resolve an internal absolute URL ("/...") to a repo-relative target file path.
 */
function resolveInternal(url) {
  const clean = String(url || "").split("#")[0].split("?")[0];

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
 * Detect case-insensitive collisions in the repo.
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
 * Process a single internal URL and record missing/warnings.
 */
function checkOneTarget({ fromFile, url, kind }, state) {
  if (url.startsWith("//")) return;

  const { target, fallbackTarget } = resolveInternal(url);

  // 1) exact exists
  if (existsRel(target)) return;

  // 2) normalized match exists (dash/hidden chars) -> PASS (but warn)
  const norm = findNormalizedMatch(target);
  if (norm) {
    state.normalizedWarnings.push({
      from: fromFile,
      kind,
      url,
      expected: target,
      actual: norm.actualRel,
    });
    return;
  }

  // 3) directory fallback
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

  // 4) normalized match for fallback
  if (fallbackTarget) {
    const normFb = findNormalizedMatch(fallbackTarget);
    if (normFb) {
      state.trailingSlashWarnings.push({
        from: fromFile,
        kind
