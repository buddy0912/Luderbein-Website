// scripts/check-links.mjs
// Link + Asset checker for static sites (GitHub Actions friendly)
// - scans all *.html in repo
// - checks internal href/src/srcset/data-reel-src targets exist
// - detects unicode dashes (– — − etc.) vs normal hyphen (-)

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

// folders to skip while walking
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".nuxt",
  "dist",
  "build",
  ".cache",
  ".vercel",
  ".idea",
  ".vscode",
]);

const DASH_CHARS = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g;

function normalizeDashes(s) {
  return (s || "").normalize("NFC").replace(DASH_CHARS, "-");
}

function stripHashQuery(u) {
  const i = u.search(/[?#]/);
  return i === -1 ? u : u.slice(0, i);
}

function isExternal(u) {
  return (
    /^https?:\/\//i.test(u) ||
    /^mailto:/i.test(u) ||
    /^tel:/i.test(u) ||
    /^data:/i.test(u) ||
    /^javascript:/i.test(u) ||
    /^#/.test(u)
  );
}

function looksLikeDirUrl(u) {
  return u.endsWith("/");
}

function hasExtension(p) {
  return path.posix.basename(p).includes(".");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function safeRel(fromFile, targetUrl) {
  // targetUrl is already stripped of hash/query
  if (targetUrl.startsWith("/")) {
    return targetUrl.slice(1); // repo-root relative
  }
  // relative to html file
  const baseDir = path.posix.dirname(toPosix(path.relative(repoRoot, fromFile)));
  return path.posix.normalize(path.posix.join(baseDir === "." ? "" : baseDir, targetUrl));
}

async function walk(dir, out = []) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

async function fileExists(absPath) {
  try {
    await fsp.access(absPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function listDir(absDir) {
  try {
    return await fsp.readdir(absDir);
  } catch {
    return null;
  }
}

function parseSrcset(value) {
  // "a.jpg 1x, b.jpg 2x" -> ["a.jpg","b.jpg"]
  return value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(part => part.split(/\s+/)[0])
    .filter(Boolean);
}

function extractLinks(html) {
  const links = [];

  // href="..."
  const hrefRe = /\bhref\s*=\s*(["'])(.*?)\1/gi;
  // src="..."
  const srcRe = /\bsrc\s*=\s*(["'])(.*?)\1/gi;
  // data-reel-src="..."
  const reelRe = /\bdata-reel-src\s*=\s*(["'])(.*?)\1/gi;
  // srcset="..."
  const srcsetRe = /\bsrcset\s*=\s*(["'])(.*?)\1/gi;

  let m;

  while ((m = hrefRe.exec(html)) !== null) links.push({ kind: "href", url: m[2] });
  while ((m = srcRe.exec(html)) !== null) links.push({ kind: "src", url: m[2] });
  while ((m = reelRe.exec(html)) !== null) links.push({ kind: "data-reel-src", url: m[2] });
  while ((m = srcsetRe.exec(html)) !== null) {
    for (const u of parseSrcset(m[2])) links.push({ kind: "srcset", url: u });
  }

  return links;
}

async function resolveTarget(htmlFile, rawUrl) {
  const url0 = (rawUrl || "").trim();
  if (!url0 || isExternal(url0)) return { skip: true };

  const url = stripHashQuery(url0);

  // normalize unicode dashes to compute "expected"
  const normalizedUrl = normalizeDashes(url);

  const rel = safeRel(htmlFile, normalizedUrl);
  const abs = path.join(repoRoot, rel);

  // 1) exact file exists
  if (await fileExists(abs)) return { ok: true, rel, abs };

  // 2) directory URL -> accept index.html
  if (looksLikeDirUrl(normalizedUrl) || (!hasExtension(normalizedUrl) && !normalizedUrl.endsWith(".html"))) {
    const idxRel = path.posix.join(rel, "index.html");
    const idxAbs = path.join(repoRoot, idxRel);
    if (await fileExists(idxAbs)) return { ok: true, rel: idxRel, abs: idxAbs, dirIndex: true };
  }

  // 3) try normalized-basename match inside same directory (unicode dash / similar)
  const dirAbs = path.dirname(abs);
  const dirList = await listDir(dirAbs);
  if (dirList && dirList.length) {
    const wantedBase = normalizeDashes(path.basename(abs));
    const hit = dirList.find(name => normalizeDashes(name) === wantedBase);
    if (hit) {
      const hitAbs = path.join(dirAbs, hit);
      const hitRel = toPosix(path.relative(repoRoot, hitAbs));
      return { ok: true, rel: hitRel, abs: hitAbs, normalizedHit: true, actual: hitRel };
    }
  }

  return { ok: false, rel, abs, raw: url0, normalizedUrl };
}

async function main() {
  console.log(`check-links.mjs repoRoot = ${repoRoot}`);

  const allFiles = await walk(repoRoot);
  const htmlFiles = allFiles.filter(f => f.toLowerCase().endsWith(".html"));

  const missing = [];
  const trailingDirNoSlash = [];

  for (const htmlFile of htmlFiles) {
    const content = await fsp.readFile(htmlFile, "utf8");
    const links = extractLinks(content);

    for (const { kind, url } of links) {
      if (!url) continue;
      const trimmed = url.trim();

      // warn: directory-like links without trailing slash (only for root-style nav paths)
      if (
        (kind === "href") &&
        trimmed.startsWith("/") &&
        !trimmed.includes(".") &&
        !trimmed.endsWith("/") &&
        !trimmed.includes("?") &&
        !trimmed.includes("#")
      ) {
        trailingDirNoSlash.push({
          kind,
          from: toPosix(path.relative(repoRoot, htmlFile)),
          url: trimmed,
          suggestion: `${trimmed}/`,
        });
      }

      const res = await resolveTarget(htmlFile, trimmed);
      if (res.skip) continue;
      if (res.ok) continue;

      missing.push({
        kind,
        from: toPosix(path.relative(repoRoot, htmlFile)),
        url: trimmed,
        expected: toPosix(res.rel),
      });
    }
  }

  if (missing.length) {
    console.error("❌ Missing internal targets:");
    for (const x of missing) {
      console.error(`- [${x.kind}] ${x.from} -> ${x.url} (expected: ${x.expected})`);
    }
    process.exit(1);
  }

  if (trailingDirNoSlash.length) {
    console.log("⚠️ Links to directories without trailing slash:");
    for (const x of trailingDirNoSlash) {
      console.log(`- [${x.kind}] ${x.from} -> ${x.url} (suggest: ${x.suggestion})`);
    }
    console.log("");
  }

  console.log("✅ All internal targets exist (href/src + data-reel-src + srcset).");
}

main().catch((err) => {
  console.error("❌ Fatal error in check-links.mjs");
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
