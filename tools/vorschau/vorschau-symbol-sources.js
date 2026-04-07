(function () {
  "use strict";

  const GOOGLE_ROOT = "/assets/tools/vorschau/google/material-design-icons-3.0.0";
  const GOOGLE_VARIANT = "production";
  const GOOGLE_FALLBACK_VARIANT = "design";

  const googleCategories = [
    {
      id: "action",
      label: "Aktionen",
      iconCount: 207,
      sourcePath: GOOGLE_ROOT + "/action/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/action/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "alert",
      label: "Hinweise",
      iconCount: 4,
      sourcePath: GOOGLE_ROOT + "/alert/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/alert/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "av",
      label: "Audio / Video",
      iconCount: 79,
      sourcePath: GOOGLE_ROOT + "/av/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/av/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "communication",
      label: "Kommunikation",
      iconCount: 46,
      sourcePath: GOOGLE_ROOT + "/communication/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/communication/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "content",
      label: "Inhalt",
      iconCount: 40,
      sourcePath: GOOGLE_ROOT + "/content/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/content/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "device",
      label: "Geräte",
      iconCount: 79,
      sourcePath: GOOGLE_ROOT + "/device/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/device/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "editor",
      label: "Editor",
      iconCount: 67,
      sourcePath: GOOGLE_ROOT + "/editor/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/editor/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "file",
      label: "Dateien",
      iconCount: 14,
      sourcePath: GOOGLE_ROOT + "/file/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/file/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "hardware",
      label: "Hardware",
      iconCount: 47,
      sourcePath: GOOGLE_ROOT + "/hardware/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/hardware/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "image",
      label: "Bild",
      iconCount: 150,
      sourcePath: GOOGLE_ROOT + "/image/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/image/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "maps",
      label: "Karten",
      iconCount: 68,
      sourcePath: GOOGLE_ROOT + "/maps/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/maps/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "navigation",
      label: "Navigation",
      iconCount: 47,
      sourcePath: GOOGLE_ROOT + "/navigation/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/navigation/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "notification",
      label: "Benachrichtigung",
      iconCount: 55,
      sourcePath: GOOGLE_ROOT + "/notification/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/notification/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "places",
      label: "Orte",
      iconCount: 19,
      sourcePath: GOOGLE_ROOT + "/places/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/places/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "social",
      label: "Social",
      iconCount: 30,
      sourcePath: GOOGLE_ROOT + "/social/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/social/svg/" + GOOGLE_FALLBACK_VARIANT
    },
    {
      id: "toggle",
      label: "Toggle",
      iconCount: 5,
      sourcePath: GOOGLE_ROOT + "/toggle/svg/" + GOOGLE_VARIANT,
      fallbackPath: GOOGLE_ROOT + "/toggle/svg/" + GOOGLE_FALLBACK_VARIANT
    }
  ];

  const customCategories = [
    {
      id: "wappen",
      label: "Wappen",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    },
    {
      id: "embleme",
      label: "Embleme",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    },
    {
      id: "tiere",
      label: "Tiere",
      sourceType: "filesystem-svg",
      groups: [
        {
          id: "hund",
          label: "Hund",
          sourcePath: "/assets/tools/vorschau/tiere/hund"
        },
        {
          id: "katze",
          label: "Katze",
          sourcePath: "/assets/tools/vorschau/tiere/katze"
        },
        {
          id: "pferd",
          label: "Pferd",
          sourcePath: "/assets/tools/vorschau/tiere/pferd"
        },
        {
          id: "vogel",
          label: "Vogel",
          sourcePath: "/assets/tools/vorschau/tiere/vogel"
        }
      ],
      previewTemplate: "/assets/tools/vorschau/vorlage-pfote.png"
    },
    {
      id: "google-symbole",
      label: "Google-Symbole",
      sourceType: "google-library-browser",
      previewTemplate: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_map_48px.svg"
    },
    {
      id: "ornamente",
      label: "Ornamente",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    },
    {
      id: "runen",
      label: "Runen",
      sourceType: "filesystem-svg",
      sourcePath: "/assets/tools/vorschau/custom/runen/svg",
      files: [
        "algiz.svg",
        "ansuz.svg",
        "berkana.svg",
        "dagaz.svg",
        "ehwaz.svg",
        "fehu.svg",
        "gebo.svg",
        "ingwaz.svg",
        "isaz.svg",
        "iwaz.svg",
        "jera.svg",
        "kenaz.svg",
        "laguz.svg",
        "mannaz.svg",
        "naudhiz.svg",
        "othala.svg",
        "perthro.svg",
        "raidho.svg",
        "thurisaz.svg",
        "tiwaz.svg",
        "uruz.svg",
        "wunjo.svg"
      ],
      meanings: {
        "algiz.svg": "Elch",
        "ansuz.svg": "Ase",
        "berkana.svg": "Birke",
        "dagaz.svg": "Tag",
        "ehwaz.svg": "Pferd",
        "fehu.svg": "Vieh/Wohlstand",
        "gebo.svg": "Gabe",
        "ingwaz.svg": "Yngvi",
        "isaz.svg": "Eis",
        "iwaz.svg": "Eibe",
        "jera.svg": "Jahr/Ernte",
        "kenaz.svg": "Kien/Kahn",
        "laguz.svg": "Wasser/See",
        "mannaz.svg": "Mann/Mensch",
        "naudhiz.svg": "Not",
        "othala.svg": "Erbbesitz/Stammgut",
        "perthro.svg": "Obstbaum",
        "raidho.svg": "Ritt/reiten",
        "thurisaz.svg": "Riese",
        "tiwaz.svg": "Krieg/Kampf",
        "uruz.svg": "Auerochse",
        "wunjo.svg": "Wonne"
      },
      previewTemplate: "/assets/tools/vorschau/custom/runen/svg/ansuz.svg"
    },
    {
      id: "herzen",
      label: "Herzen",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/google/material-design-icons-3.0.0/action/svg/production/ic_favorite_48px.svg"
    },
    {
      id: "outdoor",
      label: "Outdoor",
      sourceType: "filesystem-svg",
      sourcePath: "/assets/tools/vorschau/custom/wandern-trail-startpack/source/raw",
      files: [
        "berg-waldlinie-01.png",
        "bergkette-fein-01.png",
        "kompassring-berg-wald.png",
        "zelt-berge-kreis.png",
        "wanderer-trail-kompakt-01.png",
        "wanderer-trail-kompakt-02.png",
        "mountainbike-kompakt.png",
        "lagerfeuer-berge-kreis.png",
        "lagerfeuer-berge-offen.png",
        "gipfelkreuz-berge-kompakt.png",
        "berg-panorama-tal-wasser.png",
        "bergpanorama-wald-vorne.png",
        "einzelberg-schraffur.png",
        "kompass-berg-wald-weg.png",
        "topo-berg-konturlinien-01.png",
        "trailrunnerin-berglandschaft-kreis.png",
        "wanderer-grat-kreis.png",
        "mountainbike-berglandschaft-detail.png",
        "gipfelkreuz-landschaft-detail.png"
      ],
      previewTemplate: "/assets/tools/vorschau/custom/wandern-trail-startpack/source/raw/berg-waldlinie-01.png"
    },
    {
      id: "handwerk",
      label: "Handwerk",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    },
    {
      id: "maritim",
      label: "Maritim",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    },
    {
      id: "fantasy-mystik",
      label: "Fantasy / Mystik",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    },
    {
      id: "totenkopf-dark-rockig",
      label: "Totenkopf / Dark / Rockig",
      sourceType: "custom-library-placeholder",
      previewTemplate: "/assets/tools/vorschau/vorlage-emblem.png"
    }
  ];

  window.PREVIEW_SYMBOL_SOURCE_REGISTRY = {
    version: 1,
    activeGoogleVariant: GOOGLE_VARIANT,
    inactiveGoogleVariant: GOOGLE_FALLBACK_VARIANT,
    notes: {
      rationale:
        "Google Material nutzt vorerst svg/production als primäre Quelle, weil diese Dateien für den Frontend-Einsatz robuster und konsistenter sind. svg/design bleibt unangetastet als Reserve- und Vergleichsquelle erhalten."
    },
    google: {
      rootPath: GOOGLE_ROOT,
      categories: googleCategories
    },
    custom: {
      categories: customCategories
    },
    futureBrowser: {
      supportedSourceTypes: [
        "embedded-js-library",
        "filesystem-svg",
        "custom-library-placeholder"
      ],
      intendedFilters: [
        "source-family",
        "category",
        "kind",
        "group",
        "search"
      ]
    }
  };
}());
