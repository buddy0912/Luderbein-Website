import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { listImageFiles } from "./detect-watermark-box.mjs";

const ROOT_DIR = process.cwd();
const DEFAULT_DIRS = [
  "assets",
  "tools",
  "scripts",
  "index.html",
  "kontakt",
  "leistungen",
  "rechtliches",
  "schwibboegen",
  "service",
  "ueber",
];

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".css",
  ".html",
  ".json",
  ".svg",
  ".md",
]);

const SEARCH_TERMS = [
  "watermark",
  "lb-wm",
  "lb-watermark",
  "mark.png",
  "badge",
  "overlay",
  "corner",
  "stamp",
  "brandmark",
  "logo-box",
];

const termRegexes = SEARCH_TERMS.map(
  (term) => ({ term, regex: new RegExp(term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i") })
);

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results.push(...(await walk(fullPath)));
      continue;
    }
    if (!entry.isFile()) continue;
    results.push(fullPath);
  }
  return results;
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function rel(filePath) {
  return path.relative(ROOT_DIR, filePath).replaceAll(path.sep, "/");
}

async function collectTargetFiles() {
  const files = [];
  for (const entry of DEFAULT_DIRS) {
    const full = path.join(ROOT_DIR, entry);
    if (!(await pathExists(full))) continue;
    const stat = await fs.stat(full);
    if (stat.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (stat.isFile()) {
      files.push(full);
    }
  }
  return files.filter((filePath) => isTextFile(filePath));
}

async function scanOverlayTerms(files) {
  const hits = [];
  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const { term, regex } of termRegexes) {
        if (regex.test(line)) {
          hits.push({
            file: rel(filePath),
            line: idx + 1,
            term,
            text: line.trim(),
          });
        }
      }
    });
  }
  return hits;
}

function computeStats(data, channels) {
  let sum = 0;
  let sumSq = 0;
  const count = data.length / channels;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    sum += lum;
    sumSq += lum * lum;
  }

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return { mean, variance };
}

async function statsForRegion(image, region) {
  const { data, info } = await image
    .clone()
    .extract(region)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return computeStats(data, info.channels);
}

async function hasBoxInCorner(imageSource) {
  const PATCH_SIZE = 96;
  const MIN_PATCH = 24;
  const BRIGHTNESS_THRESHOLD = 0.72;
  const VARIANCE_THRESHOLD = 0.03;
  const CONTRAST_THRESHOLD = 0.18;

  const image = sharp(imageSource, { failOnError: false });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return false;

  const patch = Math.min(PATCH_SIZE, meta.width, meta.height);
  if (patch < MIN_PATCH) return false;

  const left = meta.width - patch;
  const top = meta.height - patch;
  const region = { left, top, width: patch, height: patch };
  const patchStats = await statsForRegion(image, region);

  const isBright = patchStats.mean > BRIGHTNESS_THRESHOLD;
  const isFlat = patchStats.variance < VARIANCE_THRESHOLD;
  if (!isBright || !isFlat) return false;

  const candidates = [];
  if (left - patch >= 0) {
    candidates.push({ left: left - patch, top, width: patch, height: patch });
  }
  if (top - patch >= 0) {
    candidates.push({ left, top: top - patch, width: patch, height: patch });
  }
  if (!candidates.length) return false;

  const contrasts = [];
  for (const candidate of candidates) {
    const adjacentStats = await statsForRegion(image, candidate);
    contrasts.push(patchStats.mean - adjacentStats.mean);
  }
  const contrast = Math.max(...contrasts);
  return contrast > CONTRAST_THRESHOLD;
}

async function auditImages() {
  const files = await listImageFiles();
  const flagged = [];

  for (const filePath of files) {
    try {
      if (await hasBoxInCorner(filePath)) {
        flagged.push(rel(filePath));
      }
    } catch (error) {
      console.warn(`Warn: ${rel(filePath)} (${error.message})`);
    }
  }

  flagged.sort();
  return flagged;
}

function printSection(title) {
  console.log("\n" + title);
  console.log("-".repeat(title.length));
}

async function main() {
  console.log("WATERMARK-BOX AUDIT\n===================");

  printSection("LISTE_A: Overlay-/Watermark-Code Treffer");
  const files = await collectTargetFiles();
  const hits = await scanOverlayTerms(files);

  if (!hits.length) {
    console.log("kein Overlay-Code mehr (keine Treffer)");
  } else {
    for (const hit of hits) {
      console.log(`${hit.file}:${hit.line} [${hit.term}] ${hit.text}`);
    }
  }

  printSection("LISTE_B: BOX-IN-BILD-VERMUTLICH");
  const flagged = await auditImages();
  if (!flagged.length) {
    console.log("0 Treffer");
  } else {
    console.log(`${flagged.length} Treffer`);
    for (const filePath of flagged) {
      console.log(filePath);
    }
  }
}

const isCli = process.argv[1]
  && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isCli) {
  main();
}
