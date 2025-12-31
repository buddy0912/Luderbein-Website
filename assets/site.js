/* Luderbein – site.js
   - Mobile Nav Toggle
   - Auto aria-current="page" für die Hauptnavigation
   - Reel/Feed: Bilder automatisch befüllen + randomisieren
*/

(function () {
  "use strict";

  // ---------------- Reel-Konfig ----------------
  // Ordner: /assets/reel/
  // Dateien: reel-01.jpg ... reel-17.jpg (passt zu deinen zuletzt erzeugten reel-13..17)
  const REEL_DIR = "/assets/reel/";
  const REEL_FILES = [
    "reel-01.jpg","reel-02.jpg","reel-03.jpg","reel-04.jpg","reel-05.jpg","reel-06.jpg",
    "reel-07.jpg","reel-08.jpg","reel-09.jpg","reel-10.jpg","reel-11.jpg","reel-12.jpg",
    "reel-13.jpg","reel-14.jpg","reel-15.jpg","reel-16.jpg","reel-17.jpg"
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickUnique(arr, n) {
    return shuffle(arr).slice(0, Math.max(0, n));
  }

  function absPath(p) {
    if (!p) return p;
    // macht aus "assets/reel/x.jpg" -> "/assets/reel/x.jpg"
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    if (p.startsWith("/")) return p;
    return "/" + p;
  }

  // Prüft Bilder nacheinander (nicht alles parallel), sammelt "available" bis count erreicht
  function collectExistingImages(urls, count, done) {
    const wanted = Math.max(1, count || 3);
    const pool = shuffle(urls);
    const found = [];

    let idx = 0;
    function next() {
      if (found.length >= wanted || idx >= pool.length) return done(found);

      const url = pool[idx++];
      const img = new Image();
      img.onload = () => {
        found.push(url);
        next();
      };
      img.onerror = () => next();
      img.src = url;
    }
    next();
  }

  function initReel() {
    // Container finden (du musst NICHTS suchen – einer davon wird’s bei dir sein)
    const reel =
      document.querySelector("[data-reel]") ||
      document.getElementById("reel") ||
      document.querySelector(".reel");

    if (!reel) return;

    // Wie viele Bilder?
    const attrCount = parseInt(reel.getAttribute("data-reel-count") || "", 10);
    const existingImgs = Array.from(reel.querySelectorAll("img"));
    const count = Number.isFinite(attrCount) ? attrCount : (existingImgs.length || 3);

    const urls = REEL_FILES.map((f) => absPath(REEL_DIR + f));

    collectExistingImages(urls, count, (available) => {
      // wenn nix gefunden wurde: lieber still sein als kaputt wirken
      if (!available.length) return;

      const chosen = pickUnique(available, count);

      // Wenn es schon <img> gibt: befüllen
      if (existingImgs.length) {
        for (let i = 0; i < existingImgs.length; i++) {
          const slot = existingImgs[i];
          const u = chosen[i % chosen.length];
          slot.src = u;
          // optional: lazy nur wenn nicht "hero"
          if (!slot.hasAttribute("loading")) slot.setAttribute("loading", "lazy");
          if (!slot.hasAttribute("decoding")) slot.setAttribute("decoding", "async");
        }
        return;
      }

      // Sonst: Slots erzeugen
      reel.innerHTML = "";
      chosen.forEach((u) => {
        const img = document.createElement("img");
        img.src = u;
        img.alt = "Beispiel – Luderbein";
        img.loading = "lazy";
        img.decoding = "async";
        reel.appendChild(img);
      });
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
