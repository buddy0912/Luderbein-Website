// ==== CAT ROUTING (zentral) ====
const CAT_MAP = {
  schiefer: "/leistungen/schiefer/",
  metall: "/leistungen/metall/",
  holz: "/leistungen/holz/",
  acryl: "/leistungen/acryl/",
  custom: "/leistungen/custom/",
  // später: "/schwibbogen/" – heute erstmal Holz:
  schwibbogen: "/leistungen/holz/"
};

// Priorität, wenn mehrere cats vorhanden sind:
const CAT_PRIORITY = ["schwibbogen", "metall", "holz", "acryl", "schiefer", "custom"];

function normalizeCats(it) {
  // akzeptiert: it.cats (Array) ODER it.cat (String)
  let cats = [];

  if (Array.isArray(it.cats)) cats = it.cats;
  else if (typeof it.cat === "string") cats = [it.cat];

  // optional: wenn jemand "holz, schwibbogen" eintippt (failsafe)
  cats = cats
    .flatMap(x => String(x || "").split(","))
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);

  // dedupe
  return Array.from(new Set(cats));
}

function resolveHrefFromCats(cats) {
  if (!cats || !cats.length) return null;

  for (const key of CAT_PRIORITY) {
    if (cats.includes(key) && CAT_MAP[key]) return CAT_MAP[key];
  }
  // fallback: erster cat, falls nicht in priority
  const first = cats[0];
  return CAT_MAP[first] || null;
}
