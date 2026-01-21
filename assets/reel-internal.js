(function () {
  const reels = Array.from(document.querySelectorAll("[data-reel]"));
  if (!reels.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================================================
  // GLOBAL CAT ROUTING + PRIORITY
  // =========================================================
  const CAT_ROUTES = {
    schiefer: "/leistungen/schiefer/",
    metall: "/leistungen/metall/",
    holz: "/leistungen/holz/",
    acryl: "/leistungen/acryl/",
    glas: "/leistungen/glas/",
    schwibbogen: "/leistungen/schwibboegen/", // Kategorie Schwibbögen
    custom: "/leistungen/custom/"      // "Spezialbau" ist Copy/Label, Route bleibt
  };

  // ✅ GLOBAL: Metall vor Acryl (und generell klare Priorität)
  const CAT_PRIORITY = ["metall", "acryl", "schiefer", "holz", "schwibbogen", "custom"];

  function $(tag, attrs = {}, children = []) {
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

  function safeTrim(v) {
    return String(v ?? "").trim();
  }

  function normalizeCats(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(x => safeTrim(x).toLowerCase()).filter(Boolean);
    // erlaubt auch "metall, acryl"
    return safeTrim(raw)
      .split(",")
      .map(x => safeTrim(x).toLowerCase())
      .filter(Boolean);
  }

  function pickBestCat(cats) {
    const list = normalizeCats(cats);
    if (!list.length) return null;

    let best = null;
    let bestScore = Infinity;

    for (const c of list) {
      const idx = CAT_PRIORITY.indexOf(c);
      const score = idx === -1 ? 9999 : idx;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }

    // Falls nichts in PRIORITY auftaucht -> nimm erstes valides
    return best || list[0] || null;
  }

  function routeFromCats(cats) {
    const best = pickBestCat(cats);
    if (!best) return null;
    return CAT_ROUTES[best] || null;
  }

  function routeFromLabel(label) {
    const raw = safeTrim(label).toLowerCase();
    if (!raw) return null;
    if (raw.includes("metall")) return CAT_ROUTES.metall;
    if (raw.includes("holz")) return CAT_ROUTES.holz;
    if (raw.includes("schiefer")) return CAT_ROUTES.schiefer;
    if (raw.includes("acryl")) return CAT_ROUTES.acryl;
    if (raw.includes("glas")) return CAT_ROUTES.glas;
    if (raw.includes("custom") || raw.includes("spezial")) return CAT_ROUTES.custom;
    if (raw.includes("schwibbogen")) return CAT_ROUTES.schwibbogen;
    return null;
  }

  function isSamePageHref(href) {
    if (!href) return false;
    try {
      const url = new URL(href, window.location.origin);
      return url.pathname.replace(/index\.html$/, "") === window.location.pathname.replace(/index\.html$/, "");
    } catch (_) {
      return false;
    }
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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

    // Link-Regel:
    // 1) Wenn href/link im Item gesetzt ist -> nehmen
    // 2) Sonst: wenn cats vorhanden -> Route daraus bauen (global priorisiert)
    const explicitHref = it.href || it.link || null;
    const cats = normalizeCats(it.cats ?? it.cat ?? null);
    const autoHref = explicitHref ? null : routeFromCats(cats);

    return {
      src,
      alt: it.alt || it.title || "Beispiel",
      cap: it.cap || it.caption || it.text || "",
      href: explicitHref || autoHref || null,
      tag: finalTag,
      cats
    };
  }

  function showError(container, msg) {
    container.innerHTML = "";
    container.appendChild($("div", { class: "muted", text: msg }));
  }

  function buildCard(item, options = {}) {
    const isModalCard = Boolean(options.modal);
    const cardTag = isModalCard ? "div" : item.href ? "a" : "div";

    const card = $(cardTag, {
      class: "reel__item",
      href: isModalCard ? null : item.href || null,
      "data-lb-modal-card": isModalCard ? "" : null,
      "data-modal-img": isModalCard ? item.src : null,
      "data-modal-alt": isModalCard ? item.alt : null,
      "data-modal-title": isModalCard ? (item.cap || item.alt || "") : null,
      "data-modal-text": isModalCard ? "" : null,
      role: isModalCard ? "button" : null,
      tabindex: isModalCard ? "0" : null
    });

    if (item.href && !isModalCard) {
      // Sauber klickbar
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", (item.cap || item.alt || "Zum Eintrag").trim());
    }

    if (item.tag) {
      card.appendChild($("span", { class: "reel__tag", text: item.tag }));
    }

    const img = $("img", {
      class: "reel__img",
      src: item.src,
      alt: item.alt,
      loading: "lazy"
    });

    card.appendChild(img);

    if (item.cap) {
      card.appendChild($("div", { class: "reel__cap", text: item.cap }));
    }

    return card;
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
    const path = window.location.pathname;
    const isHome = path === "/" || path.endsWith("/index.html");
    const isLeistungen = path.startsWith("/leistungen/");

    // default: random an (bei Reload), aus per data-random="0"
    const doRandom = container.getAttribute("data-random") !== "0";

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

      if (doRandom) shuffleInPlace(items);

      container.innerHTML = "";
      for (const it of items) {
        if (isHome) {
          const labelRoute = routeFromLabel(it.tag || it.cap || it.alt);
          const autoRoute = routeFromCats(it.cats) || labelRoute;
          if (!it.href || isSamePageHref(it.href)) {
            it.href = autoRoute || it.href;
          }
        }

        if (isLeistungen) {
          it.href = null;
          container.appendChild(buildCard(it, { modal: true }));
        } else {
          container.appendChild(buildCard(it));
        }
      }

      setupAutoScroll(container, Number.isFinite(interval) ? interval : 4500);
    } catch (e) {
      showError(container, "Reel konnte nicht geladen werden (JSON/Case prüfen).");
    }
  }

  for (const c of reels) initOne(c);
})();
