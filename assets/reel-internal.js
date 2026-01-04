/* /assets/reel-internal.js
   Reel loader + Cards + optional Category-Routing (cat/cats) + shuffle on load
*/
(function () {
  const reels = Array.from(document.querySelectorAll("[data-reel]"));
  if (!reels.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ==== CAT ROUTING (zentral) ====
  // Hinweis: "schwibbogen" routet JETZT bewusst auf Holz (später easy auf /schwibbogen/ umstellen).
  const CAT_MAP = {
    schiefer: "/leistungen/schiefer/",
    metall: "/leistungen/metall/",
    holz: "/leistungen/holz/",
    acryl: "/leistungen/acryl/",
    custom: "/leistungen/custom/",
    schwibbogen: "/leistungen/holz/"
  };

  // Priorität bei mehreren cats
  const CAT_PRIORITY = ["schwibbogen", "metall", "holz", "acryl", "schiefer", "custom"];

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, String(v));
    }
    for (const c of children) node.appendChild(c);
    return node;
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  // cats akzeptiert:
  // - it.cats: ["holz","schwibbogen"]  (empfohlen)
  // - it.cat: "holz"
  // - failsafe: "holz, schwibbogen"
  function normalizeCats(it) {
    let cats = [];

    if (Array.isArray(it?.cats)) cats = it.cats;
    else if (typeof it?.cat === "string") cats = [it.cat];

    cats = cats
      .flatMap((x) => String(x || "").split(","))
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    return Array.from(new Set(cats));
  }

  function resolveHrefFromCats(cats) {
    if (!cats || !cats.length) return null;

    for (const key of CAT_PRIORITY) {
      if (cats.includes(key) && CAT_MAP[key]) return CAT_MAP[key];
    }
    const first = cats[0];
    return CAT_MAP[first] || null;
  }

  function normalizeItem(it, defaultTag) {
    if (!it || typeof it !== "object") return null;

    const src = it.src || it.image || it.img;
    if (!src) return null;

    // Tag-Regel:
    // - Wenn Item ein eigenes "tag" (oder "badge") Feld hat (auch leer ""), nutzen wir das.
    // - Sonst Default-Tag aus dem Container (z.B. "Werkstatt").
    const ownTag =
      (hasOwn(it, "tag") ? it.tag : undefined) ??
      (hasOwn(it, "badge") ? it.badge : undefined);

    const finalTag =
      ownTag !== undefined
        ? String(ownTag ?? "").trim() // kann bewusst "" sein => kein Badge
        : String(defaultTag ?? "").trim();

    // Kategorie Routing (optional)
    const cats = normalizeCats(it);

    // href-Regel:
    // 1) explizites href/link gewinnt
    // 2) sonst: aus cats/cat ableiten (wenn vorhanden)
    const explicitHref = it.href || it.link || null;
    const computedHref = explicitHref || resolveHrefFromCats(cats) || null;

    return {
      src,
      alt: it.alt || it.title || "Beispiel",
      cap: it.cap || it.caption || it.text || "",
      href: computedHref,
      tag: finalTag,
      cats
    };
  }

  function showError(container, msg) {
    container.innerHTML = "";
    container.appendChild(el("div", { class: "muted", text: msg }));
  }

  function buildCard(item) {
    const cardTag = item.href ? "a" : "div";

    const card = el(cardTag, {
      class: "reel__item",
      href: item.href || null
    });

    if (item.tag) {
      card.appendChild(el("span", { class: "reel__tag", text: item.tag }));
    }

    const img = el("img", {
      class: "reel__img",
      src: item.src,
      alt: item.alt,
      loading: "lazy"
    });

    card.appendChild(img);

    if (item.cap) {
      card.appendChild(el("div", { class: "reel__cap", text: item.cap }));
    }

    return card;
  }

  function shuffleInPlace(arr) {
    // Fisher–Yates
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setupAutoScroll(container, intervalMs) {
    const canScroll = () => container.scrollWidth > container.clientWidth + 2;
    if (prefersReduced) return;

    let pausedUntil = 0;
    const pause = (ms) => (pausedUntil = Date.now() + ms);

    container.addEventListener("scroll", () => pause(1500), { passive: true });
    container.addEventListener("pointerdown", () => pause(2500), { passive: true });
    container.addEventListener("touchstart", () => pause(2500), { passive: true });

    function nextStep() {
      if (!canScroll()) return;

      const first = container.querySelector(".reel__item");
      const step = first ? first.getBoundingClientRect().width + 14 : 320;

      const max = container.scrollWidth - container.clientWidth;
      if (max <= 0) return;

      if (container.scrollLeft >= max - 2) {
        container.scrollTo({ left: 0, behavior: "auto" });
        pause(400);
      } else {
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }

    setTimeout(() => {
      if (!canScroll()) return;

      setInterval(() => {
        if (Date.now() < pausedUntil) return;
        nextStep();
      }, intervalMs);
    }, 600);
  }

  async function initOne(container) {
    const src = container.getAttribute("data-reel-src");
    const interval = Number(container.getAttribute("data-interval") || "4500");
    const defaultTag = container.getAttribute("data-reel-default-tag") || "";

    // Shuffle default: an
    // Wenn du irgendwo KEIN shuffle willst: data-shuffle="0"
    const shuffleAttr = String(container.getAttribute("data-shuffle") || "1").trim();
    const doShuffle = shuffleAttr !== "0";

    if (!src) {
      showError(container, "Reel konnte nicht geladen werden (data-reel-src fehlt).");
      return;
    }

    try {
      const r = await fetch(src, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);

      const raw = await r.json();
      if (!Array.isArray(raw)) throw new Error("JSON ist kein Array");

      let items = raw.map((it) => normalizeItem(it, defaultTag)).filter(Boolean);

      if (!items.length) {
        showError(container, "Reel ist leer (JSON hat keine gültigen Einträge).");
        return;
      }

      if (doShuffle && items.length > 1) {
        items = shuffleInPlace(items);
      }

      container.innerHTML = "";
      for (const it of items) container.appendChild(buildCard(it));

      setupAutoScroll(container, Number.isFinite(interval) ? interval : 4500);
    } catch (e) {
      showError(container, "Reel konnte nicht geladen werden (JSON/Case prüfen).");
    }
  }

  for (const c of reels) initOne(c);
})();
