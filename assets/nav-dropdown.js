// =========================================================
// Luderbein Navigation Dropdown v1.3
// =========================================================
(function () {
  "use strict";

  if (window.__lbNavDropdownLoaded) return;
  window.__lbNavDropdownLoaded = true;

  const NAV_LINKS = {
    preview: {
      key: "preview",
      href: "/tools/vorschau/",
      label: "Motiv-Vorschau",
      role: "menuitem",
      beforeHref: "/service/",
      afterHref: "/tools/kalkulator/",
    },
  };

  function normHref(value) {
    return (value || "").toString().trim();
  }

  function insertMenuLink(container, config) {
    if (!container) return;
    if (container.querySelector(`[data-nav-${config.key}]`)) return;
    if (container.querySelector(`a[href="${config.href}"]`)) return;

    const link = document.createElement("a");
    link.setAttribute("href", config.href);
    link.textContent = config.label;
    link.setAttribute(`data-nav-${config.key}`, "1");

    if (config.role) {
      link.setAttribute("role", config.role);
    }

    const allLinks = Array.from(container.querySelectorAll("a[href]"));
    const beforeLink = config.beforeHref
      ? allLinks.find((candidate) => normHref(candidate.getAttribute("href")) === config.beforeHref)
      : null;
    const afterLink = config.afterHref
      ? allLinks.find((candidate) => normHref(candidate.getAttribute("href")) === config.afterHref)
      : null;

    if (beforeLink && beforeLink.parentNode) {
      beforeLink.parentNode.insertBefore(link, beforeLink);
      return;
    }

    if (afterLink && afterLink.parentNode) {
      afterLink.parentNode.insertBefore(link, afterLink.nextSibling);
      return;
    }

    container.appendChild(link);
  }

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
      const panel = drop.querySelector(".navdrop__panel");
      if (!btn) return;

      insertMenuLink(panel, NAV_LINKS.preview);

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
