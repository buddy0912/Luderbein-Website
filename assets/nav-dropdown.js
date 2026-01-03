// =========================================================
// Luderbein Navigation Dropdown v1.3
// - toggles via data-open="true|false" (CSS-driven)
// - keeps aria-expanded in sync
// - click outside + ESC closes all
// =========================================================
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const drops = document.querySelectorAll("[data-navdrop]");
    if (!drops.length) return;

    function setOpen(drop, isOpen) {
      const btn = drop.querySelector(".navdrop__sum");
      if (isOpen) {
        drop.setAttribute("data-open", "true");
        if (btn) btn.setAttribute("aria-expanded", "true");
      } else {
        drop.setAttribute("data-open", "false");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    }

    function closeAll() {
      document.querySelectorAll("[data-navdrop]").forEach((el) => setOpen(el, false));
    }

    drops.forEach((drop) => {
      const btn = drop.querySelector(".navdrop__sum");
      const panel = drop.querySelector(".navdrop__panel");
      if (!btn || !panel) return;

      // init state
      if (!drop.hasAttribute("data-open")) drop.setAttribute("data-open", "false");
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = drop.getAttribute("data-open") === "true";
        closeAll();
        setOpen(drop, !isOpen);
      });

      // clicks inside panel should not close
      panel.addEventListener("click", (e) => e.stopPropagation());
    });

    document.addEventListener("click", () => closeAll());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
  });
})();
