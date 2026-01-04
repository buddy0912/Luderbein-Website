import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

/** Normalize dash variants to ASCII "-" */
const DASH_RE = /[\u2010\u2011\u2012\u2013\u2014\u2212]/g;
function normalizeDashes(s) {
  return (s || "").replace(DASH_RE, "-");
}

/** Lower + normalize dashes for stable comparisons */
function normKey(p) {
  return normalizeDashes(p).toLowerCase();
}

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

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function readBinAbs(absPath) {
  return fs.readFileSync(absPath);
}

/**
 * Build an index that can find files even if their names contain “fancy dashes”.
 * key = lower(normalized-dashes(path))
 */
function buildNormalizedIndex(allRelFiles) {
  const map = new Map(); // key -> [actualRel1, actualRel2...]
  for (const p of allRelFiles) {
    const k = normKey(p);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(p);
  }
  return map;
}

/** Detect collisions in normalized space (danger: two files become same key). */
function detectNormalizedCollisions(index) {
  const collisions = [];
  for (const [k, arr] of index.entries()) {
    if (arr.length > 1) collisions.push({ key: k, paths: arr });
  }
  return collisions;
}

/**
 * Resolve an internal absolute URL ("/...") to repo-relative target(s).
 * Also supports "directory without trailing slash" by checking .../index.html as fallback.
 */
function resolveInternal(urlRaw) {
  const base0 = urlRaw.split("#")[0].split("?")[0];

  // try decodeURI safely
  let baseDecoded = base0;
  try {
    baseDecoded = decodeURI(base0);
  } catch {
    // ignore
  }

  // normalize dashes for checking
  const clean = normalizeDashes(baseDecoded);

  if (clean === "/") {
    return { urlRaw, clean, target: "index.html", fallbackTarget: null };
  }

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { urlRaw, clean, target, fallbackTarget: null };
  }

  const target = clean.replace(/^\//, "");
  const fallbackTarget = target + "/index.html";
  return { urlRaw, clean, target, fallbackTarget };
}

/** Check if target exists using normalized index. */
function existsViaIndex(index, relTarget) {
  const key = normKey(relTarget);
  const arr = index.get(key);
  if (!arr || !arr.length) return null;
  // Choose first; collisions handled separately as hard fail
  return arr[0];
}

/** Determine if mismatch is case-only or dash-only etc. */
function classifyMismatch(expected, actual) {
  const e = expected;
  const a = actual;

  const eNorm = normKey(e);
  const aNorm = normKey(a);

  if (eNorm !== aNorm) return "other";

  // same normalized: now check if only case differs
  if (normalizeDashes(e).toLowerCase() === normalizeDashes(a).toLowerCase() && normalizeDashes(e) !== normalizeDashes(a)) {
    // could be case mismatch or dash mismatch or both
    const eNoDash = normalizeDashes(e);
    const aNoDash = normalizeDashes(a);

    if (eNoDash.toLowerCase() === aNoDash.toLowerCase() && eNoDash !== aNoDash) {
      // case differs somewhere
      return "caseOrDash";
    }
  }

  return "caseOrDash";
}

/** Basic image magic checks */
function isJpeg(buf) {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}
function isPng(buf) {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  );
}
function isWebp(buf) {
  // RIFF....WEBP
  return (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  );
}
function checkImageMagic(relPath, absPath) {
  const ext = relPath.toLowerCase().split(".").pop();
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) return null;

  const buf = readBinAbs(absPath);

  if ((ext === "jpg" || ext === "jpeg") && !isJpeg(buf)) return "JPEG";
  if (ext === "png" && !isPng(buf)) return "PNG";
  if (ext === "webp" && !isWebp(buf)) return "WEBP";
  return null;
}

// --- Scan repo ---
const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => path.relative(repoRoot, f).replaceAll("\\", "/"));

const index = buildNormalizedIndex(allFilesRel);
const normalizedCollisions = detectNormalizedCollisions(index);

const htmlFilesAbs = allFilesAbs.filter((f) => f.endsWith(".html"));

// href/src absolute internal
const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
// data-reel-src
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  mismatch: [],
  trailingSlashWarnings: [],
  corruptImages: [],
};

