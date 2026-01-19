/*
 * Luderbein Preisliste / Kalkulator
 * V1.6 – Stand Januar 2026
 * Kleinunternehmer gem. §19 UStG – keine MwSt. ausgewiesen
 *
 * Aktiv: Schiefer + Metall
 */

window.LUDERBEIN_PRICING = {
  meta: {
    version: "1.6",
    updated: "01/2026",
    note: "Schiefer + Metall aktiv. Weitere Materialien folgen."
  },

  // === Versandregeln ===
  shipping: {
    enabled: true,
    basePrice: 6.95,          // DHL ab 6,95 €
    minOrderForShipping: 29.95,
    freeShippingFrom: 80.0    // versandkostenfrei ab 80 €
  },

  // === PRODUKTE ===
  products: {
    // ===============================
    // 🔹 SCHIEFER (aktiv)
    // ===============================
    schiefer: {
      label: "Schiefer",
      active: true,
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
            { id: "jl7-25x25", label: "25 × 25 cm (eckig)", price: 29.95 },
            { id: "jl7-30r",   label: "30 cm rund",         price: 34.95 },
            { id: "jl7-38x13", label: "38 × 13 cm (Langtafel)", price: 39.95 },
            { id: "jl7-45x30", label: "45 × 30 cm",             price: 49.95 }
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

      // (Kalkulator-Default: als „einmalig pro Auftrag“ gerechnet)
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
      label: "Metall",
      active: true,
      note: "Metall-Serien, Tags, Karten, Öffner – Staffelpreise + Upgrades.",
      variants: {
        /* --------------------------------------------------------------------------
         * Metall – Flaschenöffner Schlüsselanhänger (Gravur)
         * Regeln:
         * - Mindestmenge: 10 Stück
         * - 1 Motiv pro Auftrag
         * - fertiges Logo (SVG/PDF/PNG/JPG) 1-farbig
         * -------------------------------------------------------------------------- */
        flaschenoeffner: {
          label: "Flaschenöffner Schlüsselanhänger",
          note: "Mindestmenge 10 · 1 Motiv pro Auftrag · fertiges Logo (SVG/PDF/PNG/JPG) 1-farbig",
          minQty: 10,

          // Muss existieren, weil der Kalkulator ein Format verlangt
          formats: [
            { id: "std", label: "Flaschenöffner Schlüsselanhänger" }
          ],

          tiers: [
            { min: 10,  max: 24,  price: 3.95 },
            { min: 25,  max: 49,  price: 3.49 },
            { min: 50,  max: 99,  price: 2.95 },
            { min: 100, max: 249, price: 2.29 },
            { min: 250, max: null, price: null, note: "Auf Anfrage" }
          ],

          options: {
            colors: [
              { id: "schwarz", label: "Schwarz" },
              { id: "rot",     label: "Rot" },
              { id: "gruen",   label: "Grün" },
              { id: "blau",    label: "Blau" },
              { id: "silber",  label: "Silber" }
            ],
            engraving: [
              { id: "einseitig", label: "1-seitig" },
              { id: "beidseitig", label: "Beidseitig" }
            ],
            motif: [
              { id: "text",      label: "Nur Text" },
              { id: "logo",      label: "Nur Logo" },
              { id: "text_logo", label: "Text + Logo" }
            ]
          },

          upgrades: {
            engrave_inside_and_outside: {
              label: "Innen + Außen graviert (beidseitig)",
              type: "per_unit_tiered",
              description: "Zusätzlicher Durchlauf/Handling: innen und außen graviert.",
              tiers: [
                { min: 10,  max: 24,  price: 1.49 },
                { min: 25,  max: 49,  price: 1.19 },
                { min: 50,  max: 99,  price: 0.99 },
                { min: 100, max: 249, price: 0.79 },
                { min: 250, max: null, price: null, note: "Auf Anfrage" }
              ]
            },

            variable_data_list: {
              label: "Variable Datenliste (z.B. Name/Nummer je Stück)",
              type: "setup_plus_per_unit_tiered",
              description: "Datenimport/Prüfung/Zuordnung + variabler Inhalt pro Teil.",
              setupFee: 9.95,
              tiers: [
                { min: 10,  max: 24,  price: 0.79 },
                { min: 25,  max: 49,  price: 0.59 },
                { min: 50,  max: 99,  price: 0.39 },
                { min: 100, max: 249, price: 0.25 },
                { min: 250, max: null, price: null, note: "Auf Anfrage" }
              ]
            },

            clear_coat: {
              label: "Klarlack / Schutzlack",
              type: "per_unit",
              description: "Schutzlack als Finish (Handling + Material).",
              unit: 0.99
            },

            logo_rework: {
              label: "Logo-Aufbereitung (wenn nicht druckfertig 1-farbig)",
              type: "one_time",
              description: "Einmalige Aufbereitung/Vektorisierung/Optimierung für saubere Gravur.",
              once: 14.95
            },

            display_stand_3d_printed: {
              label: "3D-gedruckter Präsentationsständer (Premium)",
              type: "one_time",
              description: "Präsentationsständer für Schlüsselanhänger (einmalig, nicht stückzahlabhängig).",
              once: 24.95
            }
          }
        },

        /* --------------------------------------------------------------------------
         * METALL – Eloxierte Alu-Visitenkarten (Gravur)
         * Regeln:
         * - Mindestmenge: 1 Stück
         * - Basis: 1-seitig graviert
         * - 2-seitig = Upgrade (Aufpreis pro Stück nach Staffel)
         * - Farben: Schwarz/Rot/Grün/Blau (ohne Aufpreis) | “Bunt gemischt” = Upgrade (einmalig)
         * - 1 Design pro Auftrag (alle Karten gleich)
         * -------------------------------------------------------------------------- */
        alu_visitenkarten_eloxiert: {
          label: "Eloxierte Alu-Visitenkarten",
          note: "Basis: 1-seitig graviert (1 Design pro Auftrag). Farben: Schwarz/Rot/Grün/Blau. Bunt gemischt optional.",
          minQty: 1,

          formats: [
            // ✅ Korrigiert: 86×54 mm (ID bleibt aus Backward-Safety gleich)
            { id: "85x55", label: "86 × 54 mm (Standard-Visitenkarte)" }
          ],

          tiers: [
            { min: 1,   max: 4,    price: 7.95 },
            { min: 5,   max: 9,    price: 6.49 },
            { min: 10,  max: 24,   price: 5.95 },
            { min: 25,  max: 49,   price: 4.95 },
            { min: 50,  max: 99,   price: 3.95 },
            { min: 100, max: 249,  price: 3.29 },
            { min: 250, max: null, price: null, note: "Auf Anfrage" }
          ],

          // (Aktuell im Kalkulator noch nicht angezeigt – wird später „nice to have“)
          options: {
            colors: [
              { id: "schwarz",       label: "Schwarz" },
              { id: "rot",           label: "Rot" },
              { id: "gruen",         label: "Grün" },
              { id: "blau",          label: "Blau" },
              { id: "bunt_gemischt", label: "Bunt gemischt" }
            ],
            engraving: [
              { id: "einseitig",  label: "1-seitig (Standard)" },
              { id: "beidseitig", label: "2-seitig (Upgrade)" }
            ]
          },

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
              once: 4.95
              // Hinweis: „appliesWhen“ wertet der Kalkulator aktuell nicht aus.
            }
          }
        },

        /* --------------------------------------------------------------------------
         * METALL – DogTags (Eloxiertes Alu, 29×50 mm, schwarz) (Gravur)
         * Regeln:
         * - Mindestmenge: 1 Stück
         * - Basis: 1-seitig graviert (Standard)
         * - 2-seitig = Upgrade (Aufpreis pro Stück nach Staffel)
         * - Schwarz (aktuell only)
         * - 1 Motiv pro Auftrag (alle Tags gleich)
         * -------------------------------------------------------------------------- */
        dogtags_alu_elox_schwarz_29x50: {
          label: "DogTag – Alu eloxiert (29×50 mm, schwarz)",
          note: "Basis: 1-seitig graviert. Schwarz. 1 Motiv pro Auftrag. 2-seitig als Upgrade.",
          minQty: 1,

          // Muss existieren, weil der Kalkulator ein Format verlangt
          formats: [
            { id: "29x50", label: "29×50 mm (schwarz, eloxiert)" }
          ],

          tiers: [
            { min: 1,  max: 1,    price: 9.95 },
            { min: 2,  max: 4,    price: 7.95 },
            { min: 5,  max: 9,    price: 6.95 },
            { min: 10, max: 24,   price: 5.95 },
            { min: 25, max: 49,   price: 4.49 },
            { min: 50, max: null, price: null, note: "Auf Anfrage" }
          ],

          upgrades: {
            // Key bewusst gleich wie beim Flaschenöffner:
            engrave_inside_and_outside: {
              label: "2-seitig graviert",
              type: "per_unit_tiered",
              description: "Aufpreis pro Stück für Rückseite (zusätzlicher Durchlauf/Handling).",
              tiers: [
                { min: 1,  max: 1,    price: 6.95 },
                { min: 2,  max: 4,    price: 5.95 },
                { min: 5,  max: 9,    price: 4.95 },
                { min: 10, max: 24,   price: 3.95 },
                { min: 25, max: 49,   price: 2.49 },
                { min: 50, max: null, price: null, note: "Auf Anfrage" }
              ]
            },

            logo_rework: {
              label: "Logo-Aufbereitung (wenn nicht druckfertig 1-farbig)",
              type: "one_time",
              description: "Einmalige Aufbereitung/Vektorisierung/Optimierung für saubere Gravur.",
              once: 14.95
            }
          }
        }
      },

      upgrades: {}
    },

    // ===============================
    // 🪵 HOLZ (noch deaktiviert)
    // ===============================
    holz: {
      label: "Holz",
      active: false,
      note: "Kommt als Nächstes. Laserbearbeitung bis 850 × 800 mm möglich.",
      variants: {},
      upgrades: {}
    },

    // ===============================
    // 🔷 ACRYL (noch deaktiviert)
    // ===============================
    acryl: {
      label: "Acryl",
      active: false,
      note: "Noch in Vorbereitung – individuelle Anfragen bitte per Mail.",
      variants: {},
      upgrades: {}
    }
  }
};
