import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

// Normalisiert “fancy dashes” (– — - − …) auf normales ASCII "-"
const DASH_RE = /[\u2010\u2011\u2012\u2013\u2014\u2212]/g;
function normalizeDashes(s) {
  return (s || "").replace(DASH_RE, "-");
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
  const parts = relPath.split("/").filter(Boolean);
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
 * Also supports "directory without trailing slash" by checking .../index.html as fallback.
 */
function resolveInternal(url) {
  // strip hash/query first
  const clean0 = url.split("#")[0].split("?")[0];

  // normalize dash variants ONLY for checking
  const clean = normalizeDashes(clean0);

  if (clean === "/") {
    return { url: clean0, clean, target: "index.html", fallbackTarget: null };
  }

  // /foo/ -> foo/index.html
  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { url: clean0, clean, target, fallbackTarget: null };
  }

  // /foo -> foo (file) OR foo/index.html (dir fallback)
  const target = clean.replace(/^\//, "");
  const fallbackTarget = target + "/index.html";
  return { url: clean0, clean, target, fallbackTarget };
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
 * Evaluate a single internal URL against the repo.
 * Returns: { type: "ok" | "caseMismatch" | "trailingSlash" | "missing", ... }
 */
function evaluateOne({ url }) {
  // Ignore protocol-relative
  if (url.startsWith("//")) return { type: "ok" };

  const { target, fallbackTarget } = resolveInternal(url);

  // 1) exact match exists
  if (existsRel(target)) return { type: "ok" };

  // 2) case-insensitive match exists but case mismatch -> fail
  const ci = findCaseInsensitiveMatch(target);
  if (ci && ci.actualRel && ci.hasCaseMismatch) {
    return { type: "caseMismatch", expected: target, actual: ci.actualRel };
  }

  // 3) /dir (no slash) but /dir/index.html exists -> warn
  if (fallbackTarget && existsRel(fallbackTarget)) {
    return { type: "trailingSlash", suggestion: "/" + target + "/", resolvesTo: fallbackTarget };
  }

  // 4) case-insensitive match for fallback target
  if (fallbackTarget) {
    const ciFallback = findCaseInsensitiveMatch(fallbackTarget);
    if (ciFallback && ciFallback.actualRel && ciFallback.hasCaseMismatch) {
      return { type: "caseMismatch", expected: fallbackTarget, actual: ciFallback.actualRel };
    }
  }

  // 5) missing
  return { type: "missing", expected: target, alsoTried: fallbackTarget };
}

/**
 * Check a URL with multiple safe variants so dash-encoding can't kill us.
 * (Original + dash-normalized + decoded + decoded+dash-normalized)
 */
function evaluateWithVariants(url) {
  const base = url.split("#")[0].split("?")[0];

  const variants = [];
  const pushUniq = (s) => {
    if (!s) return;
    if (!variants.includes(s)) variants.push(s);
  };

  pushUniq(base);
  pushUniq(normalizeDashes(base));

  try {
    const decoded = decodeURI(base);
    pushUniq(decoded);
    pushUniq(normalizeDashes(decoded));
  } catch {
    // ignore
  }

  // best effort: first OK wins, otherwise first warning, otherwise first error
  let best = null;

  for (const v of variants) {
    const r = evaluateOne({ url: v });

    if (r.type === "ok") return { type: "ok" };

    if (!best) best = r;
    else {
      // Prefer trailingSlash over missing, but keep caseMismatch as hard error
      const rank = (t) => (t === "caseMismatch" ? 3 : t === "missing" ? 1 : 2);
      if (rank(r.type) > rank(best.type)) best = r;
    }
  }

  return best || { type: "missing", expected: base.replace(/^\//, ""), alsoTried: null };
}

// --- Main scan ---

const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => path.relative(repoRoot, f).replaceAll("\\", "/"));

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

function record(fromFile, kind, url, evalResult) {
  if (evalResult.type === "ok") return;

  if (evalResult.type === "caseMismatch") {
    state.caseMismatch.push({
      from: fromFile,
      kind,
      url,
      expected: evalResult.expected,
      actual: evalResult.actual,
    });
    return;
  }

  if (evalResult.type === "trailingSlash") {
    state.trailingSlashWarnings.push({
      from: fromFile,
      kind,
      url,
      suggestion: evalResult.suggestion,
      resolvesTo: evalResult.resolvesTo,
    });
    return;
  }

  // missing
  state.missing.push({
    from: fromFile,
    kind,
    url,
    expected: evalResult.expected,
    alsoTried: evalResult.alsoTried,
  });
}

for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
  const content = read(file);

  // href/src
  {
    let m;
    while ((m = urlRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url || !url.startsWith("/")) continue;
      const r = evaluateWithVariants(url);
      record(relFile, "href/src", url, r);
    }
  }

  // data-reel-src
  {
    let m;
    while ((m = dataReelSrcRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url || !url.startsWith("/")) continue;
      const r = evaluateWithVariants(url);
      record(relFile, "data-reel-src", url, r);
    }
  }
}

// --- Reporting ---

let failed = false;

if (collisions.length) {
  failed = true;
  console.error("❌ Case-insensitive path collisions found (danger on macOS/Windows + confusing):");
  for (const c of collisions) {
    console.error(`- ${c.paths.join("  |  ")}`);
  }
  console.error("");
}

if (state.caseMismatch.length) {
  failed = true;
  console.error("❌ Case mismatch in internal targets (will break on case-sensitive hosting like Cloudflare Pages):");
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
