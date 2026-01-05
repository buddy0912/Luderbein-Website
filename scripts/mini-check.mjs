#!/usr/bin/env node
/**
 * Mini internal link + asset sanity checker
 * - scans all .html files
 * - collects href/src/srcset + data-reel-src (JSON)
 * - checks that targets exist on disk (repo root aware)
 * - verifies that image files are actually images (magic-bytes)
 *
 * Run: node scripts/mini-check.mjs
 */

import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".vercel",
  ".cache",
]);

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const HTML_EXT = new Set([".html", ".htm"]);
const JSON_EXT = new Set([".json"]);

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

function stripQueryHash(u) {
  const q = u.indexOf("?");
  const h = u.indexOf("#");
  const cut = (q === -1 ? h : h === -1 ? q : Math.min(q, h));
  return cut === -1 ? u : u.slice(0, cut);
}

function isExternal(u) {
  return (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("mailto:") ||
    u.startsWith("tel:") ||
    u.startsWith("javascript:") ||
    u.startsWith("#")
  );
}

function toFsPath(fromHtmlFile, url) {
  const u = stripQueryHash(url.trim());
  if (!u) return null;
  if (isExternal(u)) return null;

  // normalize backslashes (just in case)
  const norm = u.replaceAll("\\", "/");

  // absolute-from-root
  if (norm.startsWith("/")) {
    return path.join(repoRoot, norm.slice(1));
  }

  // relative to html file
  return path.resolve(path.dirname(fromHtmlFile), norm);
}

function asIndexIfDir(targetFsPath) {
  // if user linked to a directory: /foo/  -> /foo/index.html
  if (targetFsPath.endsWith(path.sep)) return path.join(targetFsPath, "index.html");
  return null;
}

function looksLikeImageMagic(buf) {
  if (!buf || buf.length < 12) return false;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  )
    return true;

  // GIF: GIF87a / GIF89a
  const gif = buf.slice(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return true;

  // WEBP: RIFF....WEBP
  const riff = buf.slice(0, 4).toString("ascii");
  const webp = buf.slice(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") return true;

  // SVG: text-based, allow "<svg" or "<?xml"
  const head = buf.slice(0, 64).toString("utf8").toLowerCase();
  if (head.includes("<svg") || head.includes("<?xml")) return true;

  return false;
}

function hexPreview(buf, n = 16) {
  const b = buf.slice(0, n);
  return [...b].map(x => x.toString(16).padStart(2, "0")).join(" ");
}

function asciiPreview(buf, n = 64) {
  const s = buf.slice(0, n).toString("utf8");
  return s.replace(/[^\x20-\x7E\r\n\t]/g, ".");
}

function collectFromHtml(htmlFile, content) {
  const found = [];

  // href/src
  const attrRe = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(content)) !== null) {
    found.push({ kind: "href/src", url: m[1], from: htmlFile });
  }

  // srcset
  const srcsetRe = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcsetRe.exec(content)) !== null) {
    const parts = m[1].split(",").map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      const first = p.split(/\s+/)[0];
      if (first) found.push({ kind: "srcset", url: first, from: htmlFile });
    }
  }

  // data-reel-src (JSON)
  const reelRe = /\bdata-reel-src\s*=\s*["']([^"']+)["']/gi;
  while ((m = reelRe.exec(content)) !== null) {
    found.push({ kind: "data-reel-src", url: m[1], from: htmlFile });
  }

  return found;
}

