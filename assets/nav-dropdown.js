// /assets/nav-dropdown.js
// Einheitlicher Dropdown: Desktop hover stabil + Mobile tap (ohne Burger-Menü zu schließen)
// + Active-Link Erkennung (setzt aria-current automatisch)

(function(){
  if (window.__lbNavDropdownInit) return;
  window.__lbNavDropdownInit = true;

  function normPath(p){
    // "/leistungen" == "/leistungen/"
    if (!p) return "/";
    return p.endsWith("/") ? p : (p + "/");
  }

  function markActive(){
    const path = normPath(location.pathname);

    // 1) Alle aria-current entfernen (wir setzen neu)
    document.querySelectorAll('[data-nav] a[aria-current="page"]').forEach(a => {
      a.removeAttribute('aria-current');
    });

    // 2) Direktmatch: Link dessen href exakt passt
    const links = Array.from(document.querySelectorAll('[data-nav] a[href]'));
    const exact = links.find(a => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return false;
      return normPath(href) === path;
    });
    if (exact){
      exact.setAttribute("aria-current", "page");
      return;
    }

    // 3) Fallback: Leistungen-Unterseiten -> "Leistungen" aktiv
    if (path.startsWith("/leistungen/")){
      const leistungen = links.find(a => normPath(a.getAttribute("href")) === "/leistungen/");
      if (leistungen) leistungen.setAttribute("aria-current", "page");
      return;
    }

    // 4) Fallback: Root
    if (path === "/"){
      const home = links.find(a => normPath(a.getAttribute("href")) === "/");
      if (home) home.setAttribute("aria-current", "page");
    }
  }

  function setupOne(drop){
    const btn = drop.querySelector('[data-navdrop-toggle]');
    const menu = drop.querySelector('[data-navdrop-menu]');
    if (!btn || !menu) return;

    // Mobile/Touch: Toggle per Klick (verhindert Burger-Schließen)
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = drop.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Desktop: Close-Delay gegen "Maus zu langsam"
    let t = null;
    drop.addEventListener('mouseenter', () => {
      if (t) { clearTimeout(t); t = null; }
      drop.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    });

    drop.addEventListener('mouseleave', () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        drop.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }, 220);
    });

    // Fokus (Tastatur / iPad Trackpad)
    drop.addEventListener('focusin', () => {
      drop.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    });

    drop.addEventListener('focusout', () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        if (!drop.contains(document.activeElement)){
          drop.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      }, 120);
    });
  }

  function closeAll(except){
    document.querySelectorAll('[data-navdrop].is-open').forEach(d => {
      if (d === except) return;
      d.classList.remove('is-open');
      const btn = d.querySelector('[data-navdrop-toggle]');
      if (btn) btn.setAttribute('aria-expanded','false');
    });
  }

  document.addEventListener('click', () => closeAll(null));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll(null);
  });

  document.addEventListener('DOMContentLoaded', () => {
    markActive();
    document.querySelectorAll('[data-navdrop]').forEach(setupOne);
  });
})();
