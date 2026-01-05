/* --------------------------------------------------------------------------
 * METALL – Eloxierte Alu-Visitenkarten (Gravur)
 * Regeln:
 * - Mindestmenge: 1 Stück
 * - Basis: 1-seitig graviert
 * - 2-seitig = Upgrade (Aufpreis pro Stück nach Staffel)
 * - Farben: Schwarz/Rot/Grün/Blau (ohne Aufpreis) | “Bunt gemischt” = Upgrade (einmalig)
 * - 1 Design pro Auftrag (alle Karten gleich)
 * -------------------------------------------------------------------------- */

(function () {
  const PR = (window.LUDERBEIN_PRICING = window.LUDERBEIN_PRICING || {});
  PR.products = PR.products || {};
  PR.products.metall = PR.products.metall || {};
  PR.products.metall.variants = PR.products.metall.variants || {};

  PR.products.metall.variants["alu_visitenkarten_eloxiert"] = {
    label: "Eloxierte Alu-Visitenkarten",
    note: "Basis: 1-seitig graviert (1 Design pro Auftrag). Farben: Schwarz/Rot/Grün/Blau. Bunt gemischt optional.",
    rules: "Mindestmenge 1 · 1 Design pro Auftrag · fertiges Logo (SVG/PDF/PNG/JPG) 1-farbig",
    minQty: 1,

    // Staffelpreise (Basis: 1-seitig)
    tiers: [
      { min: 1,   max: 4,    price: 7.95 },
      { min: 5,   max: 9,    price: 6.49 },
      { min: 10,  max: 24,   price: 5.95 },
      { min: 25,  max: 49,   price: 4.95 },
      { min: 50,  max: 99,   price: 3.95 },
      { min: 100, max: 249,  price: 3.29 },
      { min: 250, max: null, price: null, note: "Auf Anfrage" }
    ],

    // UI-Optionen
    options: {
      colors: [
        { id: "schwarz",       label: "Schwarz" },
        { id: "rot",           label: "Rot" },
        { id: "gruen",         label: "Grün" },
        { id: "blau",          label: "Blau" },
        { id: "bunt_gemischt", label: "Bunt gemischt" }
      ],
      engraving: [
        { id: "einseitig", label: "1-seitig (Standard)" },
        { id: "beidseitig", label: "2-seitig (Upgrade)" }
      ]
    },

    // Upgrades
    upgrades: {
      double_sided: {
        label: "2-seitig graviert",
        type: "per_unit_tiered",
        description: "Aufpreis pro Stück für Rückseite.",
        tiers: [
          { min: 1,   max: 4,    price: 3.49 },
          { min: 5,   max: 9,    price: 2.95 },
          { min: 10,  max: 24,   price: 2.49 },
          { min: 25,  max: 49,   price: 2.29 },
          { min: 50,  max: 99,   price: 1.95 },
          { min: 100, max: 249,  price: 1.45 },
          { min: 250, max: null, price: null, note: "Auf Anfrage" }
        ]
      },

      mixed_colors: {
        label: "Farbmix (bunt gemischt)",
        type: "one_time",
        description: "Einmaliger Zuschlag für Sortier-/Handlingaufwand.",
        once: 4.95,
        appliesWhen: { option: "colors", equals: "bunt_gemischt" }
      }
    }
  };
})();
