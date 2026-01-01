/* Luderbein – site.js
   - Mobile Nav Toggle
   - Auto aria-current="page" für die Hauptnavigation
   - Leistungen Dropdown (wird zur Laufzeit in jedem Header erzeugt)
   - Desktop Hover: stabil (großer Close-Delay + kein Hover-Gap)
   - Mobile (Burger): Leistungen klappt auf / zu, ohne dass Burger schließt
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
    const btn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    const menu = document.querySelector('nav[aria-label="Hauptmenü"]');

    // ---------- Helpers ----------
    function isBurgerOpen() {
      return nav && nav.getAttribute("data-open") === "1";
    }

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

      // alle offenen Submenus einklappen
      document.querySelectorAll(".navdrop.is-open").forEach((el) => el.classList.remove("is-open"));
    }

    function toggleNav() {
      if (!btn || !nav) return;
      isBurgerOpen() ? closeNav() : openNav();
    }

    // ---------- Inject CSS for Dropdown (damit wir nicht an style.css müssen) ----------
    (function injectDropdownCSS() {
      const id = "lb-navdrop-css";
      if (document.getElementById(id)) return;

      const css = `
/* --- Luderbein: Nav Dropdown (injected) --- */
.navdrop{ position:relative; display:inline-flex; align-items:center; gap:6px; }
.navdrop__top{ display:inline-flex; align-items:center; gap:6px; }
.navdrop__caret{
  width:28px; height:28px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.18);
  color:rgba(255,255,255,.92);
  display:grid; place-items:center;
  font-size:14px; line-height:1;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
}
.navdrop__caret:active{ transform:scale(.98); }

