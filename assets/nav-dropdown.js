// /assets/nav-dropdown.js
// Einheitliche Dropdown-Logik für <details class="navdrop" data-navdrop>
// Fixes:
// - entfernt "open" beim Start (damit nix inline aufreißt)
// - steuert Öffnen/Schließen über data-open (CSS)
// - stoppt Propagation, damit iPhone/Burger nicht dazwischenfunkt
// - schließt bei Klick außerhalb / ESC

(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var dds = Array.prototype.slice.call(document.querySelectorAll("details.navdrop[data-navdrop]"));
    if (!dds.length) return;

    function setOpen(dd, open) {
      dd.setAttribute("data-open", open ? "1" : "0");
      if (open) dd.setAttribute("open", "");
      else dd.removeAttribute("open");

      var sum = dd.querySelector("summary.navdrop__sum");
      if (sum) sum.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function closeAll(except) {
      dds.forEach(function (dd) {
        if (dd !== except) setOpen(dd, false);
      });
    }

    // Init: alles zu (wichtig, damit "Schiefer/Metall/..." nicht inline stehen)
    dds.forEach(function (dd) {
      setOpen(dd, false);

      var sum = dd.querySelector("summary.navdrop__sum");
      var panel = dd.querySelector(".navdrop__panel");

      if (!sum || !panel) return;

      sum.setAttribute("aria-expanded", "false");

      // Toggle nur über Summary-Click
      sum.addEventListener("click", function (e) {
        // verhindert native details-toggle + verhindert "Burger schließt" Nebenwirkungen
        e.preventDefault();
        e.stopPropagation();

        var isOpen = dd.getAttribute("data-open") === "1";
        closeAll(dd);
        setOpen(dd, !isOpen);
      });

      // Klick im Panel darf nicht als "außen" zählen
      panel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });

    // Klick außerhalb -> alles zu
    document.addEventListener("click", function () {
      closeAll(null);
    });

    // ESC -> alles zu
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });
  });
})();
