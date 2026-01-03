// =========================================================
// Luderbein Site Core v1.5
// - Mobile Nav Toggle
// - Active Nav Link
// - CTA Autofill (WhatsApp + Mail)
//   via ?p= &v= &f=  (plus legacy: size=, note=)
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

  function pickFirst(...vals) {
    for (const v of vals) {
      const n = norm(v);
      if (n) return n;
    }
    return "";
  }

  function getQueryContext() {
    const sp = new URLSearchParams(window.location.search || "");

    const product = pickFirst(sp.get("p"), sp.get("product"));
    const variant = pickFirst(sp.get("v"), sp.get("variant"));
    const format = pickFirst(sp.get("f"), sp.get("format"), sp.get("size")); // legacy support
    const note = pickFirst(sp.get("note"), sp.get("n")); // legacy support

    return { product, variant, format, note };
  }

  function buildTitle(ctx) {
    const parts = [ctx.product, ctx.variant, ctx.format].map(norm).filter(Boolean);
    return parts.join(" • ");
  }

  function buildWhatsAppText(ctx) {
    const title = buildTitle(ctx);
    const head = title
      ? `Hi Luderbein, ich möchte anfragen: ${title}`
      : "Hi Luderbein, ich möchte was anfragen:";

    const noteLine = ctx.note ? `\n- Notiz: ${ctx.note}` : "";

    return (
      head +
      "\n\n" +
      "Kurzinfos:\n" +
      "- Motiv/Text: \n" +
      "- Größe/Format: " + (ctx.format ? ctx.format : "") + "\n" +
      "- Deadline (optional): " +
      noteLine +
      "\n\n" +
      "Foto/Skizze schicke ich gleich mit."
    );
  }

  function buildMailSubject(ctx) {
    const title = buildTitle(ctx);
    return title ? `Anfrage – ${title}` : "Anfrage – Luderbein";
  }

  function buildMailBody(ctx) {
    const noteBlock = ctx.note ? `\n- Notiz: ${ctx.note}\n` : "\n";

    return (
      "Hi Luderbein,\n\n" +
      "ich möchte folgendes anfragen:\n" +
      `- Produkt: ${ctx.product || ""}\n` +
      `- Variante: ${ctx.variant || ""}\n` +
      `- Format/Größe: ${ctx.format || ""}` +
      noteBlock +
      "- Motiv/Text: \n" +
      "- Deadline (optional): \n\n" +
      "Anhang/Foto schicke ich mit.\n\n" +
      "Danke!"
    );
  }

  function applyCtasFromContext(baseCtx) {
    const ctas = document.querySelectorAll("a[data-lb-cta]");
    if (!ctas.length) return;

    ctas.forEach((a) => {
      const type = norm(a.getAttribute("data-lb-cta")).toLowerCase();
      if (!type) return;

      // pro Link optional überschreiben (data-product / data-variant / data-format / data-note)
      const ctx = {
        product: pickFirst(a.getAttribute("data-product"), baseCtx.product),
        variant: pickFirst(a.getAttribute("data-variant"), baseCtx.variant),
        format: pickFirst(a.getAttribute("data-format"), baseCtx.format),
        note: pickFirst(a.getAttribute("data-note"), baseCtx.note),
      };

      if (type === "wa" || type === "whatsapp") {
        const text = buildWhatsAppText(ctx);
        const href = `https://wa.me/${LB_CONTACT.waNumber}?text=${encodeURIComponent(text)}`;
        a.setAttribute("href", href);
        a.setAttribute("rel", "noopener");
        return;
      }

      if (type === "mail" || type === "email") {
        const subject = buildMailSubject(ctx);
        const body = buildMailBody(ctx);
        const href = `mailto:${LB_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        a.setAttribute("href", href);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Mobile Nav Toggle
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      navBtn.addEventListener("click", () => {
        const isOpen = nav.getAttribute("data-open") === "1";
        nav.setAttribute("data-open", isOpen ? "0" : "1");
        navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    }

    // Markiere aktiven Menüpunkt
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = window.location.pathname.replace(/index\.html$/, "");
    links.forEach((a) => {
      const raw = a.getAttribute("href") || "";
      const href = raw.replace(/index\.html$/, "");
      if (!href || href === "/") return;
      if (path.startsWith(href)) a.setAttribute("aria-current", "page");
    });

    // CTA Autofill (Kontaktseite)
    const ctx = getQueryContext();
    applyCtasFromContext(ctx);
  });
})();
