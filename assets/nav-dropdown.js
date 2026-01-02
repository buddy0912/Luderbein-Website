// /assets/nav-dropdown.js
// Einheitliche Dropdown-Logik für <details class="navdrop" data-navdrop>
// Fix: iOS Tap, schließt bei Außenklick/ESC, nur ein Dropdown gleichzeitig

(function(){
  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function(){
    var drops = Array.prototype.slice.call(document.querySelectorAll("details[data-navdrop]"));
    if(!drops.length) return;

    function closeAll(except){
      drops.forEach(function(d){
        if(d !== except) d.removeAttribute("open");
      });
    }

    // Toggle über summary-klick (sauber, ohne default-quirks)
    drops.forEach(function(d){
      var sum = d.querySelector("summary");
      if(!sum) return;

      sum.addEventListener("click", function(e){
        // wir togglen selbst, damit's überall gleich ist
        e.preventDefault();
        e.stopPropagation();

        var willOpen = !d.hasAttribute("open");
        closeAll(d);
        if(willOpen) d.setAttribute("open", "");
        else d.removeAttribute("open");
      });

      // Klick im Panel nicht als Außenklick werten
      var panel = d.querySelector(".navdrop__panel");
      if(panel){
        panel.addEventListener("click", function(e){
          e.stopPropagation();
        });
      }
    });

    // Außenklick => zu
    document.addEventListener("click", function(){
      closeAll(null);
    });

    // ESC => zu
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeAll(null);
    });
  });
})();
