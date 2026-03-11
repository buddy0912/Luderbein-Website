// =========================================================
// Luderbein Site Core v1.8
// - Mobile Nav Toggle
// - Active Nav Link
// - NAV-SAFETY (Dropdown-Links siteweit reparieren)
// - Kontakt: Anfrage-Builder
// - CTA Autofill (WhatsApp + Mail)
// - Landingpage Banner
// - Scroll Indicator
// - Modal Cards
// - Cloudflare Web Analytics (idle-load, safe)
// =========================================================
(function () {
  "use strict";

  // Guard: verhindert Doppel-Init (z.B. durch Fallback im HTML)
  if (window.__lbSiteCoreLoaded) return;
  window.__lbSiteCoreLoaded = true;

  // ---------------------------------
  // Kontakt/CTA: zentrale Kontaktdaten
  // ---------------------------------
  const LB_CONTACT = {
    waNumber: "491725925858",
    email: "luderbein_gravur@icloud.com",
  };

  // ---------------------------------
  // Analytics: Cloudflare Web Analytics Token (public)
  // ---------------------------------
  const CF_WEB_ANALYTICS_TOKEN = "0dfffdc44a97468d9f46712e66c46119";

  function setHeaderHeight() {
    const h = document.querySelector("header");
    if (!h) return;
    const px = Math.ceil(h.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-h", px + "px");
  }

  window.addEventListener("DOMContentLoaded", setHeaderHeight, { once: true });
  window.addEventListener("resize", setHeaderHeight);
  setHeaderHeight();

  document.addEventListener("click", function (e) {
    const card = e.target.closest("[data-href]");
    if (!card) return;
    if (e.target.closest("a,button")) return;
    const href = card.getAttribute("data-href");
    if (!href) return;
    window.location.href = href;
  });

  function loadCloudflareWebAnalytics(token) {
    try {
      if (!token || typeof token !== "string" || token.trim().length < 10) return;

      // nicht doppelt laden (falls Snippet in HTML steckt)
      if (document.querySelector('script[src*="static.cloudflareinsights.com/beacon.min.js"]')) return;

      const s = document.createElement("script");
      s.defer = true;
      s.src = "https://static.cloudflareinsights.com/beacon.min.js";
      s.setAttribute("data-cf-beacon", JSON.stringify({ token: token.trim() }));
      document.head.appendChild(s);
    } catch (_) {
      // Analytics darf niemals die Seite brechen → still fail
    }
  }

  // ---------------------------------
  // CTA Autofill (siteweit): a[data-lb-cta]
  // ---------------------------------
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

      // allow legacy split also on per-link overrides
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

  // ---------------------------------
  // Landing Banner
  // ---------------------------------
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

  // ---------------------------------
  // Scroll Indicator
  // ---------------------------------
  function initScrollIndicator() {
    if (document.querySelector(".scroll-indicator")) return;

    const indicator = document.createElement("div");
    indicator.className = "scroll-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.innerHTML = `
      <div class="scroll-indicator__track"></div>
      <div class="scroll-indicator__dot"></div>
    `;
    document.body.appendChild(indicator);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;
    let pulseTimer = null;

    function update() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      const clamped = Math.max(0, Math.min(1, progress));
      indicator.style.setProperty("--scrollP", clamped);
      if (!prefersReducedMotion.matches) {
        indicator.classList.add("is-scrolling");
        if (pulseTimer) window.clearTimeout(pulseTimer);
        pulseTimer = window.setTimeout(() => {
          indicator.classList.remove("is-scrolling");
        }, 140);
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  // ---------------------------------
  // Stencil Watermarks
  // ---------------------------------
  function ensureWatermark(container, sizeClass) {
    if (!container || container.querySelector(".lb-wm")) return null;
    container.classList.add("has-wm");
    const wm = document.createElement("span");
    wm.className = `lb-wm ${sizeClass || "lb-wm--sm"}`.trim();
    wm.setAttribute("aria-hidden", "true");
    return wm;
  }

  function attachWatermark(wrapper, anchorImg, sizeClass) {
    const wm = ensureWatermark(wrapper, sizeClass);
    if (!wm) return;
    if (anchorImg && anchorImg.parentElement === wrapper) {
      anchorImg.insertAdjacentElement("afterend", wm);
    } else {
      wrapper.appendChild(wm);
    }
  }

  function wrapImageForOverlay(img, panel) {
    const wrapper = document.createElement("div");
    wrapper.className = "has-wm";
    panel.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    return wrapper;
  }

  function initImageWatermarks() {
    const seen = new Set();
    const imgNodes = document.querySelectorAll("main img, .lb-modal__img, .lightbox__img");

    imgNodes.forEach((img) => {
      if (!img || img.classList.contains("brand-mark")) return;
      if (img.closest("header")) return;
      const modalPanel = img.closest(".lb-modal__panel");
      const lightboxPanel = img.closest(".lightbox__panel");
      if (modalPanel || lightboxPanel) {
        const panel = modalPanel || lightboxPanel;
        let wrapper = img.parentElement?.classList.contains("has-wm") ? img.parentElement : null;
        if (!wrapper || wrapper === panel) {
          wrapper = wrapImageForOverlay(img, panel);
        }
        if (seen.has(wrapper)) return;
        seen.add(wrapper);
        attachWatermark(wrapper, img, "lb-wm--lg");
        return;
      }
    });
  }

  // ---------------------------------
  // Modal Cards
  // ---------------------------------
  function initModalCards() {
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
    let lastActive = null;
    let autoOpenedCard = null;

    function buildContactUrl(product, variant, format) {
      const params = new URLSearchParams();
      if (product) params.set("p", product);
      if (variant) params.set("v", variant);
      if (format) params.set("f", format);
      const qs = params.toString();
      return qs ? `/kontakt/?${qs}` : "/kontakt/";
    }

    function normalizeModalValue(value) {
      return normalizeSearchText(value || "");
    }

    function updateModalQuery(card) {
      if (!card || !window.history || typeof window.history.replaceState !== "function") return;

      const nextUrl = new URL(window.location.href);
      const product = card.getAttribute("data-modal-product") || "";
      const variant = card.getAttribute("data-modal-variant") || card.getAttribute("data-modal-title") || "";

      if (product) nextUrl.searchParams.set("lb-modal-product", product);
      if (variant) nextUrl.searchParams.set("lb-modal-variant", variant);

      window.history.replaceState({}, "", nextUrl.pathname + nextUrl.search + nextUrl.hash);
    }

    function clearModalQuery() {
      if (!window.history || typeof window.history.replaceState !== "function") return;

      const nextUrl = new URL(window.location.href);
      const hadParams =
        nextUrl.searchParams.has("lb-modal-product") ||
        nextUrl.searchParams.has("lb-modal-variant");

      if (!hadParams) return;

      nextUrl.searchParams.delete("lb-modal-product");
      nextUrl.searchParams.delete("lb-modal-variant");
      window.history.replaceState({}, "", nextUrl.pathname + nextUrl.search + nextUrl.hash);
    }

    function openModal(card, options) {
      const opts = options || {};
      lastActive = card || document.activeElement;
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
      if (!opts.skipUrlSync) updateModalQuery(card);
      modal.querySelector("[data-lb-modal-close]")?.focus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      clearModalQuery();
      if (lastActive && typeof lastActive.focus === "function") {
        lastActive.focus();
      }
      lastActive = null;
    }

    function findModalCardFromQuery() {
      const params = new URLSearchParams(window.location.search || "");
      const targetProduct = normalizeModalValue(params.get("lb-modal-product"));
      const targetVariant = normalizeModalValue(params.get("lb-modal-variant"));
      if (!targetProduct && !targetVariant) return null;

      const cards = Array.from(document.querySelectorAll("[data-lb-modal-card]"));
      return cards.find((card) => {
        const product = normalizeModalValue(card.getAttribute("data-modal-product"));
        const variant = normalizeModalValue(card.getAttribute("data-modal-variant"));
        const title = normalizeModalValue(card.getAttribute("data-modal-title"));
        const productMatches = !targetProduct || product === targetProduct;
        const variantMatches = !targetVariant || variant === targetVariant || title === targetVariant;
        return productMatches && variantMatches;
      }) || null;
    }

    document.addEventListener("click", (e) => {
      const card = e.target.closest("[data-lb-modal-card]");
      if (card) {
        e.preventDefault();
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

    autoOpenedCard = findModalCardFromQuery();
    if (autoOpenedCard) {
      window.requestAnimationFrame(() => {
        autoOpenedCard.scrollIntoView({ block: "center", behavior: "auto" });
        openModal(autoOpenedCard, { skipUrlSync: true });
      });
    }
  }

  // =========================================================
  // NAV-SAFETY – fix outdated hrefs sitewide
  // =========================================================
  function navSafetyFixLinks() {
    // Zielpfade (einheitlich)
    const TARGET = {
      custom: "/leistungen/custom/",
      acryl: "/leistungen/acryl/",
      glas: "/leistungen/glas/",
      b2b: "/b2b/",
    };

    function normHref(h) {
      return (h || "").toString().trim();
    }

    const as = document.querySelectorAll("nav.menu a[href]");
    as.forEach((a) => {
      const raw = normHref(a.getAttribute("href"));
      if (!raw) return;
      const label = (a.textContent || "").toString().trim();

      // 1) Custom: alte Links -> neue Seite
      if (raw.startsWith("/kontakt/") && raw.includes("p=Custom")) {
        a.setAttribute("href", TARGET.custom);
        return;
      }
      if (raw.startsWith("/kontakt/") && raw.includes("p=Costum")) {
        a.setAttribute("href", TARGET.custom);
        return;
      }
      if (raw.startsWith("/leistungen/") && raw.toLowerCase().includes("/costum")) {
        a.setAttribute("href", TARGET.custom);
        return;
      }

      // 2) Acryl: alte URL-Variante -> neue Seite
      if (raw.startsWith("/leistungen/") && raw.toLowerCase().includes("/acryl-schilder")) {
        a.setAttribute("href", TARGET.acryl);
        return;
      }

      // 3) Glas: alte Anker -> neue Seite
      if (raw.startsWith("/leistungen/") && raw.includes("#glas")) {
        a.setAttribute("href", TARGET.glas);
        return;
      }

      // 3b) Glas: alter Label "Glas (kommt)" -> neue Seite + neues Label
      if (label.toLowerCase().startsWith("glas") && label.toLowerCase().includes("kommt")) {
        a.setAttribute("href", TARGET.glas);
        a.textContent = "Glas";
        return;
      }
    });

    // 4) Glas-Eintrag hinzufügen
    const panels = document.querySelectorAll(".navdrop__panel");
    panels.forEach((panel) => {
      if (panel.querySelector('[data-nav-glas]')) return;
      if (panel.querySelector(`a[href="${TARGET.glas}"]`)) return;

      const acrylLink = Array.from(panel.querySelectorAll('a[href]'))
        .find((link) => normHref(link.getAttribute("href")) === TARGET.acryl);

      const glas = document.createElement("a");
      glas.setAttribute("href", TARGET.glas);
      glas.setAttribute("role", "menuitem");
      glas.setAttribute("data-nav-glas", "1");
      glas.textContent = "Glas";

      if (acrylLink && acrylLink.parentNode) {
        acrylLink.parentNode.insertBefore(glas, acrylLink.nextSibling);
      } else {
        panel.appendChild(glas);
      }
    });

    // 5) B2B-Eintrag in allen Header-Menüs sicherstellen
    const menus = document.querySelectorAll("nav.menu");
    menus.forEach((menu) => {
      if (menu.querySelector(`:scope > a[href="${TARGET.b2b}"]`)) return;

      const topLevelLinks = Array.from(menu.children).filter((el) => el.tagName === "A");
      const ueberLink = topLevelLinks.find(
        (link) => normHref(link.getAttribute("href")) === "/ueber/"
      );

      const b2b = document.createElement("a");
      b2b.setAttribute("href", TARGET.b2b);
      b2b.textContent = "B2B";

      if (ueberLink) {
        menu.insertBefore(b2b, ueberLink);
      } else {
        menu.appendChild(b2b);
      }
    });
  }

  // =========================================================
  // Kontakt – Anfrage-Builder
  // =========================================================
  function initContactRequestBuilder() {
    const root = document.querySelector("[data-contact-config]");
    if (!root) return;

    const els = {
      steps: root.querySelector("[data-cfg-steps]"),
      mats: Array.from(root.querySelectorAll('input[name="cfg-mat"]')),
      variantSelect: root.querySelector("[data-cfg-variant]"),
      variantCustom: root.querySelector("[data-cfg-variant-custom]"),
      formatSelect: root.querySelector("[data-cfg-format]"),
      formatCustom: root.querySelector("[data-cfg-format-custom]"),
      note: root.querySelector("[data-cfg-note]"),
      wa: root.querySelector("[data-cfg-wa]"),
      mail: root.querySelector("[data-cfg-mail]"),
      summary: root.querySelector("[data-cfg-summary]"),
    };

    if (!els.mats.length || !els.wa || !els.mail) return;

    const MAT_ALIAS = {
      "Acryl-Schilder": "Acryl",
      "Acrylschilder": "Acryl",
      "Acryl_Schilder": "Acryl",
      "Acryl Schilder": "Acryl",
    };

    function resolveMaterialName(m) {
      const t = safeText(m);
      if (!t) return "";
      return MAT_ALIAS[t] || t;
    }

    const DATA = {
      Schiefer: {
        variants: [
          { value: "Fotogravur", label: "Fotogravur" },
          { value: "Text & Symbole", label: "Text & Symbole" },
          { value: "Gedenktafel", label: "Gedenktafel" },
        ],
        formats: [
          { value: "10x10", label: "10×10 cm (eckig)" },
          { value: "10r", label: "10 cm (rund)" },
          { value: "20x20", label: "20×20 cm (eckig)" },
          { value: "20r", label: "20 cm (rund)" },
          { value: "25x25", label: "25×25 cm (eckig)" },
          { value: "30r", label: "30 cm (rund)" },
          { value: "38x13", label: "38×13 cm" },
          { value: "45x30", label: "45×30 cm" },
          { value: "custom", label: "Andere Größe (nach Maß)" },
        ],
      },
      Metall: {
        variants: [{ value: "Allgemein", label: "Allgemein" }],
        formats: [{ value: "custom", label: "Nach Maß / Rohling" }],
      },
      Holz: {
        variants: [{ value: "Allgemein", label: "Allgemein" }],
        formats: [{ value: "custom", label: "Nach Maß" }],
      },
      Acryl: {
        variants: [{ value: "Allgemein", label: "Allgemein" }],
        formats: [{ value: "custom", label: "Nach Maß" }],
      },
      "Acryl-Schilder": {
        variants: [{ value: "Allgemein", label: "Allgemein" }],
        formats: [{ value: "custom", label: "Nach Maß" }],
      },
      Custom: {
        variants: [{ value: "Sonderwunsch", label: "Sonderwunsch" }],
        formats: [{ value: "custom", label: "Nach Maß" }],
      },
    };

    const params = new URLSearchParams(window.location.search);
    const preMatRaw = safeText(params.get("p"));
    const preMat = resolveMaterialName(preMatRaw);
    const preVar = safeText(params.get("v"));
    const preFmt = safeText(params.get("f"));
    const preNote = safeText(params.get("note"));

    if (els.note && preNote) els.note.value = preNote;

    function updateChipClasses() {
      els.mats.forEach((r) => {
        const lab = r.closest(".chip");
        if (lab) lab.classList.toggle("is-on", !!r.checked);
      });
    }

    if (preMat) {
      const hit = els.mats.find((i) => i.value === preMat);
      if (hit) {
        hit.checked = true;
        showSteps();
        populateVariantAndFormat(preMat);
        applyPrefillVariantFormat(preMat, preVar, preFmt);
        updateChipClasses();
      }
    }

    els.mats.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        showSteps();
        populateVariantAndFormat(radio.value);
        updateChipClasses();
        clearCustomFields();
        updateLinks();
      });
    });

    els.variantSelect?.addEventListener("change", () => {
      if (els.variantCustom) els.variantCustom.value = "";
      updateLinks();
    });
    els.variantCustom?.addEventListener("input", () => {
      if (els.variantSelect && els.variantCustom.value.trim()) els.variantSelect.value = "";
      updateLinks();
    });

    els.formatSelect?.addEventListener("change", () => {
      if (els.formatCustom) {
        if (els.formatSelect.value !== "custom") els.formatCustom.value = "";
      }
      updateLinks();
    });
    els.formatCustom?.addEventListener("input", () => {
      if (!els.formatSelect) return;
      if (els.formatCustom.value.trim()) els.formatSelect.value = "custom";
      updateLinks();
    });

    els.note?.addEventListener("input", updateLinks);

    updateChipClasses();
    updateLinks();

    function showSteps() {
      if (els.steps) els.steps.hidden = false;
    }

    function clearCustomFields() {
      if (els.variantCustom) els.variantCustom.value = "";
      if (els.formatCustom) els.formatCustom.value = "";
    }

    function populateVariantAndFormat(material) {
      const cfg = DATA[material];
      if (!cfg) return;

      if (els.variantSelect) {
        els.variantSelect.innerHTML = "";
        els.variantSelect.appendChild(new Option("— auswählen —", ""));
        cfg.variants.forEach((v) => els.variantSelect.appendChild(new Option(v.label, v.value)));
      }

      if (els.formatSelect) {
        els.formatSelect.innerHTML = "";
        els.formatSelect.appendChild(new Option("— auswählen —", ""));
        cfg.formats.forEach((f) => els.formatSelect.appendChild(new Option(f.label, f.value)));
      }
    }

    function applyPrefillVariantFormat(material, v, f) {
      const cfg = DATA[material];
      if (!cfg) return;

      if (v) {
        const variantHit = cfg.variants.find((x) => normalizeText(x.value) === normalizeText(v));
        if (variantHit && els.variantSelect) {
          els.variantSelect.value = variantHit.value;
          if (els.variantCustom) els.variantCustom.value = "";
        } else if (els.variantCustom) {
          els.variantCustom.value = v;
          if (els.variantSelect) els.variantSelect.value = "";
        }
      }

      if (f) {
        const fmtNorm = normalizeFormat(f);
        const fmtHit = cfg.formats.find((x) => normalizeFormat(x.value) === fmtNorm);
        if (fmtHit && els.formatSelect) {
          els.formatSelect.value = fmtHit.value;
          if (els.formatCustom) els.formatCustom.value = "";
          if (fmtHit.value === "custom" && els.formatCustom) els.formatCustom.value = f;
        } else {
          if (els.formatSelect) els.formatSelect.value = "custom";
          if (els.formatCustom) els.formatCustom.value = f;
        }
      }

      updateLinks();
    }

    function getSelectedMaterial() {
      const hit = els.mats.find((i) => i.checked);
      return hit ? hit.value : "";
    }

    function getVariantText(material) {
      const custom = els.variantCustom ? els.variantCustom.value.trim() : "";
      if (custom) return custom;

      const sel = els.variantSelect ? els.variantSelect.value : "";
      if (!sel) return "";

      if (material !== "Schiefer" && sel === "Allgemein") return "";
      return sel;
    }

    function getFormatText() {
      const sel = els.formatSelect ? els.formatSelect.value : "";
      const custom = els.formatCustom ? els.formatCustom.value.trim() : "";

      if (!sel && !custom) return "";

      if (els.formatSelect && sel && sel !== "custom") {
        const opt = els.formatSelect.selectedOptions && els.formatSelect.selectedOptions[0];
        return opt ? opt.textContent.trim() : sel;
      }

      if (custom) return custom;
      if (els.formatSelect) {
        const opt = els.formatSelect.selectedOptions && els.formatSelect.selectedOptions[0];
        return opt ? opt.textContent.trim() : "Nach Maß";
      }
      return "Nach Maß";
    }

    function buildTitleLocal(material, variant, format) {
      const parts = [];
      if (material) parts.push(material);
      if (variant) parts.push(variant);
      if (format) parts.push(format);
      return parts.join(" • ");
    }

    function updateLinks() {
      const material = getSelectedMaterial();
      const variant = material ? getVariantText(material) : "";
      const format = material ? getFormatText() : "";
      const note = els.note ? els.note.value.trim() : "";

      const title = material ? buildTitleLocal(material, variant, format) : "";

      if (els.summary) {
        els.summary.textContent = title ? title : "Bitte Material wählen.";
      }

      setCtaEnabled(!!material);

      if (!material) {
        els.wa.setAttribute("href", "#");
        els.mail.setAttribute("href", "#");
        return;
      }

      const waText = buildWhatsAppTextFromTitle(title, format, note);
      const waHref = "https://wa.me/" + LB_CONTACT.waNumber + "?text=" + encodeURIComponent(waText);

      const mailSubject = "Anfrage – " + title;
      const mailBody = buildMailBodyFromTitle(title, format, note);
      const mailHref =
        "mailto:" +
        LB_CONTACT.email +
        "?subject=" +
        encodeURIComponent(mailSubject) +
        "&body=" +
        encodeURIComponent(mailBody);

      els.wa.setAttribute("href", waHref);
      els.mail.setAttribute("href", mailHref);
      els.wa.setAttribute("rel", "noopener");
    }

    function setCtaEnabled(on) {
      [els.wa, els.mail].forEach((a) => {
        if (!a) return;
        a.setAttribute("aria-disabled", on ? "false" : "true");
        a.dataset.disabled = on ? "0" : "1";
        if (!on) a.setAttribute("tabindex", "-1");
        else a.removeAttribute("tabindex");
      });
    }

    function buildWhatsAppTextFromTitle(title, format, note) {
      const lines = [];
      lines.push("Hi Luderbein, ich möchte anfragen: " + title);
      lines.push("");
      lines.push("Kurzinfos:");
      lines.push("- Motiv/Text: ");
      lines.push("- Größe/Format: " + (format || ""));
      lines.push("- Deadline (optional): ");
      if (note) {
        lines.push("");
        lines.push("Notiz:");
        lines.push(note);
      }
      lines.push("");
      lines.push("Foto/Skizze schicke ich gleich mit.");
      return lines.join("\n");
    }

    function buildMailBodyFromTitle(title, format, note) {
      const lines = [];
      lines.push("Hi Luderbein,");
      lines.push("");
      lines.push("ich möchte folgendes anfragen:");
      lines.push("- Produkt/Variante: " + title);
      lines.push("- Größe/Format: " + (format || ""));
      lines.push("- Motiv/Text: ");
      lines.push("- Deadline (optional): ");
      if (note) {
        lines.push("");
        lines.push("Notiz:");
        lines.push(note);
      }
      lines.push("");
      lines.push("Anhang/Foto schicke ich mit.");
      lines.push("");
      lines.push("Danke!");
      return lines.join("\n");
    }

    function safeText(v) {
      return (v || "").toString().trim();
    }

    function normalizeText(s) {
      return (s || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    }

    function normalizeFormat(s) {
      return (s || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[×]/g, "x")
        .replace(/\s+/g, "")
        .replace(/cm/g, "");
    }
  }

  // =========================================================
  // B2B – Mailto sauber aufbereiten
  // =========================================================
  function initB2BMailForm() {
    const form = document.querySelector("[data-b2b-mail-form]");
    if (!form) return;

    const fields = {
      name: form.querySelector("#b2b-name"),
      email: form.querySelector("#b2b-email"),
      company: form.querySelector("#b2b-company"),
      quantity: form.querySelector("#b2b-quantity"),
      material: form.querySelector("#b2b-material"),
      file: form.querySelector("#b2b-file"),
      deadline: form.querySelector("#b2b-deadline"),
      application: form.querySelector("#b2b-application"),
      details: form.querySelector("#b2b-details"),
    };

    function cleanValue(value) {
      return (value || "")
        .toString()
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
    }

    function singleLineValue(value) {
      return cleanValue(value).replace(/\s+/g, " ");
    }

    function getFieldValue(input) {
      if (!input) return "";
      if (input.tagName === "SELECT") {
        return singleLineValue(input.value);
      }
      return cleanValue(input.value);
    }

    function formatFieldLine(label, value) {
      const cleaned = cleanValue(value);
      return `${label}: ${cleaned || "nicht angegeben"}`;
    }

    function buildSubject(company, material) {
      const parts = ["B2B-Anfrage"];
      if (company) parts.push(company);
      if (material) parts.push(material);
      return parts.join(" – ");
    }

    function buildBody(data) {
      const lines = [
        "Hallo Luderbein,",
        "",
        "ich habe eine Anfrage zu einem B2B-Projekt. Hier die ersten Infos:",
        "",
        formatFieldLine("Name", data.name),
        formatFieldLine("E-Mail", data.email),
        formatFieldLine("Unternehmen", data.company),
        formatFieldLine("Stückzahl", data.quantity),
        formatFieldLine("Material", data.material),
        formatFieldLine("Motiv oder Datei", data.file),
        formatFieldLine("Gewünschter Termin", data.deadline),
        formatFieldLine("Einsatz / Zweck", data.application),
        "Projektbeschreibung:",
        data.details || "nicht angegeben",
        "",
        "Ich freue mich auf Ihre Rückmeldung.",
        "Mit freundlichen Grüßen",
        data.name || "",
      ];

      return lines.join("\n").trim();
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        return;
      }

      const data = {
        name: getFieldValue(fields.name),
        email: singleLineValue(getFieldValue(fields.email)),
        company: singleLineValue(getFieldValue(fields.company)),
        quantity: singleLineValue(getFieldValue(fields.quantity)),
        material: singleLineValue(getFieldValue(fields.material)),
        file: singleLineValue(getFieldValue(fields.file)),
        deadline: singleLineValue(getFieldValue(fields.deadline)),
        application: singleLineValue(getFieldValue(fields.application)),
        details: getFieldValue(fields.details),
      };

      const subject = buildSubject(data.company, data.material);
      const body = buildBody(data);
      const href =
        `mailto:${LB_CONTACT.email}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      window.location.href = href;
    });
  }

  // ---------------------------------
  // LuderBot Chat Widget
  // ---------------------------------
  function initLuderBot() {
    if (document.getElementById("lb-chat-launcher")) return;

    const launcher = document.createElement("button");
    launcher.id = "lb-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "lb-chat");
    launcher.textContent = "LuderBot";

    const panel = document.createElement("section");
    panel.id = "lb-chat";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
      <div class="lb-chat-header">
        <div>
          <strong>LuderBot</strong>
          <span>Frag mich alles rund um Gravuren.</span>
        </div>
        <button type="button" class="lb-chat-close" aria-label="Chat schließen">×</button>
      </div>
      <div class="lb-chat-messages" role="log" aria-live="polite"></div>
      <form class="lb-chat-form">
        <div class="lb-chat-input">
          <textarea id="lb-chat-input" rows="2" placeholder="Deine Frage..." maxlength="1200" required></textarea>
          <button id="lb-chat-send" type="submit" disabled>Senden</button>
        </div>
        <label class="lb-chat-consent">
          <input type="checkbox" required />
          Ich stimme zu, dass meine Nachricht zur Verarbeitung an Cloudflare Workers AI übermittelt wird.
        </label>
        <div class="lb-chat-actions" hidden>
          <a class="lb-chat-action" data-action="wa" target="_blank" rel="noopener">WhatsApp übernehmen</a>
          <a class="lb-chat-action" data-action="mail">Mail übernehmen</a>
        </div>
      </form>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    const closeBtn = panel.querySelector(".lb-chat-close");
    const form = panel.querySelector(".lb-chat-form");
    const textarea = panel.querySelector("textarea");
    const sendBtn = panel.querySelector("button[type=\"submit\"]");
    const messages = panel.querySelector(".lb-chat-messages");
    const consent = panel.querySelector("input[type=\"checkbox\"]");
    const actions = panel.querySelector(".lb-chat-actions");
    const waBtn = panel.querySelector("[data-action=\"wa\"]");
    const mailBtn = panel.querySelector("[data-action=\"mail\"]");
    const chatMessages = [];
    let lastSuggestion = null;

    function shouldAutofocus() {
      return !(
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 480px)").matches
      );
    }

    function focusInput() {
      if (!shouldAutofocus()) return;
      try {
        textarea.focus({ preventScroll: true });
      } catch (_) {
        textarea.focus();
      }
    }

    function setOpen(isOpen) {
      panel.classList.toggle("is-open", isOpen);
      panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      launcher.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        focusInput();
      }
    }

    function escapeHtml(text) {
      return (text || "").replace(/[&<>"']/g, (char) => {
        switch (char) {
          case "&":
            return "&amp;";
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "\"":
            return "&quot;";
          case "'":
            return "&#39;";
          default:
            return char;
        }
      });
    }

    function linkifyText(text) {
      const escaped = escapeHtml(text);
      const pattern = /(https?:\/\/[^\s<]+|\/[A-Za-z0-9._~!$&'()*+,;=:@/%-]+)/g;
      return escaped.replace(pattern, (match) => {
        let url = match;
        let trailing = "";
        if (/[.,!?)]$/.test(url)) {
          trailing = url.slice(-1);
          url = url.slice(0, -1);
        }
        const isExternal = url.startsWith("http://") || url.startsWith("https://");
        const attrs = isExternal ? " target=\"_blank\" rel=\"noopener\"" : "";
        return `<a href=\"${url}\"${attrs}>${url}</a>${trailing}`;
      });
    }

    function addMessage(role, text) {
      const bubble = document.createElement("div");
      bubble.className = `lb-chat-msg ${role}`;
      if (role === "bot") {
        bubble.innerHTML = linkifyText(text);
      } else {
        bubble.textContent = text;
      }
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    }

    function setSuggestion(suggestion) {
      lastSuggestion = suggestion || null;
      const waText = lastSuggestion?.whatsappText || "";
      const mailBody = lastSuggestion?.mailBody || waText;
      if (!waText || !mailBody) {
        waBtn.removeAttribute("href");
        mailBtn.removeAttribute("href");
        actions.hidden = true;
        return;
      }
      const subject = lastSuggestion?.subject || "Anfrage via LuderBot";
      const waHref = `https://wa.me/${LB_CONTACT.waNumber}?text=${encodeURIComponent(waText)}`;
      const mailHref = `mailto:${LB_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
      waBtn.setAttribute("href", waHref);
      mailBtn.setAttribute("href", mailHref);
      actions.hidden = false;
    }

    function updateSendState() {
      const hasText = norm(textarea.value).length > 0;
      const canSend = hasText && consent.checked;
      sendBtn.disabled = !canSend;
    }

    function pushMessage(role, content) {
      chatMessages.push({ role, content });
      if (chatMessages.length > 16) chatMessages.splice(0, chatMessages.length - 16);
    }

    launcher.addEventListener("click", () => {
      setOpen(!panel.classList.contains("is-open"));
      updateSendState();
    });
    closeBtn.addEventListener("click", () => setOpen(false));
    textarea.addEventListener("input", updateSendState);
    consent.addEventListener("change", updateSendState);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const text = norm(textarea.value);
      if (!text) return;
      if (!consent.checked) {
        addMessage("system", "Bitte bestätige die Einwilligung, damit ich antworten darf.");
        updateSendState();
        return;
      }

      addMessage("user", text);
      pushMessage("user", text);
      textarea.value = "";
      updateSendState();
      setSuggestion(null);
      form.classList.add("is-loading");

      try {
        const outgoingMessages = chatMessages.slice(-16);
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, messages: outgoingMessages }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data && data.error) {
            addMessage("system", data.error);
          }
          return;
        }

        if (data && data.reply) {
          addMessage("bot", data.reply);
          pushMessage("assistant", data.reply);
          setSuggestion(data.suggestion);
        } else if (data && data.error) {
          addMessage("system", data.error);
        }
      } catch (_) {
        // no-op
      } finally {
        form.classList.remove("is-loading");
      }
    });
  }

  // =========================================================
  // Site Search
  // =========================================================
  function loadSearchIndex() {
    if (Array.isArray(window.__lbSearchIndex)) {
      return Promise.resolve(window.__lbSearchIndex);
    }

    if (window.__lbSearchIndexPromise) {
      return window.__lbSearchIndexPromise;
    }

    window.__lbSearchIndexPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/assets/search-index.js";
      script.async = true;
      script.onload = () => resolve(Array.isArray(window.__lbSearchIndex) ? window.__lbSearchIndex : []);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return window.__lbSearchIndexPromise;
  }

  function normalizeSearchText(value) {
    return norm(value)
      .toLowerCase()
      .replace(/ß/g, "ss")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " und ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function splitSearchTokens(value) {
    return normalizeSearchText(value)
      .split(/\s+/)
      .filter(Boolean);
  }

  function uniqueSearchTerms(values) {
    const seen = new Set();
    const result = [];

    values.forEach((value) => {
      const normalized = normalizeSearchText(value);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      result.push(normalized);
    });

    return result;
  }

  function preprocessSearchEntry(entry) {
    const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
    const imageTags = Array.isArray(entry.imageTags) ? entry.imageTags : [];
    const imageProjects = Array.isArray(entry.imageProjects) ? entry.imageProjects : [];
    const imageProjectTags = imageProjects.flatMap((project) => {
      const projectName = project && project.project ? [project.project] : [];
      const tags = Array.isArray(project?.tags) ? project.tags : [];
      return [...projectName, ...tags];
    });

    return {
      ...entry,
      _haystack: {
        title: normalizeSearchText(entry.title || ""),
        type: normalizeSearchText(entry.type || ""),
        section: normalizeSearchText(entry.section || ""),
        summary: normalizeSearchText(entry.summary || ""),
        content: normalizeSearchText(entry.content || ""),
        keywords: keywords.map(normalizeSearchText).join(" "),
        imageTags: imageTags.map(normalizeSearchText).join(" "),
        imageProjects: imageProjectTags.map(normalizeSearchText).join(" "),
      },
      _terms: uniqueSearchTerms([
        entry.title || "",
        entry.type || "",
        entry.section || "",
        entry.summary || "",
        entry.content || "",
        ...keywords,
        ...imageTags,
        ...imageProjectTags,
      ]),
    };
  }

  function scoreSearchEntry(entry, query, tokens) {
    if (!query) return null;

    const fields = [
      { value: entry._haystack.title, weight: 52 },
      { value: entry._haystack.keywords, weight: 40 },
      { value: entry._haystack.imageTags, weight: 34 },
      { value: entry._haystack.imageProjects, weight: 30 },
      { value: entry._haystack.section, weight: 28 },
      { value: entry._haystack.summary, weight: 18 },
      { value: entry._haystack.content, weight: 12 },
      { value: entry._haystack.type, weight: 10 },
    ];

    let score = 0;
    let matchedTokenCount = 0;

    fields.forEach((field) => {
      if (field.value && field.value.includes(query)) {
        score += field.weight * 2;
      }
    });

    tokens.forEach((token) => {
      let tokenMatched = false;

      fields.forEach((field) => {
        if (!field.value || !field.value.includes(token)) return;
        score += field.weight;
        tokenMatched = true;
      });

      if (tokenMatched) matchedTokenCount += 1;
    });

    const phraseMatched = fields.some((field) => field.value && field.value.includes(query));
    const minimumMatches = tokens.length >= 3 ? 2 : 1;

    if (!phraseMatched && matchedTokenCount < minimumMatches) {
      return null;
    }

    if (tokens.length > 1 && matchedTokenCount === tokens.length) {
      score += 36;
    }

    const matchedTags = [];
    [
      ...(entry.keywords || []),
      ...(entry.imageTags || []),
      ...((entry.imageProjects || []).flatMap((project) => Array.isArray(project?.tags) ? project.tags : [])),
    ].forEach((tag) => {
      const normalizedTag = normalizeSearchText(tag);
      if (!normalizedTag) return;
      if (tokens.some((token) => normalizedTag.includes(token) || token.includes(normalizedTag))) {
        if (!matchedTags.includes(tag)) matchedTags.push(tag);
      }
    });

    const matchedProjects = (entry.imageProjects || [])
      .filter((project) => {
        const projectTerms = [project?.project || "", ...((Array.isArray(project?.tags) ? project.tags : []))];
        return projectTerms.some((value) => {
          const normalized = normalizeSearchText(value);
          return normalized && tokens.some((token) => normalized.includes(token) || token.includes(normalized));
        });
      })
      .map((project) => project.project)
      .filter(Boolean)
      .slice(0, 2);

    return {
      ...entry,
      _score: score,
      _matchedTags: matchedTags.slice(0, 3),
      _matchedProjects: matchedProjects,
      _matchedTokenCount: matchedTokenCount,
    };
  }

  function buildSearchResultHref(entry) {
    const base = entry && entry.url ? entry.url : "/";
    if (!entry || !entry.modalTarget) return base;

    const url = new URL(base, window.location.origin);
    if (entry.modalTarget.product) {
      url.searchParams.set("lb-modal-product", entry.modalTarget.product);
    }
    if (entry.modalTarget.variant) {
      url.searchParams.set("lb-modal-variant", entry.modalTarget.variant);
    }

    return url.pathname + url.search + url.hash;
  }

  function initSiteSearch() {
    const nav = document.querySelector("header .nav");
    if (!nav || document.getElementById("lb-search-trigger")) return;

    loadSearchIndex()
      .then((rawIndex) => {
        const entries = Array.isArray(rawIndex) ? rawIndex.map(preprocessSearchEntry) : [];
        if (!entries.length) return;

        let quick = nav.querySelector(".nav-quick");
        if (!quick) {
          quick = document.createElement("div");
          quick.className = "nav-quick";
          const navToggle = nav.querySelector("[data-nav-toggle]");
          if (navToggle) {
            nav.insertBefore(quick, navToggle);
          } else {
            nav.appendChild(quick);
          }
        }

        const searchBtn = document.createElement("button");
        searchBtn.className = "lb-search-trigger";
        searchBtn.id = "lb-search-trigger";
        searchBtn.type = "button";
        searchBtn.setAttribute("aria-label", "Suche öffnen");
        searchBtn.setAttribute("title", "Suche");
        searchBtn.setAttribute("aria-haspopup", "dialog");
        searchBtn.setAttribute("aria-expanded", "false");
        searchBtn.setAttribute("aria-controls", "lb-search");
        searchBtn.innerHTML = `
          <span class="lb-search-trigger__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"></circle>
              <path d="M16 16L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
          </span>
        `;
        quick.appendChild(searchBtn);

        const overlay = document.createElement("section");
        overlay.className = "lb-search";
        overlay.id = "lb-search";
        overlay.setAttribute("aria-hidden", "true");
        overlay.innerHTML = `
          <div class="lb-search__backdrop" data-search-close></div>
          <div class="lb-search__panel" role="dialog" aria-modal="true" aria-labelledby="lb-search-title">
            <div class="lb-search__header">
              <div>
                <p class="lb-search__eyebrow">Site Search</p>
                <h2 id="lb-search-title">Was suchst du?</h2>
              </div>
              <button class="lb-search__close" type="button" data-search-close aria-label="Suche schließen">×</button>
            </div>

            <form class="lb-search__form" novalidate>
              <label class="lb-search__field">
                <span class="lb-search__field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"></circle>
                    <path d="M16 16L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                  </svg>
                </span>
                <input type="search" name="q" autocomplete="off" placeholder="z. B. Schiefer, Hundemarke, Gastronomie, Geschenk" />
              </label>
            </form>

            <p class="lb-search__meta">Sucht in Leistungen, Materialien, Produktarten, FAQ, B2B-Inhalten und Bild-Tags.</p>

            <div class="lb-search__chips" aria-label="Beliebte Suchbegriffe">
              <button type="button" class="lb-search-chip" data-search-chip="Schiefer">Schiefer</button>
              <button type="button" class="lb-search-chip" data-search-chip="Metall">Metall</button>
              <button type="button" class="lb-search-chip" data-search-chip="Hundemarke">Hundemarke</button>
              <button type="button" class="lb-search-chip" data-search-chip="Glas">Glas</button>
              <button type="button" class="lb-search-chip" data-search-chip="B2B">B2B</button>
              <button type="button" class="lb-search-chip" data-search-chip="Gastronomie">Gastronomie</button>
              <button type="button" class="lb-search-chip" data-search-chip="Gravur">Gravur</button>
              <button type="button" class="lb-search-chip" data-search-chip="Geschenk">Geschenk</button>
              <button type="button" class="lb-search-chip" data-search-chip="Schwibbogen">Schwibbogen</button>
            </div>

            <div class="lb-search__active" data-search-active hidden></div>
            <div class="lb-search__results" data-search-results></div>
          </div>
        `;

        document.body.appendChild(overlay);

        const trigger = quick.querySelector(".lb-search-trigger");
        const input = overlay.querySelector("input[type='search']");
        const results = overlay.querySelector("[data-search-results]");
        const active = overlay.querySelector("[data-search-active]");
        const closeNodes = overlay.querySelectorAll("[data-search-close]");
        const chips = Array.from(overlay.querySelectorAll("[data-search-chip]"));

        function updateActiveChipState(rawValue) {
          const activeValue = normalizeSearchText(rawValue);
          chips.forEach((chip) => {
            const chipValue = normalizeSearchText(chip.getAttribute("data-search-chip") || "");
            const isActive = !!activeValue && chipValue === activeValue;
            chip.classList.toggle("is-active", isActive);
            chip.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
        }

        function buildPrimaryLabel(item) {
          return item.section || item.type || "Luderbein";
        }

        function buildSecondaryLabel(item) {
          return item.title || item.summary || "Treffer";
        }

        function renderResults(items, queryValue) {
          updateActiveChipState(queryValue);

          if (!queryValue) {
            active.hidden = true;
            active.innerHTML = "";
            results.innerHTML = `
              <div class="lb-search__state">
                <strong>Schnell starten</strong>
                <p>Suche nach Material, Produktart, FAQ oder B2B-Thema. Beispiele: Schiefer, Hundemarke, Gastronomie, Geschenk, Schwibbogen.</p>
              </div>
            `;
            return;
          }

          active.hidden = false;
          active.innerHTML = `
            <div class="lb-search__active-title">Suchergebnisse für <span>„${queryValue}“</span></div>
            <p class="lb-search__active-text">${items.length} anklickbare Treffer zur aktuellen Suche.</p>
          `;

          if (!items.length) {
            results.innerHTML = `
              <div class="lb-search__state">
                <strong>Keine passenden Treffer</strong>
                <p>Versuche einen Materialbegriff, eine Produktart oder einen einfacheren Suchbegriff wie Metall, Glas, B2B oder Gravur.</p>
              </div>
            `;
            return;
          }

          results.innerHTML = items
            .slice(0, 8)
            .map((item) => {
              const primary = buildPrimaryLabel(item);
              const secondary = buildSecondaryLabel(item);

              return `
                <a class="lb-search__result" href="${buildSearchResultHref(item)}">
                  <div class="lb-search__result-top">${primary}</div>
                  <strong>${secondary}</strong>
                  <span class="lb-search__result-cta">Jetzt öffnen</span>
                </a>
              `;
            })
            .join("");
        }

        function runSearch(rawValue) {
          const query = normalizeSearchText(rawValue);
          const tokens = splitSearchTokens(rawValue);
          if (!query) {
            renderResults([], "");
            return;
          }

          const ranked = entries
            .map((entry) => scoreSearchEntry(entry, query, tokens))
            .filter(Boolean)
            .sort((a, b) => {
              if (b._score !== a._score) return b._score - a._score;
              if (b._matchedTokenCount !== a._matchedTokenCount) return b._matchedTokenCount - a._matchedTokenCount;
              return a.title.localeCompare(b.title, "de");
            });

          renderResults(ranked, rawValue);
        }

        function setOpen(isOpen) {
          overlay.classList.toggle("is-open", isOpen);
          overlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
          trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
          document.body.classList.toggle("lb-search-open", isOpen);

          if (isOpen) {
            runSearch(input.value);
            window.requestAnimationFrame(() => {
              try {
                input.focus({ preventScroll: true });
              } catch (_) {
                input.focus();
              }
            });
          }
        }

        trigger.addEventListener("click", () => {
          setOpen(!overlay.classList.contains("is-open"));
        });

        closeNodes.forEach((node) => {
          node.addEventListener("click", () => setOpen(false));
        });

        overlay.addEventListener("click", (event) => {
          if (event.target.closest(".lb-search__result")) {
            setOpen(false);
          }
        });

        overlay.querySelectorAll("[data-search-chip]").forEach((chip) => {
          chip.addEventListener("click", () => {
            input.value = chip.getAttribute("data-search-chip") || "";
            runSearch(input.value);
            input.focus();
          });
        });

        overlay.querySelector(".lb-search__form").addEventListener("submit", (event) => {
          event.preventDefault();
          const firstResult = results.querySelector(".lb-search__result");
          if (firstResult) {
            firstResult.click();
          }
        });

        input.addEventListener("input", () => runSearch(input.value));

        document.addEventListener("keydown", (event) => {
          const target = event.target;
          const isTypingTarget =
            target &&
            (target.tagName === "INPUT" ||
              target.tagName === "TEXTAREA" ||
              target.isContentEditable);

          if (event.key === "Escape" && overlay.classList.contains("is-open")) {
            setOpen(false);
            return;
          }

          if (isTypingTarget) return;

          if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
            event.preventDefault();
            setOpen(true);
          }
        });

        renderResults([], "");
      })
      .catch(() => {
        // Search bleibt optional und darf die Seite nicht brechen.
      });
  }

  function initIdeaWallNavLink() {
    const nav = document.querySelector("header .nav");
    if (!nav || document.getElementById("lb-idea-wall-link")) return;

    let quick = nav.querySelector(".nav-quick");
    if (!quick) {
      quick = document.createElement("div");
      quick.className = "nav-quick";
      const navToggle = nav.querySelector("[data-nav-toggle]");
      if (navToggle) {
        nav.insertBefore(quick, navToggle);
      } else {
        nav.appendChild(quick);
      }
    }

    const link = document.createElement("a");
    link.className = "nav-symbol-link";
    link.id = "lb-idea-wall-link";
    link.href = "/ideenpinnwand/";
    link.setAttribute("aria-label", "Ideen- und Diskussionspinnwand");
    link.setAttribute("title", "Ideen- und Diskussionspinnwand");
    link.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="5.5" y="4.75" width="13" height="13" rx="1.8" stroke="currentColor" stroke-width="1.6"></rect>
        <path d="M8 8.25H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
        <path d="M8 12H14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
        <path d="M9 4.75V2.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
        <path d="M15 4.75V2.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
        <path d="M12 17.75V21.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
        <path d="M9.5 21.25H14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
      </svg>
    `;

    const path = window.location.pathname.replace(/index\.html$/, "");
    if (path.startsWith("/ideenpinnwand/")) {
      link.setAttribute("aria-current", "page");
    }

    quick.insertBefore(link, quick.firstChild);
  }

  // ---------------------------------
  // DOM Ready
  // ---------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // NAV: Burger Toggle
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      const closeNav = () => {
        nav.setAttribute("data-open", "0");
        navBtn.setAttribute("aria-expanded", "false");
      };

      const openNav = () => {
        nav.setAttribute("data-open", "1");
        navBtn.setAttribute("aria-expanded", "true");
      };

      navBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = nav.getAttribute("data-open") === "1";
        if (isOpen) closeNav();
        else openNav();
      });

      document.addEventListener("click", (event) => {
        const isOpen = nav.getAttribute("data-open") === "1";
        if (!isOpen) return;

        if (nav.contains(event.target)) return;
        if (navBtn.contains(event.target)) return;

        closeNav();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeNav();
        }
      });

      nav.querySelectorAll("a[href]").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.matchMedia("(max-width: 480px)").matches) {
            closeNav();
          }
        });
      });

      window.addEventListener("resize", () => {
        if (!window.matchMedia("(max-width: 480px)").matches) {
          closeNav();
        }
      });
    }

    // NAV-SAFETY (Dropdown-Links fix)
    navSafetyFixLinks();

    // NAV: aktiven Menüpunkt markieren
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = window.location.pathname.replace(/index\.html$/, "");
    links.forEach((a) => {
      const raw = a.getAttribute("href") || "";
      const href = raw.replace(/index\.html$/, "");
      if (!href || href === "/") return;
      if (path.startsWith(href)) a.setAttribute("aria-current", "page");
    });

    initIdeaWallNavLink();

    // CTA Autofill (a[data-lb-cta])
    const ctx = getQueryContext();
    applyCtasFromContext(ctx);

    // Kontakt: Anfrage-Builder
    initContactRequestBuilder();
    initB2BMailForm();

    // Landing Banner / Scroll Indicator / Modal Cards
    initBanner();
    initScrollIndicator();
    initModalCards();
    initImageWatermarks();
    initSiteSearch();
    // initChatWidget wird absichtlich NICHT aufgerufen, um den Bot auszublenden.

    // Analytics: möglichst ruhig laden (bricht nie die Seite)
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => loadCloudflareWebAnalytics(CF_WEB_ANALYTICS_TOKEN));
    } else {
      setTimeout(() => loadCloudflareWebAnalytics(CF_WEB_ANALYTICS_TOKEN), 800);
    }
  });
})();
