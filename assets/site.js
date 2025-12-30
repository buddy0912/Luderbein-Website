/* Luderbein – site.js
   - Mobile Nav Toggle
   - Auto aria-current="page" für die Hauptnavigation
*/

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
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
      // Default-Zustand sauber setzen (falls HTML mal anders ist)
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
      if (!nav.hasAttribute("data-open")) nav.setAttribute("data-open", "0");

      btn.addEventListener("click", toggleNav);

      // Klick auf Menülink schließt das Menü (mobil)
      nav.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (a) closeNav();
      });

      // ESC schließt Menü
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });

      // Klick außerhalb schließt Menü (nur wenn offen)
      document.addEventListener("click", (e) => {
        const isOpen = nav.getAttribute("data-open") === "1";
        if (!isOpen) return;
        if (e.target.closest("[data-nav]") || e.target.closest("[data-nav-toggle]")) return;
        closeNav();
      });
    }

    // ---------- Auto aria-current ----------
    const menu = document.querySelector('nav[aria-label="Hauptmenü"]');
    if (!menu) return;

    const links = Array.from(menu.querySelectorAll("a[href]"));
    if (!links.length) return;

    // Aktuellen Pfad normalisieren
    let current = window.location.pathname || "/";
    current = current.replace(/index\.html$/i, ""); // /kontakt/index.html -> /kontakt/
    if (current === "") current = "/";

    // vorhandene aria-current entfernen (wir setzen sauber neu)
    links.forEach((a) => a.removeAttribute("aria-current"));

    function normPath(p) {
      if (!p) return "/";
      let x = p.replace(/index\.html$/i, "");
      if (x === "") x = "/";
      return x;
    }

    // Bestes Match = längster passender Pfad (damit "/" nicht alles frisst)
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
        // Verzeichnis-Links matchen alles darunter
        matches = current.startsWith(linkPath);
      } else {
        // Datei-Links matchen exakt (z.B. /rechtliches/impressum.html)
        matches = current === linkPath;
      }

      if (matches && linkPath.length > bestLen) {
        best = a;
        bestLen = linkPath.length;
      }
    }

    if (best) best.setAttribute("aria-current", "page");
  });
})();
