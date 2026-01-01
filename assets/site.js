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

      // Klick auf Menülink schließt das Menü (mobil)
      // ABER: "Leistungen"-Dropdown soll im Burger NICHT schließen, sondern toggeln.
      nav.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;

        const isBurgerOpen = nav.getAttribute("data-open") === "1";
        if (!isBurgerOpen) return;

        const dropTop = a.classList.contains("navdrop__top");
        if (dropTop) {
          // Untermenü toggeln statt schließen/navigieren
          e.preventDefault();
          e.stopPropagation();
          const holder = a.closest(".navdrop");
          if (holder) holder.classList.toggle("is-open");
          return;
        }

        // normaler Link -> Burger schließen
        closeNav();
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
    // Problem: Hover-Lücke beim Runterfahren mit Maus -> Dropdown klappt zu.
    // Lösung: Beim Verlassen kurz offen lassen (Delay), damit man sauber ins Menü kommt.
    (function setupNavDropdowns() {
      const drops = Array.from(document.querySelectorAll(".navdrop"));
      if (!drops.length) return;

      drops.forEach((drop) => {
        let t = null;

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
          }, 220); // <- “Puffer” gegen Hover-Lücke
        }

        // Desktop/Pointer Hover: öffnen/schließen mit Delay
        drop.addEventListener("pointerenter", () => {
          const isBurgerOpen = nav && nav.getAttribute("data-open") === "1";
          if (isBurgerOpen) return;
          openDrop();
        });

        drop.addEventListener("pointerleave", () => {
          const isBurgerOpen = nav && nav.getAttribute("data-open") === "1";
          if (isBurgerOpen) return;
          closeDropDelayed();
        });

        // Keyboard: Fokus innerhalb -> offen
        drop.addEventListener("focusin", () => {
          const isBurgerOpen = nav && nav.getAttribute("data-open") === "1";
          if (isBurgerOpen) return;
          openDrop();
        });

        drop.addEventListener("focusout", () => {
          const isBurgerOpen = nav && nav.getAttribute("data-open") === "1";
          if (isBurgerOpen) return;
          closeDropDelayed();
        });

        // Wenn irgendwo anders geklickt wird (Desktop), Dropdown zu
        document.addEventListener("click", (e) => {
          const isBurgerOpen = nav && nav.getAttribute("data-open") === "1";
          if (isBurgerOpen) return;
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
