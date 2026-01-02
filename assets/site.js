/* Luderbein – site.js
   - Mobile Nav Toggle
   - Auto aria-current="page" für die Hauptnavigation
   - Leistungen Dropdown (wird zur Laufzeit in jedem Header erzeugt)
   - Desktop Hover: stabil (großer Close-Delay + kein Hover-Gap)
   - Mobile (Burger): Leistungen klappt auf / zu (iOS-sicher über pointerdown capture)
   - GLOBAL: Synchrone Thumb-Slideshows (alle wechseln gleichzeitig + weicher Übergang)
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
      document.querySelectorAll(".navdrop.is-open").forEach((el) => el.classList.remove("is-open"));
    }

    function toggleNav() {
      if (!btn || !nav) return;
      isBurgerOpen() ? closeNav() : openNav();
    }

    // ---------- Inject CSS for Dropdown ----------
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
.navdrop__menu a:hover{ background:rgba(255,255,255,.06); }
.navdrop.is-open .navdrop__menu{ display:block; }

@media (hover:hover) and (pointer:fine){
  .navdrop__caret{ opacity:.85; }
}

/* Mobile/Burger */
.nav-open .menu .navdrop{ width:100%; display:block; }
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

    // ---------- Build "Leistungen" Dropdown everywhere ----------
    (function buildLeistungenDropdown() {
      if (!menu) return;
      if (menu.querySelector(".navdrop")) return;

      const a = Array.from(menu.querySelectorAll('a[href]')).find((x) => {
        const href = x.getAttribute("href") || "";
        return href === "/leistungen/" || href === "/leistungen";
      });
      if (!a) return;

      const wrap = document.createElement("div");
      wrap.className = "navdrop";
      wrap.setAttribute("data-navdrop", "leistungen");

      const topRow = document.createElement("div");
      topRow.className = "navdrop__toprow";

      const topLink = a.cloneNode(true);
      topLink.className = (topLink.className ? topLink.className + " " : "") + "navdrop__top";

      const caret = document.createElement("button");
      caret.type = "button";
      caret.className = "navdrop__caret";
      caret.setAttribute("aria-label", "Leistungen öffnen");
      caret.textContent = "▾";

      const dd = document.createElement("div");
      dd.className = "navdrop__menu";
      dd.setAttribute("role", "menu");
      dd.innerHTML = `
        <a role="menuitem" href="/leistungen/schiefer/">Schiefer</a>
        <a role="menuitem" href="/leistungen/metall/">Metall</a>
        <a role="menuitem" href="/leistungen/holz/">Holz</a>
        <a role="menuitem" href="/kontakt/?p=Custom">Custom</a>
        <div style="height:1px;margin:8px 0;background:rgba(255,255,255,.10)"></div>
        <a role="menuitem" href="/tools/kalkulator/">Kalkulator</a>
        <a role="menuitem" href="/service/">Downloads</a>
      `;

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

      // iOS-HARTE Lösung:
      // pointerdown (capture) feuert VOR click -> Dropdown toggeln, bevor irgendwas den Burger schließt
      nav.addEventListener(
        "pointerdown",
        (e) => {
          if (!isBurgerOpen()) return;

          const drop = e.target.closest(".navdrop");
          if (!drop) return;

          const isMenuLink = e.target.closest(".navdrop__menu a");
          if (isMenuLink) return; // normal navigieren dürfen

          // Alles im "Leistungen"-Header toggelt nur (Link/Caret/Row)
          e.preventDefault();
          e.stopPropagation();
          drop.classList.toggle("is-open");
        },
        true // CAPTURE!
      );

      // Click-Handler bleibt für normale Links
      nav.addEventListener("click", (e) => {
        if (!isBurgerOpen()) return;

        // Klick im Dropdown-Menü -> schließen
        const menuLink = e.target.closest(".navdrop__menu a");
        if (menuLink) {
          closeNav();
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

    // ---------- Desktop Hover: stabil ----------
    (function setupDesktopHover() {
      const drops = Array.from(document.querySelectorAll(".navdrop"));
      if (!drops.length) return;

      const CLOSE_DELAY_MS = 1400;

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
          if (isBurgerOpen()) return;
          drop.classList.add("is-open");
        }
        function closeDropDelayed() {
          clearTimer();
          if (isBurgerOpen()) return;
          t = window.setTimeout(() => {
            if (!isBurgerOpen()) drop.classList.remove("is-open");
          }, CLOSE_DELAY_MS);
        }

        drop.addEventListener("mouseenter", openDrop);
        drop.addEventListener("mouseleave", closeDropDelayed);
        drop.addEventListener("focusin", openDrop);
        drop.addEventListener("focusout", closeDropDelayed);

        const caret = drop.querySelector(".navdrop__caret");
        if (caret) {
          caret.addEventListener("click", (e) => {
            if (isBurgerOpen()) return;
            e.preventDefault();
            e.stopPropagation();
            drop.classList.toggle("is-open");
          });
        }

        document.addEventListener("click", (e) => {
          if (isBurgerOpen()) return;
          if (e.target.closest(".navdrop")) return;
          drop.classList.remove("is-open");
        });
      });
    })();

    // ---------- Auto aria-current ----------
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

    // =========================================================
    // GLOBAL: Synchrone Slideshows (alle gleichzeitig, weich)
    // Nutzung:
    // - Container: .thumbslider
    // - Bilder:   <img> als direkte Kinder (beliebig viele)
    // - Aktiv:    JS setzt .is-active auf genau 1 Bild je Slider
    // =========================================================
    (function slideshowSync() {
      const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sliders = Array.from(document.querySelectorAll(".thumbslider"));

      if (!sliders.length) return;

      // Wenn Reduced Motion: alles statisch auf Slide 0
      if (prefersReduced) {
        sliders.forEach((s) => {
          const imgs = Array.from(s.querySelectorAll("img"));
          imgs.forEach((img, i) => {
            img.classList.toggle("is-active", i === 0);
            // Fallback falls CSS nicht greift:
            img.style.opacity = i === 0 ? "1" : "0";
          });
        });
        return;
      }

      // Globaler Takt (alle wechseln zusammen)
      const STEP_MS = 3000;   // <- 2–3 Sekunden, hier 3s
      const FADE_MS = 650;    // <- weicher Übergang

      // Prepare: sicherstellen, dass wir weich faden können,
      // auch wenn die CSS-Regel mal fehlt.
      sliders.forEach((s) => {
        const imgs = Array.from(s.querySelectorAll("img"));
        imgs.forEach((img) => {
          // Transition als Fallback (CSS kann das auch schon liefern)
          if (!img.style.transition) {
            img.style.transition = `opacity ${FADE_MS}ms ease-in-out`;
          }
          // Falls nicht via CSS positioniert:
          if (!img.style.position) {
            // nur minimal invasiv: wir setzen nichts, wenn CSS es eh macht
          }
        });
      });

      let tick = 0;

      function render() {
        sliders.forEach((s) => {
          const imgs = Array.from(s.querySelectorAll("img"));
          const n = imgs.length;
          if (!n) return;

          const active = tick % n;

          imgs.forEach((img, i) => {
            const on = i === active;
            img.classList.toggle("is-active", on);

            // Fallback (falls du nur opacity steuerst):
            img.style.opacity = on ? "1" : "0";
          });
        });
      }

      // Start synchron (alle bei 0)
      render();

      // Takt
      window.setInterval(() => {
        tick++;
        render();
      }, STEP_MS);
    })();
  });
})();
