// /assets/nav-dropdown.js
// Einheitlicher Dropdown: Desktop hover stabil + Mobile tap (ohne Burger-Menü zu schließen)

(function(){
  if (window.__lbNavDropdownInit) return;
  window.__lbNavDropdownInit = true;

  function setupOne(drop){
    const btn = drop.querySelector('[data-navdrop-toggle]');
    const menu = drop.querySelector('[data-navdrop-menu]');
    if (!btn || !menu) return;

    // Mobile/Touch: Toggle per Klick
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = drop.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Klick auf "Leistungen"-Link soll normal navigieren (nicht togglen)
    const mainLink = drop.querySelector('a[href^="/leistungen/"]');
    if (mainLink){
      mainLink.addEventListener('click', (e) => {
        // nichts – normal navigieren
      });
    }

    // Desktop: kleines Close-Delay gegen "Maus zu langsam"
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

    // Fokus: wenn man mit Tab navigiert
    drop.addEventListener('focusin', () => {
      drop.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    });

    drop.addEventListener('focusout', () => {
      // Verzögert schließen, falls Fokus ins Dropdown wandert
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
    document.querySelectorAll('[data-navdrop]').forEach(setupOne);
  });
})();
