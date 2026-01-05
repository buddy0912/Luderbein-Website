/*
 * Luderbein Preisliste / Kalkulator
 * V1.5 – Stand Januar 2026
 * Kleinunternehmer gem. §19 UStG – keine MwSt. ausgewiesen
 */

window.LUDERBEIN_PRICING = {
  meta: {
    version: "1.5",
    updated: "01/2026",
    note: "Schiefer aktiv. Metall wird schrittweise ergänzt."
  },

  // === Versandregeln ===
  shipping: {
    enabled: true,
    basePrice: 6.95,
    minOrderForShipping: 29.95,
    freeShippingFrom: 80.0
  },

  // === PRODUKTE ===
  products: {
    // ===============================
    // 🔹 SCHIEFER (aktiv)
    // ===============================
    schiefer: {
      active: true,
      label: "Schiefer",
      includes: "Fotoaufbereitung, Gravur, Klarlack-Versiegelung",

      variants: {
        fotogravur: {
          label: "Fotogravur",
          note: "inkl. Fotoaufbereitung, Gravur & Versiegelung.",
          formats: [
            { id: "jl7-10x10", label: "10 × 10 cm (eckig)", price: 14.95 },
            { id: "jl7-10r",   label: "10 cm rund",         price: 14.95 },
            { id: "jl7-20x20", label: "20 × 20 cm (eckig)", price: 19.95 },
            { id: "jl7-20r",   label: "20 cm rund",         price: 19.95 },
            { id: "jl7-25x25", label: "25 × 25 cm (eckig)", price: 39.95 },
            { id: "jl7-30r",   label: "30 cm rund",         price: 44.95 },
            { id: "jl7-38x13", label: "38 × 13 cm (Langtafel)", price: 34.95 },
            { id: "jl7-45x30", label: "45 × 30 cm",             price: 89.95 }
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
          label: "Text / Symbol",
          note: "Koordinaten, Widmung, kurzer Spruch, kleines Icon – clean & schnell.",
          formats: [
            { id: "txt-10x10", label: "10 × 10 cm", price: 9.95 }
          ]
        }
      },

      upgrades: {
        widmung:       { label: "Signatur / Widmung",   price: 4.95 },
        standfuss_std: { label: "3D-Standfuß (schwarz)", price: 9.95 },
        wandhalter:    { label: "Wandhalterung",         price: 6.95 },
        express:       { label: "Express (3 Werktage)",  price: 19.95 }
      }
    },

    // ===============================
    // ⚫ METALL (aktiv, Start-Setup)
    // ===============================
    metall: {
      active: true,
      label: "Metall",
      includes: "Layout-Check, Gravur, Kantencheck (je nach Produkt)",

      // ✅ Start: 1 Variante + 1 Format (damit der Kalkulator Metall “kann”)
      // Später einfach neue Varianten/Formate ergänzen.
      variants: {
        gravur: {
          label: "Gravur (Start)",
          note: "Metallpreise werden gerade aufgebaut – wenn du unsicher bist: Anfrage schicken.",
          formats: [
            { id: "m-start", label: "Start-Format (Platzhalter)", price: 0.00 }
          ]
        }
      },

      // vorerst leer (oder später eigene Metall-Upgrades)
      upgrades: {}
    },

    // ===============================
    // 🪵 HOLZ (noch deaktiviert)
    // ===============================
    holz: {
      active: false,
      label: "Holz",
      note: "Kommt als Nächstes. Laserbearbeitung bis 850 × 800 mm möglich.",
      variants: {},
      upgrades: {}
    },

    // ===============================
    // 🔷 ACRYL (noch deaktiviert)
    // ===============================
    acryl: {
      active: false,
      label: "Acryl",
      note: "Noch in Vorbereitung – individuelle Anfragen bitte per Mail.",
      variants: {},
      upgrades: {}
    }
  }
};
