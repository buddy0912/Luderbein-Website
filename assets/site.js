// =========================================================
// Luderbein Site Core v1.4.3
// - Nav Toggle
// - Active Nav Marker
// - Kontakt: CTA Autofill (WhatsApp + Mail) aus URL params
//   Params: p (Produkt), v (Variante), f (Format) | size (Fallback), note
// - Fix: iOS/Safari BFCache (pageshow) + popstate => CTAs immer aktuell
// =========================================================
(function () {
  "use strict";

  const VERSION = "1.4.3";
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

    // Ziel-CTAs finden:
    // 1) Bevorzugt: .hero .cta a (dein Layout)
    // 2) Fallback: alle .cta a (aber wir greifen nur wa.me und mailto an)
    function getCtaAnchors() {
      const hero = Array.from(document.querySelectorAll(".hero .cta a"));
      const scope = hero.length ? hero : Array.from(document.querySelectorAll(".cta a"));
      const waAnchors = scope.filter((a) => (a.getAttribute("href") || "").includes("wa.me/"));
      const mailAnchors = scope.filter((a) => (a.getAttribute("href") || "").startsWith("mailto:"));
      return { waAnchors, mailAnchors };
    }

    function extractWaNumber(href) {
      const m = (href || "").match(/wa\.me\/(\d+)/);
      return (m && m[1]) ? m[1] : "491725925858";
    }

    function extractMailAddress(href) {
      const raw = (href || "mailto:luderbein_gravur@icloud.com").trim();
      const addr = raw.replace(/^mailto:/, "").split("?")[0].trim();
      return addr || "luderbein_gravur@icloud.com";
    }

    function buildState() {
      const sp = new URLSearchParams(window.location.search);
      const p = (sp.get("p") || "").trim();
      const v = (sp.get("v") || "").trim();
      const f = (sp.get("f") || sp.get("size") || "").trim();
      const note = (sp.get("note") || "").trim();
      return { p, v, f, note };
    }

    function buildLabel(st) {
      const parts = [st.p, st.v, st.f].filter(Boolean);
      return parts.length ? parts.join(" • ") : "Allgemeine Anfrage";
    }

    function applyAutofill() {
      const st = buildState();
      const label = buildLabel(st);

      // WhatsApp Text (dein Stil: Kurzinfos)
      const waLines = [];
      waLines.push(`Hi Luderbein, ich möchte anfragen: ${label}`);
      waLines.push("");
      waLines.push("Kurzinfos:");
      waLines.push(`- Motiv/Text: ${st.note || ""}`);
      waLines.push(`- Größe/Format: ${st.f || ""}`);
      waLines.push("- Deadline (optional): ");
      waLines.push("");
      waLines.push("Foto/Skizze schicke ich gleich mit.");
      const waText = waLines.join("\n");

      // Mail
      const mailSubject = `Anfrage – ${label} – Luderbein`;

      const mailLines = [];
      mailLines.push("Hi Luderbein,");
      mailLines.push("");
      mailLines.push("ich möchte anfragen:");
      if (st.p) mailLines.push(`- Produkt: ${st.p}`);
      if (st.v) mailLines.push(`- Variante: ${st.v}`);
      if (st.f) mailLines.push(`- Größe/Format: ${st.f}`);
      mailLines.push(`- Motiv/Text: ${st.note || ""}`);
      mailLines.push("- Deadline (optional): ");
      mailLines.push("");
      mailLines.push("Foto/Skizze schicke ich gleich mit.");
      mailLines.push("");
      mailLines.push("Danke!");
      const mailBody = mailLines.join("\n");

      const { waAnchors, mailAnchors } = getCtaAnchors();

      // WhatsApp CTA(s)
      waAnchors.forEach((a) => {
        const old = a.getAttribute("href") || "";
        const num = extractWaNumber(old);
        a.setAttribute("href", `https://wa.me/${num}?text=${encodeURIComponent(waText)}`);
      });

      // Mail CTA(s)
      mailAnchors.forEach((a) => {
        const old = a.getAttribute("href") || "mailto:luderbein_gravur@icloud.com";
        const mail = extractMailAddress(old);
        a.setAttribute(
          "href",
          `mailto:${mail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
        );
      });

      // Optional Preview (falls vorhanden)
      const preview = document.getElementById("lbCtaPreview");
      if (preview) {
        preview.textContent = `Wird gesendet: ${label}${st.note ? ` — Notiz: ${st.note}` : ""}`;
      }
    }

    // 1) Initial
    applyAutofill();

    // 2) BFCache Fix: beim Zurück/Vor (Safari iOS) wird oft kein DOMContentLoaded gefeuert
    window.addEventListener("pageshow", () => {
      applyAutofill();
    });

    // 3) Wenn History-States genutzt werden (z.B. URL ändert sich ohne Reload)
    window.addEventListener("popstate", () => {
      applyAutofill();
    });
  }
})();
