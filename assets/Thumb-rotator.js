/* /assets/thumb-rotator.js
   Mini-Slideshow für Kachel-Thumbs.
   Aktiv nur, wenn ein Element data-thumb-rotator="url1|url2|..."
*/

(function () {
  function setupRotator(el) {
    const raw = (el.getAttribute("data-thumb-rotator") || "").trim();
    if (!raw) return;

    const urls = raw.split("|").map(s => s.trim()).filter(Boolean);
    if (urls.length < 2) return;

    // Thumb als Bühne vorbereiten (ohne Layout zu ändern)
    el.style.position = el.style.position || "relative";
    el.style.overflow = "hidden";

    // Alle vorhandenen Children (Label etc.) über die Bilder heben
    Array.from(el.children).forEach(ch => {
      // Unsere eigenen Bilder später ignorieren wir via data-flag
      if (ch && ch.getAttribute && ch.getAttribute("data-rotator-layer") === "1") return;
      ch.style.position = ch.style.position || "relative";
      ch.style.zIndex = ch.style.zIndex || "2";
    });

    // Zwei Layer für Crossfade
    const imgA = document.createElement("img");
    const imgB = document.createElement("img");

    [imgA, imgB].forEach(img => {
      img.setAttribute("data-rotator-layer", "1");
      img.alt = "";
      img.decoding = "async";
      img.loading = "eager";
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.pointerEvents = "none";
      img.style.transition = "opacity 420ms ease";
      img.style.opacity = "0";
      img.style.zIndex = "1";
    });

    imgA.src = urls[0];
    imgA.style.opacity = "1";
    imgB.src = urls[1];
    imgB.style.opacity = "0";

    // Bilder ganz nach unten in den Thumb einsetzen (aber vor evtl. Text? egal – zIndex regelt)
    el.insertBefore(imgA, el.firstChild);
    el.insertBefore(imgB, el.firstChild);

    let idx = 1;          // aktuell "vorbereitetes" Bild in imgB
    let showingA = true;  // A sichtbar?
    const intervalMs = 4600;

    setInterval(() => {
      idx = (idx + 1) % urls.length;

      if (showingA) {
        // B einblenden, A ausblenden
        imgB.src = urls[idx];
        imgB.style.opacity = "1";
        imgA.style.opacity = "0";
      } else {
        // A einblenden, B ausblenden
        imgA.src = urls[idx];
        imgA.style.opacity = "1";
        imgB.style.opacity = "0";
      }

      showingA = !showingA;
    }, intervalMs);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-thumb-rotator]").forEach(setupRotator);
  });
})();
