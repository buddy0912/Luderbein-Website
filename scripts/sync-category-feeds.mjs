#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(repoRoot, 'assets');

const TARGET_FEEDS = {
  holz: 'reel-holz.json',
  metall: 'reel-metall.json',
  glas: 'reel-glas.json',
  acryl: 'reel-acryl.json',
  schiefer: 'reel-schiefer.json',
  custom: 'reel-custom.json',
  schwibboegen: 'reel-schwibboegen.json'
};

const CATEGORY_ALIASES = {
  schwibbogen: 'schwibboegen',
  'schwibbögen': 'schwibboegen',
  'schwibboegen': 'schwibboegen'
};

function normalizeCategory(raw) {
  const value = String(raw ?? '').trim().toLowerCase();
  if (!value) return null;
  const aliased = CATEGORY_ALIASES[value] ?? value;
  return Object.hasOwn(TARGET_FEEDS, aliased) ? aliased : null;
}

function asArrayCategories(item) {
  const cats = [];
  if (typeof item?.cat === 'string') cats.push(item.cat);
  if (Array.isArray(item?.cats)) cats.push(...item.cats);

  const normalized = [];
  const seen = new Set();
  for (const cat of cats) {
    const n = normalizeCategory(cat);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    normalized.push(n);
  }
  return normalized;
}

function normalizeFeedItem(item, fallbackCat = null) {
  if (!item || typeof item !== 'object') return null;
  const src = typeof item.src === 'string' ? item.src.trim() : '';
  if (!src) return null;

  const normalized = {
    src,
    cap: typeof item.cap === 'string' ? item.cap : '',
    alt: typeof item.alt === 'string' ? item.alt : ''
  };

  if (typeof item.tag === 'string' && item.tag.trim()) normalized.tag = item.tag;
  if (typeof item.href === 'string' && item.href.trim()) normalized.href = item.href;

  const directCat = normalizeCategory(item.cat);
  const cat = directCat ?? normalizeCategory(fallbackCat);
  if (cat) normalized.cat = cat;

  return normalized;
}

async function readJsonArray(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function main() {
  const werkstattPath = path.join(assetsDir, 'reel-werkstatt.json');
  const werkstattRaw = await readJsonArray(werkstattPath);

  const additionsByCategory = new Map(Object.keys(TARGET_FEEDS).map((cat) => [cat, []]));

  for (const item of werkstattRaw) {
    const cats = asArrayCategories(item);
    for (const cat of cats) {
      const normalized = normalizeFeedItem(item, cat);
      if (!normalized) continue;
      additionsByCategory.get(cat).push(normalized);
    }
  }

  for (const [cat, filename] of Object.entries(TARGET_FEEDS)) {
    const targetPath = path.join(assetsDir, filename);
    const existingRaw = await readJsonArray(targetPath);
    const merged = [];
    const seenSrc = new Set();

    for (const item of existingRaw) {
      const normalized = normalizeFeedItem(item, cat);
      if (!normalized || seenSrc.has(normalized.src)) continue;
      seenSrc.add(normalized.src);
      merged.push(normalized);
    }

    for (const item of additionsByCategory.get(cat)) {
      if (seenSrc.has(item.src)) continue;
      seenSrc.add(item.src);
      merged.push(item);
    }

    await writeFile(targetPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    console.log(`synced ${filename}: ${merged.length} items`);
  }
}

main().catch((error) => {
  console.error('[sync-category-feeds] failed:', error);
  process.exitCode = 1;
});
