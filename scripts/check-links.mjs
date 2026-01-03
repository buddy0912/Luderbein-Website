import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function resolveInternal(url) {
  // strip query/hash
  const clean = url.split("#")[0].split("?")[0];
  if (clean === "/") return { target: "index.html", ok: exists("index.html") };

  if (clean.endsWith("/")) {
    const target = clean.replace(/^\//, "") + "index.html";
    return { target, ok: exists(target) };
  }

  const target = clean.replace(/^\//, "");
  return { target, ok: exists(target) };
}

const htmlFiles = walk(repoRoot).filter((f) => f.endsWith(".html"));

const urlRegex = /\b(?:href|src)\s*=\s*["'](\/[^"']+)["']/gi;

let missing = [];
for (const file of htmlFiles) {
  const relFile = path.relative(repoRoot, file).replaceAll("\\", "/");
  const content = read(file);

  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    const url = m[1];
    if (!url.startsWith("/")) continue;

    const { target, ok } = resolveInternal(url);
    if (!ok) missing.push({ from: relFile, url, target });
  }
}

if (missing.length) {
  console.error("❌ Missing internal targets:");
  for (const x of missing) {
    console.error(`- ${x.from} -> ${x.url} (expected: ${x.target})`);
  }
  process.exit(1);
} else {
  console.log("✅ All internal /href + /src targets exist.");
}
