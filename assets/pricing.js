// /assets/pricing.js
// Zentrale Preisdaten (V0)
// Kleinunternehmer gem. §19 UStG – keine MwSt. ausgewiesen

window.LUDERBEIN_PRICING = {
  meta: {
    currency: "EUR",
    updated: "2026-01-02",
    note: "Kleinunternehmer gem. §19 UStG – keine MwSt. ausgewiesen"
  },

  shipping: {
    enabled: true,
    basePrice: 6.95,          // V0: Standardversand als Richtwert
    minOrderForShipping: 29.95,
    freeShippingFrom: 80.00,
    label: "Versand (wenn gewünscht)"
  },

  products: {
    schiefer: {
      label: "Schiefer",
      machineDefault: "JL7",
      includes: "inkl. Fotoaufbereitung, Gravur & Klarlack-Versiegelung",
      variants: {
        fotogravur: {
          label: "Fotogravur",
          formats: [
            { id: "10x10", label: "10×10 cm (eckig)", price: 14.95 },
            { id: "10r",   label: "10 cm rund",        price: 14.95 },

            { id: "20x20", label: "20×20 cm (eckig)", price: 19.95 },
            { id: "20r",   label: "20 cm rund",       price: 19.95 },

            { id: "25x25", label: "25×25 cm (eckig)", price: 39.95 },
            { id: "30r",   label: "30 cm rund",       price: 44.95 },

            { id: "38x13", label: "38×13 cm",         price: 34.95 },

            { id: "45x30", label: "45×30 cm (A70 Max)", price: 89.95 }
          ]
        },

        gedenktafel: {
          label: "Gedenktafel",
          note: "V0: aktuell nur 10×10 (eckig). Rund nur auf Anfrage / Sonderfall.",
          formats: [
            { id: "10x10", label: "10×10 cm (eckig)", price: 19.95 }
          ]
        }
      },

      upgrades: {
        widmung:       { label: "Signatur / Widmung", price: 4.95 },
        standfuss_std: { label: "3D-gedruckter Standfuß (schwarz)", price: 9.95 },
        wandhalter:    { label: "3D-Wandhalterung (zum Aufhängen)", price: 6.95 },
        express:       { label: "Express (3 Werktage)", price: 19.95 }
      }
    }

    // metall / holz / acryl kommen als nächstes hier rein
  }
};
