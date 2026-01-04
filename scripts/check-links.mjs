// scripts/check-links.mjs
// Link & asset target checker for static HTML repos.
// - Validates internal href/src/srcset + data-reel-src targets exist in repo.
// - Correctly resolves web-absolute paths like "/assets/..." against repo root.
// - Tolerates unicode dash variants (– — - etc.) by matching normalized filenames.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer GITHUB_WORKSPACE; fallback: repo root assumed to be parent of /scripts
const repoRoot = process.env.GITHUB_WORKSPACE
  ? path.resolve(process.env.GITHUB_WORKSPACE)
  : path.resolve(__dirname, "..");

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  ".github",
  ".vscode",
  ".idea",
  "dist",
  "build",
  "out",
  ".next",
]);

const isWindows = process.platform === "win32";
const toPosix = (p) => p.split(path.sep).join("/");

// Normalize for “same looking but different” characters (unicode dashes etc.)
function normalizeName(s) {
  return s
    .normalize("NFKC")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-");
}

// Return true if URL is external-ish and should be ignored.
function isSkippableUrl(u) {
  if (!u) return true;
  const s = u.trim();
  if (!s) return true;
  if (s.startsWith("#")) return true;
  if (s.startsWith("mailto:")) return true;
  if (s.startsWith("tel:")) return true;
  if (s.startsWith("javascript:")) return true;
  if (s.startsWith("data:")) return true;
  if (s.startsWith("http://") || s.startsWith("https://")) return true;
  return false;
}

// Strip query/hash and decode URI safely.
function cleanUrl(u) {
  let s = u.trim();
  // drop surrounding spaces
  // remove hash/query
  s = s.split("#")[0].split("?")[0];
  try {
    s = decodeURI(s);
  } catch {
    // ignore decode errors, keep raw
  }
  return s;
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// Try to find file by normalized basename inside its directory (unicode dash fix).
function findByNormalizedBasename(expectedPath) {
  const dir = path.dirname(expectedPath);
  const base = path.basename(expectedPath);
  if (!dirExists(dir)) return null;

  const want = normalizeName(base);
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return null;
  }

  for (const e of entries) {
    if (normalizeName(e) === want) {
      const candidate = path.join(dir, e);
      if (fileExists(candidate)) return candidate;
    }
  }
  return null;
}

function resolveTarget(fromHtmlFile, url) {
  // url is already cleaned (no query/hash)
  // Absolute web path => resolve from repoRoot
  if (url.startsWith("/")) {
    const rel = url.replace(/^\/+/, ""); // remove all leading slashes
    return path.join(repoRoot, rel);
  }

  // Relative path => resolve from html file directory
  const fromDir = path.dirname(fromHtmlFile);
  return path.resolve(fromDir, url);
}

function collectHtmlFiles(rootDir) {
  const out = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (IGNORED_DIRS.has(ent.name)) continue;
        walk(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
        out.push(full);
      }
    }
  }

  walk(rootDir);
  return out;
}

// Extract urls from href/src/srcset + data-reel-src
function extractUrlsFromHtml(content) {
  const urls = [];

  // href/src
  const attrRe = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(content)) !== null) {
    urls.push(m[1]);
  }

  // data-reel-src
  const reelRe = /\bdata-reel-src\s*=\s*["']([^"']+)["']/gi;
  while ((m = reelRe.exec(content)) !== null) {
    urls.push(m[1]);
  }

  // srcset: "a.jpg 1x, b.jpg 2x"
  const srcsetRe = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcsetRe.exec(content)) !== null) {
    const parts = m[1].split(",");
    for (const part of parts) {
      const token = part.trim().split(/\s+/)[0];
      if (token) urls.push(token);
    }
  }

  return urls;
}

function asIndexHtmlIfDirectory(targetPath) {
  // If target points to a directory or ends with '/', accept directory/index.html
  if (targetPath.endsWith(path.sep) || targetPath.endsWith("/")) {
    return path.join(targetPath, "index.html");
  }

  if (dirExists(targetPath)) {
    return path.join(targetPath, "index.html");
  }

  // If no extension and not a file, also try index.html (for "/foo/" style links without trailing slash)
  const base = path.basename(targetPath);
  if (!base.includes(".") && !fileExists(targetPath)) {
    const idx = path.join(targetPath, "index.html");
    return idx;
  }

  return null;
}

function showPath(p) {
  // make logs stable
  const rel = path.relative(repoRoot, p);
  const nice = rel && !rel
