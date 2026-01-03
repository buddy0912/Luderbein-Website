// =========================================================
// Luderbein Site Core v1.5.0
// - Nav Toggle
// - Active Nav Marker
// - Kontakt: CTA Autofill (WhatsApp + Mail)
//   FIX: Safari/BFCache + "stale URL params" -> Kontext wird beim KLICK gespeichert (sessionStorage)
//   Quelle der Wahrheit = letzter Klick auf einen /kontakt/?... Link
// =========================================================
(function () {
  "use strict";

  const VERSION = "1.5.0";
  if (window.__lbSiteCoreLoadedVersion === VERSION) return;
  window.__lbSiteCoreLoadedVersion = VERSION;

  const STORE_KEY = "lb_kontakt_ctx";
  const STORE_TTL_MS = 10 * 60 * 1000; // 10 Minuten

  document.addEventListener("DOMContentLoaded", () => {
    initNavToggle();
    markActiveNav();
    bindKontaktContextCapture(); // überall aktiv
    initKontaktCtas();          // nur auf /kontakt/
  });

  // ----------------------------
  // NAV: Burger Toggle
  // ----------------------------
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

  // ----------------------------
  // NAV: aktiven Menüpunkt markieren
  // ----------------------------
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
  // 1) Kontext beim Klick auf /kontakt/?... speichern
  // =========================================================
  function bindKontaktContextCapture() {
    if (document.documentElement.dataset.lbKontaktCapture === "1") return;
    document.documentElement.dataset.lbKontaktCapture = "1";

    document.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      const href = (a.getAttribute("href") || "").trim();
      if (!href) return;

      // Nur Links, die nach /kontakt/ gehen (relativ oder absolut)
      let url;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (!url.pathname.startsWith("/kontakt")) return;

      const sp = url.searchParams;

      // Letzter gewinnt (falls jemand doppelte Params produziert)
      const p = lastParam(sp, "p");
      const v = lastParam(sp, "v");
      const f = (lastParam(sp, "f") || lastParam(sp, "size")).trim();
      const note = lastParam(sp, "note");

      // Nur speichern, wenn überhaupt Kontext vorhanden ist
      if (!p && !v && !f && !note) return;

      const payload = {
        ts: Date.now(),
        p, v, f, note,
        href: url.pathname + url.search
      };

      try {
        sessionStorage.setItem(STORE_KEY, JSON.stringify(payload));
      } catch {
        // wenn Storage blockiert ist: ignorieren -> Fallback URL
      }
    }, true);
  }

  function lastParam(sp, key) {
    const all = sp.getAll(key);
    if (!all || !all.length) return "";
    return (all[all.length - 1] || "").trim();
  }

  function readStoredCtx() {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.ts) return null;
      if ((Date.now() - obj.ts) > STORE_TTL_MS) return null;
      return obj;
    } catch {
      return null;
    }
  }

  // =========================================================
  // 2) Kontakt-CTAs: immer aus "letztem Klick" bauen (Fallback URL)
  // =========================================================
  function initKontaktCtas() {
    const pathname = window.location.pathname || "";
    if (!pathname.startsWith("/kontakt")) return;

    // Initial + BFCache
    applyKontaktAutofill();
    window.addEventListener("pageshow", () => applyKontaktAutofill());
    window.addEventListener("popstate", () => applyKontaktAutofill());

    // Beim KLICK auf WhatsApp/Mail im Hero: live neu berechnen & dann öffnen
    if (document.documentElement.dataset.lbKontaktClickFix === "1") return;
    document.documentElement.dataset.lbKontaktClickFix = "1";

    document.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      // Nur Hero-CTA Buttons
      if (!a.closest(".hero .cta")) return;

      const href = (a.getAttribute("href") || "").trim();
      const isWa = href.includes("wa.me/");
      const isMail = href.startsWith("mailto:");
      if (!isWa && !isMail) return;

      const { waHref, mailHref } = applyKontaktAutofill();

      // modifier clicks: nur aktualisieren
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;

      e.preventDefault();
      if (isWa && waHref) window.location.href = waHref;
      if (isMail && mailHref) window.location.href = mailHref;
    }, true);
  }

  function getKontaktState() {
    // 1) Primär: letzter Klick-Kontext (sessionStorage)
    const stored = readStoredCtx();
    if (stored && (stored.p || stored.v || stored.f || stored.note)) {
      return {
        p: stored.p || "",
        v: stored.v || "",
        f: stored.f || "",
        note: stored.note || ""
      };
    }

    // 2) Fallback: URL
    const sp = new URLSearchParams(window.location.search);
    return {
      p: (sp.get("p") || "").trim(),
      v: (sp.get("v") || "").trim(),
      f: ((sp.get("f") || sp.get("size") || "")).trim(),
      note: (sp.get("note") || "").trim()
    };
  }

  function applyKontaktAutofill() {
    const st = getKontaktState();

    const labelParts = [st.p, st.v, st.f].filter(Boolean);
    const label = labelParts.length ? labelParts.join(" • ") : "Allgemeine Anfrage";

    // WhatsApp Text (dein Stil)
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

    return { waHref: waHrefOut, mailHref: mailHrefOut };
  }
})();
