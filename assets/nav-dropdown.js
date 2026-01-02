// =========================================================
// Luderbein Navigation Dropdown v1.2
// =========================================================
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const drops = document.querySelectorAll("[data-navdrop]");
    if (!drops.length) return;

    drops.forEach((drop) => {
      const btn = drop.querySelector(".navdrop__sum");
      const panel = drop.querySelector(".navdrop__panel");

      if (!btn || !panel) return;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const expanded = btn.getAttribute("aria-expanded") === "true";
        closeAll();
        if (!expanded) open(drop, btn);
      });
    });

    function closeAll() {
      document.querySelectorAll("[data-navdrop]").forEach((el) => {
        const b = el.querySelector(".navdrop__sum");
        const p = el.querySelector(".navdrop__panel");
        if (b) b.setAttribute("aria-expanded", "false");
        if (p) p.style.display = "none";
      });
    }

    function open(drop, btn) {
      const panel = drop.querySelector(".navdrop__panel");
      if (panel) {
        panel.style.display = "block";
        btn.setAttribute("aria-expanded", "true");
      }
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-navdrop]")) closeAll();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
  });
})();
