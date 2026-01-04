import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

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

function checkOneTarget({ fromFile, url, kind }, state) {
  if (url.startsWith("//")) return;

  const { target, fallbackTarget } = resolveInternal(url);

  // 1) exact exists
  if (existsRel(target)) return;

  // 2) normalized match exists (dash/hidden chars)
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
        kind,
        url,
        suggestion: "/" + target + "/",
        resolvesTo: normFb.actualRel,
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
const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => path.relative(repoRoot, f).replaceAll("\\", "/"));

const collisions = detectCaseCollisions(allFilesRel);

const htmlFiles = allFilesAbs.filter((f) => f.endsWith(".html"));

const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  trailingSlashWarnings: [],
  normalizedWarnings: [],
};

for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
  const content = read(file);

  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    const url = m[1];
    if (url?.startsWith("/")) checkOneTarget({ fromFile: relFile, url, kind: "href/src" }, state);
  }

  while ((m = dataReelSrcRegex.exec(content)) !== null) {
    const url = m[1];
    if (url?.startsWith("/")) checkOneTarget({ fromFile: relFile, url, kind: "data-reel-src" }, state);
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

if (state.normalizedWarnings.length) {
  console.log("⚠️ Normalized matches (dash/hidden-char fixed by checker):");
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
