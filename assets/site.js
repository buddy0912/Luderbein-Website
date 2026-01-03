// =========================================================
// Luderbein Site Core v1.4.2
// - Nav Toggle
// - Active Nav Marker
// - Kontakt: CTA Autofill (WhatsApp + Mail) aus URL params
//   Params: p (Produkt), v (Variante), f (Format) | size (Fallback), note
// =========================================================
(function () {
  "use strict";

  // Versioned Guard: verhindert, dass eine alte (cached/inline) Version die neue blockiert
  const VERSION = "1.4.2";
  if (window.__lbSiteCoreLoadedVersion === VERSION) return;
  window.__lbSiteCoreLoadedVersion = VERSION;

  document.addEventListener("DOMContentLoaded", () => {
    initNavToggle();
    markActiveNav();
    initKontaktCtaAutofill();
  });

  function initNavToggle() {
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    if (!navBtn || !nav) return;

    // Doppel-Binding vermeiden
    if (navBtn.dataset.lbBound === "1") return;
    navBtn.dataset.lbBound = "1";

    navBtn.addEventListener("click", () => {
      const isOpen = nav.getAttribute("data-open") === "1";
      nav.setAttribute("data-open", isOpen ? "0" : "1");
      navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  }

  function markActiveNav() {
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = (window.location.pathname || "").replace(/index\.html$/, "");
    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/index\.html$/, "");
      if (!href || href === "/") return;
      if (path.startsWith(href)) a.setAttribute("aria-current", "page");
    });
  }

  function initKontaktCtaAutofill() {
    const pathname = window.location.pathname || "";
    if (!pathname.startsWith("/kontakt")) return;

    const sp = new URLSearchParams(window.location.search);

    const p = (sp.get("p") || "").trim();
    const v = (sp.get("v") || "").trim();
    const f = (sp.get("f") || sp.get("size") || "").trim();
    const note = (sp.get("note") || "").trim();

    const labelParts = [p, v, f].filter(Boolean);
    const label = labelParts.length ? labelParts.join(" • ") : "Allgemeine Anfrage";

    // Nachricht: wie dein Stil ("Kurzinfos"), aber jetzt mit v/f sauber drin
    const waLines = [];
    waLines.push(`Hi Luderbein, ich möchte anfragen: ${label}`);
    waLines.push("");
    waLines.push("Kurzinfos:");
    waLines.push(`- Motiv/Text: ${note || ""}`);
    waLines.push(`- Größe/Format: ${f || ""}`);
    waLines.push("- Deadline (optional): ");
    waLines.push("");
    waLines.push("Foto/Skizze schicke ich gleich mit.");
    const waText = waLines.join("\n");

    const mailSubject = `Anfrage – ${label} – Luderbein`;

    const mailLines = [];
    mailLines.push("Hi Luderbein,");
    mailLines.push("");
    mailLines.push("ich möchte anfragen:");
    if (p) mailLines.push(`- Produkt: ${p}`);
    if (v) mailLines.push(`- Variante: ${v}`);
    if (f) mailLines.push(`- Größe/Format: ${f}`);
    mailLines.push(`- Motiv/Text: ${note || ""}`);
    mailLines.push("- Deadline (optional): ");
    mailLines.push("");
    mailLines.push("Foto/Skizze schicke ich gleich mit.");
    mailLines.push("");
    mailLines.push("Danke!");
    const mailBody = mailLines.join("\n");

    // Ziel-CTAs finden:
    // 1) Bevorzugt: .hero .cta a (dein Layout)
    // 2) Fallback: erste .cta a mit wa.me / mailto
    const heroCtas = Array.from(document.querySelectorAll(".hero .cta a"));
    const ctaScope = heroCtas.length ? heroCtas : Array.from(document.querySelectorAll(".cta a"));

    const waAnchors = ctaScope.filter((a) => (a.getAttribute("href") || "").includes("wa.me/"));
    const mailAnchors = ctaScope.filter((a) => (a.getAttribute("href") || "").startsWith("mailto:"));

    function extractWaNumber(href) {
      const m = (href || "").match(/wa\.me\/(\d+)/);
      return (m && m[1]) ? m[1] : "491725925858";
    }

    // WhatsApp CTA(s) überschreiben
    waAnchors.forEach((a) => {
      const old = a.getAttribute("href") || "";
      const num = extractWaNumber(old);
      a.setAttribute("href", `https://wa.me/${num}?text=${encodeURIComponent(waText)}`);
    });

    // Mail CTA(s) überschreiben
    mailAnchors.forEach((a) => {
      const old = a.getAttribute("href") || "mailto:luderbein_gravur@icloud.com";
      const mail = old.replace(/^mailto:/, "").split("?")[0].trim() || "luderbein_gravur@icloud.com";
      a.setAttribute(
        "href",
        `mailto:${mail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
      );
    });

    // Optional Preview (falls vorhanden)
    const preview = document.getElementById("lbCtaPreview");
    if (preview) preview.textContent = `Wird gesendet: ${label}${note ? ` — Notiz: ${note}` : ""}`;
  }
})();
