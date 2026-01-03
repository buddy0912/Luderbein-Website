// =========================================================
// Luderbein Site Core v1.4.4
// - Nav Toggle
// - Active Nav Marker
// - Kontakt: CTA Autofill (WhatsApp + Mail) aus URL params
//   Params: p (Produkt), v (Variante), f (Format) | size (Fallback), note
// - FIX: Safari/BFCache/Stale href -> CTAs werden beim KLICK live aus URL gebaut
// =========================================================
(function () {
  "use strict";

  const VERSION = "1.4.4";
  if (window.__lbSiteCoreLoadedVersion === VERSION) return;
  window.__lbSiteCoreLoadedVersion = VERSION;

  document.addEventListener("DOMContentLoaded", () => {
    initNavToggle();
    markActiveNav();
    initKontaktCtas();
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

  // =========================================================
  // KONTAKT CTAs
  // =========================================================
  function initKontaktCtas() {
    const pathname = window.location.pathname || "";
    if (!pathname.startsWith("/kontakt")) return;

    // 1) Initial einmal setzen
    applyKontaktAutofill();

    // 2) BFCache / History: nochmal setzen
    window.addEventListener("pageshow", () => applyKontaktAutofill());
    window.addEventListener("popstate", () => applyKontaktAutofill());

    // 3) Killer-Fix: beim KLICK live aus aktueller URL bauen
    //    (Safari kann href im DOM "stale" lassen; wir rechnen daher on-demand)
    if (document.documentElement.dataset.lbCtaDelegated === "1") return;
    document.documentElement.dataset.lbCtaDelegated = "1";

    document.addEventListener(
      "click",
      (e) => {
        const a = e.target && e.target.closest ? e.target.closest("a") : null;
        if (!a) return;

        // Nur Hero-CTAs anfassen (nicht Direktlinks unten)
        const inHeroCta = !!a.closest(".hero .cta");
        if (!inHeroCta) return;

        const href = (a.getAttribute("href") || "").trim();
        const isWa = href.includes("wa.me/");
        const isMail = href.startsWith("mailto:");

        if (!isWa && !isMail) return;

        // Immer zuerst sauber neu berechnen + href aktualisieren
        const { waHref, mailHref } = applyKontaktAutofill();

        // Bei modifier clicks (neuer Tab etc.) nur aktualisieren, nicht abwürgen
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;

        // Normaler Klick: wir verhindern Default und navigieren gezielt
        // -> garantiert, dass wirklich der neue Link benutzt wird
        e.preventDefault();

        if (isWa && waHref) {
          window.location.href = waHref;
          return;
        }
        if (isMail && mailHref) {
          window.location.href = mailHref;
        }
      },
      true
    );
  }

  function applyKontaktAutofill() {
    const sp = new URLSearchParams(window.location.search);

    const p = (sp.get("p") || "").trim();
    const v = (sp.get("v") || "").trim();
    const f = (sp.get("f") || sp.get("size") || "").trim();
    const note = (sp.get("note") || "").trim();

    const labelParts = [p, v, f].filter(Boolean);
    const label = labelParts.length ? labelParts.join(" • ") : "Allgemeine Anfrage";

    // WhatsApp Text (dein Stil: Kurzinfos)
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

    // Mail
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

    // Nur Hero-CTA Buttons updaten
    const heroAnchors = Array.from(document.querySelectorAll(".hero .cta a"));
    const waAnchors = heroAnchors.filter((a) => (a.getAttribute("href") || "").includes("wa.me/"));
    const mailAnchors = heroAnchors.filter((a) => (a.getAttribute("href") || "").startsWith("mailto:"));

    function extractWaNumber(href) {
      const m = (href || "").match(/wa\.me\/(\d+)/);
      return (m && m[1]) ? m[1] : "491725925858";
    }
    function extractMailAddress(href) {
      const raw = (href || "mailto:luderbein_gravur@icloud.com").trim();
      const addr = raw.replace(/^mailto:/, "").split("?")[0].trim();
      return addr || "luderbein_gravur@icloud.com";
    }

    let waHrefOut = "";
    let mailHrefOut = "";

    waAnchors.forEach((a) => {
      const old = a.getAttribute("href") || "";
      const num = extractWaNumber(old);
      const newHref = `https://wa.me/${num}?text=${encodeURIComponent(waText)}`;
      a.setAttribute("href", newHref);
      waHrefOut = newHref;
    });

    mailAnchors.forEach((a) => {
      const old = a.getAttribute("href") || "mailto:luderbein_gravur@icloud.com";
      const mail = extractMailAddress(old);
      const newHref = `mailto:${mail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
      a.setAttribute("href", newHref);
      mailHrefOut = newHref;
    });

    const preview = document.getElementById("lbCtaPreview");
    if (preview) {
      preview.textContent = `Wird gesendet: ${label}${note ? ` — Notiz: ${note}` : ""}`;
    }

    return { waHref: waHrefOut, mailHref: mailHrefOut };
  }
})();
