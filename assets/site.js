/* /assets/site.js
   Navigation: Burger-Menü + Leistungen-Dropdown (mobil toggelbar, desktop hover)
*/
(function () {
  const navBtn = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav]');

  if (!navBtn || !menu) return;

  function isOpen() {
    return menu.getAttribute('data-open') === '1';
  }

  function setOpen(open) {
    menu.setAttribute('data-open', open ? '1' : '0');
    navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAllDrops() {
    menu.querySelectorAll('.navdrop.is-open').forEach((d) => {
      d.classList.remove('is-open');
      const top = d.querySelector('.navdrop__top');
      if (top) top.setAttribute('aria-expanded', 'false');
    });
  }

  // Burger Toggle
  navBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isOpen();
    setOpen(next);
    if (!next) closeAllDrops();
  });

  // Klick außerhalb schließt Menü (wenn offen)
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    if (e.target.closest('[data-nav]') || e.target.closest('[data-nav-toggle]')) return;
    setOpen(false);
    closeAllDrops();
  });

  // ESC schließt
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (isOpen()) setOpen(false);
    closeAllDrops();
  });

  // Dropdowns initialisieren
  const drops = Array.from(menu.querySelectorAll('.navdrop'));

  drops.forEach((drop) => {
    const top = drop.querySelector('.navdrop__top');
    if (!top) return;

    top.setAttribute('aria-haspopup', 'true');
    top.setAttribute('aria-expanded', 'false');

    top.addEventListener('click', (e) => {
      // Nur im offenen Burger-Menü toggeln
      if (!isOpen()) return;

      // Wichtig: NICHT das Burger-Menü schließen!
      e.preventDefault();
      e.stopPropagation();

      // andere Dropdowns schließen
      drops.forEach((d) => {
        if (d !== drop) {
          d.classList.remove('is-open');
          const t = d.querySelector('.navdrop__top');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      const open = drop.classList.toggle('is-open');
      top.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Klick auf Links im Menü: schließt Burger (außer Dropdown-Top)
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    // Dropdown-Top-Link im Burger: handled oben, soll NICHT schließen
    if (a.classList.contains('navdrop__top') && isOpen()) return;

    // normale Links schließen das Menü
    if (isOpen()) {
      setOpen(false);
      closeAllDrops();
    }
  });
})();
