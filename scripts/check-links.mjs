import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

/**
 * Robust normalization for comparing path segments.
 * - decodes %xx
 * - normalizes unicode (NFKC)
 * - converts all dash variants to "-"
 * - removes zero-width chars + soft hyphen
 * - trims
 */
function normSeg(input) {
  if (input == null) return "";
  let s = String(input);

  // decode percent-encoding if present (safe)
  try {
    // decodeURIComponent explodes on malformed sequences; ignore then
    s = decodeURIComponent(s);
  } catch {}

  // unicode normalize
  s = s.normalize("NFKC");

  // remove soft hyphen + zero width chars + BOM
  s = s.replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, "");

  // replace dash variants with ASCII hyphen-minus
  s = s.replace(
    /[\u2010\u2011\u2012\u2013\u2014\u2212\u2043\uFE58\uFE63\uFF0D]/g,
    "-"
  );

  // normalize weird spaces (just in case)
  s = s.replace(/[\u00A0\u2007\u202F]/g, " ");

  return s.trim();
}

function normPathRel(relPath) {
  return relPath
    .split("/")
    .filter(Boolean)
    .map(normSeg)
    .join("/");
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

/**
 * Loose-exists: exact OR normalization-based match across segments.
 * Returns { ok:true, actualRel } or { ok:false }.
 */
function existsRelLoose(relPath) {
  const exactAbs = path.join(repoRoot, relPath);
  if (fs.existsSync(exactAbs)) return { ok: true, actualRel: relPath };

  // try segment-by-segment normalized match on disk
  const match = findNormalizedMatch(relPath);
  if (match && match.actualRel && fs.existsSync(path.join(repoRoot, match.actualRel))) {
    return { ok: true, actualRel: match.actualRel };
  }

  return { ok: false };
}

/**
 * Finds the actual on-disk path by matching each segment using normSeg().
 * Returns null if no match exists.
 * If matched, returns { actualRel, differs } where differs means the raw segment strings differ.
 */
function findNormalizedMatch(relPath) {
  const partsRaw = relPath.split("/").filter(Boolean);
  const parts = partsRaw.map(normSeg);

  let curAbs = repoRoot;
  let actualParts = [];
  let differs = false;

  for (let i = 0; i < parts.length; i++) {
    const wantNorm = parts[i];

    let entries;
    try {
      entries = fs.readdirSync(curAbs, { withFileTypes: true });
    } catch {
      return null;
    }

    // match by normalized name
    const match = entries.find((e) => normSeg(e.name) === wantNorm);
    if (!match) return null;

    // if raw differs, note it (case/dash/hidden char)
    if (match.name !== partsRaw[i]) differs = true;

    actualParts.push(match.name);
    curAbs = path.join(curAbs, match.name);
  }

  const actualRel = actualParts.join("/");
  return { actualRel, differs };
}

/**
 * Resolve an internal absolute URL ("/...") to a repo-relative target file path.
 * Also supports "directory without trailing slash" by checking .../index.html as fallback.
 */
function resolveInternal(url) {
  const cleanRaw = String(url || "").split("#")[0].split("?")[0];

  // Normalize the URL path for comparison purposes (dash/hidden chars/percent-encoding)
  // NOTE: We DO NOT change what the site serves, only how the checker resolves.
  const clean = normSeg(cleanRaw).startsWith("/")
    ? normSeg(cleanRaw)
    : "/" + normSeg(cleanRaw);

  if (clean === "/") {
    return { url: cleanRaw, target: "index.html", fallbackTarget: null };
  }

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { url: cleanRaw, target, fallbackTarget: null };
  }

  const target = clean.replace(/^\//, "");
  const fallbackTarget = target + "/index.html";
  return { url: cleanRaw, target, fallbackTarget };
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
 * Process a single internal URL and record missing/warnings.
 */
function checkOneTarget({ fromFile, url, kind }, state) {
  if (!url || url.startsWith("//")) return;

  const { target, fallbackTarget } = resolveInternal(url);

  // 1) exact OR normalized match exists
  const ex1 = existsRelLoose(target);
  if (ex1.ok) {
    // optional warn if normalized match had to fix something
    if (ex1.actualRel !== target) {
      state.normalizedWarnings.push({
        from: fromFile,
        kind,
        url,
        expected: target,
        actual: ex1.actualRel,
      });
    }
    return;
  }

  // 2) /dir (no slash) but /dir/index.html exists -> warn only
  if (fallbackTarget) {
    const ex2 = existsRelLoose(fallbackTarget);
    if (ex2.ok) {
      state.trailingSlashWarnings.push({
        from: fromFile,
        kind,
        url,
        suggestion: "/" + target + "/",
        resolvesTo: ex2.actualRel,
      });
      return;
    }
  }

  // 3) missing
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

// Match only absolute internal URLs: href="/..." or src="/..."
const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;

// match internal reel JSON sources: data-reel-src="/assets/..."
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  trailingSlashWarnings: [],
  normalizedWarnings: [],
};

for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
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

// This is ONLY a warning: means "we had to normalize something to find it"
if (state.normalizedWarnings.length) {
  console.log("⚠️ Normalized matches (dash/hidden-char/encoding fixed by checker):");
  for (const x of state.normalizedWarnings) {
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
