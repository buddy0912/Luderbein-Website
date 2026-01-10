DATEI: /assets/auto-feeds.js

// =========================================================
// Luderbein Auto-Feeds v1.0
// Lädt /assets/<kategorie>/manifest.json und rendert Bilder.
// =========================================================
(function () {
  "use strict";

  async function loadJSON(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("Fetch failed: " + res.status);
    return res.json();
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k.startsWith("data-")) node.setAttribute(k, v);
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(c));
    return node;
  }

  function renderGallery(container, items, opts) {
    const limit = opts.limit;
    const use = opts.use; // "src" | "thumb"
    const cls = opts.itemClass;

    const frag = document.createDocumentFragment();
    items.slice(0, limit).forEach((it) => {
      const imgSrc = use === "thumb" ? (it.thumb || it.src) : it.src;

      const img = el("img", {
        src: imgSrc,
        alt: it.alt || "",
        loading: "lazy",
        decoding: "async",
      });

      // Minimal, kompatibel mit deinem bestehenden Grid-Stil:
      // Wenn Container bereits .products ist, passt das optisch.
      const card = el("article", { class: cls }, [
        el("div", { class: "thumb", style: "aspect-ratio:1/1; position:relative; overflow:hidden;" }, [img]),
      ]);

      frag.appendChild(card);
    });

    container.innerHTML = "";
    container.appendChild(frag);
  }

  function parseOpts(container) {
    const limit = parseInt(container.getAttribute("data-feed-limit") || "12", 10);
    const use = (container.getAttribute("data-feed-use") || "src").toLowerCase(); // src|thumb
    const mode = (container.getAttribute("data-feed-mode") || "gallery").toLowerCase(); // gallery
    const itemClass = container.getAttribute("data-feed-item-class") || "productcard";
    return { limit: Number.isFinite(limit) ? limit : 12, use, mode, itemClass };
  }

  async function init() {
    const nodes = document.querySelectorAll("[data-feed]");
    if (!nodes.length) return;

    for (const node of nodes) {
      const url = node.getAttribute("data-feed");
      if (!url) continue;

      const opts = parseOpts(node);

      try {
        const items = await loadJSON(url);
        if (!Array.isArray(items) || !items.length) continue;

        // Default: wir rendern als Karten in ein Grid.
        // Tipp: gib dem Container class="products", dann sieht's wie der Rest aus.
        renderGallery(node, items, opts);
      } catch (e) {
        // Fail silently: Seite bleibt benutzbar, nur Feed wird nicht ersetzt.
        console.warn("[auto-feeds] could not load", url, e);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
