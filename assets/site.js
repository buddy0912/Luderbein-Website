/* ===============================
   Luderbein – site.js (v2 Navigation)
   Verbesserungen:
   - Einheitliches data-open-State
   - Nur ein globaler Outside-Click-Handler
   - Sanftes Fade-Opening für Dropdowns
   - Keyboard & ESC Support
   =============================== */

(function () {
  "use strict";

  const ready = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn)
      : fn();

  ready(() => {
    const btn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    const menu = document.querySelector('nav[aria-label="Hauptmenü"]');

    // ---- Helpers ----
    const isBurgerOpen = () => nav?.dataset.open === "true";
    const setBurgerState = (state) => {
      if (!btn || !nav) return;
      nav.dataset.open = state ? "true" : "false";
      btn.setAttribute("aria-expanded", state ? "true" : "false");
      document.documentElement.classList.toggle("nav-open", state);
    };

    const openNav = () => setBurgerState(true);
    const closeNav = () => setBurgerState(false);
    const toggleNav = () => setBurgerState(!isBurgerOpen());

    // ---- Mobile Nav Toggle ----
    if (btn && nav) {
      btn.addEventListener("click", toggleNav);
      document.addEventListener("keydown", (e) => e.key === "Escape" && closeNav());
    }

    // ---- Dropdown Setup ----
    const drops = [...document.querySelectorAll(".navdrop[data-navdrop]")];
    drops.forEach((dd) => {
      const sum = dd.querySelector(".navdrop__sum");
      const panel = dd.querySelector(".navdrop__panel");
      if (!sum || !panel) return;

      const toggle = (state) => {
        dd.dataset.open = state ? "true" : "false";
        sum.setAttribute("aria-expanded", state ? "true" : "false");
      };

      sum.addEventListener("click", (e) => {
        e.preventDefault();
        const willOpen = dd.dataset.open !== "true";
        drops.forEach((o) => toggle.call(o, false));
        toggle(willOpen);
      });

      sum.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          sum.click();
        }
      });
    });

    // ---- Outside-Click Handler (global) ----
    document.addEventListener("click", (e) => {
      const inNav = e.target.closest("[data-nav]") || e.target.closest("[data-nav-toggle]");
      if (inNav) return;
      drops.forEach((dd) => (dd.dataset.open = "false"));
      if (isBurgerOpen()) closeNav();
    });

    // ---- aria-current (autodetect) ----
    if (menu) {
      const links = [...menu.querySelectorAll("a[href]")];
      const current = location.pathname.replace(/index\.html$/i, "") || "/";
      links.forEach((a) => {
        const href = new URL(a.getAttribute("href"), location.origin).pathname.replace(/index\.html$/i, "") || "/";
        a.setAttribute("aria-current", href !== "/" && current.startsWith(href) ? "page" : null);
      });
    }
  });
})();
