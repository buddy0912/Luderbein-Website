/*
 * Luderbein Preisliste / Kalkulator
 * V1.4 – Stand Januar 2026
 * Basierend auf: JL7 Preisliste (Schiefer Fotogravur)
 * Kleinunternehmer gem. §19 UStG – keine MwSt. ausgewiesen
 */

window.LUDERBEIN_PRICING = {
  meta: {
    version: "1.4",
    updated: "01/2026",
    note: "Schieferpreise aktiv (Fotogravur JL7 + Gedenktafel). Weitere Materialien bitte anfragen."
  },

  // === Versandregeln ===
  shipping: {
    enabled: true,
    basePrice: 6.95,
    minOrderForShipping: 29.95,
    freeShippingFrom: 80.00
  },

  // === PRODUKTE ===
  products: {

    // ===============================
    // 🔹 SCHIEFER (aktiv)
    // ===============================
    schiefer: {
      label: "Schiefer",
      includes: "Fotoaufbereitung, Gravur, Klarlack-Versiegelung",

      variants: {
        fotogravur: {
          label: "Fotogravur (JL7)",
          note: "inkl. Fotoaufbereitung, Gravur & Versiegelung.",
          formats: [
            { id: "jl7-10x10", label: "10 × 10 cm (eckig)", price: 14.95 },
            { id: "jl7-10r",   label: "10 cm rund",         price: 14.95 },
            { id: "jl7-20x20", label: "20 × 20 cm (eckig)", price: 19.95 },
            { id: "jl7-20r",   label: "20 cm rund",         price: 19.95 },
            { id: "jl7-25x25", label: "25 × 25 cm (eckig)", price: 39.95 },
            { id: "jl7-30r",   label: "30 cm rund",         price: 44.95 },
            { id: "jl7-38x13", label: "38 × 13 cm (Langtafel)", price: 34.95 },
            { id: "jl7-45x30", label: "45 × 30 cm (A70 Max)",   price: 89.95 }
          ]
        },

        gedenktafel: {
          label: "Gedenktafel / Memorial",
          note: "Bild, Spruch, Name, Daten, optional Symbol oder Widmung.",
          formats: [
            { id: "ged-10x10", label: "10 × 10 cm (Quadratisch)", price: 19.95 }
          ]
        },

        textsymbol: {
          label: "Text / Symbol (einfach)",
          note: "Kleine Gravuren, kurze Widmung oder Symbol.",
          formats: [
            { id: "txt-6x6", label: "6 × 6 cm", price: 6.95 }
          ]
        }
      },

      upgrades: {
        widmung:       { label: "Signatur / Widmung",        price: 4.95 },
        standfuss_std: { label: "3D-Standfuß (schwarz)",      price: 9.95 },
        wandhalter:    { label: "3D-Wandhalterung (Aufhängen)", price: 6.95 },
        express:       { label: "Express (3 Werktage)",       price: 19.95 }
      }
    },

    // ===============================
    // ⚫ METALL (noch deaktiviert)
    // ===============================
    metall: {
      label: "Metall",
      note: "In Vorbereitung – bitte aktuell per WhatsApp oder Mail anfragen.",
      active: false,
      variants: {},
      upgrades: {}
    },

    // ===============================
    // 🪵 HOLZ (noch deaktiviert)
    // ===============================
    holz: {
      label: "Holz",
      note: "Kommt als Nächstes. Laserbearbeitung bis 850 × 800 mm möglich.",
      active: false,
      variants: {},
      upgrades: {}
    },

    // ===============================
    // 🔷 ACRYL (noch deaktiviert)
    // ===============================
    acryl: {
      label: "Acryl",
      note: "Noch in Vorbereitung – individuelle Anfragen bitte per Mail.",
      active: false,
      variants: {},
      upgrades: {}
    }
  }
};
