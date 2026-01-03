(function () {
  function initReel(root) {
    const slides = Array.from(root.querySelectorAll(".reel__slide"));
    const dots = Array.from(root.querySelectorAll(".reel__dot"));

    if (!slides.length) return;

    const interval = Number(root.getAttribute("data-interval")) || 4500;
    let i = 0;
    let timer = null;

    function setActive(idx) {
      slides.forEach((s, n) => s.classList.toggle("is-active", n === idx));
      dots.forEach((d, n) => d.classList.toggle("is-active", n === idx));
      i = idx;
    }

    function next() {
      setActive((i + 1) % slides.length);
    }

    function start() {
      stop();
      timer = setInterval(next, interval);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // Optional: Tap on dots (nice UX, still internal)
    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        setActive(idx);
        start();
      });
    });

    // Pause on hover (desktop), resume after
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    // Start
    setActive(0);
    start();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-reel]").forEach(initReel);
  });
})();
