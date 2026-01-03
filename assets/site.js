// =========================================================
// Luderbein Site Core v1.4
// - Nav Toggle
// - Active Nav Marker
// - CTA Autofill (Kontakt): WhatsApp + Mail aus URL params
// - Quick Buttons (Kontakt): setzt p/f/note in URL + aktualisiert CTAs
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
    // CTA AUTOFILL (Kontakt)
    // ----------------------------
    initCtaAutofill();
  });

  function initCtaAutofill() {
    const waLinks = Array.from(document.querySelectorAll('[data-lb-cta="whatsapp"]'));
    const mailLinks = Array.from(document.querySelectorAll('[data-lb-cta="email"]'));
    const summaryEl = document.getElementById("lbCtaPreview");
    const noteEl = document.getElementById("lbNote");

    const hasCtas = waLinks.length || mailLinks.length;
    const hasUi = !!(noteEl || document.querySelector("[data-lb-set]") || document.querySelector("[data-lb-clear]"));
    if (!hasCtas && !hasUi) return; // Seite ohne Kontakt-CTA/UI: nichts machen

    // Defaults (falls data-Attribute fehlen)
    const DEFAULT_WA = "491725925858";
    const DEFAULT_MAIL = "luderbein_gravur@icloud.com";

    // --- Utils
    const getParams = () => new URL(window.location.href).searchParams;

    function getState() {
      const sp = getParams();
      const p = (sp.get("p") || "").trim();
      const v = (sp.get("v") || "").trim();
      const f = (sp.get("f") || sp.get("size") || "").trim(); // size als Fallback
      const note = (sp.get("note") || "").trim();
      return { p, v, f, note };
    }

    function buildLabel(st) {
      const parts = [st.p, st.v, st.f].filter(Boolean);
      return parts.length ? parts.join(" • ") : "Allgemeine Anfrage";
    }

    function buildMail(st) {
      const label = buildLabel(st);
      const subject = `Anfrage – ${label} – Luderbein`;

      const lines = [];
      lines.push("Hi Luderbein,");
      lines.push("");
      lines.push("ich möchte folgendes anfragen:");

      if (st.p) lines.push(`- Produkt: ${st.p}`);
      if (st.v) lines.push(`- Variante: ${st.v}`);
      if (st.f) lines.push(`- Format: ${st.f}`);
      if (st.note) lines.push(`- Notiz: ${st.note}`);

      if (!st.p && !st.v && !st.f && !st.note) {
        lines.push("- (kurz beschreiben, worum es geht)");
      }

      lines.push("");
      lines.push("Anhang/Foto schicke ich mit.");
      lines.push("");
      lines.push("Danke!");

      return { subject, body: lines.join("\n") };
    }

    function buildWhatsApp(st) {
      const label = buildLabel(st);

      const lines = [];
      lines.push(`Hi Luderbein, ich möchte anfragen: ${label}`);
      if (st.note) lines.push(`Notiz: ${st.note}`);
      lines.push("");
      lines.push("Ich schicke ggf. Foto/Skizze nach.");

      return lines.join("\n");
    }

    function updateCtas() {
      const st = getState();

      // Preview
      if (summaryEl) {
        const label = buildLabel(st);
        summaryEl.textContent = st.note ? `Wird gesendet: ${label} — Notiz: ${st.note}` : `Wird gesendet: ${label}`;
      }

      // WhatsApp
      waLinks.forEach((a) => {
        const wa = (a.getAttribute("data-lb-wa") || DEFAULT_WA).trim();
        const text = buildWhatsApp(st);
        a.setAttribute("href", `https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
      });

      // Mail
      mailLinks.forEach((a) => {
        const mail = (a.getAttribute("data-lb-mail") || DEFAULT_MAIL).trim();
        const m = buildMail(st);
        a.setAttribute(
          "href",
          `mailto:${mail}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`
        );
      });

      // Notizfeld initial füllen (nur wenn URL note hat und Feld leer ist)
      if (noteEl) {
        const current = (noteEl.value || "").trim();
        if (!current && st.note) noteEl.value = st.note;
      }
    }

    function setParam(key, val) {
      const url = new URL(window.location.href);
      const sp = url.searchParams;

      if (!val) {
        sp.delete(key);
      } else {
        sp.set(key, val);
      }

      // Wenn f gesetzt wird: size-Fallback raus, damit nur 1 Wahrheit existiert
      if (key === "f") sp.delete("size");

      // URL ohne Reload aktualisieren
      const next = url.pathname + (sp.toString() ? `?${sp.toString()}` : "");
      window.history.replaceState({}, "", next);

      updateCtas();
    }

    function clearParams() {
      const url = new URL(window.location.href);
      const sp = url.searchParams;

      ["p", "v", "f", "size", "note"].forEach((k) => sp.delete(k));

      const next = url.pathname;
      window.history.replaceState({}, "", next);

      if (noteEl) noteEl.value = "";
      updateCtas();
    }

    // Quick Buttons: data-lb-set="p|v|f" data-lb-val="..."
    document.querySelectorAll("[data-lb-set][data-lb-val]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = (btn.getAttribute("data-lb-set") || "").trim();
        const val = (btn.getAttribute("data-lb-val") || "").trim();
        if (!key) return;
        setParam(key, val);
      });
    });

    // Clear Button
    const clearBtn = document.querySelector("[data-lb-clear]");
    if (clearBtn) clearBtn.addEventListener("click", clearParams);

    // Notiz Input: schreibt nach note=...
    if (noteEl) {
      let t = null;
      noteEl.addEventListener("input", () => {
        if (t) clearTimeout(t);
        t = setTimeout(() => {
          const v = (noteEl.value || "").trim();
          setParam("note", v);
        }, 250);
      });
    }

    // Initial
    updateCtas();
  }
})();
