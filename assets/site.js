// =========================================================
// Luderbein Site Core v1.7
// - Mobile Nav Toggle
// - Active Nav Link
// - CTA Autofill (WhatsApp + Mail)
// - Landingpage Banner
// - Scroll Indicator
// - Modal Cards
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

  // Split legacy: "Produkt – Variante" (nur wenn mit Leerzeichen um den Trenner)
  function splitLegacyProductVariant(product, variant) {
    const p = norm(product);
    const v = norm(variant);
    if (!p || v) return { product: p, variant: v };

    const seps = [" – ", " - ", " — "]; // en dash, hyphen, em dash (mit spaces)
    for (const sep of seps) {
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

    // legacy support
    const format = pickFirst(sp.get("f"), sp.get("format"), sp.get("size"));
    const note = pickFirst(sp.get("note"), sp.get("n"));

    // if p contains "Produkt – Variante" and v is empty => split
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
      let ctx = {
        product: pickFirst(a.getAttribute("data-product"), baseCtx.product),
        variant: pickFirst(a.getAttribute("data-variant"), baseCtx.variant),
        format: pickFirst(a.getAttribute("data-format"), baseCtx.format),
        note: pickFirst(a.getAttribute("data-note"), baseCtx.note),
      };

      // allow legacy split also on per-link overrides (falls jemand data-product="X – Y" setzt)
      const split = splitLegacyProductVariant(ctx.product, ctx.variant);
      ctx.product = split.product;
      ctx.variant = split.variant;

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

  function initBanner() {
    const banner = document.querySelector("[data-lb-banner]");
    if (!banner) return;

    const closeBtn = banner.querySelector("[data-banner-close]");
    const KEY = "lb_banner_dismissed_at";
    const TTL = 12 * 60 * 60 * 1000;
    let last = 0;

    try {
      last = parseInt(localStorage.getItem(KEY) || "0", 10);
    } catch (e) {
      last = 0;
    }

    const now = Date.now();
    if (now - last > TTL) banner.classList.add("is-visible");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        banner.classList.remove("is-visible");
        try {
          localStorage.setItem(KEY, String(Date.now()));
        } catch (e) {
          // ignore
        }
      });
    }
  }

  function initScrollIndicator() {
    if (document.querySelector(".scroll-indicator")) return;

    const indicator = document.createElement("div");
    indicator.className = "scroll-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.innerHTML = '<div class="scroll-indicator__thumb"></div>';
    document.body.appendChild(indicator);

    const thumb = indicator.querySelector(".scroll-indicator__thumb");

    function update() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      const travel = indicator.clientHeight - thumb.offsetHeight;
      const y = Math.max(0, Math.min(travel, travel * progress));
      thumb.style.transform = `translateY(${y}px)`;
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initModalCards() {
    const cards = document.querySelectorAll("[data-lb-modal-card]");
    if (!cards.length) return;

    let modal = document.querySelector(".lb-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "lb-modal";
      modal.innerHTML = `
        <div class="lb-modal__panel" role="dialog" aria-modal="true" aria-label="Detailansicht">
          <button class="lb-modal__close" type="button" data-lb-modal-close aria-label="Schließen">✕</button>
          <img class="lb-modal__img" alt="" />
          <h3 class="lb-modal__title"></h3>
          <p class="lb-modal__text"></p>
          <div class="cta">
            <a class="btn primary" data-lb-modal-cta href="/kontakt/">Mach mir ein Angebot</a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const modalImg = modal.querySelector(".lb-modal__img");
    const modalTitle = modal.querySelector(".lb-modal__title");
    const modalText = modal.querySelector(".lb-modal__text");
    const modalCta = modal.querySelector("[data-lb-modal-cta]");

    function buildContactUrl(product, variant, format) {
      const params = new URLSearchParams();
      if (product) params.set("p", product);
      if (variant) params.set("v", variant);
      if (format) params.set("f", format);
      const qs = params.toString();
      return qs ? `/kontakt/?${qs}` : "/kontakt/";
    }

    function openModal(card) {
      const img = card.getAttribute("data-modal-img");
      const alt = card.getAttribute("data-modal-alt") || "Detailbild";
      const title = card.getAttribute("data-modal-title") || card.querySelector("h3")?.textContent || "";
      const text = card.getAttribute("data-modal-text") || card.querySelector(".kicker")?.textContent || "";
      const product = card.getAttribute("data-modal-product");
      const variant = card.getAttribute("data-modal-variant");
      const format = card.getAttribute("data-modal-format");

      if (img) {
        modalImg.src = img;
        modalImg.alt = alt;
        modalImg.style.display = "block";
      } else {
        modalImg.src = "";
        modalImg.alt = "";
        modalImg.style.display = "none";
      }

      modalTitle.textContent = title;
      modalText.textContent = text;
      modalCta.setAttribute("href", buildContactUrl(product, variant, format));

      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", (e) => {
      const card = e.target.closest("[data-lb-modal-card]");
      if (card) {
        openModal(card);
        return;
      }

      if (e.target === modal || e.target.closest("[data-lb-modal-close]")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
      if ((e.key === "Enter" || e.key === " ") && document.activeElement?.matches("[data-lb-modal-card]")) {
        e.preventDefault();
        openModal(document.activeElement);
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

    initBanner();
    initScrollIndicator();
    initModalCards();
  });
})();
