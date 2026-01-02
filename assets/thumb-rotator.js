/* =========================================================
   Luderbein – Thumb-Rotator (v1.4 Debug Edition)
   ========================================================= */

(function () {
  "use strict";
  const INTERVAL_MS = 4200;
  const FADE_MS = 600;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    console.log("💤 [Luderbein Rotator] Animation deaktiviert (prefers-reduced-motion)");
    return;
  }

  function initRotator(el, index) {
    const imgs = Array.from(el.querySelectorAll("img")).filter(
      (img) => img.src && img.style.display !== "none"
    );

    if (imgs.length <= 1) {
      if (imgs[0]) imgs[0].classList.add("is-on");
      console.log(`⚠️ [Luderbein Rotator #${index}] Nur ${imgs.length} Bild(er) – nichts zu rotieren.`);
      return;
    }

    console.log(`✅ [Luderbein Rotator #${index}] Initialisiert (${imgs.length} Bilder).`);

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
      console.log(`🔁 [Luderbein Rotator #${index}] Zeige Bild ${i + 1} von ${imgs.length}`);
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const rotators = document.querySelectorAll("[data-thumb-rotator]");
    if (!rotators.length) {
      console.warn("⚠️ [Luderbein Rotator] Kein Element mit data-thumb-rotator gefunden.");
      return;
    }
    console.log(`🎬 [Luderbein Rotator] Starte ${rotators.length} Rotator(en).`);
    rotators.forEach((el, idx) => initRotator(el, idx + 1));
  });
})();
