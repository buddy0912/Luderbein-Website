/* Luderbein – site.js
   - Mobile Nav Toggle
   - Auto aria-current="page" für die Hauptnavigation
   - Leistungen Dropdown (Desktop Hover stabil + Mobile Toggle im Burger-Menü)
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

      // Wenn Burger zugeht: alle offenen Submenus einklappen
      document.querySelectorAll(".navdrop.is-open").forEach((el) => el.classList.remove("is-open"));
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

      // Klick-Logik im NAV (Burger offen vs. geschlossen)
      nav.addEventListener("click", (e) => {
        const isBurgerOpen = nav.getAttribute("data-open") === "1";

        // Falls Burger NICHT offen ist: normale Desktop-Navigation
        if (!isBurgerOpen) return;

        // Wenn Burger offen ist:
        // - Klick auf Leistungen-Bereich (inkl. Pfeil) soll toggeln, NICHT schließen
        // - Klick auf Submenu-Link soll navigieren + schließen
        const drop = e.target.closest(".navdrop");
        if (drop) {
          const subLink = e.target.closest(".navdrop__menu a");
          if (subLink) {
            closeNav();
            return;
          }
          // Alles andere innerhalb .navdrop toggelt nur
          e.preventDefault();
          e.stopPropagation();
          drop.classList.toggle("is-open");
          return;
        }

        // Normaler Link -> Burger schließen
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

    // ---------- Leistungen Dropdown: Desktop Hover stabil ----------
    // Fix:
    // 1) Close-Delay erhöhen (gegen "Hover-Lücke")
    // 2) Dropdown-Menü selbst "hält offen" (weil absolute Position oft außerhalb Parent-Box liegt)
    (function setupNavDropdowns() {
      const drops = Array.from(document.querySelectorAll(".navdrop"));
      if (!drops.length) return;

      drops.forEach((drop) => {
        let t = null;

        const top = drop.querySelector(".navdrop__top");
        const menu = drop.querySelector(".navdrop__menu");

        function clearTimer() {
          if (t) {
            window.clearTimeout(t);
            t = null;
          }
        }

        function openDrop() {
          clearTimer();
          drop.classList.add("is-open");
        }

        function closeDropDelayed() {
          clearTimer();
          t = window.setTimeout(() => {
            // nur schließen, wenn Burger NICHT offen ist
            const isBurgerOpen = nav && nav.getAttribute("data-open") === "1";
            if (!isBurgerOpen) drop.classList.remove("is-open");
          }, 650); // <- deutlich mehr Puffer, damit iPad-Maus nicht "wegrutscht"
        }

        function isBurger() {
          return nav && nav.getAttribute("data-open") === "1";
        }

        // Desktop/Pointer Hover: TOP
        if (top) {
          top.addEventListener("pointerenter", () => {
            if (isBurger()) return;
            openDrop();
          });
          top.addEventListener("pointerleave", () => {
            if (isBurger()) return;
            closeDropDelayed();
          });

          // Keyboard-Fokus: offen halten
          top.addEventListener("focusin", () => {
            if (isBurger()) return;
            openDrop();
          });
          top.addEventListener("focusout", () => {
            if (isBurger()) return;
            closeDropDelayed();
          });
        }

        // Desktop/Pointer Hover: MENU (wichtig! hält Dropdown offen)
        if (menu) {
          menu.addEventListener("pointerenter", () => {
            if (isBurger()) return;
            openDrop();
          });
          menu.addEventListener("pointerleave", () => {
            if (isBurger()) return;
            closeDropDelayed();
          });

          menu.addEventListener("focusin", () => {
            if (isBurger()) return;
            openDrop();
          });
          menu.addEventListener("focusout", () => {
            if (isBurger()) return;
            closeDropDelayed();
          });
        }

        // Desktop: Klick irgendwo außerhalb -> zu
        document.addEventListener("click", (e) => {
          if (isBurger()) return;
          if (e.target.closest(".navdrop")) return;
          drop.classList.remove("is-open");
        });
      });
    })();

    // ---------- Auto aria-current ----------
    const menu = document.querySelector('nav[aria-label="Hauptmenü"]');
    if (!menu) return;

    const links = Array.from(menu.querySelectorAll("a[href]"));
    if (!links.length) return;

    // Aktuellen Pfad normalisieren
    let current = window.location.pathname || "/";
    current = current.replace(/index\.html$/i, "");
    if (current === "") current = "/";

    // vorhandene aria-current entfernen
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
  });
})();
