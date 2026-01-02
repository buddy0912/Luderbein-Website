// =========================================================
// Luderbein – NAVIGATION DROPDOWN (v1.1)
// ---------------------------------------------------------
// - Reines JS: kein Framework
// - Desktop: Hover + Klick + ESC schließt
// - Mobile: integriert im Burger-Menü
// - ARIA-Unterstützung
// =========================================================

(function() {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function() {
    const drops = Array.from(document.querySelectorAll(".navdrop[data-navdrop]"));
    if (!drops.length) return;

    // Schließt alle außer aktuelles
    function closeAll(except) {
      drops.forEach(dd => {
        if (dd !== except) {
          dd.setAttribute("data-open", "false");
          const sum = dd.querySelector(".navdrop__sum");
          if (sum) sum.setAttribute("aria-expanded", "false");
        }
      });
    }

    drops.forEach(dd => {
      const sum = dd.querySelector(".navdrop__sum");
      const panel = dd.querySelector(".navdrop__panel");
      if (!sum || !panel) return;

      // Initial
      dd.setAttribute("data-open", "false");
      sum.setAttribute("aria-expanded", "false");
      sum.setAttribute("aria-haspopup", "true");

      // Toggle bei Klick
      sum.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dd.getAttribute("data-open") === "true";
        closeAll(dd);
        dd.setAttribute("data-open", String(!isOpen));
        sum.setAttribute("aria-expanded", String(!isOpen));
      });

      // Klick im Panel soll nicht alles schließen
      panel.addEventListener("click", e => e.stopPropagation());
    });

    // Klick außerhalb → schließen
    document.addEventListener("click", () => closeAll(null));

    // ESC → schließen
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeAll(null);
    });

    // Hover-Support für Desktop
    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      drops.forEach(dd => {
        let t = null;
        const OPEN_DELAY = 100;
        const CLOSE_DELAY = 500;

        function open() {
          clearTimeout(t);
          t = setTimeout(() => {
            dd.setAttribute("data-open", "true");
            const sum = dd.querySelector(".navdrop__sum");
            if (sum) sum.setAttribute("aria-expanded", "true");
          }, OPEN_DELAY);
        }

        function close() {
          clearTimeout(t);
          t = setTimeout(() => {
            dd.setAttribute("data-open", "false");
            const sum = dd.querySelector(".navdrop__sum");
            if (sum) sum.setAttribute("aria-expanded", "false");
          }, CLOSE_DELAY);
        }

        dd.addEventListener("mouseenter", open);
        dd.addEventListener("mouseleave", close);
      });
    }
  });
})();