function extractAssetLikeStringsFromJsonText(txt) {
  // grabs /assets/.../*.jpg|png|webp|svg|gif and also assets/... (without leading slash)
  const re = /(?:\/|^)(assets\/[^\s"'<>]+?\.(?:jpe?g|png|webp|svg|gif))/gi;
  const out = new Set();
  let m;
  while ((m = re.exec(txt)) !== null) {
    out.add("/" + m[1].replaceAll("\\", "/"));
  }
  return [...out];
}

function main() {
  const allFiles = walk(repoRoot);
  const htmlFiles = allFiles.filter(f => HTML_EXT.has(path.extname(f).toLowerCase()));
  const problems = [];
  const checked = new Set();

  // 1) collect URLs from HTML
  const refs = [];
  for (const hf of htmlFiles) {
    const content = fs.readFileSync(hf, "utf8");
    refs.push(...collectFromHtml(hf, content));
  }

  // 2) expand data-reel-src JSONs into image paths
  const jsonRefs = refs.filter(r => r.kind === "data-reel-src");
  const syntheticRefs = [];
  for (const jr of jsonRefs) {
    const jsonPath = toFsPath(jr.from, jr.url);
    if (!jsonPath) continue;

    if (!fs.existsSync(jsonPath)) {
      problems.push({
        type: "missing",
        from: path.relative(repoRoot, jr.from),
        url: jr.url,
        expected: path.relative(repoRoot, jsonPath),
      });
      continue;
    }

    let txt;
    try {
      txt = fs.readFileSync(jsonPath, "utf8");
    } catch {
      continue;
    }

    // try parse, fallback to regex scan
    let imgUrls = [];
    try {
      JSON.parse(txt);
      imgUrls = extractAssetLikeStringsFromJsonText(txt);
    } catch {
      imgUrls = extractAssetLikeStringsFromJsonText(txt);
    }

    for (const u of imgUrls) {
      syntheticRefs.push({ kind: "json-image", url: u, from: jsonPath });
    }
  }

  const allRefs = refs.filter(r => r.kind !== "data-reel-src").concat(syntheticRefs);

  // 3) check existence + basic validity
  for (const r of allRefs) {
    const target = toFsPath(r.from, r.url);
    if (!target) continue;

    // de-dupe by resolved path
    const key = `${path.relative(repoRoot, r.from)} -> ${path.relative(repoRoot, target)}`;
    if (checked.has(key)) continue;
    checked.add(key);

    const ext = path.extname(target).toLowerCase();

    // allow directory links => index.html
    if (!fs.existsSync(target)) {
      const idx = asIndexIfDir(target);
      if (idx && fs.existsSync(idx)) continue;

      problems.push({
        type: "missing",
        from: path.relative(repoRoot, r.from),
        url: r.url,
        expected: path.relative(repoRoot, target),
        alsoTried: idx ? path.relative(repoRoot, idx) : null,
      });
      continue;
    }

    // image sanity: check magic bytes (catches “.jpg but actually text/html/lfs pointer”)
    if (IMG_EXT.has(ext)) {
      const buf = fs.readFileSync(target);
      if (!looksLikeImageMagic(buf)) {
        problems.push({
          type: "bad-image",
          from: path.relative(repoRoot, r.from),
          url: r.url,
          expected: path.relative(repoRoot, target),
          headHex: hexPreview(buf),
          headAscii: asciiPreview(buf),
        });
      }
    }

    // json sanity: if referenced via data-reel-src, it should be valid JSON
    if (JSON_EXT.has(ext) && r.kind === "data-reel-src") {
      const txt = fs.readFileSync(target, "utf8");
      try {
        JSON.parse(txt);
      } catch (e) {
        problems.push({
          type: "bad-json",
          from: path.relative(repoRoot, r.from),
          url: r.url,
          expected: path.relative(repoRoot, target),
          error: String(e),
        });
      }
    }
  }

  if (!problems.length) {
    console.log("✅ Mini-check: keine fehlenden Targets, keine kaputten Image-Header.");
    process.exit(0);
  }

  console.error(`❌ Mini-check: ${problems.length} Problem(e)\n`);

  for (const p of problems) {
    if (p.type === "missing") {
      console.error(`- MISSING: ${p.from} -> ${p.url}`);
      console.error(`  expected: ${p.expected}`);
      if (p.alsoTried) console.error(`  also tried: ${p.alsoTried}`);
    } else if (p.type === "bad-image") {
      console.error(`- BAD-IMAGE: ${p.from} -> ${p.url}`);
      console.error(`  file: ${p.expected}`);
      console.error(`  head(hex):  ${p.headHex}`);
      console.error(`  head(text): ${p.headAscii}`);
    } else if (p.type === "bad-json") {
      console.error(`- BAD-JSON: ${p.from} -> ${p.url}`);
      console.error(`  file: ${p.expected}`);
      console.error(`  error: ${p.error}`);
    }
    console.error("");
  }

  process.exit(1);
}

main();
