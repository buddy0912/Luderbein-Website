(function () {
  const host = document.getElementById("site-footer");
  if (!host) return;

  const url = "/assets/partials/footer.html";

  fetch(url, { credentials: "same-origin" })
    .then((r) => {
      if (!r.ok) throw new Error("Footer fetch failed: " + r.status);
      return r.text();
    })
    .then((html) => {
      host.innerHTML = html;

      // Jahr setzen
      const y = host.querySelector("[data-year]");
      if (y) y.textContent = String(new Date().getFullYear());
    })
    .catch(() => {
      // Wenn fetch failt, lassen wir's einfach leer (oder du setzt hier ein fallback).
    });
})();
