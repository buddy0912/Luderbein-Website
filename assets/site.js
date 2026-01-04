// =========================================================
// Luderbein Site Core v1.4 (patched)
// - Navigation Toggle (Mobile)
// - Active Menu Marker
// - Kontakt: Anfrage-Builder (CTA-Autofill + Click-Flow)
// - PATCH: Prefill-Aliase (z.B. ?p=Acryl-Schilder -> Acryl)
// - PATCH: NAV-SAFETY (Top-Navigation + Leistungen-Dropdown absichern)
// =========================================================
(function () {
  "use strict";

  // Guard: verhindert Doppel-Init (z.B. durch Fallback im HTML)
  if (window.__lbSiteCoreLoaded) return;
  window.__lbSiteCoreLoaded = true;

  document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------
    // NAV: Burger Toggle
    // ---------------------------------
    const navBtn = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navBtn && nav) {
      navBtn.addEventListener("click", () => {
        const isOpen = nav.getAttribute("data-open") === "1";
        nav.setAttribute("data-open", isOpen ? "0" : "1");
        navBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    }

    // ---------------------------------
    // NAV: Safety-Net (Links & Reihenfolge)
    // -> verhindert "Acryl fehlt" usw.
    // ---------------------------------
    initNavSafety();

    // ---------------------------------
    // NAV: aktiven Menüpunkt markieren
    // ---------------------------------
    const links = document.querySelectorAll("nav.menu a[href]");
    const path = window.location.pathname.replace(/index\.html$/, "");
    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/index\.html$/, "");
      if (!href || href === "/") return;
      if (path.startsWith(href)) a.setAttribute("aria-current", "page");
    });

    // ---------------------------------
    // KONTAKT: Anfrage-Builder
    // ---------------------------------
    initContactRequestBuilder();
  });

  // =========================================================
  // NAV – Safety: Top-Links + Leistungen Dropdown absichern
  // =========================================================
  function initNavSafety() {
    const navs = Array.from(document.querySelectorAll("nav.menu"));
    if (!navs.length) return;

    navs.forEach((nav) => {
      // 1) Top-Navigation absichern (Start, Leistungen, Über, Kontakt, Impressum)
      normalizeTopNav(nav);

      // 2) Leistungen Panel absichern (Schiefer/Metall/Holz/Acryl/Custom + Kalkulator/Downloads)
      normalizeLeistungenPanel(nav);
    });

    // ----------------------------
    // Helpers
    // ----------------------------
    function canonicalHref(raw) {
      const h = (raw || "").toString().trim();
      if (!h) return "";
      if (h.startsWith("#")) return h;

      try {
        const u = new URL(h, window.location.origin);
        let p = (u.pathname || "").replace(/index\.html$/, "");
        const hasExt = /\.[a-z0-9]+$/i.test(p);

        if (p === "") p = "/";
        // trailing slash nur für "Ordnerpfade"
        if (!hasExt && p !== "/" && !p.endsWith("/")) p += "/";

        return p + (u.search || "");
      } catch {
        // Fallback: Original
        return h;
      }
    }

    function findLinkIn(container, href) {
      const target = canonicalHref(href);
      const as = Array.from(container.querySelectorAll('a[href]'));
      return as.find((a) => canonicalHref(a.getAttribute("href")) === target) || null;
    }

    function createLink(text, href) {
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = text;
      return a;
    }

    function normalizeTopNav(nav) {
      // vorhandene Knoten abgreifen
      const start = findLinkIn(nav, "/") || createLink("Start", "/");

      // Leistungen: bevorzugt Dropdown-Block, sonst Link /leistungen/
      const drop = nav.querySelector(".navdrop");
      const leistungen =
        drop ||
        findLinkIn(nav, "/leistungen/") ||
        createLink("Leistungen", "/leistungen/");

      const ueber = findLinkIn(nav, "/ueber/") || createLink("Über", "/ueber/");
      const kontakt =
        findLinkIn(nav, "/kontakt/") || createLink("Kontakt", "/kontakt/");
      const impressum =
        findLinkIn(nav, "/rechtliches/impressum.html") ||
        createLink("Impressum", "/rechtliches/impressum.html");

      // gewünschte Reihenfolge: Start, Leistungen, Über, Kontakt, Impressum
      const keep = new Set([start, leistungen, ueber, kontakt, impressum]);

      // alles andere am Ende behalten (z.B. zusätzliche Links)
      const extras = Array.from(nav.childNodes).filter((n) => !keep.has(n));

      // Re-Order ohne Duplikate (falls z.B. Start mehrfach drin war)
      const frag = document.createDocumentFragment();
      frag.appendChild(start);
      frag.appendChild(leistungen);
      frag.appendChild(ueber);
      frag.appendChild(kontakt);
      frag.appendChild(impressum);

      extras.forEach((n) => frag.appendChild(n));
      nav.innerHTML = "";
      nav.appendChild(frag);
    }

    function normalizeLeistungenPanel(nav) {
      const drop = nav.querySelector(".navdrop");
      if (!drop) return; // wenn kein Dropdown existiert, nix erzwingen

      const panel = drop.querySelector(".navdrop__panel");
      if (!panel) return;

      // Soll-Struktur
      const SPEC = [
        { type: "a", href: "/leistungen/schiefer/", text: "Schiefer" },
        { type: "a", href: "/leistungen/metall/", text: "Metall" },
        { type: "a", href: "/leistungen/holz/", text: "Holz" },
        { type: "a", href: "/leistungen/acryl/", text: "Acryl" },
        { type: "a", href: "/kontakt/?p=Custom", text: "Custom" },
        { type: "sep" },
        { type: "a", href: "/tools/kalkulator/", text: "Kalkulator" },
        { type: "a", href: "/service/", text: "Downloads" },
      ];

      // vorhandene Links einsammeln + Duplikate killen (nach canonical href)
      const existingAnchors = Array.from(panel.querySelectorAll('a[href]'));
      const firstByHref = new Map();
      const dupes = [];

      existingAnchors.forEach((a) => {
        const key = canonicalHref(a.getAttribute("href"));
        if (!key) return;
        if (!firstByHref.has(key)) firstByHref.set(key, a);
        else dupes.push(a);
      });

      // Duplikate entfernen
      dupes.forEach((a) => a.remove());

      // Separator: wenn einer existiert, den ersten nehmen
      let existingSep = panel.querySelector(".navdrop__sep");
      if (existingSep) {
        // falls mehrere: alle bis auf ersten löschen
        const seps = Array.from(panel.querySelectorAll(".navdrop__sep"));
        seps.slice(1).forEach((s) => s.remove());
        existingSep = seps[0];
      }

      // neue Reihenfolge bauen, vorhandene wiederverwenden
      const used = new Set();
      const ordered = [];

      SPEC.forEach((item) => {
        if (item.type === "sep") {
          const sep = existingSep || document.createElement("div");
          sep.className = "navdrop__sep";
          sep.setAttribute("aria-hidden", "true");
          ordered.push(sep);
          used.add(sep);
          existingSep = sep;
          return;
        }

        const key = canonicalHref(item.href);
        let a = firstByHref.get(key);

        if (!a) {
          a = createLink(item.text, item.href);
          a.setAttribute("role", "menuitem");
        } else {
          // role absichern (ohne Text umzuschreiben)
          if (!a.getAttribute("role")) a.setAttribute("role", "menuitem");
        }

        ordered.push(a);
        used.add(a);
      });

      // extras (nicht in SPEC) hinten dran lassen
      const extras = Array.from(panel.childNodes).filter((n) => !used.has(n));

      // panel rebuild
      const frag = document.createDocumentFragment();
      ordered.forEach((n) => frag.appendChild(n));
      extras.forEach((n) => frag.appendChild(n));

      panel.innerHTML = "";
      panel.appendChild(frag);

      // Panel-Rolle absichern
      if (!panel.getAttribute("role")) panel.setAttribute("role", "menu");
    }
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

      // ✅ Acryl (wie im HTML value="Acryl")
      Acryl: {
        variants: [{ value: "Allgemein", label: "Allgemein" }],
        formats: [{ value: "custom", label: "Nach Maß" }],
      },

      // ✅ Alias bleibt drin (für interne Kompatibilität), wird aber über resolveMaterialName() sauber gemappt
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

    // Note prefill
    if (els.note && preNote) els.note.value = preNote;

    // Chip-Styles (ohne :has) – kompatibel
    function updateChipClasses() {
      els.mats.forEach((r) => {
        const lab = r.closest(".chip");
        if (lab) lab.classList.toggle("is-on", !!r.checked);
      });
    }

    // Material preselect (wenn bekannt)
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

    // Listener
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

    // Initial render
    updateChipClasses();
    updateLinks();

    // ---------------------------------
    // Helpers
    // ---------------------------------
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

    function buildTitle(material, variant, format) {
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

      const title = material ? buildTitle(material, variant, format) : "";

      if (els.summary) {
        els.summary.textContent = title ? title : "Bitte Material wählen.";
      }

      setCtaEnabled(!!material);

      if (!material) {
        els.wa.setAttribute("href", "#");
        els.mail.setAttribute("href", "#");
        return;
      }

      const waText = buildWhatsAppText(title, format, note);
      const waHref = "https://wa.me/491725925858?text=" + encodeURIComponent(waText);

      const mailSubject = "Anfrage – " + title;
      const mailBody = buildMailBody(title, format, note);
      const mailHref =
        "mailto:luderbein_gravur@icloud.com" +
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

    function buildWhatsAppText(title, format, note) {
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

    function buildMailBody(title, format, note) {
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
})();
