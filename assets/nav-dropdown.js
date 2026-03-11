// =========================================================
// Luderbein Navigation Dropdown v2.0
// =========================================================
(function () {
  "use strict";

  function initNavDropdowns() {
    const drops = Array.from(document.querySelectorAll("[data-navdrop]"));
    if (!drops.length) return;

    function setOpen(drop, shouldOpen) {
      const btn = drop.querySelector(".navdrop__sum");
      drop.setAttribute("data-open", shouldOpen ? "true" : "false");
      if (btn) btn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }

    function closeAll(except) {
      drops.forEach((drop) => {
        if (drop === except) return;
        setOpen(drop, false);
      });
    }

    drops.forEach((drop) => {
      const btn = drop.querySelector(".navdrop__sum");
      const panel = drop.querySelector(".navdrop__panel");
      if (!btn || !panel) return;

      setOpen(drop, false);

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = drop.getAttribute("data-open") === "true";
        closeAll(drop);
        setOpen(drop, !isOpen);
      });

      panel.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (!link) return;
        closeAll();
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-navdrop]")) closeAll();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });

    document.addEventListener("lb:nav-close", () => closeAll());

    window.addEventListener("resize", () => closeAll());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavDropdowns, { once: true });
  } else {
    initNavDropdowns();
  }
})();