.navdrop__menu{
  position:absolute;
  left:0;
  top:calc(100% - 2px); /* <- minimiert Hover-Gap */
  min-width:220px;
  padding:10px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(12,12,12,.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 70px rgba(0,0,0,.55);
  display:none;
  z-index:50;
}
.navdrop__menu a{
  display:block;
  padding:10px 10px;
  border-radius:10px;
  text-decoration:none;
}
.navdrop__menu a:hover{
  background:rgba(255,255,255,.06);
}
.navdrop.is-open .navdrop__menu{ display:block; }

/* Desktop: Caret optional dezent (bleibt sichtbar, schadet nicht) */
@media (hover:hover) and (pointer:fine){
  .navdrop__caret{ opacity:.85; }
}

/* Mobile/Burger: Dropdown wird inline untereinander */
.nav-open .menu .navdrop{
  width:100%;
  display:block;
}
.nav-open .menu .navdrop__toprow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  width:100%;
}
.nav-open .menu .navdrop__menu{
  position:static;
  display:none;
  margin-top:8px;
  padding:8px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.10);
  box-shadow:none;
}
.nav-open .menu .navdrop.is-open .navdrop__menu{ display:block; }
`;
      const style = document.createElement("style");
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    })();

    // ---------- Build "Leistungen" Dropdown in every header ----------
    (function buildLeistungenDropdown() {
      if (!menu) return;

      // Schon vorhanden? Dann nix kaputtmachen.
      if (menu.querySelector(".navdrop")) return;

      // Finde den Leistungen-Link im Menu
      const a = Array.from(menu.querySelectorAll('a[href]')).find((x) => {
        const href = x.getAttribute("href") || "";
        return href === "/leistungen/" || href === "/leistungen";
      });
      if (!a) return;

      // Dropdown Wrapper
      const wrap = document.createElement("div");
      wrap.className = "navdrop";
      wrap.setAttribute("data-navdrop", "leistungen");

      // Toprow (für Burger Layout)
      const topRow = document.createElement("div");
      topRow.className = "navdrop__toprow";

      // Top link (Leistungen bleibt navigierbar)
      const topLink = a.cloneNode(true);
      topLink.className = (topLink.className ? topLink.className + " " : "") + "navdrop__top";

      // Caret Button (Toggle)
      const caret = document.createElement("button");
      caret.type = "button";
      caret.className = "navdrop__caret";
      caret.setAttribute("aria-label", "Leistungen öffnen");
      caret.textContent = "▾";

      // Menu
      const dd = document.createElement("div");
      dd.className = "navdrop__menu";
      dd.setAttribute("role", "menu");

      // Einträge (kannst du später erweitern)
      dd.innerHTML = `
        <a role="menuitem" href="/leistungen/schiefer/">Schiefer</a>
        <a role="menuitem" href="/leistungen/metall/">Metall</a>
        <a role="menuitem" href="/tools/kalkulator/?t=metall">Kalkulator</a>
      `;

      // Original-Link ersetzen
      a.replaceWith(wrap);
      topRow.appendChild(topLink);
      topRow.appendChild(caret);
      wrap.appendChild(topRow);
      wrap.appendChild(dd);
    })();

    // ---------- Mobile Nav Toggle ----------
    if (btn && nav) {
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
      if (!nav.hasAttribute("data-open")) nav.setAttribute("data-open", "0");

      btn.addEventListener("click", toggleNav);

      // Klicklogik im Burger:
      // - Klick auf Leistungen oder Pfeil toggelt Dropdown, schließt NICHT
      // - Klick auf Dropdown-Link navigiert + schließt Burger
      nav.addEventListener("click", (e) => {
        if (!isBurgerOpen()) return;

        const drop = e.target.closest(".navdrop");
        if (drop) {
          const isMenuLink = e.target.closest(".navdrop__menu a");
          if (isMenuLink) {
            closeNav();
            return;
          }

          // Alles im navdrop (Toplink / caret / row) toggelt nur
          e.preventDefault();
          e.stopPropagation();
          drop.classList.toggle("is-open");
          return;
        }

        // Normale Links -> Burger schließen
        const link = e.target.closest("a");
        if (link) closeNav();
      });

      // ESC schließt Menü
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });

      // Klick außerhalb schließt Menü
      document.addEventListener("click", (e) => {
        if (!isBurgerOpen()) return;
        if (e.target.closest("[data-nav]") || e.target.closest("[data-nav-toggle]")) return;
        closeNav();
      });
    }

    // ---------- Desktop Hover: Stabil, kein Glücksspiel ----------
    (function setupDesktopHover() {
      const drops = Array.from(document.querySelectorAll(".navdrop"));
      if (!drops.length) return;

      const CLOSE_DELAY_MS = 1400; // <- deutlich länger als vorher (iPad Maus-friendly)

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
          if (isBurgerOpen()) return; // wenn Burger offen, Desktop-Hover ignorieren
          drop.classList.add("is-open");
        }
        function closeDropDelayed() {
          clearTimer();
          if (isBurgerOpen()) return;
          t = window.setTimeout(() => {
            if (!isBurgerOpen()) drop.classList.remove("is-open");
          }, CLOSE_DELAY_MS);
        }

        // Hover-Zone = drop selbst (enthält top + menu)
        drop.addEventListener("mouseenter", openDrop);
        drop.addEventListener("mouseleave", closeDropDelayed);

        // Fokus (Keyboard)
        drop.addEventListener("focusin", openDrop);
        drop.addEventListener("focusout", closeDropDelayed);

        // Caret click (Desktop optional): toggelt
        const caret = drop.querySelector(".navdrop__caret");
        if (caret) {
          caret.addEventListener("click", (e) => {
            if (isBurgerOpen()) return; // Burger handled oben
            e.preventDefault();
            e.stopPropagation();
            drop.classList.toggle("is-open");
          });
        }

        // Klick außerhalb -> zu (Desktop)
        document.addEventListener("click", (e) => {
          if (isBurgerOpen()) return;
          if (e.target.closest(".navdrop")) return;
          drop.classList.remove("is-open");
        });
      });
    })();

    // ---------- Auto aria-current ----------
    // (bleibt wie gehabt, aber robust)
    if (menu) {
      const links = Array.from(menu.querySelectorAll("a[href]"));
      if (links.length) {
        let current = window.location.pathname || "/";
        current = current.replace(/index\.html$/i, "");
        if (current === "") current = "/";

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
          if (isRoot) matches = current === "/";
          else if (linkPath.endsWith("/")) matches = current.startsWith(linkPath);
          else matches = current === linkPath;

          if (matches && linkPath.length > bestLen) {
            best = a;
            bestLen = linkPath.length;
          }
        }

        if (best) best.setAttribute("aria-current", "page");
      }
    }
  });
})();
