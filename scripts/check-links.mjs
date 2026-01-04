import fs from "fs";
import path from "path";

/**
 * Robust repo root:
 * - prefer GITHUB_WORKSPACE
 * - if cwd ends with /scripts, go one level up
 */
let repoRoot = process.env.GITHUB_WORKSPACE || process.cwd();
if (path.basename(repoRoot) === "scripts") {
  const up = path.resolve(repoRoot, "..");
  if (fs.existsSync(path.join(up, "index.html")) || fs.existsSync(path.join(up, ".github"))) {
    repoRoot = up;
  }
}

/** dash variants -> "-" */
const DASH_RE = /[\u2010\u2011\u2012\u2013\u2014\u2212]/g;
function normalizeDashes(s) {
  return (s || "").replace(DASH_RE, "-");
}
function hasFancyDash(s) {
  return DASH_RE.test(s || "");
}
function dashCodepoints(s) {
  // annotate fancy dashes with codepoint
  return (s || "").replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, (ch) => {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
    return `${ch}[U+${cp}]`;
  });
}
function rel(p) {
  return path.relative(repoRoot, p).replaceAll("\\", "/");
}

/** walk repo */
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

function existsRel(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function listDirRel(relDir) {
  const abs = path.join(repoRoot, relDir);
  if (!fs.existsSync(abs)) return null;
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  return entries.map((e) => e.name);
}

function buildNormalizedIndex(allRelFiles) {
  const map = new Map(); // normKey -> [actualRel...]
  for (const p of allRelFiles) {
    const k = normalizeDashes(p).toLowerCase();
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(p);
  }
  return map;
}

function detectNormalizedCollisions(index) {
  const collisions = [];
  for (const [k, arr] of index.entries()) {
    if (arr.length > 1) collisions.push({ key: k, paths: arr });
  }
  return collisions;
}

function resolveInternal(urlRaw) {
  const base0 = urlRaw.split("#")[0].split("?")[0];
  let baseDecoded = base0;
  try {
    baseDecoded = decodeURI(base0);
  } catch {
    // ignore
  }

  const clean = normalizeDashes(baseDecoded);

  if (clean === "/") return { urlRaw, clean, target: "index.html", fallbackTarget: null };

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { urlRaw, clean, target, fallbackTarget: null };
  }

  const target = clean.replace(/^\//, "");
  const fallbackTarget = target + "/index.html";
  return { urlRaw, clean, target, fallbackTarget };
}

function existsViaIndex(index, relTarget) {
  const k = normalizeDashes(relTarget).toLowerCase();
  const arr = index.get(k);
  if (!arr || !arr.length) return null;
  return arr[0];
}

/** find “near matches” in same dir when missing */
function suggestNearMatches(index, expectedRel) {
  const dir = expectedRel.includes("/") ? expectedRel.split("/").slice(0, -1).join("/") : "";
  const base = expectedRel.split("/").pop();

  const wantDirKey = normalizeDashes(dir).toLowerCase();
  const baseKey = normalizeDashes(base).toLowerCase();

  const suggestions = [];
  for (const [, arr] of index.entries()) {
    for (const actual of arr) {
      const aDir = actual.includes("/") ? actual.split("/").slice(0, -1).join("/") : "";
      const aBase = actual.split("/").pop();
      if (normalizeDashes(aDir).toLowerCase() !== wantDirKey) continue;

      // same file name except dash variants/case?
      if (normalizeDashes(aBase).toLowerCase() === baseKey) {
        suggestions.push(actual);
      }
    }
  }
  return suggestions.slice(0, 5);
}

// --- Main scan ---
console.log(`check-links.mjs repoRoot = ${repoRoot}`);

const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => rel(f));

const index = buildNormalizedIndex(allFilesRel);
const collisions = detectNormalizedCollisions(index);

// Debug: show what’s really in assets/schwibbogen + assets/reel (including fancy dash codepoints)
for (const d of ["assets/schwibbogen", "assets/reel"]) {
  const names = listDirRel(d);
  if (names) {
    const fancy = names.filter((n) => hasFancyDash(n));
    if (fancy.length) {
      console.log(`⚠️ Fancy dashes in /${d}/:`);
      for (const n of fancy) console.log(`- ${dashCodepoints(n)}`);
    } else {
      console.log(`✅ No fancy dashes detected in /${d}/ filenames.`);
    }
  } else {
    console.log(`ℹ️ Directory /${d}/ not found.`);
  }
}

const htmlFiles = allFilesAbs.filter((f) => f.endsWith(".html"));

// Match absolute internal URLs in href/src
const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
// Match data-reel-src
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  caseOrDashMismatch: [],
  trailingSlashWarnings: [],
};

function checkOne({ fromFile, url, kind }) {
  if (url.startsWith("//")) return;

  const { target, fallbackTarget } = resolveInternal(url);

  // 1) exact exists
  if (existsRel(target)) return;

  // 2) normalized exists -> this means: you have a real mismatch (dash/case) that WILL break on hosting
  const actual = existsViaIndex(index, target);
  if (actual) {
    state.caseOrDashMismatch.push({
      from: fromFile,
      kind,
      url,
      expected: target,
      actual,
    });
    return;
  }

  // 3) trailing slash fallback
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

  // 4) normalized exists for fallback
  if (fallbackTarget) {
    const actualFb = existsViaIndex(index, fallbackTarget);
    if (actualFb) {
      state.caseOrDashMismatch.push({
        from: fromFile,
        kind,
        url,
        expected: fallbackTarget,
        actual: actualFb,
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
    suggestions: suggestNearMatches(index, target),
  });
}

for (const file of htmlFiles) {
  const relFile = rel(file);
  const content = readText(file);

  // href/src
  {
    let m;
    while ((m = urlRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url || !url.startsWith("/")) continue;
      checkOne({ fromFile: relFile, url, kind: "href/src" });
    }
  }

  // data-reel-src
  {
    let m;
    while ((m = dataReelSrcRegex.exec(content)) !== null) {
      const url = m[1];
      if (!url || !url.startsWith("/")) continue;
      checkOne({ fromFile: relFile, url, kind: "data-reel-src" });
    }
  }
}

// --- Reporting ---
let failed = false;

if (collisions.length) {
  failed = true;
  console.error("❌ Normalized path collisions (case/dash variants collapse to same key):");
  for (const c of collisions) {
    console.error(`- ${c.paths.join("  |  ")}`);
  }
  console.error("");
}

if (state.caseOrDashMismatch.length) {
  failed = true;
  console.error("❌ Case/Dash mismatch in internal targets (WILL break on hosting):");
  for (const x of state.caseOrDashMismatch) {
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
    if (x.suggestions && x.suggestions.length) {
      console.error(`  suggestions:`);
      for (const s of x.suggestions) console.error(`   - ${s}`);
    }
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

if (failed) process.exit(1);
console.log("✅ All internal targets exist (href/src + data-reel-src) with no case/dash issues.");
