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

  // ---------------------------------
  // Modal Cards
  // ---------------------------------
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

  // =========================================================
  // NAV-SAFETY – fix outdated hrefs sitewide
  // =========================================================
  function navSafetyFixLinks() {
    // Zielpfade (einheitlich)
    const TARGET = {
      custom: "/leistungen/custom/",
      acryl: "/leistungen/acryl/",
    };

    function normHref(h) {
      return (h || "").toString().trim();
    }

    const as = document.querySelectorAll("nav.menu a[href]");
    as.forEach((a) => {
      const raw = normHref(a.getAttribute("href"));
      if (!raw) return;

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

    // ---------------------------------
    // Prefill-Aliase (nur fürs URL-Handling)
    // ---------------------------------
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

    // --- Daten: nur das, was wir sicher wissen ---
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

    // ---------------------------------
    // URL Prefill (?p=...&v=...&f=...&note=...)
    // ---------------------------------
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

  // ---------------------------------
  // DOM Ready
  // ---------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // NAV: Burger Toggle
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      navBtn.addEventListener("click", () => {
        const isOpen = nav.getAttribute("data-open") === "1";
        nav.setAttribute("data-open", isOpen ? "0" : "1");
        navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
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

    // CTA Autofill (a[data-lb-cta])
    const ctx = getQueryContext();
    applyCtasFromContext(ctx);

    // Kontakt: Anfrage-Builder
    initContactRequestBuilder();

    // Landing Banner / Scroll Indicator / Modal Cards
    initBanner();
    initScrollIndicator();
    initModalCards();

    // Analytics: möglichst ruhig laden (bricht nie die Seite)
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => loadCloudflareWebAnalytics(CF_WEB_ANALYTICS_TOKEN));
    } else {
      setTimeout(() => loadCloudflareWebAnalytics(CF_WEB_ANALYTICS_TOKEN), 800);
    }
  });
})();
