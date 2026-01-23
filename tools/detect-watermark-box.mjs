import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT_DIR = process.cwd();
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const IGNORE_DIRS = new Set([".git", "node_modules"]);
const PATCH_SIZE = 160;
const MIN_PATCH = 24;
const BRIGHTNESS_THRESHOLD = 0.72;
const VARIANCE_THRESHOLD = 0.03;
const CONTRAST_THRESHOLD = 0.18;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(...(await walk(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      results.push(fullPath);
    }
  }

  return results;
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

async function hasBoxWatermark(imageSource) {
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
  if (candidates.length === 0) return false;

  const contrasts = [];
  for (const candidate of candidates) {
    const adjacentStats = await statsForRegion(image, candidate);
    contrasts.push(patchStats.mean - adjacentStats.mean);
  }
  const contrast = Math.max(...contrasts);
  return contrast > CONTRAST_THRESHOLD;
}

export async function listImageFiles() {
  return walk(ROOT_DIR);
}

export async function detectBoxWatermark(filePath) {
  return hasBoxWatermark(filePath);
}

export async function detectBoxWatermarkBuffer(buffer) {
  return hasBoxWatermark(buffer);
}

async function runCli() {
  const files = await listImageFiles();
  const flagged = [];

  for (const filePath of files) {
    try {
      if (await detectBoxWatermark(filePath)) {
        flagged.push(path.relative(ROOT_DIR, filePath));
      }
    } catch (error) {
      console.warn(`Warn: ${filePath} (${error.message})`);
    }
  }

  flagged.sort().forEach((filePath) => console.log(filePath));
}

const isCli = process.argv[1]
  && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isCli) {
  runCli();
}
