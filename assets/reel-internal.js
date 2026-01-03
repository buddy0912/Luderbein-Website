(function () {
  function px(val) {
    const n = parseFloat(String(val || "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  function pauseController() {
    let pausedUntil = 0;
    return {
      pause(ms) { pausedUntil = Date.now() + ms; },
      isPaused() { return Date.now() < pausedUntil; }
    };
  }

  function showInlineError(reel, message) {
    let el = reel.querySelector("[data-reel-error]");
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("data-reel-error", "1");
      el.style.cssText =
        "flex:0 0 auto; padding:10px 12px; border-radius:12px; " +
        "border:1px dashed rgba(64,62,65,.55); color:inherit; opacity:.85;";
      reel.appendChild(el);
    }
    el.textContent = message;
  }

  function initAutoScroll(reel) {
    const forceAuto = reel.getAttribute("data-force-auto") === "1";
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Accessibility first, unless explicitly forced for this reel
    if (reduce && !forceAuto) return;

    const ctrl = pauseController();

    reel.addEventListener("scroll", () => ctrl.pause(1500), { passive: true });
    reel.addEventListener("pointerdown", () => ctrl.pause(2500), { passive: true });
    reel.addEventListener("touchstart", () => ctrl.pause(2500), { passive: true });
    reel.addEventListener("wheel", () => ctrl.pause(2500), { passive: true });

    function stepSize() {
      const first = reel.querySelector(".reel__item");
      if (!first) return 0;

      const w = first.getBoundingClientRect().width;
      const cs = window.getComputedStyle(reel);
      const gapStr = (cs.gap || cs.columnGap || "0").split(" ")[0];
      const gap = px(gapStr);
      return w + gap;
    }

    const interval = Number(reel.getAttribute("data-interval")) || 4500;

    setInterval(() => {
      if (ctrl.isPaused()) return;

      const step = stepSize();
      if (!step) return;

      const max = reel.scrollWidth - reel.clientWidth;
      if (max <= 0) return;

      if (reel.scrollLeft >= max - (step * 0.6)) {
        reel.scrollTo({ left: 0, behavior: "smooth" });
        ctrl.pause(600);
        return;
      }

      reel.scrollBy({ left: step, behavior: "smooth" });
    }, interval);
  }

  async function buildReelFromJson(reel) {
    const src = reel.getAttribute("data-reel-src");
    if (!src) return;

    try {
      const res = await fetch(src, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed (" + res.status + "): " + src);

      let items;
      try {
        items = await res.json();
      } catch {
        throw new Error("JSON parse error in " + src);
      }

      if (!Array.isArray(items)) throw new Error("JSON must be an array in " + src);

      reel.innerHTML = "";

      for (const it of items) {
        if (!it || !it.src) continue;

        const fig = document.createElement("figure");
        fig.className = "reel__item";

        const img = document.createElement("img");
        img.className = "reel__img";
        img.loading = "lazy";
        img.src = it.src;
        img.alt = it.alt || "";

        const cap = document.createElement("figcaption");
        cap.className = "reel__cap";
        cap.textContent = it.cap || "";

        fig.appendChild(img);
        fig.appendChild(cap);
        reel.appendChild(fig);
      }

      if (!reel.querySelector(".reel__item")) {
        showInlineError(reel, "Reel: JSON geladen, aber keine Items gefunden (prüfe src-Felder).");
        return;
      }

      initAutoScroll(reel);
    } catch (e) {
      showInlineError(reel, "Reel-Fehler: " + (e && e.message ? e.message : "unbekannt"));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-reel]").forEach(buildReelFromJson);
  });
})();
