import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

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

// --- Dash helpers (Unicode-Dashes sind der Endgegner) ---
const DASH_CHARS = new Set(["-", "–", "—", "-", "−", "‒", "‐", "﹘", "﹣", "－"]);
function normalizeDashes(s) {
  // map all known dash-like chars to ASCII hyphen-minus
  let out = "";
  for (const ch of s) out += DASH_CHARS.has(ch) ? "-" : ch;
  return out;
}
function hasWeirdDash(s) {
  // any dash char that is NOT ASCII '-'
  for (const ch of s) {
    if (DASH_CHARS.has(ch) && ch !== "-") return true;
  }
  return false;
}
function showDashCodes(s) {
  // highlights dash-like chars with codepoint
  let out = "";
  for (const ch of s) {
    if (DASH_CHARS.has(ch)) {
      out += `${ch}(U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")})`;
    } else {
      out += ch;
    }
  }
  return out;
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
 * Finds path by matching segments with:
 * - case-insensitive compare
 * - dash-normalized compare (all dash-like chars treated as '-')
 * Returns { actualRel, hasMismatch } or null.
 */
function findDashInsensitiveMatch(relPath) {
  const parts = relPath.split("/").filter(Boolean);
  let curAbs = repoRoot;
  let actualParts = [];
  let hasMismatch = false;

  for (const part of parts) {
    let entries;
    try {
      entries = fs.readdirSync(curAbs, { withFileTypes: true });
    } catch {
      return null;
    }

    const want = normalizeDashes(part).toLowerCase();
    const match = entries.find((e) => normalizeDashes(e.name).toLowerCase() === want);
    if (!match) return null;

    if (match.name !== part) hasMismatch = true;

    actualParts.push(match.name);
    curAbs = path.join(curAbs, match.name);
  }

  const actualRel = actualParts.join("/");
  if (!fs.existsSync(path.join(repoRoot, actualRel))) return null;

  return { actualRel, hasMismatch };
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

function listDir(relDir) {
  try {
    const abs = path.join(repoRoot, relDir);
    const entries = fs.readdirSync(abs, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .slice(0, 80);
    return entries;
  } catch {
    return null;
  }
}

/**
 * Process a single internal URL and record missing/case-mismatch/warnings.
 */
function checkOneTarget({ fromFile, url, kind }, state) {
  if (url.startsWith("//")) return;

  // Candidate URLs: original + dash-normalized (prevents “unsichtbare Dash”-Fails)
  const candidates = [];
  candidates.push(url);
  const normUrl = normalizeDashes(url);
  if (normUrl !== url) candidates.push(normUrl);

  let resolvedAny = false;

  for (const candidateUrl of candidates) {
    const { target, fallbackTarget } = resolveInternal(candidateUrl);

    // 1) exact match exists
    if (existsRel(target)) {
      // If we only succeeded via dash-normalized URL, warn (but do NOT fail)
      if (candidateUrl !== url) {
        state.dashWarnings.push({
          from: fromFile,
          kind,
          url,
          normalizedUrl: candidateUrl,
          expected: target,
        });
      }
      return;
    }

    // 2) case mismatch (hard fail)
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

    // 2b) dash mismatch (warn, not fail)
    const di = findDashInsensitiveMatch(target);
    if (di && di.actualRel && di.hasMismatch) {
      state.dashWarnings.push({
        from: fromFile,
        kind,
        url,
        expected: target,
        actual: di.actualRel,
        expectedShown: showDashCodes(target),
        actualShown: showDashCodes(di.actualRel),
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

    // 4) case mismatch for fallback (hard fail)
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

      // 4b) dash mismatch for fallback (warn)
      const diFallback = findDashInsensitiveMatch(fallbackTarget);
      if (diFallback && diFallback.actualRel && diFallback.hasMismatch) {
        state.dashWarnings.push({
          from: fromFile,
          kind,
          url,
          expected: fallbackTarget,
          actual: diFallback.actualRel,
          expectedShown: showDashCodes(fallbackTarget),
          actualShown: showDashCodes(diFallback.actualRel),
        });
        return;
      }
    }

    resolvedAny = true;
  }

  // 5) missing (add directory listing for instant clarity)
  const { target, fallbackTarget } = resolveInternal(url);
  const expectedDir = path.posix.dirname(target);
  const filesInDir = listDir(expectedDir);

  state.missing.push({
    from: fromFile,
    kind,
    url,
    expected: target,
    alsoTried: fallbackTarget,
    expectedDir,
    filesInDir,
    dashInfo: hasWeirdDash(target) ? showDashCodes(target) : null,
  });

  if (!resolvedAny) return;
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
  dashWarnings: [],
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
  for (const c of collisions) {
    console.error(`- ${c.paths.join("  |  ")}`);
  }
  console.error("");
}

if (state.caseMismatch.length) {
  failed = true;
  console.error("❌ Case mismatch in internal targets (breaks on case-sensitive hosting):");
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
    if (x.dashInfo) console.error(`  dash-codes expected: ${x.dashInfo}`);
    if (x.expectedDir) console.error(`  expectedDir: ${x.expectedDir}`);
    if (x.filesInDir) {
      console.error(`  filesInDir (${x.filesInDir.length}):`);
      for (const f of x.filesInDir) console.error(`   - ${showDashCodes(f)}`);
    } else {
      console.error(`  filesInDir: <dir missing or unreadable>`);
    }
  }
  console.error("");
}

// Warnings (do NOT fail)
if (state.dashWarnings.length) {
  console.log("⚠️ Dash-normalization matched a file (Unicode dash vs '-'). Not failing, but please standardize later:");
  for (const x of state.dashWarnings) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url}`);
    if (x.actual) {
      console.log(`  expected: ${x.expectedShown || x.expected}`);
      console.log(`  actual:   ${x.actualShown || x.actual}`);
    } else {
      console.log(`  normalizedUrl: ${x.normalizedUrl}`);
      console.log(`  target: ${x.expected}`);
    }
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

if (failed) {
  process.exit(1);
} else {
  console.log("✅ All internal targets exist (href/src + data-reel-src) and no hard case issues found.");
}
