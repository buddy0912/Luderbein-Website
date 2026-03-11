// =========================================================
// Luderbein Navigation Dropdown v1.3
// =========================================================
(function () {
  "use strict";

  if (window.__lbNavDropdownLoaded) return;
  window.__lbNavDropdownLoaded = true;

  function initNavDropdown() {
    const drops = Array.from(document.querySelectorAll("[data-navdrop]"));
    if (!drops.length) return;

    function setOpen(drop, shouldOpen) {
      const btn = drop.querySelector(".navdrop__sum");
      if (!btn) return;

      drop.setAttribute("data-open", shouldOpen ? "true" : "false");
      btn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }

    function closeAll(except) {
      drops.forEach((drop) => {
        if (except && drop === except) return;
        setOpen(drop, false);
      });
    }

    drops.forEach((drop) => {
      const btn = drop.querySelector(".navdrop__sum");
      if (!btn) return;

      setOpen(drop, false);

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = drop.getAttribute("data-open") === "true";
        closeAll(drop);
        setOpen(drop, !isOpen);
      });

      drop.querySelectorAll(".navdrop__panel a[href]").forEach((link) => {
        link.addEventListener("click", () => {
          closeAll();
        });
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-navdrop]")) return;
      closeAll();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });

    const mainNav = document.querySelector("[data-nav]");
    if (mainNav && "MutationObserver" in window) {
      const observer = new MutationObserver(() => {
        if (mainNav.getAttribute("data-open") !== "1") {
          closeAll();
        }
      });
      observer.observe(mainNav, {
        attributes: true,
        attributeFilter: ["data-open"],
      });
    }

    window.LBNavDropdown = {
      closeAll,
    };
  }

  document.addEventListener("DOMContentLoaded", initNavDropdown, { once: true });
})();
