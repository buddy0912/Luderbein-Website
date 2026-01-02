// /assets/nav-dropdown.js
// Dropdown-Logik für <details class="navdrop" data-navdrop>
// - Safari/iOS friendly (Marker wird per CSS entfernt)
// - Klick: toggelt sauber, schließt andere
// - Klick außerhalb + ESC: schließt
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var drops = Array.prototype.slice.call(
      document.querySelectorAll('details.navdrop[data-navdrop]')
    );
    if (!drops.length) return;

    function closeAll(except) {
      drops.forEach(function (dd) {
        if (dd !== except) dd.open = false;
        var sum = dd.querySelector(".navdrop__sum");
        if (sum) sum.setAttribute("aria-expanded", dd.open ? "true" : "false");
      });
    }

    drops.forEach(function (dd) {
      var sum = dd.querySelector(".navdrop__sum");
      if (!sum) return;

      // Initial state
      sum.setAttribute("aria-expanded", dd.open ? "true" : "false");

      sum.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        var willOpen = !dd.open;
        closeAll(dd);
        dd.open = willOpen;
        sum.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });

      var panel = dd.querySelector(".navdrop__panel");
      if (panel) {
        panel.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    });

    document.addEventListener("click", function () {
      closeAll(null);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });
  });
})();
