// =========================================================
// Luderbein Site Core v1.4.1
// =========================================================
(function () {
  "use strict";

  // Guard: verhindert Doppel-Init (z.B. durch Fallback im HTML)
  if (window.__lbSiteCoreLoaded) return;
  window.__lbSiteCoreLoaded = true;

  document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------
    // NAV: Burger Toggle
    // ----------------------------
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      navBtn.addEventListener("click", () => {
        const isOpen = nav.getAttribute("data-open") === "1";
        nav.setAttribute("data-open", isOpen ? "0" : "1");
        navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    }

    // ----------------------------
    // NAV: aktiven Menüpunkt markieren
    // ----------------------------
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = window.location.pathname.replace(/index\.html$/, "");
    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/index\.html$/, "");
      if (!href || href === "/") return;
      if (path.startsWith(href)) {
        a.setAttribute("aria-current", "page");
      }
    });

    // ----------------------------
    // KONTAKT: CTA Autofill (WhatsApp + Mail)
    // ----------------------------
    initKontaktAutofill();
  });

  function initKontaktAutofill() {
    const pth = (window.location.pathname || "").toLowerCase();
    if (!pth.startsWith("/kontakt")) return;

    // Nur die Hero-CTA Buttons anfassen (nicht die Direktlinks weiter unten)
    const heroCtas = document.querySelectorAll(".hero .cta a");
    if (!heroCtas.length) return;

    const sp = new URLSearchParams(window.location.search);

    // Parameter: p = Produkt, v = Variante, f = Format (Fallback: size), note = freie Notiz
    const p = (sp.get("p") || "").trim();
    const v = (sp.get("v") || "").trim();
    const f = (sp.get("f") || sp.get("size") || "").trim();
    const note = (sp.get("note") || "").trim();

    // Label für Kopfzeile
    const labelParts = [p, v, f].filter(Boolean);
    const label = labelParts.length ? labelParts.join(" • ") : "Allgemeine Anfrage";

    // WhatsApp-Text: dein bestehender Stil, aber jetzt mit v/f sauber drin
    const waLines = [];
    waLines.push(`Hi Luderbein, ich möchte anfragen: ${label}`);
    waLines.push("");
    waLines.push("Kurzinfos:");
    waLines.push(`- Motiv/Text: ${note ? note : ""}`);
    waLines.push(`- Größe/Format: ${f ? f : ""}`);
    waLines.push("- Deadline (optional): ");
    waLines.push("");
    waLines.push("Foto/Skizze schicke ich gleich mit.");

    const waText = waLines.join("\n");

    // Mail: Betreff + Body
    const mailSubject = `Anfrage – ${label} – Luderbein`;

    const mailLines = [];
    mailLines.push("Hi Luderbein,");
    mailLines.push("");
    mailLines.push("ich möchte anfragen:");
    if (p) mailLines.push(`- Produkt: ${p}`);
    if (v) mailLines.push(`- Variante: ${v}`);
    if (f) mailLines.push(`- Größe/Format: ${f}`);
    mailLines.push(`- Motiv/Text: ${note ? note : ""}`);
    mailLines.push("- Deadline (optional): ");
    mailLines.push("");
    mailLines.push("Foto/Skizze schicke ich gleich mit.");
    mailLines.push("");
    mailLines.push("Danke!");

    const mailBody = mailLines.join("\n");

    // Helper: WhatsApp Nummer aus vorhandener href ziehen (falls vorhanden)
    function extractWaNumber(href) {
      if (!href) return "491725925858";
      const m = href.match(/wa\.me\/(\d+)/);
      return m && m[1] ? m[1] : "491725925858";
    }

    heroCtas.forEach((a) => {
      const href = (a.getAttribute("href") || "").trim();

      // WhatsApp CTA
      if (href.includes("wa.me/")) {
        const num = extractWaNumber(href);
        a.setAttribute("href", `https://wa.me/${num}?text=${encodeURIComponent(waText)}`);
        return;
      }

      // Mail CTA
      if (href.startsWith("mailto:")) {
        // vorhandene Mailadresse übernehmen
        const mail = href.replace(/^mailto:/, "").split("?")[0].trim() || "luderbein_gravur@icloud.com";
        a.setAttribute(
          "href",
          `mailto:${mail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
        );
      }
    });
  }
})();
