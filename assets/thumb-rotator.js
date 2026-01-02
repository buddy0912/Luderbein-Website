/* =========================================================
   Luderbein – Thumb-Rotator & Reel-Feed  (v1.3)
   ---------------------------------------------------------
   - Automatisches Crossfading der Thumbnails
   - Lazy-Loading + Reduced-Motion-Check
   - Ressourcen-schonend: requestAnimationFrame-Takt
   ========================================================= */

(function () {
  "use strict";

  const INTERVAL_MS = 4200;
  const FADE_MS = 600;

  // Early exit bei "prefers-reduced-motion"
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Initialisierung
  function initRotator(el) {
    const imgs = Array.from(el.querySelectorAll("img")).filter((i) => i.src && i.style.display !== "none");
    if (imgs.length <= 1) {
      if (imgs[0]) imgs[0].classList.add("is-on");
      return;
    }

    // Basis-Stile
    imgs.forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.transition = `opacity ${FADE_MS}ms ease`;
      img.style.opacity = "0";
    });
    imgs[0].style.opacity = "1";
    imgs[0].classList.add("is-on");

    let i = 0;
    let lastTick = performance.now();

    function step(now) {
      if (now - lastTick < INTERVAL_MS) {
        requestAnimationFrame(step);
        return;
      }
      lastTick = now;
      const prev = imgs[i];
      i = (i + 1) % imgs.length;
      const next = imgs[i];

      prev.classList.remove("is-on");
      next.classList.add("is-on");

      prev.style.opacity = "0";
      next.style.opacity = "1";

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Start, sobald DOM bereit
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-thumb-rotator]").forEach(initRotator);
  });
})();
