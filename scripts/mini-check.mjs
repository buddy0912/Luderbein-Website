import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const assetsRoot = path.join(repoRoot, "assets");

// Unicode-Dashes, die wie "-" aussehen, aber KEIN ASCII "-" sind
const DASH_CHARS = [
  "\u2010", "\u2011", "\u2012", "\u2013", "\u2014",
  "\u2212", "\uFE58", "\uFE63", "\uFF0D", "\u00AD",
];
const dashRe = new RegExp(`[${DASH_CHARS.join("")}]`, "g");

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(repoRoot, p).replaceAll("\\", "/");
}

function normalizeForCollision(p) {
  // NFKC + fake dashes -> "-"
  return p
    .split("/")
    .map(seg => seg.normalize("NFKC").replace(dashRe, "-"))
    .join("/");
}

function sniffMagic(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length >= 3 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "webp";
  return "unknown";
}

function extOf(p) {
  const e = path.extname(p).toLowerCase().replace(".", "");
  return e || "";
}

function main() {
  if (!fs.existsSync(assetsRoot)) {
    console.log("✅ mini-check: Kein /assets Ordner – nichts zu prüfen.");
    return;
  }

  const filesAbs = walkFiles(assetsRoot);
  const filesRel = filesAbs.map(rel);

  let failed = false;

  // 1) Fake-Dash im Dateinamen
  const weirdDash = [];
  for (const p of filesRel) {
    const base = p.split("/").pop() || p;
    if (dashRe.test(base.normalize("NFKC"))) weirdDash.push(p);
  }
  if (weirdDash.length) {
    failed = true;
    console.error("❌ Fake-Dash im Dateinamen gefunden:");
    for (const p of weirdDash) console.error(" -", p);
    console.error("");
  }

  // 2) Kollisionen nach Normalisierung
  const map = new Map();
  for (const p of filesRel) {
    const n = normalizeForCollision(p);
    if (!map.has(n)) map.set(n, []);
    map.get(n).push(p);
  }

  const collisions = [];
  for (const [n, arr] of map.entries()) {
    const uniq = Array.from(new Set(arr));
    if (uniq.length > 1) collisions.push({ normalized: n, actual: uniq });
  }
  if (collisions.length) {
    failed = true;
    console.error("❌ Kollisionen nach Dash-Normalisierung:");
    for (const c of collisions) {
      console.error(" normalized:", c.normalized);
      for (const a of c.actual) console.error("  -", a);
    }
    console.error("");
  }

  // 3) Datei-Typ vs Endung
  const typeMismatch = [];
  for (const abs of filesAbs) {
    const r = rel(abs);
    const ext = extOf(r);
    if (!["jpg","jpeg","png","webp","gif"].includes(ext)) continue;

    const buf = fs.readFileSync(abs);
    const magic = sniffMagic(buf);

    if (magic === "unknown") continue;

    const extGroup = (ext === "jpeg") ? "jpg" : ext;

    if (magic === "jpg" && extGroup !== "jpg") typeMismatch.push({ file: r, ext, magic: "jpg" });
    if (magic === "png" && ext !== "png") typeMismatch.push({ file: r, ext, magic: "png" });
    if (magic === "webp" && ext !== "webp") typeMismatch.push({ file: r, ext, magic: "webp" });
    if (magic === "gif" && ext !== "gif") typeMismatch.push({ file: r, ext, magic: "gif" });
  }

  if (typeMismatch.length) {
    failed = true;
    console.error("❌ Endung passt nicht zum echten Dateityp:");
    for (const x of typeMismatch) console.error(` - ${x.file} (ext .${x.ext} | real ${x.magic})`);
    console.error("");
  }

  if (failed) process.exit(1);
  console.log("✅ mini-check: /assets ist sauber (keine Fake-Dashes, keine Kollisionen, keine Typ-Mismatches).");
}

main();
