/* Luderbein – site.js
   - Mobile Nav Toggle
   - Auto aria-current="page" für die Hauptnavigation
   - Reel/Feed: Bilder automatisch laden + random start + autoplay
*/

(function () {
  "use strict";

  // ---------------- Reel-Konfig ----------------
  // Ordner: /assets/reel/
  // Dateien: reel-01.jpg ... reel-XX.jpg
  const REEL_DIR = "/assets/reel/";
  const REEL_TOTAL = 50;          // <- HOCHDREHEN, wenn du mehr als 17/20 hast
  const REEL_PREFIX = "reel-";
  const REEL_EXT = ".jpg";

  // Slideshow
  const REEL_INTERVAL_MS = 2800;  // <- Geschwindigkeit (ms)
  const REEL_FADE_MS = 220;       // <- schneller Übergang (ohne CSS nötig)

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function buildReelUrls() {
    const out = [];
    for (let i = 1; i <= REEL_TOTAL; i++) {
      out.push(`${REEL_DIR}${REEL_PREFIX}${pad2(i)}${REEL_EXT}`);
    }
    return out;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // sammelt existierende Bilder (prüft real per Image load)
  function collectExistingImages(urls, minCount, done) {
    const pool = shuffle(urls);
    const found = [];
    const wanted = Math.max(1, minCount || 6);

    let idx = 0;
    function next() {
      if (found.length >= wanted || idx >= pool.length) return done(found);

      const url = pool[idx++];
      const img = new Image();
      img.onload = () => { found.push(url); next(); };
      img.onerror = () => next();
      img.src = url;
    }
    next();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReel() {
    const reel =
      document.querySelector("[data-reel]") ||
      document.getElementById("reel") ||
      document.querySelector(".reel");

    if (!reel) return;

    // wie viele Bilder sollen mindestens gefunden werden, damit’s schön randomisiert?
    const attrMin = parseInt(reel.getAttribute("data-reel-min") || "", 10);
    const minPool = Number.isFinite(attrMin) ? attrMin : 10;

    // falls du die Geschwindigkeit pro Seite ändern willst:
    const attrInterval = parseInt(reel.getAttribute("data-reel-interval") || "", 10);
    const intervalMs = Number.isFinite(attrInterval) ? attrInterval : REEL_INTERVAL_MS;

    // 1) wir nutzen EIN "main img" und tauschen src
    let main = reel.querySelector("img[data-reel-main]") || reel.querySelector("img");

    if (!main) {
      main = document.createElement("img");
      main.alt = "Beispiel – Luderbein";
      reel.innerHTML = "";
      reel.appendChild(main);
    }

    // sanity attrs
    if (!main.hasAttribute("loading")) main.setAttribute("loading", "eager");
    if (!main.hasAttribute("decoding")) main.setAttribute("decoding", "async");

    // leichtes Fade ohne CSS
    main.style.transition = `opacity ${REEL_FADE_MS}ms ease`;
    main.style.opacity = "1";

    const urls = buildReelUrls();

    collectExistingImages(urls, minPool, (available) => {
      if (!available.length) return;

      // random start + shuffle playlist
      let playlist = shuffle(available);
      let i = Math.floor(Math.random() * playlist.length);

      function show(url) {
        // kleines Fade-out → src swap → fade-in
        main.style.opacity = "0";
        window.setTimeout(() => {
          main.src = url;
          main.style.opacity = "1";
        }, REEL_FADE_MS);
      }

      // initial
      show(playlist[i]);

      // autoplay (wenn nicht reduce motion)
      if (prefersReducedMotion()) return;

      // wenn Nutzer drauf tippt/hover: kurz pausieren (mobile-friendly)
      let timer = null;
      let paused = false;

      function start() {
        if (timer) return;
        timer = window.setInterval(() => {
          if (paused) return;
          i = (i + 1) % playlist.length;
          show(playlist[i]);
        }, intervalMs);
      }

      function stop() {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
      }

      reel.addEventListener("mouseenter", () => { paused = true; });
      reel.addEventListener("mouseleave", () => { paused = false; });
      reel.addEventListener("touchstart", () => { paused = true; }, { passive: true });
      reel.addEventListener("touchend", () => { paused = false; }, { passive: true });

      // wenn Tab inaktiv → stoppen (spart Ressourcen)
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
      });

      start();
    });
  }

  ready(function () {
    // ---------- Mobile Nav ----------
    const btn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    function openNav() {
      if (!btn || !nav) return;
      btn.setAttribute("aria-expanded", "true");
      nav.setAttribute("data-open", "1");
      document.documentElement.classList.add("nav-open");
    }

    function closeNav() {
      if (!btn || !nav) return;
      btn.setAttribute("aria-expanded", "false");
      nav.setAttribute("data-open", "0");
      document.documentElement.classList.remove("nav-open");
    }

    function toggleNav() {
      if (!btn || !nav) return;
      const isOpen = nav.getAttribute("data-open") === "1";
      isOpen ? closeNav() : openNav();
    }

    if (btn && nav) {
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
      if (!nav.hasAttribute("data-open")) nav.setAttribute("data-open", "0");

      btn.addEventListener("click", toggleNav);

      nav.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (a) closeNav();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });

      document.addEventListener("click", (e) => {
        const isOpen = nav.getAttribute("data-open") === "1";
        if (!isOpen) return;
        if (e.target.closest("[data-nav]") || e.target.closest("[data-nav-toggle]")) return;
        closeNav();
      });
    }

    // ---------- Auto aria-current ----------
    const menu = document.querySelector('nav[aria-label="Hauptmenü"]');
    if (menu) {
      const links = Array.from(menu.querySelectorAll("a[href]"));
      if (links.length) {
        let current = window.location.pathname || "/";
        current = current.replace(/index\.html$/i, "");
        if (current === "") current = "/";

        links.forEach((a) => a.removeAttribute("aria-current"));

        function normPath(p) {
          if (!p) return "/";
          let x = p.replace(/index\.html$/i, "");
          if (x === "") x = "/";
          return x;
        }

        let best = null;
        let bestLen = -1;

        for (const a of links) {
          let hrefPath;
          try {
            hrefPath = new URL(a.getAttribute("href"), window.location.origin).pathname;
          } catch {
            continue;
          }

          const linkPath = normPath(hrefPath);
          const isRoot = linkPath === "/";

          let matches = false;

          if (isRoot) {
            matches = current === "/";
          } else if (linkPath.endsWith("/")) {
            matches = current.startsWith(linkPath);
          } else {
            matches = current === linkPath;
          }

          if (matches && linkPath.length > bestLen) {
            best = a;
            bestLen = linkPath.length;
          }
        }

        if (best) best.setAttribute("aria-current", "page");
      }
    }

    // ---------- Reel/Feed ----------
    initReel();
  });
})();
