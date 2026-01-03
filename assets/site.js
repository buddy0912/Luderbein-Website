// =========================================================
// Luderbein Site Core v1.4.5
// - Nav Toggle
// - Active Nav Marker
// - Kontakt: CTA Autofill (WhatsApp + Mail) aus URL params
//   Params: p (Produkt), v (Variante), f (Format) | size (Fallback), note
// - Fix: Safari/BFCache/Stale href -> CTAs beim KLICK live aus URL
// - Fix: doppelte Query-Params -> wir nehmen IMMER den letzten Wert + kanonisieren URL
// =========================================================
(function () {
  "use strict";

  const VERSION = "1.4.5";
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
    applyKontaktAutofill(true);

    // 2) BFCache / History: nochmal setzen
    window.addEventListener("pageshow", () => applyKontaktAutofill(false));
    window.addEventListener("popstate", () => applyKontaktAutofill(false));

    // 3) Killer-Fix: beim KLICK live aus aktueller URL bauen
    if (document.documentElement.dataset.lbCtaDelegated === "1") return;
    document.documentElement.dataset.lbCtaDelegated = "1";

    document.addEventListener(
      "click",
      (e) => {
        const a = e.target && e.target.closest ? e.target.closest("a") : null;
        if (!a) return;

        const inHeroCta = !!a.closest(".hero .cta");
        if (!inHeroCta) return;

        const href = (a.getAttribute("href") || "").trim();
        const isWa = href.includes("wa.me/");
        const isMail = href.startsWith("mailto:");
        if (!isWa && !isMail) return;

        // immer live neu berechnen (aus AKTUELLER URL)
        const { waHref, mailHref } = applyKontaktAutofill(false);

        // modifier clicks: nur href aktualisieren
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;

        e.preventDefault();
        if (isWa && waHref) window.location.href = waHref;
        if (isMail && mailHref) window.location.href = mailHref;
      },
      true
    );
  }

  // Nimmt immer den LETZTEN Param-Wert (wichtig bei doppelten Params)
  function getLastParam(sp, key) {
    const all = sp.getAll(key);
    if (!all || !all.length) return "";
    return (all[all.length - 1] || "").trim();
  }

  // Kanonisiert die URL auf /kontakt/:
  // - p/v/f/note jeweils nur 1x (letzter gewinnt)
  // - size wird entfernt, wenn f existiert
  function canonicalizeKontaktUrl(st) {
    const url = new URL(window.location.href);
    const sp = new URLSearchParams();

    if (st.p) sp.set("p", st.p);
    if (st.v) sp.set("v", st.v);
    if (st.f) sp.set("f", st.f);
    if (st.note) sp.set("note", st.note);

    const next = url.pathname + (sp.toString() ? `?${sp.toString()}` : "");
    const current = url.pathname + (url.search || "");

    if (next !== current) {
      window.history.replaceState({}, "", next);
    }
  }

  function applyKontaktAutofill(doCanonicalize) {
    const sp = new URLSearchParams(window.location.search);

    // Letzter gewinnt (bei doppelten Params)
    const p = getLastParam(sp, "p");
    const v = getLastParam(sp, "v");
    const f = (getLastParam(sp, "f") || getLastParam(sp, "size")).trim();
    const note = getLastParam(sp, "note");

    const state = { p, v, f, note };

    // URL bereinigen (nur auf /kontakt/)
    if (doCanonicalize) canonicalizeKontaktUrl(state);

    const labelParts = [state.p, state.v, state.f].filter(Boolean);
    const label = labelParts.length ? labelParts.join(" • ") : "Allgemeine Anfrage";

    // WhatsApp Text (dein Stil: Kurzinfos)
    const waLines = [];
    waLines.push(`Hi Luderbein, ich möchte anfragen: ${label}`);
    waLines.push("");
    waLines.push("Kurzinfos:");
    waLines.push(`- Motiv/Text: ${state.note || ""}`);
    waLines.push(`- Größe/Format: ${state.f || ""}`);
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
    if (state.p) mailLines.push(`- Produkt: ${state.p}`);
    if (state.v) mailLines.push(`- Variante: ${state.v}`);
    if (state.f) mailLines.push(`- Größe/Format: ${state.f}`);
    mailLines.push(`- Motiv/Text: ${state.note || ""}`);
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
      preview.textContent = `Wird gesendet: ${label}${state.note ? ` — Notiz: ${state.note}` : ""}`;
    }

    return { waHref: waHrefOut, mailHref: mailHrefOut };
  }
})();
