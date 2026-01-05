#!/usr/bin/env node
/**
 * Mini ASSETS check (ohne HTML-Parsing)
 * - prüft ALLE Dateien unter /assets/
 * - validiert magic-bytes für jpg/jpeg/png/webp/gif/svg
 *
 * Run: node scripts/mini-assets-check.mjs
 */

import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const assetsDir = path.join(repoRoot, "assets");

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
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
  ) return true;

  // GIF: GIF87a / GIF89a
  const gif = buf.slice(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return true;

  // WEBP: RIFF....WEBP
  const riff = buf.slice(0, 4).toString("ascii");
  const webp = buf.slice(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") return true;

  // SVG: text-based
  const head = buf.slice(0, 128).toString("utf8").toLowerCase();
  if (head.includes("<svg") || head.includes("<?xml")) return true;

  return false;
}

function hexPreview(buf, n = 16) {
  const b = buf.slice(0, n);
  return [...b].map(x => x.toString(16).padStart(2, "0")).join(" ");
}

function asciiPreview(buf, n = 80) {
  const s = buf.slice(0, n).toString("utf8");
  return s.replace(/[^\x20-\x7E\r\n\t]/g, ".");
}

function main() {
  if (!fs.existsSync(assetsDir)) {
    console.log("ℹ️  Kein /assets/ Ordner gefunden – übersprungen.");
    process.exit(0);
  }

  const files = walk(assetsDir);
  const imgFiles = files.filter(f => IMG_EXT.has(path.extname(f).toLowerCase()));

  const bad = [];

  for (const f of imgFiles) {
    const buf = fs.readFileSync(f);
    if (!looksLikeImageMagic(buf)) {
      bad.push({
        file: path.relative(repoRoot, f),
        headHex: hexPreview(buf),
        headAscii: asciiPreview(buf),
      });
    }
  }

  if (!bad.length) {
    console.log(`✅ Assets-check: ${imgFiles.length} Bilder ok.`);
    process.exit(0);
  }

  console.error(`❌ Assets-check: ${bad.length} kaputte/ungewöhnliche Bilddatei(en):\n`);
  for (const b of bad) {
    console.error(`- ${b.file}`);
    console.error(`  head(hex):  ${b.headHex}`);
    console.error(`  head(text): ${b.headAscii}\n`);
  }
  process.exit(1);
}

main();
