import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * RepoRoot IMMER zuverlässig:
 * => Ordner vom Script (/scripts) -> eine Ebene hoch = RepoRoot
 * (egal, von wo Actions das Script ausführt)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

// --- helpers ---
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

function listDir(relDir) {
  const abs = path.join(repoRoot, relDir);
  if (!fs.existsSync(abs)) return null;
  return fs.readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name);
}

/**
 * Zeigt dir, OB irgendwo ein anderes Dash/Unicode drin steckt.
 * (nicht diskutieren – nur anzeigen)
 */
function showDashCodes(s) {
  return String(s).replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, (ch) => {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
    return `${ch}[U+${cp}]`;
  });
}

function checkOneTarget({ fromFile, url, kind }, state) {
  if (url.startsWith("//")) return;

  const { target, fallbackTarget } = resolveInternal(url);

  // 1) exact match exists
  if (existsRel(target)) return;

  // 2) directory fallback
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

  // 3) missing
  const expectedDir = target.includes("/") ? target.split("/").slice(0, -1).join("/") : "";
  const expectedBase = target.split("/").pop();
  const filesInDir = expectedDir ? listDir(expectedDir) : null;

  state.missing.push({
    from: fromFile,
    kind,
    url,
    expected: target,
    alsoTried: fallbackTarget,
    expectedDir,
    expectedBase,
    filesInDir,
  });
}

// --- Main scan ---
console.log(`check-links.mjs repoRoot = ${repoRoot}`);

const allFilesAbs = walkFiles(repoRoot);
const htmlFiles = allFilesAbs.filter((f) => f.endsWith(".html"));

const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;
const dataReelSrcRegex = /\bdata-reel-src\s*=\s*["'](\/[^"']+)["']/gi;

const state = {
  missing: [],
  trailingSlashWarnings: [],
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

if (state.missing.length) {
  failed = true;
  console.error("❌ Missing internal targets:");
  for (const x of state.missing) {
    const extra = x.alsoTried ? ` (also tried: ${x.alsoTried})` : "";
    console.error(`- [${x.kind}] ${x.from} -> ${x.url} (expected: ${x.expected})${extra}`);

    // ultra-konkret: zeig den Zielordner + Dateiliste
    if (x.expectedDir) {
      console.error(`  expectedDir: ${x.expectedDir}`);
      console.error(`  expectedBase: ${showDashCodes(x.expectedBase)}`);
      if (x.filesInDir && x.filesInDir.length) {
        console.error(`  filesInDir:`);
        for (const f of x.filesInDir) console.error(`   - ${showDashCodes(f)}`);
      } else {
        console.error(`  filesInDir: <none or dir missing>`);
      }
    }
  }
  console.error("");
}

if (state.trailingSlashWarnings.length) {
  console.log("⚠️ Links to directories without trailing slash:");
  for (const x of state.trailingSlashWarnings) {
    console.log(`- [${x.kind}] ${x.from} -> ${x.url} (suggest: ${x.suggestion}, resolves to: ${x.resolvesTo})`);
  }
  console.log("");
}

process.exit(failed ? 1 : 0);
