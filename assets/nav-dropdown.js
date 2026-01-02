// /assets/nav-dropdown.js
// Dropdown-Logik für <details class="navdrop" data-navdrop>
// - nur ein Dropdown gleichzeitig offen
// - schließt bei Click außerhalb
// - schließt bei ESC

(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    const drops = Array.from(document.querySelectorAll("details.navdrop[data-navdrop]"));
    if (!drops.length) return;

    function closeAll(except) {
      drops.forEach((d) => {
        if (d !== except) d.removeAttribute("open");
      });
    }

    // Wenn eins aufgeht -> andere zu
    drops.forEach((d) => {
      d.addEventListener("toggle", function () {
        if (d.open) closeAll(d);
      });

      // Klicks im Panel nicht nach außen "durchstechen" lassen
      const panel = d.querySelector(".navdrop__panel");
      if (panel) {
        panel.addEventListener("click", (e) => e.stopPropagation());
      }

      const sum = d.querySelector("summary");
      if (sum) {
        sum.addEventListener("click", (e) => {
          // verhindert, dass irgendwelche globalen Click-Handler (z.B. Burger) das direkt wieder zumachen
          e.stopPropagation();
        });
      }
    });

    // Klick außerhalb -> alles zu
    document.addEventListener("click", function (e) {
      const inside = e.target.closest("details.navdrop[data-navdrop]");
      if (!inside) closeAll(null);
    });

    // ESC -> alles zu
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });
  });
})();
