(function () {
  const reels = Array.from(document.querySelectorAll("[data-reel]"));
  if (!reels.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Mini-CSS für Lightbox + Tag-Link (ohne style.css anzufassen)
  (function injectCss(){
    const css = `
      .lbOverlay{position:fixed;inset:0;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;z-index:9999;padding:18px}
      .lbOverlay[data-open="1"]{display:flex}
      .lbBox{max-width:min(1100px,96vw);max-height:86vh;position:relative}
      .lbImg{max-width:100%;max-height:86vh;display:block;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.6)}
      .lbClose{position:absolute;top:-12px;right:-12px;width:40px;height:40px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.55);color:rgba(255,255,255,.92);cursor:pointer}
      .reel__tag--link{text-decoration:none}
      .reel__tag--link:hover{filter:brightness(1.05)}
      .reel__itemBtn{all:unset;cursor:pointer;display:block}
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  })();

  // ---- Lightbox einmal global
  const lightbox = (function makeLightbox(){
    const overlay = document.createElement("div");
    overlay.className = "lbOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Bildanzeige");
    overlay.dataset.open = "0";

    const box = document.createElement("div");
    box.className = "lbBox";

    const img = document.createElement("img");
    img.className = "lbImg";
    img.alt = "";

    const btn = document.createElement("button");
    btn.className = "lbClose";
    btn.type = "button";
    btn.setAttribute("aria-label", "Schließen");
    btn.textContent = "×";

    box.appendChild(img);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function close(){
      overlay.dataset.open = "0";
      img.src = "";
      img.alt = "";
    }
    function open(src, alt){
      img.src = src;
      img.alt = alt || "";
      overlay.dataset.open = "1";
    }

    overlay.addEventListener("click", (e)=>{
      if (e.target === overlay) close();
    });
    btn.addEventListener("click", close);
    document.addEventListener("keydown", (e)=>{
      if (e.key === "Escape" && overlay.dataset.open === "1") close();
    });

    return { open, close };
  })();

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

  function normalizeItem(it, defaultTag) {
    if (!it || typeof it !== "object") return null;

    const src = it.src || it.image || it.img;
    if (!src) return null;

    // Tag-Regel:
    // - Wenn Item eigenes "tag"/"badge" hat (auch leer ""), nutzen wir das.
    // - Sonst Default-Tag aus dem Container.
    const ownTag =
      (hasOwn(it, "tag") ? it.tag : undefined) ??
      (hasOwn(it, "badge") ? it.badge : undefined);

    const finalTag =
      ownTag !== undefined
        ? String(ownTag ?? "").trim()
        : String(defaultTag ?? "").trim();

    return {
      src,
      alt: it.alt || it.title || "Beispiel",
      cap: it.cap || it.caption || it.text || "",
      href: it.href || it.link || null,
      tag: finalTag
    };
  }

  function showError(container, msg) {
    container.innerHTML = "";
    container.appendChild(el("div", { class: "muted", text: msg }));
  }

  // Tag → Zielseite (Werkstattfeed)
  // Schwibbögen existiert noch nicht als eigene Seite → erstmal Holz.
  const TAG_LINKS = {
    "Schiefer": "/leistungen/schiefer/",
    "Metall": "/leistungen/metall/",
    "Holz": "/leistungen/holz/",
    "Acryl": "/leistungen/acryl/",
    "Custom": "/leistungen/custom/",
    "Schwibbogen": "/leistungen/holz/"
  };

  function buildCard(item, mode) {
    // mode:
    // - "lightbox": Klick auf Bild => Lightbox (nur wenn item.href NICHT gesetzt)
    // - "taglinks": Tag wird klickbar (Link nach TAG_LINKS), Card bleibt "div"
    // - default: bisheriges Verhalten (wenn href da: <a>, sonst <div>)
    const wantsLightbox = mode === "lightbox";
    const wantsTagLinks = mode === "taglinks";

    // Card-Wrapper
    let cardTag = "div";
    let cardAttrs = { class: "reel__item" };

    if (!wantsTagLinks && item.href) {
      cardTag = "a";
      cardAttrs.href = item.href;
    }

    // Lightbox: wenn kein href, dann als "button-like" (div bleibt möglich, aber button ist besser)
    let asButton = false;
    if (wantsLightbox && !item.href) {
      asButton = true;
      cardTag = "button";
      cardAttrs.type = "button";
      cardAttrs.class = "reel__item reel__itemBtn";
      cardAttrs["aria-label"] = (item.cap || item.alt || "Bild öffnen");
    }

    const card = el(cardTag, cardAttrs);

    // Tag
    if (item.tag) {
      if (wantsTagLinks && TAG_LINKS[item.tag]) {
        const a = el("a", {
          class: "reel__tag reel__tag--link",
          href: TAG_LINKS[item.tag],
          text: item.tag
        });
        card.appendChild(a);
      } else {
        card.appendChild(el("span", { class: "reel__tag", text: item.tag }));
      }
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

    // Lightbox Click
    if (asButton && !prefersReduced) {
      card.addEventListener("click", () => {
        lightbox.open(item.src, item.alt);
      });
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

      const first = container.querySelector(".reel__item, .reel__itemBtn");
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
    const mode = (container.getAttribute("data-reel-mode") || "").trim(); // "lightbox" | "taglinks" | ""

    if (!src) {
      showError(container, "Reel konnte nicht geladen werden (data-reel-src fehlt).");
      return;
    }

    try {
      const r = await fetch(src, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);

      const raw = await r.json();
      if (!Array.isArray(raw)) throw new Error("JSON ist kein Array");

      const items = raw.map((it) => normalizeItem(it, defaultTag)).filter(Boolean);
      if (!items.length) {
        showError(container, "Reel ist leer (JSON hat keine gültigen Einträge).");
        return;
      }

      container.innerHTML = "";
      for (const it of items) container.appendChild(buildCard(it, mode));

      setupAutoScroll(container, Number.isFinite(interval) ? interval : 4500);
    } catch (e) {
      showError(container, "Reel konnte nicht geladen werden (JSON/Case prüfen).");
    }
  }

  for (const c of reels) initOne(c);
})();
