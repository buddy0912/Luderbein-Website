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
 * This is a real risk on macOS/Windows + generally a maintenance hazard.
 */
function detectCaseCollisions(allRelFiles) {
  const map = new Map(); // lower -> [actual...]
  for (const p of allRelFiles) {
    const k = p.toLowerCase();
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(p);
  }

  const collisions = [];
  for (const [k, arr] of map.entries()) {
    if (arr.length > 1) collisions.push({ key: k, paths: arr });
  }
  return collisions;
}

// --- Main scan ---

const allFilesAbs = walkFiles(repoRoot);
const allFilesRel = allFilesAbs.map((f) => path.relative(repoRoot, f).replaceAll("\\", "/"));

const collisions = detectCaseCollisions(allFilesRel);

const htmlFiles = allFilesAbs.filter((f) => f.endsWith(".html"));

// Match only absolute internal URLs: href="/..." or src="/..."
const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;

const missing = [];
const caseMismatch = [];
const trailingSlashWarnings = [];

for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
  const content = read(file);

  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    const url = m[1];

    // Ignore special cases that still begin with "/" but aren't real file targets
    // (rare, but safe)
    if (url.startsWith("//")) continue;

    const { target, fallbackTarget } = resolveInternal(url);

    // First try exact match
    if (existsRel(target)) continue;

    // If exact doesn't exist, check if it exists with different case
    const ci = findCaseInsensitiveMatch(target);
    if (ci && ci.actualRel && ci.hasCaseMismatch) {
      caseMismatch.push({
        from: relFile,
        url,
        expected: target,
        actual: ci.actualRel,
      });
      continue;
    }

    // If /dir (no slash) but /dir/index.html exists -> warn, but don't fail
    if (fallbackTarget && existsRel(fallbackTarget)) {
      trailingSlashWarnings.push({
        from: relFile,
        url,
        suggestion: "/" + target + "/",
        resolvesTo: fallbackTarget,
      });
      continue;
    }

    // Also try case-insensitive match for fallbackTarget
    if (fallbackTarget) {
      const ciFallback = findCaseInsensitiveMatch(fallbackTarget);
      if (ciFallback && ciFallback.actualRel && ciFallback.hasCaseMismatch) {
        caseMismatch.push({
          from: relFile,
          url,
          expected: fallbackTarget,
          actual: ciFallback.actualRel,
        });
        continue;
      }
    }

    // Otherwise: missing
    missing.push({ from: relFile, url, expected: target, alsoTried: fallbackTarget });
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

if (caseMismatch.length) {
  failed = true;
  console.error("❌ Case mismatch in internal links (will break on case-sensitive hosting like Cloudflare Pages):");
  for (const x of caseMismatch) {
    console.error(`- ${x.from} -> ${x.url}`);
    console.error(`  expected: ${x.expected}`);
    console.error(`  actual:   ${x.actual}`);
  }
  console.error("");
}

if (missing.length) {
  failed = true;
  console.error("❌ Missing internal targets:");
  for (const x of missing) {
    const extra = x.alsoTried ? ` (also tried: ${x.alsoTried})` : "";
    console.error(`- ${x.from} -> ${x.url} (expected: ${x.expected})${extra}`);
  }
  console.error("");
}

if (trailingSlashWarnings.length) {
  console.log("⚠️ Links to directories without trailing slash (works sometimes via redirect, but not guaranteed everywhere):");
  for (const x of trailingSlashWarnings) {
    console.log(`- ${x.from} -> ${x.url} (suggest: ${x.suggestion}, resolves to: ${x.resolvesTo})`);
  }
  console.log("");
}

if (failed) {
  process.exit(1);
} else {
  console.log("✅ All internal /href + /src targets exist (and no case issues found).");
}
