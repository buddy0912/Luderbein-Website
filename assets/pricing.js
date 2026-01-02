/*
 * Luderbein Preisliste / Kalkulator – V1.3
 * Gültig ab: Januar 2026
 * Verwendung: /tools/kalkulator/
 */

window.LUDERBEIN_PRICING = {
  meta: {
    version: "1.3",
    updated: "01/2026",
    note: "Schieferpreise aktiv · Weitere Materialien bitte anfragen"
  },

  // === Versandregeln ===
  shipping: {
    enabled: true,
    basePrice: 5.90,             // Standard-Versandkosten
    minOrderForShipping: 29.95,  // Mindestbestellwert für Versand
    freeShippingFrom: 80.00      // Versandkostenfrei ab
  },

  // === PRODUKTE ===
  products: {

    // --- SCHIEFER (aktiv) ---
    schiefer: {
      label: "Schiefer",
      includes: "Versiegelung, Grunddesign, Verpackung",

      // Varianten
      variants: {
        fotogravur: {
          label: "Fotogravur / Widmung",
          note: "Ideal für Gedenktafeln, Bilder, Textgravuren.",
          formats: [
            { id: "s-10x10", label: "10×10 cm", price: 9.95 },
            { id: "s-15x15", label: "15×15 cm", price: 14.95 },
            { id: "s-20x15", label: "20×15 cm", price: 17.95 },
            { id: "s-25x20", label: "25×20 cm", price: 21.95 },
            { id: "s-30x20", label: "30×20 cm", price: 26.95 },
            { id: "s-30r",   label: "30 cm rund", price: 28.95 }
          ]
        },

        gedenktafeln: {
          label: "Gedenktafeln / Memorial",
          note: "Mit oder ohne Foto. Sauber gelasert, lichtecht versiegelt.",
          formats: [
            { id: "g-15x10", label: "15×10 cm", price: 12.95 },
            { id: "g-20x15", label: "20×15 cm", price: 16.95 },
            { id: "g-25x20", label: "25×20 cm", price: 22.95 },
            { id: "g-30x20", label: "30×20 cm", price: 26.95 },
            { id: "g-35x25", label: "35×25 cm", price: 32.95 }
          ]
        },

        schilder: {
          label: "Schilder / Deko",
          note: "Einfache Motive, Hausnummern, Schriftzüge.",
          formats: [
            { id: "d-10x5",  label: "10×5 cm",  price: 8.50 },
            { id: "d-15x7",  label: "15×7 cm",  price: 9.95 },
            { id: "d-20x10", label: "20×10 cm", price: 12.50 },
            { id: "d-30x10", label: "30×10 cm", price: 15.95 }
          ]
        }
      },

      // Upgrades (werden in allen Varianten verwendet)
      upgrades: {
        widmung:       { label: "Widmung / Signatur", price: 3.50 },
        standfuss_std: { label: "3D-Standfuß (schwarz)", price: 4.95 },
        wandhalter:    { label: "3D-Wandhalterung", price: 5.50 },
        express:       { label: "Express (3 Werktage)", price: 8.00 }
      }
    },

    // --- METALL (vorbereitet, noch deaktiviert) ---
    metall: {
      label: "Metall",
      note: "Derzeit in Vorbereitung – bitte per Mail oder WhatsApp anfragen.",
      active: false,
      variants: {},
      upgrades: {}
    },

    // --- HOLZ (vorbereitet, noch deaktiviert) ---
    holz: {
      label: "Holz",
      note: "Kommt als Nächstes. Laserbearbeitung bis 850 × 800 mm möglich.",
      active: false,
      variants: {},
      upgrades: {}
    },

    // --- ACRYL (vorbereitet, noch deaktiviert) ---
    acryl: {
      label: "Acryl",
      note: "Noch in Vorbereitung – individuelle Anfragen gern per Mail.",
      active: false,
      variants: {},
      upgrades: {}
    }
  }
};
