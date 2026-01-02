// =========================================================
// Luderbein Site Core v1.2
// =========================================================
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      navBtn.addEventListener("click", () => {
        const isOpen = nav.getAttribute("data-open") === "1";
        nav.setAttribute("data-open", isOpen ? "0" : "1");
        navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    }

    // Markiere aktiven Menüpunkt
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = window.location.pathname.replace(/index\.html$/, "");
    links.forEach((a) => {
      const href = a.getAttribute("href").replace(/index\.html$/, "");
      if (path.startsWith(href) && href !== "/") {
        a.setAttribute("aria-current", "page");
      }
    });
  });
})();