function evaluateUrl(urlRaw) {
  if (urlRaw.startsWith("//")) return { type: "ok" };

  const { target, fallbackTarget } = resolveInternal(urlRaw);

  // 1) exact exists?
  const exactAbs = path.join(repoRoot, target);
  if (fs.existsSync(exactAbs)) {
    return { type: "ok", actual: target };
  }

  // 2) normalized exists?
  const actual = existsViaIndex(index, target);
  if (actual) {
    // treat as ok, but record mismatch to make it visible (case/dash etc.)
    if (actual !== target) {
      return { type: "mismatchOk", expected: target, actual };
    }
    return { type: "ok", actual };
  }

  // 3) directory fallback
  if (fallbackTarget) {
    const fbAbs = path.join(repoRoot, fallbackTarget);
    if (fs.existsSync(fbAbs)) {
      return { type: "trailingSlash", suggestion: "/" + target + "/", resolvesTo: fallbackTarget };
    }

    const fbActual = existsViaIndex(index, fallbackTarget);
    if (fbActual) {
      return { type: "mismatchOk", expected: fallbackTarget, actual: fbActual };
    }
  }

  return { type: "missing", expected: target, alsoTried: fallbackTarget };
}

function record(fromFile, kind, urlRaw, res) {
  if (res.type === "ok") return;

  if (res.type === "trailingSlash") {
    state.trailingSlashWarnings.push({
      from: fromFile,
      kind,
      url: urlRaw,
      suggestion: res.suggestion,
      resolvesTo: res.resolvesTo,
    });
    return;
  }

  if (res.type === "mismatchOk") {
    state.mismatch.push({
      from: fromFile,
      kind,
      url: urlRaw,
      expected: res.expected,
      actual: res.actual,
      note: classifyMismatch(res.expected, res.actual),
    });
    return;
  }

  state.missing.push({
    from: fromFile,
    kind,
    url: urlRaw,
    expected: res.expected,
    alsoTried: res.alsoTried,
  });
}

function validateIfImage(relPathResolved) {
  const rel = relPathResolved;
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) return;

  const bad = checkImageMagic(rel, abs);
  if (bad) {
    state.corruptImages.push({
      file: rel,
      expectedMagic: bad,
    });
  }
}

// --- Parse HTMLs ---
for (const absFile of htmlFilesAbs) {
  const fromRel = path.relative(repoRoot, absFile).replaceAll("\\", "/");
  const content = readText(absFile);

  // href/src
  {
    let m;
    while ((m = urlRegex.exec(content)) !== null) {
      const urlRaw = m[1];
      if (!urlRaw || !urlRaw.startsWith("/")) continue;

      const res = evaluateUrl(urlRaw);
      record(fromRel, "href/src", urlRaw, res);

      // if it's an image src, validate magic (only when it exists via exact or mismatchOk)
      if (res.type === "ok" && res.actual) validateIfImage(res.actual);
      if (res.type === "mismatchOk" && res.actual) validateIfImage(res.actual);
    }
  }

  // data-reel-src
  {
    let m;
    while ((m = dataReelSrcRegex.exec(content)) !== null) {
      const urlRaw = m[1];
      if (!urlRaw || !urlRaw.startsWith("/")) continue;

      const res = evaluateUrl(urlRaw);
      record(fromRel, "data-reel-src", urlRaw, res);

      // JSON not validated as image
    }
  }
}

// --- Reporting ---
let failed = false;

// collisions are a real hazard → fail
if (normalizedCollisions.length) {
  failed = true;
  console.error("❌ Normalized path collisions (case/dash variants create same key):");
  for (const c of normalizedCollisions) {
    console.error(`- ${c.paths.join("  |  ")}`);
  }
  console.error("");
}

if (state.corruptImages.length) {
  failed = true;
  console.error("❌ Corrupt/invalid images (file extension says image, magic bytes disagree):");
  for (const x of state.corruptImages) {
    console.error(`- ${x.file} (expected ${x.expectedMagic})`);
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

// mismatchOk = exists, but shows you where dash/case got altered (does not fail)
if (state.mismatch.length) {
  console.log("⚠️ Target exists but differs by case/dash encoding (allowed by this checker):");
  for (const x of state.mismatch) {
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
console.log("✅ All internal targets exist (href/src + data-reel-src) and images look valid.");
