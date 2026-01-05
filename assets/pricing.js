/*
 * Luderbein Preisliste / Kalkulator
 * V1.7 – Stand Januar 2026
 * Kleinunternehmer gem. §19 UStG – keine MwSt. ausgewiesen
 */

window.LUDERBEIN_PRICING = {
  meta: {
    version: "1.7",
    updated: "01/2026",
    note: "Schiefer aktiv. Metall aktiv: Flaschenöffner Schlüsselanhänger (Staffelpreise + Upgrades)."
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
    // ⚫ METALL (aktiv)
    // ===============================
    metall: {
      active: true,
      label: "Metall",
      includes: "Gravur, Qualitätscheck (Ausschuss ~5% eingepreist)",
      note: "Metall: Staffelpreise & Upgrades im Kalkulator. Ab 250 Stück: auf Anfrage.",

      variants: {
        flaschenoeffner: {
          id: "metall_bottle_opener_keychain",
          label: "Flaschenöffner Schlüsselanhänger",
          unit: "Stk",
          minQty: 10,

          note:
            "Regeln: Mindestmenge 10. 1 Motiv pro Auftrag (alle Teile gleich). Basis: 1-seitig graviert (Außen ODER Innen). Fertiges Logo: SVG/PDF/AI oder PNG/JPG 1-farbig. Ab 250: auf Anfrage.",

          // UI braucht ein Format – Preis kommt aus Staffel
          formats: [
            { id: "fo-std", label: "Standard", price: 0.0 }
          ],

          // Auswahlfelder (für UI + Nachricht)
          options: {
            colors: [
              { id: "schwarz", label: "Schwarz" },
              { id: "rot",     label: "Rot" },
              { id: "gruen",   label: "Grün" },
              { id: "blau",    label: "Blau" },
              { id: "silber",  label: "Silber" },
              { id: "gold",    label: "Gold" },
              { id: "bunt",    label: "Bunt / gemischt" }
            ],
            engraving: [
              { id: "aussen_oder_innen", label: "1-seitig (Außen ODER Innen)" },
              { id: "beidseitig",        label: "Innen + Außen (beidseitig)" }
            ],
            motif: [
              { id: "text",     label: "Nur Text" },
              { id: "logo",     label: "Fertiges Logo (1-farbig)" },
              { id: "textlogo", label: "Text + Logo (1 Motiv)" }
            ]
          },

          // ✅ Basis-Staffelpreise (pro Stück) – exakt aus deinem Block
          tiers: [
            { min: 10,  max: 24,  unit: 3.95 },
            { min: 25,  max: 49,  unit: 3.49 },
            { min: 50,  max: 99,  unit: 2.95 },
            { min: 100, max: 249, unit: 2.29 },
            { min: 250, max: null, unit: null, note: "Auf Anfrage" }
          ],

          // ✅ Upgrades / Zuschläge – exakt aus deinem Block
          upgrades: {
            engrave_inside_and_outside: {
              label: "Innen + Außen graviert (beidseitig)",
              type: "per_unit_tiered",
              tiers: [
                { min: 10,  max: 24,  unit: 1.49 },
                { min: 25,  max: 49,  unit: 1.19 },
                { min: 50,  max: 99,  unit: 0.99 },
                { min: 100, max: 249, unit: 0.79 },
                { min: 250, max: null, unit: null, note: "Auf Anfrage" }
              ]
            },

            variable_data_list: {
              label: "Variable Datenliste (z.B. Name/Nummer je Stück)",
              type: "setup_plus_per_unit_tiered",
              setupFee: 9.95,
              tiers: [
                { min: 10,  max: 24,  unit: 0.79 },
                { min: 25,  max: 49,  unit: 0.59 },
                { min: 50,  max: 99,  unit: 0.39 },
                { min: 100, max: 249, unit: 0.25 },
                { min: 250, max: null, unit: null, note: "Auf Anfrage" }
              ]
            },

            clear_coat: {
              label: "Klarlack / Schutzlack",
              type: "per_unit",
              unit: 0.99
            },

            logo_rework: {
              label: "Logo-Aufbereitung (wenn nicht druckfertig 1-farbig)",
              type: "one_time",
              once: 14.95
            },

            display_stand_3d_printed: {
              label: "3D-gedruckter Präsentationsständer (Premium)",
              type: "one_time",
              once: 24.95
            }
          },

          notes: [
            "Basis gilt für Text ODER fertiges Logo (druckfertig, 1-farbig).",
            "Mehrere Motive in einem Auftrag = separate Positionen / auf Anfrage.",
            "Ab 250 Stück: Preis & Umsetzung auf Anfrage (Menge/Workflow/Deadline)."
          ]
        }
      },

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
