// /assets/nav-dropdown.js
// Dropdown-Logik für "Leistungen"
// Fix iPhone: Tap auf Pfeil klappt Dropdown auf, ohne das Burger-Menü zu schließen
// Schließt Dropdowns bei Click außerhalb / ESC

(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function(){
    var dds = Array.prototype.slice.call(document.querySelectorAll('[data-navdd]'));
    if(!dds.length) return;

    function closeAll(except){
      dds.forEach(function(dd){
        if(dd !== except) dd.setAttribute('data-open','0');
        var btn = dd.querySelector('[data-navdd-toggle]');
        if(btn) btn.setAttribute('aria-expanded', (dd === except && dd.getAttribute('data-open') === '1') ? 'true' : 'false');
      });
    }

    dds.forEach(function(dd){
      dd.setAttribute('data-open','0');

      var btn = dd.querySelector('[data-navdd-toggle]');
      var menu = dd.querySelector('[data-navdd-menu]');
      if(!btn || !menu) return;

      btn.setAttribute('aria-expanded','false');

      // Wichtig: nur der Pfeil toggelt im Mobile/Burger
      btn.addEventListener('click', function(e){
        // verhindert, dass der Click irgendwoanders (z.B. auf den Burger-Handler) durchrutscht
        e.preventDefault();
        e.stopPropagation();

        var isOpen = dd.getAttribute('data-open') === '1';
        closeAll(dd);
        dd.setAttribute('data-open', isOpen ? '0' : '1');
        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });

      // Klick im Menü soll nicht "außenklick" triggern
      menu.addEventListener('click', function(e){
        e.stopPropagation();
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
