// =========================================================
// Luderbein Site Core v1.6
// =========================================================
(function () {
  "use strict";

  // Guard: verhindert Doppel-Init (z.B. durch Fallback im HTML)
  if (window.__lbSiteCoreLoaded) return;
  window.__lbSiteCoreLoaded = true;

  const LB_CONTACT = {
    waNumber: "491725925858",
    email: "luderbein_gravur@icloud.com",
  };

  function norm(v) {
    return (v || "").toString().trim();
  }

  function pickFirst() {
    for (let i = 0; i < arguments.length; i++) {
      const n = norm(arguments[i]);
      if (n) return n;
    }
    return "";
  }

  // Legacy: "Produkt – Variante" (nur wenn v fehlt)
  function splitLegacyProductVariant(product, variant) {
    const p = norm(product);
    const v = norm(variant);
    if (!p || v) return { product: p, variant: v };

    const seps = [" – ", " - ", " — "]; // en dash, hyphen, em dash (mit spaces)
    for (let i = 0; i < seps.length; i++) {
      const sep = seps[i];
      const idx = p.indexOf(sep);
      if (idx > 0) {
        const left = norm(p.slice(0, idx));
        const right = norm(p.slice(idx + sep.length));
        if (left && right) return { product: left, variant: right };
      }
    }
    return { product: p, variant: v };
  }

  function getQueryContext() {
    const sp = new URLSearchParams(window.location.search || "");

    let product = pickFirst(sp.get("p"), sp.get("product"));
    let variant = pickFirst(sp.get("v"), sp.get("variant"));

    const format = pickFirst(sp.get("f"), sp.get("format"), sp.get("size"));
    const note = pickFirst(sp.get("note"), sp.get("n"));

    const split = splitLegacyProductVariant(product, variant);
    product = split.product;
    variant = split.variant;

    return { product, variant, format, note };
  }

  function buildTitle(ctx) {
    const parts = [ctx.product, ctx.variant, ctx.format].map(norm).filter(Boolean);
    return parts.join(" • ");
  }

  function buildWhatsAppText(ctx) {
    const title = buildTitle(ctx);
    const head = title
      ? "Hi Luderbein, ich möchte anfragen: " + title
      : "Hi Luderbein, ich möchte was anfragen:";

    const lines = [
      head,
      "",
      "Kurzinfos:",
      "- Motiv/Text: ",
      "- Größe/Format: " + (ctx.format ? ctx.format : ""),
      "- Deadline (optional): ",
    ];

    if (ctx.note) lines.push("- Notiz: " + ctx.note);

    lines.push("");
    lines.push("Foto/Skizze schicke ich gleich mit.");

    return lines.join("\n");
  }

  function buildMailSubject(ctx) {
    const title = buildTitle(ctx);
    return title ? "Anfrage – " + title : "Anfrage – Luderbein";
  }

  function buildMailBody(ctx) {
    const lines = [
      "Hi Luderbein,",
      "",
      "ich möchte folgendes anfragen:",
      "- Produkt: " + (ctx.product || ""),
      "- Variante: " + (ctx.variant || ""),
      "- Format/Größe: " + (ctx.format || ""),
    ];

    if (ctx.note) lines.push("- Notiz: " + ctx.note);

    lines.push("- Motiv/Text: ");
    lines.push("- Deadline (optional): ");
    lines.push("");
    lines.push("Anhang/Foto schicke ich mit.");
    lines.push("");
    lines.push("Danke!");

    return lines.join("\n");
  }

  // Überschreibt nur markierte CTAs (sicher, kein Side-Effect)
  function applyCtasFromContext(baseCtx) {
    const ctas = document.querySelectorAll("a[data-lb-cta]");
    if (!ctas.length) return;

    ctas.forEach((a) => {
      const type = norm(a.getAttribute("data-lb-cta")).toLowerCase();
      if (!type) return;

      let ctx = {
        product: pickFirst(a.getAttribute("data-product"), baseCtx.product),
        variant: pickFirst(a.getAttribute("data-variant"), baseCtx.variant),
        format: pickFirst(a.getAttribute("data-format"), baseCtx.format),
        note: pickFirst(a.getAttribute("data-note"), baseCtx.note),
      };

      const split = splitLegacyProductVariant(ctx.product, ctx.variant);
      ctx.product = split.product;
      ctx.variant = split.variant;

      if (type === "wa" || type === "whatsapp") {
        const text = buildWhatsAppText(ctx);
        const href = "https://wa.me/" + LB_CONTACT.waNumber + "?text=" + encodeURIComponent(text);
        a.setAttribute("href", href);
        a.setAttribute("rel", "noopener");
        return;
      }

      if (type === "mail" || type === "email") {
        const subject = buildMailSubject(ctx);
        const body = buildMailBody(ctx);
        const href =
          "mailto:" +
          LB_CONTACT.email +
          "?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(body);
        a.setAttribute("href", href);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      navBtn.addEventListener("click", () => {
        const isOpen = nav.getAttribute("data-open") === "1";
        nav.setAttribute("data-open", isOpen ? "0" : "1");
        navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    }

    // Aktiver Menüpunkt
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = window.location.pathname.replace(/index\.html$/, "");
    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/index\.html$/, "");
      if (!href || href === "/") return;
      if (path.startsWith(href)) a.setAttribute("aria-current", "page");
    });

    // CTA Autofill
    const ctx = getQueryContext();
    applyCtasFromContext(ctx);
  });
})();
