// /assets/nav-dropdown.js
// Dropdown-Logik für <details class="navdrop" data-navdrop>
// - Nur eins offen
// - Klick außerhalb / ESC schließt
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var dds = Array.prototype.slice.call(document.querySelectorAll("details.navdrop[data-navdrop]"));
    if (!dds.length) return;

    function closeAll(except) {
      dds.forEach(function (dd) {
        if (dd !== except) dd.removeAttribute("open");
      });
    }

    dds.forEach(function (dd) {
      dd.addEventListener("toggle", function () {
        if (dd.open) closeAll(dd);
      });
    });

    // Klick außerhalb schließt alle
    document.addEventListener("click", function (e) {
      var insideAny = dds.some(function (dd) {
        return dd.contains(e.target);
      });
      if (!insideAny) closeAll(null);
    });

    // ESC schließt alle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });
  });
})();
