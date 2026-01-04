import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const toPosix = (p) => p.replaceAll("\\", "/");

// alle Dash-Varianten → "-"
const normalizeDashes = (s) =>
  String(s).replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE63\uFF0D]/g, "-");

const normKey = (s) => normalizeDashes(String(s)).toLowerCase();

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

function resolveInternal(url) {
  const clean = url.split("#")[0].split("?")[0];

  if (clean === "/") return { url: clean, target: "index.html", fallbackTarget: null };

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { url: clean, target, fallbackTarget: null };
  }

  const target = clean.replace(/^\//, "");
  return { url: clean, target, fallbackTarget: target + "/index.html" };
}

// Build index of existing files (normalized key -> actual rel path)
const allAbs = walkFiles(repoRoot);
const allRel = allAbs.map((f) => toPosix(path.relative(repoRoot, f)));

const fileIndex = new Map(); // normKey -> actualRel
const collisions = []; // same normKey with different actual path
for (const rel of allRel) {
  const k = normKey(rel);
  const prev = fileIndex.get(k);
  if (prev && prev !== rel) collisions.push([prev, rel]);
  else fileIndex.set(k, rel);
}

const htmlFiles = allAbs.filter((f) => f.endsWith(".html"));

const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  trailingSlashWarnings: [],
  tolerantMatches: [],
};

function existsExact(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function existsTolerant(relPath) {
  const k = normKey(relPath);
  const hit = fileIndex.get(k);
  return hit ? hit : null;
}

function checkOneTarget({ fromFile, url, kind }) {
  if (!url || !url.startsWith("/")) return;
  if (url.startsWith("//")) return;

  const normalizedUrl = normalizeDashes(url);
  const { target, fallbackTarget } = resolveInternal(normalizedUrl);

  // exact
  if (existsExact(target)) return;

  // tolerant (case/dash variants)
  const hit = existsTolerant(target);
  if (hit) {
    state.tolerantMatches.push({ from: fromFile, kind, url, expected: target, actual: hit });
    return;
  }

  // fallback index.html
  if (fallbackTarget) {
    if (existsExact(fallbackTarget)) {
      state.trailingSlashWarnings.push({
        from: fromFile,
        kind,
        url,
        suggestion: "/" + target + "/",
        resolvesTo: fallbackTarget,
      });
      return;
    }
    const hitFb = existsTolerant(fallbackTarget);
    if (hitFb) {
      state.tolerantMatches.push({ from: fromFile, kind, url, expected: fallbackTarget, actual: hitFb });
      return;
    }
  }

  state.missing.push({
    from: fromFile,
    kind,
    url,
    expected: target,
    alsoTried: fallbackTarget,
  });
}

// scan
for (const file of htmlFiles) {
  const relFile = toPosix(path.relative(repoRoot, file));
  const content = fs.readFileSync(file, "utf8");

  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    checkOneTarget({ fromFile: relFile, url: m[1], kind: "href/src" });
  }

  while ((m = dataReelSrcRegex.exec(content)) !== null) {
    checkOneTarget({ fromFile: relFile, url: m[1], kind: "data-reel-src" });
  }
}

// report
let failed = false;

if (collisions.length) {
  failed = true;
  console.error("❌ Path collisions (case/dash-insensitive):");
  for (const [a, b] of collisions) console.error(`- ${a}  |  ${b}`);
  console.error("");
}

if (state.missing.length) {
  failed = true;
  console.error("❌ Missing internal targets:");
  for (const x of state.missing) {
    const extra = x.alsoTried ? ` (also tried: ${x.alsoTried})` : "";
    console.error(`- [${x.kind}] ${x.from} -> ${x.url} (expected: ${x.expected})${extra}`);
  }
  console.error("");
}

if (state.tolerantMatches.length) {
  console.log("⚠️ Tolerant matches used (case/dash variants tolerated):");
  for (const x of state.tolerantMatches) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url}`);
    console.log(`  expected: ${x.expected}`);
    console.log(`  actual:   ${x.actual}`);
  }
  console.log("");
}

if (state.trailingSlashWarnings.length) {
  console.log("⚠️ Missing trailing slash:");
  for (const x of state.trailingSlashWarnings) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url} (suggest: ${x.suggestion}, resolves to: ${x.resolvesTo})`);
  }
  console.log("");
}

if (failed) process.exit(1);
console.log("✅ Link check OK (href/src + data-reel-src).");
