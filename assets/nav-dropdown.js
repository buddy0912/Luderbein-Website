// /assets/nav-dropdown.js
// Einheitliches Dropdown für "Leistungen" (überall gleich)
// - Mobile/iPhone: Toggle per Pfeil-Button, ohne Burger-Menü zu schließen
// - Desktop/iPad Trackpad: Hover öffnet, verzögertes Schließen (leicht), damit man sicher reinfahren kann
// - Click außerhalb / ESC schließt

(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function(){
    var dds = Array.prototype.slice.call(document.querySelectorAll('[data-navdd]'));
    if(!dds.length) return;

    var closeTimers = new WeakMap();

    function setOpen(dd, open){
      dd.setAttribute('data-open', open ? '1' : '0');
      var btn = dd.querySelector('[data-navdd-toggle]');
      if(btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function closeAll(except){
      dds.forEach(function(dd){
        if(dd !== except) setOpen(dd, false);
      });
    }

    function clearCloseTimer(dd){
      var t = closeTimers.get(dd);
      if(t) {
        window.clearTimeout(t);
        closeTimers.delete(dd);
      }
    }

    dds.forEach(function(dd){
      setOpen(dd, false);

      var btn = dd.querySelector('[data-navdd-toggle]');
      var menu = dd.querySelector('[data-navdd-menu]');
      if(!btn || !menu) return;

      btn.setAttribute('aria-expanded','false');

      // Mobile: nur der Pfeil toggelt
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        var isOpen = dd.getAttribute('data-open') === '1';
        closeAll(dd);
        setOpen(dd, !isOpen);
      });

      // Klick im Menü darf nicht "außenklick" schließen
      menu.addEventListener('click', function(e){
        e.stopPropagation();
      });

      // Hover: besser für Trackpad (iPad/Magic Keyboard)
      dd.addEventListener('mouseenter', function(){
        clearCloseTimer(dd);
        closeAll(dd);
        setOpen(dd, true);
      });

      dd.addEventListener('mouseleave', function(){
        clearCloseTimer(dd);
        // kleine Verzögerung, damit man sicher in den Panel-Bereich fahren kann
        var t = window.setTimeout(function(){
          setOpen(dd, false);
        }, 220);
        closeTimers.set(dd, t);
      });
    });

    // Klick außerhalb: alles zu
    document.addEventListener('click', function(){
      closeAll(null);
    });

    // ESC: alles zu
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeAll(null);
    });
  });
})();
