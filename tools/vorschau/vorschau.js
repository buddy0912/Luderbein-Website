(function () {
  "use strict";

  const canvas = document.getElementById("previewCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const mobileCanvas = document.getElementById("previewCanvasMobile");
  const mobileCtx = mobileCanvas ? mobileCanvas.getContext("2d") : null;
  const materialGroup = document.getElementById("materialGroup");
  const materialOptionsEl = document.getElementById("materialOptions");
  const productGroup = document.getElementById("productGroup");
  const productOptionsEl = document.getElementById("productOptions");
  const finishGroup = document.getElementById("finishGroup");
  const finishOptionsEl = document.getElementById("finishOptions");
  const setGroup = document.getElementById("setGroup");
  const controlCard = document.querySelector(".preview-control-card");
  const setOptionsEl = document.getElementById("setOptions");
  const sizeGroup = document.getElementById("sizeGroup");
  const sizeOptionsEl = document.getElementById("sizeOptions");
  const designModeGroup = document.getElementById("designModeGroup");
  const designModeOptionsEl = document.getElementById("designModeOptions");
  const templateOptionsEl = document.getElementById("templateOptions");
  const motifTemplateGroup = document.getElementById("motifTemplateGroup");
  const motifOverlayOptionsEl = document.getElementById("motifOverlayOptions");
  const motifVariantOverlay = document.getElementById("motifVariantOverlay");
  const motifVariantOverlayBackdrop = document.getElementById("motifVariantOverlayBackdrop");
  const motifVariantOverlayPanel = motifVariantOverlay ? motifVariantOverlay.querySelector(".preview-motif-overlay__panel") : null;
  const closeMotifVariantOverlayButton = document.getElementById("closeMotifVariantOverlayButton");
  const motifVariantOverlayBackButton = document.getElementById("motifVariantOverlayBackButton");
  const motifVariantOverlayTitle = document.getElementById("motifVariantOverlayTitle");
  const motifVariantOverlayHelp = document.getElementById("motifVariantOverlayHelp");
  const motifOverlayUploadActions = document.getElementById("motifOverlayUploadActions");
  const motifOverlayUploadButton = document.getElementById("motifOverlayUploadButton");
  const motifOverlayUploadRemoveButton = document.getElementById("motifOverlayUploadRemoveButton");
  const motifOverlayUploadHint = document.getElementById("motifOverlayUploadHint");
  const openFeedbackOverlayButton = document.getElementById("openFeedbackOverlayButton");
  const feedbackOverlay = document.getElementById("feedbackOverlay");
  const feedbackOverlayBackdrop = document.getElementById("feedbackOverlayBackdrop");
  const closeFeedbackOverlayButton = document.getElementById("closeFeedbackOverlayButton");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const submitFeedbackButton = document.getElementById("submitFeedbackButton");
  const feedbackStatus = document.getElementById("feedbackStatus");
  const feedbackReasonOptions = document.getElementById("feedbackReasonOptions");
  const motifAdjustGroup = document.getElementById("motifAdjustGroup");
  const monogramGroup = document.getElementById("monogramGroup");
  const emblemGroup = document.getElementById("emblemGroup");
  const rotationGroup = document.getElementById("rotationGroup");
  const qrCodeGroup = document.getElementById("qrCodeGroup");
  const textGroup = document.getElementById("textGroup");
  const uploadInput = document.getElementById("uploadInput");
  const clearTextButton = document.getElementById("clearTextButton");
  const clearQrButton = document.getElementById("clearQrButton");
  const resetPlacementButton = document.getElementById("resetPlacementButton");
  const centerPlacementButton = document.getElementById("centerPlacementButton");
  const centerTextButton = document.getElementById("centerTextButton");
  const downloadPreviewButton = document.getElementById("downloadPreviewButton");
  const downloadPreviewButtonMobile = document.getElementById("downloadPreviewButtonMobile");
  const requestMenuPanel = document.getElementById("requestMenuPanel");
  const requestMenuPanelMobile = document.getElementById("requestMenuPanelMobile");
  const requestWhatsappLink = document.getElementById("requestWhatsappLink");
  const requestWhatsappLinkMobile = document.getElementById("requestWhatsappLinkMobile");
  const requestEmailLink = document.getElementById("requestEmailLink");
  const requestEmailLinkMobile = document.getElementById("requestEmailLinkMobile");
  const scaleSlider = document.getElementById("scaleSlider");
  const stretchXSlider = document.getElementById("stretchXSlider");
  const stretchYSlider = document.getElementById("stretchYSlider");
  const rotationSlider = document.getElementById("rotationSlider");
  const textSizeSlider = document.getElementById("textSizeSlider");
  const textFontSelect = document.getElementById("textFontSelect");
  const qrInput = document.getElementById("qrInput");
  const qrCharacterCount = document.getElementById("qrCharacterCount");
  const monogramInput = document.getElementById("monogramInput");
  const monogramCharacterCount = document.getElementById("monogramCharacterCount");
  const monogramFontSelect = document.getElementById("monogramFontSelect");
  const scaleValueLabel = document.getElementById("scaleValueLabel");
  const stretchXValueLabel = document.getElementById("stretchXValueLabel");
  const stretchYValueLabel = document.getElementById("stretchYValueLabel");
  const rotationValueLabel = document.getElementById("rotationValueLabel");
  const textSizeValueLabel = document.getElementById("textSizeValueLabel");
  const motifSizeHint = document.getElementById("motifSizeHint");
  const photoPricingHint = document.getElementById("photoPricingHint");
  const emblemSourceTemplateButton = document.getElementById("emblemSourceTemplateButton");
  const emblemSourceUploadButton = document.getElementById("emblemSourceUploadButton");
  const chooseEmblemTemplateButton = document.getElementById("chooseEmblemTemplateButton");
  const chooseEmblemUploadButton = document.getElementById("chooseEmblemUploadButton");
  const clearEmblemUploadButton = document.getElementById("clearEmblemUploadButton");
  const emblemTemplateActions = document.getElementById("emblemTemplateActions");
  const emblemUploadActions = document.getElementById("emblemUploadActions");
  const emblemUploadHint = document.getElementById("emblemUploadHint");
  const priceSummaryBox = document.getElementById("priceSummaryBox");
  const priceBreakdown = document.getElementById("priceBreakdown");
  const priceSubtotalLabel = document.getElementById("priceSubtotalLabel");
  const priceSubtotal = document.getElementById("priceSubtotal");
  const priceDiscountRow = document.getElementById("priceDiscountRow");
  const priceDiscountLabel = document.getElementById("priceDiscountLabel");
  const priceDiscount = document.getElementById("priceDiscount");
  const priceTotalLabel = document.getElementById("priceTotalLabel");
  const priceTotal = document.getElementById("priceTotal");
  const priceSummaryHint = document.getElementById("priceSummaryHint");
  const priceSummarySubhint = document.getElementById("priceSummarySubhint");
  const previewProductName = document.getElementById("previewProductName");
  const previewStageTitle = document.getElementById("previewStageTitle");
  const previewProductNameMobile = document.getElementById("previewProductNameMobile");
  const previewProductHint = document.getElementById("previewProductHint");
  const previewModeChip = document.getElementById("previewModeChip");
  const previewModeChipMobile = document.getElementById("previewModeChipMobile");
  const previewSetLabel = document.getElementById("previewSetLabel");
  const previewPendantLabel = document.getElementById("previewPendantLabel");
  const previewActiveSideLabel = document.getElementById("previewActiveSideLabel");
  const previewActiveSideLabelMobile = document.getElementById("previewActiveSideLabelMobile");
  const previewModeLabel = document.getElementById("previewModeLabel");
  const previewSourceLabel = document.getElementById("previewSourceLabel");
  const toggleSummaryButton = document.getElementById("toggleSummaryButton");
  const openSummaryMobileButton = document.getElementById("openSummaryMobileButton");
  const openSummaryMobileFooterButton = document.getElementById("openSummaryMobileFooterButton");
  const previewSummarySection = document.getElementById("previewSummarySection");
  const previewSummaryPanel = document.getElementById("previewSummaryPanel");
  const previewSummaryBackdrop = document.getElementById("previewSummaryBackdrop");
  const closeSummaryButton = document.getElementById("closeSummaryButton");
  const summaryToggleMeta = document.getElementById("summaryToggleMeta");
  const summaryPreviewCanvas = document.getElementById("summaryPreviewCanvas");
  const summaryPreviewCtx = summaryPreviewCanvas ? summaryPreviewCanvas.getContext("2d") : null;
  const summaryConfiguration = document.getElementById("summaryConfiguration");
  const summaryContent = document.getElementById("summaryContent");
  const summaryPrice = document.getElementById("summaryPrice");
  const summaryPriceHint = document.getElementById("summaryPriceHint");
  const pendantSwitchGroup = document.getElementById("pendantSwitchGroup");
  const pendantTabs = document.getElementById("pendantTabs");
  const pendantSwitchStatus = document.getElementById("pendantSwitchStatus");
  const pendantSwitchHint = document.getElementById("pendantSwitchHint");
  const sideSwitchGroup = document.getElementById("sideSwitchGroup");
  const sideTabs = document.getElementById("sideTabs");
  const sideSwitchStatus = document.getElementById("sideSwitchStatus");
  const sideSwitchHint = document.getElementById("sideSwitchHint");
  const enableBackSideButton = document.getElementById("enableBackSideButton");
  const sideFrontButton = document.getElementById("sideFrontButton");
  const sideBackButton = document.getElementById("sideBackButton");
  const textInput = document.getElementById("textInput");
  const textCharacterCount = document.getElementById("textCharacterCount");

  const MAX_TEXT_LENGTH = 18;
  const MAX_QR_LENGTH = 180;
  const MAX_FEEDBACK_MESSAGE_LENGTH = 500;
  const WHATSAPP_NUMBER = "491725925858";
  const REQUEST_EMAIL = "luderbein_gravur@icloud.com";
  const ACTIVE_STEP_SEQUENCE = ["material", "product", "finish", "set", "size", "designMode"];
  const SIDE_IDS = ["front", "back"];
  const PHOTO_SIZE_12_HINT = "Foto bei 12 mm nur unter Vorbehalt: Ergebnis hängt stark von der Vorlage ab (Kontrast/Details).";
  const PHOTO_DISCOUNT_HINT = "Foto wird händisch optimiert (Zufriedenheitsgarantie). Der Rabatt gilt nur bei identischem Foto (keine Neuaufbereitung).";
  const FEEDBACK_REASON_LABELS = {
    orientation: "Ich finde mich nicht zurecht",
    broken: "Die Seite funktioniert nicht richtig",
    "wrong-look": "Etwas sieht falsch aus",
    unexpected: "Nicht das, was ich erwartet habe",
    other: "Sonstiges"
  };
  const PRICE_BY_SIZE_GROUP_CENTS = {
    S: 995,
    M: 1195,
    L: 1395
  };
  const JEWELRY_SET_BASE_PRICES_CENTS = {
    1: 995,
    2: 1795,
    3: 2595,
    4: 3295,
    5: 3795
  };
  const BACK_SIDE_STANDARD_CENTS = 495;
  const PHOTO_NEW_PREP_CENTS = 3495;
  const PHOTO_REPEAT_FRONT_CENTS = 2495;
  const PHOTO_REPEAT_BACK_CENTS = 995;
  const BOTTLE_OPENER_FALLBACK_START_CENTS = 299;
  const SET_DISCOUNT_RATES = {
    2: 0.10,
    3: 0.12,
    4: 0.14,
    5: 0.15
  };
  const EXTERNAL_PRICING = window.LUDERBEIN_PRICING || null;
  const mobileThumbCropCache = new Map();
  let mobileThumbCropFrame = 0;
  let mobilePreviewPanX = 0;
  let mobilePreviewPanY = 0;
  let mobilePreviewDragOrigin = null;
  let mobilePreviewGeometryKey = "";
  const MOBILE_PREVIEW_TAP_SLOP = 8;

  const MODE_LIBRARY = [
    {
      id: "motif",
      name: "Motiv",
      description: "Vorlage wählen oder eigenes Bild nutzen."
    },
    {
      id: "text",
      name: "Text",
      description: "Namen, Initialen oder ein kurzes Wort setzen."
    }
  ];

  const BOTTLE_OPENER_MODE_LIBRARY = [
    {
      id: "motif",
      name: "Motiv",
      description: "Vorlage für die Hauptfläche wählen."
    },
    {
      id: "text",
      name: "Text",
      description: "Kurzen Text auf der Hauptfläche platzieren."
    },
    {
      id: "qr",
      name: "QR",
      description: "QR-Code direkt auf der Hauptfläche zeigen."
    }
  ];

  const SET_LIBRARY = [
    {
      id: "single",
      count: 1,
      name: "Einzelanhänger",
      shortLabel: "Einzel",
      description: "Ein einzelnes rundes Edelstahl-Plättchen."
    },
    {
      id: "set-2",
      count: 2,
      name: "Set mit 2 Anhängern",
      shortLabel: "2er-Set",
      description: "Zwei Anhänger als ruhiges kleines Set."
    },
    {
      id: "set-3",
      count: 3,
      name: "Set mit 3 Anhängern",
      shortLabel: "3er-Set",
      description: "Drei Anhänger mit klarer Staffelung."
    },
    {
      id: "set-4",
      count: 4,
      name: "Set mit 4 Anhängern",
      shortLabel: "4er-Set",
      description: "Vier Anhänger als erstes Familien- oder Setbild."
    },
    {
      id: "set-5",
      count: 5,
      name: "Set mit 5 Anhängern",
      shortLabel: "5er-Set",
      description: "Fünf Anhänger als ruhige kleine Gruppe."
    }
  ];

  const TEXT_FONT_LIBRARY = [
    {
      id: "sans",
      label: "Inter / klar",
      family: "\"Inter\", \"Helvetica Neue\", Arial, sans-serif"
    },
    {
      id: "serif",
      label: "Playfair Display / klassisch",
      family: "\"Playfair Display\", Georgia, \"Times New Roman\", serif"
    },
    {
      id: "script",
      label: "Great Vibes / elegant",
      family: "\"Great Vibes\", \"Brush Script MT\", \"Segoe Script\", cursive"
    },
    {
      id: "marcellus",
      label: "Marcellus / ruhig",
      family: "\"Marcellus\", Georgia, serif"
    },
    {
      id: "cinzel",
      label: "Cinzel / markant",
      family: "\"Cinzel\", Georgia, serif"
    },
    {
      id: "dancing-script",
      label: "Dancing Script / weich",
      family: "\"Dancing Script\", \"Segoe Script\", cursive"
    }
  ];

  const MONOGRAM_FONT_LIBRARY = [
    {
      id: "cinzel",
      label: "Cinzel",
      family: "\"Cinzel\", Georgia, serif"
    },
    {
      id: "great-vibes",
      label: "Great Vibes",
      family: "\"Great Vibes\", \"Brush Script MT\", cursive"
    },
    {
      id: "inter",
      label: "Inter",
      family: "\"Inter\", \"Helvetica Neue\", Arial, sans-serif"
    },
    {
      id: "cormorant",
      label: "Cormorant Garamond",
      family: "\"Cormorant Garamond\", Georgia, serif"
    },
    {
      id: "playfair",
      label: "Playfair Display",
      family: "\"Playfair Display\", Georgia, serif"
    },
    {
      id: "marcellus",
      label: "Marcellus",
      family: "\"Marcellus\", Georgia, serif"
    }
  ];

  let lastMotifOverlayTrigger = null;
  let lastFeedbackOverlayTrigger = null;
  const CATALOG = {
    materials: [
      {
        id: "metal",
        name: "Metall",
        description: "Schmuckanhänger und weitere Metallprodukte.",
        productFamilies: [
          {
            id: "jewelry-pendant",
            name: "Schmuckanhänger",
            description: "Edelstahl-Schmuckanhänger mit Gravur in Juwelierstandard.",
            finishes: [
              {
                id: "silver",
                name: "silberfarbig",
                description: "Edelstahl-Schmuckanhänger in silberfarbiger Ausführung."
              },
              {
                id: "gold",
                name: "goldfarbig",
                description: "Edelstahl-Schmuckanhänger in goldfarbiger Ausführung."
              }
            ],
            products: [
              {
                id: "round-tag",
                name: "Rundes Blättchen",
                description: "Internes Standardmodell für Schmuckanhänger.",
                sizes: [
                  {
                    id: "8mm",
                    label: "8 mm",
                    diameterMm: 8,
                    productRadius: 180,
                    engravingRatio: 0.94,
                    ringOuter: 54,
                    ringInner: 26,
                    ringY: 362,
                    lift: 56
                  },
                  {
                    id: "10mm",
                    label: "10 mm",
                    diameterMm: 10,
                    productRadius: 210,
                    engravingRatio: 0.95,
                    ringOuter: 58,
                    ringInner: 28,
                    ringY: 334,
                    lift: 64
                  },
                  {
                    id: "12mm",
                    label: "12 mm",
                    diameterMm: 12,
                    productRadius: 238,
                    engravingRatio: 0.955,
                    ringOuter: 62,
                    ringInner: 30,
                    ringY: 306,
                    lift: 72
                  },
                  {
                    id: "15mm",
                    label: "15 mm",
                    diameterMm: 15,
                    productRadius: 272,
                    engravingRatio: 0.96,
                    ringOuter: 68,
                    ringInner: 32,
                    ringY: 272,
                    lift: 82
                  },
                  {
                    id: "20mm",
                    label: "20 mm",
                    diameterMm: 20,
                    productRadius: 326,
                    engravingRatio: 0.965,
                    ringOuter: 78,
                    ringInner: 38,
                    ringY: 214,
                    lift: 98
                  }
                ]
              }
            ]
          },
          {
            id: "bottle-opener",
            name: "Flaschenöffner",
            description: "Metall-Flaschenöffner mit Gravur für Text, Motiv oder QR.",
            isComingSoon: false,
            finishes: [],
            products: []
          }
        ]
      },
      {
        id: "wood",
        name: "Holz",
        description: "Wird vorbereitet.",
        isComingSoon: true,
        productFamilies: [
          {
            id: "wood-coming-soon",
            name: "Produkte aus Holz",
            description: "Struktur vorbereitet. Details folgen in einem nächsten Schritt.",
            isComingSoon: true,
            finishes: [],
            products: []
          }
        ]
      },
      {
        id: "slate",
        name: "Schiefer",
        description: "Wird vorbereitet.",
        isComingSoon: true,
        productFamilies: [
          {
            id: "slate-coming-soon",
            name: "Produkte aus Schiefer",
            description: "Struktur vorbereitet. Details folgen in einem nächsten Schritt.",
            isComingSoon: true,
            finishes: [],
            products: []
          }
        ]
      }
    ]
  };

  const TEMPLATE_LIBRARY = [
    {
      id: "symbol-template",
      name: "Symbolvorlage",
      description: "",
      imageSrc: "/assets/tools/vorschau/vorlage-emblem.png",
      category: "emblem"
    },
    {
      id: "qr-code",
      name: "QR-Code",
      description: "",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<rect x="24" y="24" width="54" height="54" fill="#000"/>' +
          '<rect x="36" y="36" width="30" height="30" fill="#f6f2ee"/>' +
          '<rect x="122" y="24" width="54" height="54" fill="#000"/>' +
          '<rect x="134" y="36" width="30" height="30" fill="#f6f2ee"/>' +
          '<rect x="24" y="122" width="54" height="54" fill="#000"/>' +
          '<rect x="36" y="134" width="30" height="30" fill="#f6f2ee"/>' +
          '<path d="M98 24h16v16H98zM98 56h16v16H98zM82 72h16v16H82zM114 72h16v16H114zM130 88h16v16h-16zM98 104h16v16H98zM82 120h16v16H82zM114 120h16v16H114zM146 120h16v16h-16zM82 152h16v16H82zM114 152h16v16H114zM146 152h16v16h-16z" fill="#000"/>' +
        '</svg>'
      ),
      category: "qr-shortcut"
    },
    {
      id: "monogram",
      name: "Monogramm",
      description: "1–3 Zeichen direkt setzen.",
      imageSrc: "/assets/tools/vorschau/vorlage-monogramm.png",
      category: "monogram"
    },
    {
      id: "photo-portrait",
      name: "Foto / Porträt",
      description: "Eigenes Bild für die Vorschau nutzen.",
      imageSrc: "/assets/tools/vorschau/vorlage-portraet.png",
      category: "photo",
      prefersUpload: true
    },
    {
      id: "animal-symbols",
      name: "Tiersymbole",
      description: "Hund, Katze, Pferd oder Vogel auswählen.",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-01-klassisch.svg",
      category: "animal-symbols",
      hideFromMainSelection: true,
      hasVariants: true
    }
  ];

  const EMBLEM_KIND_LIBRARY = [
    {
      id: "crest",
      name: "Wappen",
      description: "Klarer Schildcharakter mit etwas mehr Detail.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M100 26 152 44v48c0 40-22 67-52 84-30-17-52-44-52-84V44Z" fill="#16181c"/>' +
          '<path d="M100 44 136 56v34c0 28-15 47-36 60-21-13-36-32-36-60V56Z" fill="#f6f2ee"/>' +
          '<path d="M100 64 110 88h26l-21 15 8 24-23-15-23 15 8-24-21-15h26Z" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem",
      name: "Emblem",
      description: "Reduzierte Symbolwirkung mit ruhiger Form.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="62" fill="none" stroke="#16181c" stroke-width="18"/>' +
          '<circle cx="100" cy="100" r="18" fill="#16181c"/>' +
          '<path d="M100 44v112M44 100h112" stroke="#16181c" stroke-width="14" stroke-linecap="round"/>' +
        '</svg>'
      )
    },
    {
      id: "qr",
      name: "QR-Code",
      description: "Für Link oder kurze Information.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<rect x="28" y="28" width="48" height="48" fill="#16181c"/>' +
          '<rect x="40" y="40" width="24" height="24" fill="#f6f2ee"/>' +
          '<rect x="124" y="28" width="48" height="48" fill="#16181c"/>' +
          '<rect x="136" y="40" width="24" height="24" fill="#f6f2ee"/>' +
          '<rect x="28" y="124" width="48" height="48" fill="#16181c"/>' +
          '<rect x="40" y="136" width="24" height="24" fill="#f6f2ee"/>' +
          '<rect x="104" y="96" width="12" height="12" fill="#16181c"/>' +
          '<rect x="120" y="96" width="12" height="12" fill="#16181c"/>' +
          '<rect x="136" y="96" width="12" height="12" fill="#16181c"/>' +
          '<rect x="104" y="112" width="12" height="12" fill="#16181c"/>' +
          '<rect x="136" y="112" width="12" height="12" fill="#16181c"/>' +
          '<rect x="88" y="128" width="12" height="12" fill="#16181c"/>' +
          '<rect x="120" y="128" width="12" height="12" fill="#16181c"/>' +
          '<rect x="152" y="128" width="12" height="12" fill="#16181c"/>' +
          '<rect x="88" y="144" width="12" height="12" fill="#16181c"/>' +
          '<rect x="104" y="144" width="12" height="12" fill="#16181c"/>' +
          '<rect x="136" y="144" width="12" height="12" fill="#16181c"/>' +
        '</svg>'
      ),
      isQr: true
    }
  ];

  const EMBLEM_VARIANT_LIBRARY = [
    {
      id: "crest-star",
      kindId: "crest",
      parentId: "emblem",
      name: "Schild mit Stern",
      description: "Klassisches Wappen mit Stern.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M100 24 154 42v50c0 42-22 70-54 88-32-18-54-46-54-88V42Z" fill="#16181c"/>' +
          '<path d="M100 42 136 54v35c0 29-15 48-36 61-21-13-36-32-36-61V54Z" fill="#f6f2ee"/>' +
          '<path d="M100 62 109 84h24l-19 14 7 23-21-14-21 14 7-23-19-14h24Z" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "crest-classic",
      kindId: "crest",
      parentId: "emblem",
      name: "Klassischer Schild",
      description: "Ruhige klassische Wappenform.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M100 28 150 44v52c0 38-21 63-50 80-29-17-50-42-50-80V44Z" fill="#16181c"/>' +
          '<path d="M100 46 132 56v34c0 24-12 42-32 55-20-13-32-31-32-55V56Z" fill="#f6f2ee"/>' +
          '<path d="M100 52v93M70 82h60" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
        '</svg>'
      )
    },
    {
      id: "crest-angular",
      kindId: "crest",
      parentId: "emblem",
      name: "Kantiger Schild",
      description: "Moderner, klarer Schild.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M58 34h84l20 24v48c0 32-21 58-62 78-41-20-62-46-62-78V58Z" fill="#16181c"/>' +
          '<path d="M75 52h50l17 18v30c0 22-14 40-42 56-28-16-42-34-42-56V70Z" fill="#f6f2ee"/>' +
          '<path d="M84 78h32M100 62v72" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
        '</svg>'
      )
    },
    {
      id: "crest-badge",
      kindId: "crest",
      parentId: "emblem",
      name: "Badge-Wappen",
      description: "Runder Badge mit Schildkern.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="68" fill="none" stroke="#16181c" stroke-width="18"/>' +
          '<path d="M100 50 132 60v32c0 24-13 42-32 54-19-12-32-30-32-54V60Z" fill="#16181c"/>' +
          '<path d="M100 66 116 72v18c0 14-6 25-16 33-10-8-16-19-16-33V72Z" fill="#f6f2ee"/>' +
        '</svg>'
      )
    },
    {
      id: "crest-laurel",
      kindId: "crest",
      parentId: "emblem",
      name: "Ehrenform",
      description: "Lorbeer und Schild schlicht.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M62 54c-18 10-28 28-30 52 3 22 13 40 30 54" fill="none" stroke="#16181c" stroke-width="10" stroke-linecap="round"/>' +
          '<path d="M138 54c18 10 28 28 30 52-3 22-13 40-30 54" fill="none" stroke="#16181c" stroke-width="10" stroke-linecap="round"/>' +
          '<path d="M100 54 132 64v30c0 24-12 42-32 54-20-12-32-30-32-54V64Z" fill="#16181c"/>' +
          '<path d="M100 70 116 76v15c0 13-6 23-16 31-10-8-16-18-16-31V76Z" fill="#f6f2ee"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem-focus",
      kindId: "emblem",
      parentId: "emblem",
      name: "Fokus",
      description: "Zielscheibe klar und ruhig.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="64" fill="none" stroke="#16181c" stroke-width="16"/>' +
          '<circle cx="100" cy="100" r="34" fill="none" stroke="#16181c" stroke-width="14"/>' +
          '<circle cx="100" cy="100" r="10" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem-gear",
      kindId: "emblem",
      parentId: "emblem",
      name: "Zahnrad",
      description: "Technisches Emblem mit Zahnkranz.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M100 34 114 34 118 50 132 56 146 46 156 56 146 70 152 84 168 88 168 102 152 106 146 120 156 134 146 144 132 134 118 140 114 156 100 156 96 140 82 134 68 144 58 134 68 120 62 106 46 102 46 88 62 84 68 70 58 56 68 46 82 56 96 50Z" fill="#16181c"/>' +
          '<circle cx="100" cy="95" r="24" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="95" r="10" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem-bolt",
      kindId: "emblem",
      parentId: "emblem",
      name: "Blitz",
      description: "Energiezeichen mit Kreis.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="64" fill="none" stroke="#16181c" stroke-width="16"/>' +
          '<path d="M108 42 76 104h22l-8 54 34-66h-22Z" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem-tools",
      kindId: "emblem",
      parentId: "emblem",
      name: "Werkzeug",
      description: "Gekreuzte Werkzeuge reduziert.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="66" fill="none" stroke="#16181c" stroke-width="14"/>' +
          '<path d="M68 66 132 130M132 66 68 130" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
          '<circle cx="62" cy="62" r="10" fill="#16181c"/>' +
          '<rect x="122" y="122" width="20" height="20" rx="4" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem-crown",
      kindId: "emblem",
      parentId: "emblem",
      name: "Krone",
      description: "Schlichte Krone im Badge.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="66" fill="none" stroke="#16181c" stroke-width="14"/>' +
          '<path d="M58 120h84l-8-44-24 22-20-30-20 30-24-22Z" fill="#16181c"/>' +
          '<rect x="58" y="120" width="84" height="16" rx="4" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "emblem-modern",
      kindId: "emblem",
      parentId: "emblem",
      name: "Modernes Badge",
      description: "Klares Badge mit Zentrum.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<circle cx="100" cy="100" r="62" fill="none" stroke="#16181c" stroke-width="18"/>' +
          '<circle cx="100" cy="100" r="18" fill="#16181c"/>' +
          '<path d="M100 44v112M44 100h112" stroke="#16181c" stroke-width="14" stroke-linecap="round"/>' +
        '</svg>'
      )
    },
    {
      id: "ornament-flourish",
      kindId: "ornament",
      parentId: "emblem",
      name: "Schwungornament",
      description: "Klassische geschwungene Zierform.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M28 104c18 0 24-30 46-30 19 0 24 28 50 28 18 0 26-10 48-30" fill="none" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
          '<path d="M28 96c18 0 24 30 46 30 19 0 24-28 50-28 18 0 26 10 48 30" fill="none" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
          '<circle cx="28" cy="100" r="9" fill="#16181c"/>' +
          '<circle cx="172" cy="100" r="9" fill="#16181c"/>' +
          '<circle cx="100" cy="100" r="11" fill="#16181c"/>' +
        '</svg>'
      )
    },
    {
      id: "ornament-laurel",
      kindId: "ornament",
      parentId: "emblem",
      name: "Lorbeerornament",
      description: "Reduzierte Lorbeerform für Gravur.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M62 44c-20 12-31 32-31 58 0 25 11 45 31 60" fill="none" stroke="#16181c" stroke-width="10" stroke-linecap="round"/>' +
          '<path d="M138 44c20 12 31 32 31 58 0 25-11 45-31 60" fill="none" stroke="#16181c" stroke-width="10" stroke-linecap="round"/>' +
          '<path d="M68 66 54 80M70 88 48 100M72 112 54 124M132 66l14 14M130 88l22 12M128 112l18 12" stroke="#16181c" stroke-width="10" stroke-linecap="round"/>' +
          '<path d="M74 142h52" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
        '</svg>'
      )
    },
    {
      id: "ornament-knot",
      kindId: "ornament",
      parentId: "emblem",
      name: "Knotenornament",
      description: "Symmetrische Flechtform mit klaren Linien.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M54 72c0-14 10-24 24-24 12 0 19 6 22 18 3-12 10-18 22-18 14 0 24 10 24 24 0 12-6 20-18 24 12 4 18 12 18 24 0 14-10 24-24 24-12 0-19-6-22-18-3 12-10 18-22 18-14 0-24-10-24-24 0-12 6-20 18-24-12-4-18-12-18-24Z" fill="none" stroke="#16181c" stroke-width="12" stroke-linejoin="round"/>' +
          '<path d="M78 72h44v56H78Z" fill="none" stroke="#16181c" stroke-width="12" stroke-linejoin="round"/>' +
        '</svg>'
      )
    },
    {
      id: "ornament-corner",
      kindId: "ornament",
      parentId: "emblem",
      name: "Rahmenornament",
      description: "Vier ruhige Ecken für einen Zierrahmen.",
      imageSrc: buildInlineSvgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
          '<rect width="200" height="200" fill="#f6f2ee"/>' +
          '<path d="M48 74c0-18 8-26 26-26h22M126 48h22c18 0 26 8 26 26v22M152 126v22c0 18-8 26-26 26h-22M74 152H52c-18 0-26-8-26-26v-22" fill="none" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
          '<path d="M62 62 86 86M138 62 114 86M62 138l24-24M138 138l-24-24" stroke="#16181c" stroke-width="12" stroke-linecap="round"/>' +
        '</svg>'
      )
    },
    {
      id: "google-heart-filled",
      kindId: "google-hearts",
      parentId: "emblem",
      name: "Herz",
      description: "action/svg/production/ic_favorite_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/action/svg/production/ic_favorite_48px.svg"
    },
    {
      id: "google-heart-outline",
      kindId: "google-hearts",
      parentId: "emblem",
      name: "Herz Kontur",
      description: "action/svg/production/ic_favorite_border_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/action/svg/production/ic_favorite_border_48px.svg"
    },
    {
      id: "google-motorsport-motorcycle",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Motorrad",
      description: "action/svg/production/ic_motorcycle_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/action/svg/production/ic_motorcycle_48px.svg"
    },
    {
      id: "google-motorsport-car",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Auto",
      description: "maps/svg/production/ic_directions_car_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_car_48px.svg"
    },
    {
      id: "google-motorsport-traffic",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Ampel",
      description: "maps/svg/production/ic_traffic_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_traffic_48px.svg"
    },
    {
      id: "google-motorsport-ev-station",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Ladestation",
      description: "maps/svg/production/ic_ev_station_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_ev_station_48px.svg"
    },
    {
      id: "google-motorsport-bike",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Fahrrad",
      description: "maps/svg/production/ic_directions_bike_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_bike_48px.svg"
    },
    {
      id: "google-motorsport-boat",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Boot",
      description: "maps/svg/production/ic_directions_boat_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_boat_48px.svg"
    },
    {
      id: "google-motorsport-bus",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Bus",
      description: "maps/svg/production/ic_directions_bus_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_bus_48px.svg"
    },
    {
      id: "google-motorsport-railway",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Bahn",
      description: "maps/svg/production/ic_directions_railway_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_railway_48px.svg"
    },
    {
      id: "google-motorsport-subway-directions",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "U-Bahn",
      description: "maps/svg/production/ic_directions_subway_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_subway_48px.svg"
    },
    {
      id: "google-motorsport-walk",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Zu Fuß",
      description: "maps/svg/production/ic_directions_walk_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_directions_walk_48px.svg"
    },
    {
      id: "google-motorsport-taxi",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Taxi",
      description: "maps/svg/production/ic_local_taxi_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_local_taxi_48px.svg"
    },
    {
      id: "google-motorsport-train",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Zug",
      description: "maps/svg/production/ic_train_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_train_48px.svg"
    },
    {
      id: "google-motorsport-tram",
      kindId: "google-motorsport",
      parentId: "emblem",
      name: "Tram",
      description: "maps/svg/production/ic_tram_48px.svg",
      imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/maps/svg/production/ic_tram_48px.svg"
    },
    {
      id: "qr",
      kindId: "qr",
      parentId: "emblem",
      name: "QR-Code",
      description: "Für Link oder kurze Information.",
      imageSrc: EMBLEM_KIND_LIBRARY.find(function (item) { return item.id === "qr"; }).imageSrc,
      isQr: true
    }
  ];

  const MOTIF_VARIANT_LIBRARY = [
    {
      id: "hund-01-klassisch",
      parentId: "animal-dog",
      name: "Klassisch",
      description: "hund-01-klassisch.svg",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-01-klassisch.svg"
    },
    {
      id: "hund-02-breit-herz",
      parentId: "animal-dog",
      name: "Breit mit Herz",
      description: "hund-02-breit-herz.svg",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-02-breit-herz.svg"
    },
    {
      id: "hund-03-klein-zart",
      parentId: "animal-dog",
      name: "Klein und zart",
      description: "hund-03-klein-zart.svg",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-03-klein-zart.svg"
    },
    {
      id: "hund-04-minimalistisch",
      parentId: "animal-dog",
      name: "Minimalistisch",
      description: "hund-04-minimalistisch.svg",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-04-minimalistisch.svg"
    },
    {
      id: "hund-05-konturiert-elegant",
      parentId: "animal-dog",
      name: "Konturiert elegant",
      description: "hund-05-konturiert-elegant.svg",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-05-konturiert-elegant.svg"
    },
    {
      id: "katze-01-klassisch",
      parentId: "animal-cat",
      name: "Klassisch",
      description: "katze-01-klassisch.svg",
      imageSrc: "/assets/tools/vorschau/tiere/katze/katze-01-klassisch.svg"
    },
    {
      id: "katze-02-zart-herz",
      parentId: "animal-cat",
      name: "Zart mit Herz",
      description: "katze-02-zart-herz.svg",
      imageSrc: "/assets/tools/vorschau/tiere/katze/katze-02-zart-herz.svg"
    },
    {
      id: "katze-03-elegant",
      parentId: "animal-cat",
      name: "Elegant",
      description: "katze-03-elegant.svg",
      imageSrc: "/assets/tools/vorschau/tiere/katze/katze-03-elegant.svg"
    },
    {
      id: "katze-04-zart",
      parentId: "animal-cat",
      name: "Zart",
      description: "katze-04-zart.svg",
      imageSrc: "/assets/tools/vorschau/tiere/katze/katze-04-zart.svg"
    },
    {
      id: "katze-05-krallen",
      parentId: "animal-cat",
      name: "Krallen",
      description: "katze-05-krallen.svg",
      imageSrc: "/assets/tools/vorschau/tiere/katze/katze-05-krallen.svg"
    },
    {
      id: "pferd-01-hufeisen-schlicht",
      parentId: "animal-horse",
      name: "Hufeisen schlicht",
      description: "pferd-01-hufeisen-schlicht.svg",
      imageSrc: "/assets/tools/vorschau/tiere/pferd/pferd-01-hufeisen-schlicht.svg"
    },
    {
      id: "pferd-02-hufabdruck-stilisiert",
      parentId: "animal-horse",
      name: "Hufabdruck stilisiert",
      description: "pferd-02-hufabdruck-stilisiert.svg",
      imageSrc: "/assets/tools/vorschau/tiere/pferd/pferd-02-hufabdruck-stilisiert.svg"
    },
    {
      id: "pferd-03-pferdekopf-silhouette",
      parentId: "animal-horse",
      name: "Pferdekopf Silhouette",
      description: "pferd-03-pferdekopf-silhouette.svg",
      imageSrc: "/assets/tools/vorschau/tiere/pferd/pferd-03-pferdekopf-silhouette.svg"
    },
    {
      id: "pferd-04-pferdeprofil-elegant",
      parentId: "animal-horse",
      name: "Pferdeprofil elegant",
      description: "pferd-04-pferdeprofil-elegant.svg",
      imageSrc: "/assets/tools/vorschau/tiere/pferd/pferd-04-pferdeprofil-elegant.svg"
    },
    {
      id: "pferd-05-pferde-emblem-reduziert",
      parentId: "animal-horse",
      name: "Pferde-Emblem reduziert",
      description: "pferd-05-pferde-emblem-reduziert.svg",
      imageSrc: "/assets/tools/vorschau/tiere/pferd/pferd-05-pferde-emblem-reduziert.svg"
    },
    {
      id: "vogel-01-silhouette-sitzend",
      parentId: "animal-bird",
      name: "Silhouette sitzend",
      description: "vogel-01-silhouette-sitzend.svg",
      imageSrc: "/assets/tools/vorschau/tiere/vogel/vogel-01-silhouette-sitzend.svg"
    },
    {
      id: "vogel-02-silhouette-fliegend",
      parentId: "animal-bird",
      name: "Silhouette fliegend",
      description: "vogel-02-silhouette-fliegend.svg",
      imageSrc: "/assets/tools/vorschau/tiere/vogel/vogel-02-silhouette-fliegend.svg"
    },
    {
      id: "vogel-03-singvogel-minimalistisch",
      parentId: "animal-bird",
      name: "Singvogel minimalistisch",
      description: "vogel-03-singvogel-minimalistisch.svg",
      imageSrc: "/assets/tools/vorschau/tiere/vogel/vogel-03-singvogel-minimalistisch.svg"
    },
    {
      id: "vogel-04-feder-schlicht",
      parentId: "animal-bird",
      name: "Feder schlicht",
      description: "vogel-04-feder-schlicht.svg",
      imageSrc: "/assets/tools/vorschau/tiere/vogel/vogel-04-feder-schlicht.svg"
    },
    {
      id: "vogel-05-vogel-emblem-reduziert",
      parentId: "animal-bird",
      name: "Vogel-Emblem reduziert",
      description: "vogel-05-vogel-emblem-reduziert.svg",
      imageSrc: "/assets/tools/vorschau/tiere/vogel/vogel-05-vogel-emblem-reduziert.svg"
    }
  ];

  const ANIMAL_GROUP_LIBRARY = [
    {
      id: "animal-dog",
      name: "Hund",
      description: "Von klassisch bis fein reduziert.",
      imageSrc: "/assets/tools/vorschau/tiere/hund/hund-02-breit-herz.svg"
    },
    {
      id: "animal-cat",
      name: "Katze",
      description: "Von zart bis markant.",
      imageSrc: "/assets/tools/vorschau/tiere/katze/katze-03-elegant.svg"
    },
    {
      id: "animal-horse",
      name: "Pferd",
      description: "Profile, Hufeisen und reduzierte Zeichen.",
      imageSrc: "/assets/tools/vorschau/tiere/pferd/pferd-03-pferdekopf-silhouette.svg"
    },
    {
      id: "animal-bird",
      name: "Vogel",
      description: "Silhouetten und feine Formen.",
      imageSrc: "/assets/tools/vorschau/tiere/vogel/vogel-01-silhouette-sitzend.svg"
    }
  ];

  const STEP_DEFINITIONS = {
    material: {
      id: "material",
      stateKey: "materialId",
      groupEl: materialGroup,
      getNextValue: function (selectedId) {
        return {
          materialId: selectedId
        };
      }
    },
    product: {
      id: "product",
      stateKey: "productFamilyId",
      groupEl: productGroup,
      getNextValue: function (selectedId) {
        const family = getProductFamilyById(selectedId);
        const models = family && Array.isArray(family.products) ? family.products : [];
        return {
          productFamilyId: family ? family.id : null,
          productId: models.length === 1 ? models[0].id : null,
          finishId: family && family.finishes && family.finishes.length === 1 ? family.finishes[0].id : null
        };
      }
    },
    finish: {
      id: "finish",
      stateKey: "finishId",
      groupEl: finishGroup
    },
    set: {
      id: "set",
      stateKey: "setId",
      groupEl: setGroup
    },
    size: {
      id: "size",
      stateKey: "pendantSizeId",
      groupEl: sizeGroup
    },
    designMode: {
      id: "designMode",
      stateKey: "designMode",
      groupEl: designModeGroup
    }
  };

  const BOTTLE_OPENER_ASSET = {
    src: "/assets/tools/flaschenoeffner/flaschenoeffner-schwarz-front-2.png",
    image: null
  };

  const BOTTLE_OPENER_ENGRAVING_FILL = "rgba(210,207,206,0.92)";
  const BOTTLE_OPENER_ENGRAVING_STROKE = "rgba(210,207,206,0.82)";
  const bottleOpenerEngravingCache = typeof WeakMap === "function" ? new WeakMap() : null;
  const symbolSourceRegistry = window.PREVIEW_SYMBOL_SOURCE_REGISTRY || null;
  const GOOGLE_BROWSER_GROUP_FILES = {
    action: [
      "ic_3d_rotation_48px.svg",
      "ic_account_balance_48px.svg",
      "ic_account_circle_48px.svg",
      "ic_add_shopping_cart_48px.svg",
      "ic_alarm_48px.svg",
      "ic_android_48px.svg",
      "ic_announcement_48px.svg",
      "ic_assignment_turned_in_48px.svg",
      "ic_autorenew_48px.svg",
      "ic_bookmark_48px.svg",
      "ic_build_48px.svg",
      "ic_card_giftcard_48px.svg",
      "ic_check_circle_48px.svg",
      "ic_code_48px.svg",
      "ic_credit_card_48px.svg",
      "ic_date_range_48px.svg",
      "ic_done_all_48px.svg",
      "ic_euro_symbol_48px.svg",
      "ic_explore_48px.svg",
      "ic_face_48px.svg",
      "ic_favorite_48px.svg",
      "ic_favorite_border_48px.svg",
      "ic_gavel_48px.svg",
      "ic_grade_48px.svg"
    ],
    alert: [
      "ic_add_alert_48px.svg",
      "ic_error_48px.svg",
      "ic_error_outline_48px.svg",
      "ic_warning_48px.svg"
    ],
    communication: [
      "ic_business_48px.svg",
      "ic_call_48px.svg",
      "ic_chat_48px.svg",
      "ic_chat_bubble_48px.svg",
      "ic_chat_bubble_outline_48px.svg",
      "ic_comment_48px.svg",
      "ic_contact_mail_48px.svg",
      "ic_contact_phone_48px.svg",
      "ic_contacts_48px.svg",
      "ic_email_48px.svg",
      "ic_forum_48px.svg",
      "ic_live_help_48px.svg",
      "ic_location_on_48px.svg",
      "ic_mail_outline_48px.svg",
      "ic_message_48px.svg",
      "ic_phone_48px.svg",
      "ic_ring_volume_48px.svg",
      "ic_rss_feed_48px.svg",
      "ic_screen_share_48px.svg",
      "ic_speaker_phone_48px.svg"
    ],
    file: [
      "ic_attachment_48px.svg",
      "ic_cloud_48px.svg",
      "ic_cloud_circle_48px.svg",
      "ic_cloud_done_48px.svg",
      "ic_cloud_download_48px.svg",
      "ic_cloud_off_48px.svg",
      "ic_cloud_queue_48px.svg",
      "ic_cloud_upload_48px.svg",
      "ic_create_new_folder_48px.svg",
      "ic_file_download_48px.svg",
      "ic_file_upload_48px.svg",
      "ic_folder_48px.svg",
      "ic_folder_open_48px.svg",
      "ic_folder_shared_48px.svg"
    ],
    hardware: [
      "ic_cast_48px.svg",
      "ic_computer_48px.svg",
      "ic_desktop_mac_48px.svg",
      "ic_desktop_windows_48px.svg",
      "ic_devices_other_48px.svg",
      "ic_gamepad_48px.svg",
      "ic_headset_48px.svg",
      "ic_headset_mic_48px.svg",
      "ic_keyboard_48px.svg",
      "ic_keyboard_voice_48px.svg",
      "ic_laptop_48px.svg",
      "ic_laptop_mac_48px.svg",
      "ic_laptop_windows_48px.svg",
      "ic_memory_48px.svg",
      "ic_mouse_48px.svg",
      "ic_phone_android_48px.svg",
      "ic_phone_iphone_48px.svg",
      "ic_router_48px.svg",
      "ic_scanner_48px.svg",
      "ic_smartphone_48px.svg"
    ],
    image: [
      "ic_add_a_photo_48px.svg",
      "ic_adjust_48px.svg",
      "ic_assistant_photo_48px.svg",
      "ic_brightness_7_48px.svg",
      "ic_brush_48px.svg",
      "ic_burst_mode_48px.svg",
      "ic_camera_48px.svg",
      "ic_camera_alt_48px.svg",
      "ic_camera_front_48px.svg",
      "ic_camera_rear_48px.svg",
      "ic_collections_48px.svg",
      "ic_color_lens_48px.svg",
      "ic_colorize_48px.svg",
      "ic_crop_landscape_48px.svg",
      "ic_crop_portrait_48px.svg",
      "ic_dehaze_48px.svg",
      "ic_details_48px.svg",
      "ic_edit_48px.svg",
      "ic_filter_drama_48px.svg",
      "ic_filter_vintage_48px.svg",
      "ic_flare_48px.svg",
      "ic_flash_off_48px.svg",
      "ic_flash_on_48px.svg",
      "ic_gradient_48px.svg"
    ],
    maps: [
      "ic_add_location_48px.svg",
      "ic_beenhere_48px.svg",
      "ic_directions_48px.svg",
      "ic_directions_bike_48px.svg",
      "ic_directions_boat_48px.svg",
      "ic_directions_bus_48px.svg",
      "ic_directions_car_48px.svg",
      "ic_directions_railway_48px.svg",
      "ic_directions_run_48px.svg",
      "ic_directions_subway_48px.svg",
      "ic_directions_transit_48px.svg",
      "ic_directions_walk_48px.svg",
      "ic_edit_location_48px.svg",
      "ic_ev_station_48px.svg",
      "ic_flight_48px.svg",
      "ic_local_gas_station_48px.svg",
      "ic_local_shipping_48px.svg",
      "ic_local_taxi_48px.svg",
      "ic_map_48px.svg",
      "ic_my_location_48px.svg",
      "ic_navigation_48px.svg",
      "ic_pin_drop_48px.svg",
      "ic_place_48px.svg",
      "ic_terrain_48px.svg"
    ],
    places: [
      "ic_ac_unit_48px.svg",
      "ic_airport_shuttle_48px.svg",
      "ic_all_inclusive_48px.svg",
      "ic_beach_access_48px.svg",
      "ic_business_center_48px.svg",
      "ic_casino_48px.svg",
      "ic_child_care_48px.svg",
      "ic_child_friendly_48px.svg",
      "ic_fitness_center_48px.svg",
      "ic_free_breakfast_48px.svg",
      "ic_golf_course_48px.svg",
      "ic_hot_tub_48px.svg",
      "ic_kitchen_48px.svg",
      "ic_pool_48px.svg",
      "ic_room_service_48px.svg",
      "ic_rv_hookup_48px.svg",
      "ic_smoke_free_48px.svg",
      "ic_smoking_rooms_48px.svg",
      "ic_spa_48px.svg"
    ],
    social: [
      "ic_cake_48px.svg",
      "ic_domain_48px.svg",
      "ic_group_48px.svg",
      "ic_group_add_48px.svg",
      "ic_location_city_48px.svg",
      "ic_mood_48px.svg",
      "ic_mood_bad_48px.svg",
      "ic_notifications_active_48px.svg",
      "ic_notifications_none_48px.svg",
      "ic_notifications_off_48px.svg",
      "ic_pages_48px.svg",
      "ic_party_mode_48px.svg",
      "ic_people_48px.svg",
      "ic_people_outline_48px.svg",
      "ic_person_48px.svg",
      "ic_person_add_48px.svg",
      "ic_person_outline_48px.svg",
      "ic_plus_one_48px.svg",
      "ic_poll_48px.svg",
      "ic_public_48px.svg",
      "ic_school_48px.svg",
      "ic_sentiment_neutral_48px.svg",
      "ic_share_48px.svg",
      "ic_whatshot_48px.svg"
    ],
    toggle: [
      "ic_check_box_48px.svg",
      "ic_check_box_outline_blank_48px.svg",
      "ic_radio_button_checked_48px.svg",
      "ic_radio_button_unchecked_48px.svg",
      "ic_star_half_48px.svg"
    ]
  };
  const GOOGLE_BROWSER_GROUP_IDS = ["action", "alert", "communication", "file", "hardware", "image", "maps", "places", "social", "toggle"];
  EMBLEM_VARIANT_LIBRARY.push.apply(EMBLEM_VARIANT_LIBRARY, buildGoogleBrowserVariants());
  EMBLEM_VARIANT_LIBRARY.push.apply(EMBLEM_VARIANT_LIBRARY, buildFilesystemSvgVariantsForCategory("runen"));
  EMBLEM_VARIANT_LIBRARY.push.apply(EMBLEM_VARIANT_LIBRARY, buildFilesystemSvgVariantsForCategory("outdoor"));

  const state = createInitialState();
  let renderQueued = false;
  let pendingAfterRenderAction = null;

  Promise.all(
    TEMPLATE_LIBRARY.concat(MOTIF_VARIANT_LIBRARY, EMBLEM_VARIANT_LIBRARY)
      .map((entry) =>
        loadImage(entry.imageSrc).then((image) => {
          entry.image = image;
        })
      )
      .concat([
        loadImage(BOTTLE_OPENER_ASSET.src).then((image) => {
          BOTTLE_OPENER_ASSET.image = image;
        })
      ])
  ).then(init);

  function init() {
    renderMaterialOptions();
    renderProductOptions();
    renderFinishOptions();
    renderSetOptions();
    renderSizeOptions();
    renderDesignModeOptions();
    renderTemplateOptions();
    renderMotifOverlayOptions();
    renderPendantTabs();
    bindEvents();
    setSummaryOpen(false);
    syncUi();
    queueRender();
  }

  function toTitleCase(value) {
    return String(value).replace(/\b[a-z]/g, function (match) {
      return match.toUpperCase();
    });
  }

  function isMobileThumbnailCropViewport() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function getMobileThumbnailCropTargets(root) {
    const scope = root || document;
    const selectors = [
      '#motifOverlayOptions[data-overlay-step="symbolCategories"] .preview-option--symbol-category[data-category-status="active"] .preview-option__thumb-media--symbol img',
      '#motifOverlayOptions[data-overlay-step="emblemVariants"][data-overlay-kind="custom-filesystem-outdoor"] .preview-option__thumb-media--symbol img'
    ];
    return Array.from(scope.querySelectorAll(selectors.join(", ")));
  }

  function classifyMobileThumbnailCropTarget(img) {
    const categoryButton = img.closest('.preview-option--symbol-category[data-category-status="active"]');
    if (categoryButton) {
      const categoryId = String(categoryButton.getAttribute("data-symbol-category-id") || "").toLowerCase();
      const categoryOverrides = {
        "tiere": {
          cacheKey: "category-tiere",
          fillRatio: 0.78,
          paddingRatio: 0.03
        },
        "runen": {
          cacheKey: "category-runen",
          fillRatio: 0.8,
          paddingRatio: 0.03
        },
        "outdoor": {
          cacheKey: "category-outdoor",
          fillRatio: 0.86,
          paddingRatio: 0.02
        }
      };
      if (categoryOverrides[categoryId]) {
        return categoryOverrides[categoryId];
      }

      return {
        cacheKey: "category",
        fillRatio: 0.76,
        paddingRatio: 0.04
      };
    }

    const overlayCard = img.closest(".preview-option--symbol-card");
    if (overlayCard && motifOverlayOptionsEl && motifOverlayOptionsEl.getAttribute("data-overlay-kind") === "custom-filesystem-outdoor") {
      const sourceName = String((img.dataset.originalSrc || img.getAttribute("src") || "").split("/").pop() || "").toLowerCase();
      const outdoorOverrides = {
        "berg-waldlinie-01.png": {
          cacheKey: "outdoor-berg-waldlinie-01",
          fillRatio: 0.9,
          paddingRatio: 0.015
        },
        "bergkette-fein-01.png": {
          cacheKey: "outdoor-bergkette-fein-01",
          fillRatio: 0.88,
          paddingRatio: 0.015
        },
        "kompassring-berg-wald.png": {
          cacheKey: "outdoor-kompassring-berg-wald",
          fillRatio: 0.84,
          paddingRatio: 0.025
        },
        "zelt-berge-kreis.png": {
          cacheKey: "outdoor-zelt-berge-kreis",
          fillRatio: 0.84,
          paddingRatio: 0.025
        }
      };
      if (outdoorOverrides[sourceName]) {
        return outdoorOverrides[sourceName];
      }

      return {
        cacheKey: "outdoor-motif",
        fillRatio: 0.84,
        paddingRatio: 0.025
      };
    }

    return null;
  }

  function clampCropBounds(bounds, width, height) {
    return {
      left: clamp(bounds.left, 0, width),
      top: clamp(bounds.top, 0, height),
      right: clamp(bounds.right, 0, width),
      bottom: clamp(bounds.bottom, 0, height)
    };
  }

  function getDarkContentBoundsFromImage(image) {
    const naturalWidth = Math.max(1, image.naturalWidth || image.width || 1);
    const naturalHeight = Math.max(1, image.naturalHeight || image.height || 1);
    const maxScanSide = 320;
    const scanScale = Math.min(1, maxScanSide / Math.max(naturalWidth, naturalHeight));
    const scanWidth = Math.max(1, Math.round(naturalWidth * scanScale));
    const scanHeight = Math.max(1, Math.round(naturalHeight * scanScale));
    const scanCanvas = document.createElement("canvas");
    scanCanvas.width = scanWidth;
    scanCanvas.height = scanHeight;
    const scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
    if (!scanCtx) return null;

    scanCtx.clearRect(0, 0, scanWidth, scanHeight);
    scanCtx.drawImage(image, 0, 0, scanWidth, scanHeight);

    const imageData = scanCtx.getImageData(0, 0, scanWidth, scanHeight).data;
    let minX = scanWidth;
    let minY = scanHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < scanHeight; y += 1) {
      for (let x = 0; x < scanWidth; x += 1) {
        const offset = (y * scanWidth + x) * 4;
        const alpha = imageData[offset + 3];
        if (alpha < 20) continue;

        const red = imageData[offset];
        const green = imageData[offset + 1];
        const blue = imageData[offset + 2];
        const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
        if (luminance > 242) continue;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX || maxY < minY) {
      return null;
    }

    return {
      left: (minX / scanWidth) * naturalWidth,
      top: (minY / scanHeight) * naturalHeight,
      right: ((maxX + 1) / scanWidth) * naturalWidth,
      bottom: ((maxY + 1) / scanHeight) * naturalHeight
    };
  }

  function loadImageForMobileThumbnailCrop(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.decoding = "async";
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  async function buildMobileThumbnailCropDataUrl(src, targetWidth, targetHeight, config) {
    const roundedWidth = Math.max(64, Math.round(targetWidth));
    const roundedHeight = Math.max(64, Math.round(targetHeight));
    const cacheKey = [src, config.cacheKey, roundedWidth, roundedHeight].join("|");
    if (mobileThumbCropCache.has(cacheKey)) {
      return mobileThumbCropCache.get(cacheKey);
    }

    const buildPromise = loadImageForMobileThumbnailCrop(src).then(function (image) {
      const naturalWidth = Math.max(1, image.naturalWidth || image.width || 1);
      const naturalHeight = Math.max(1, image.naturalHeight || image.height || 1);
      const rawBounds = getDarkContentBoundsFromImage(image) || {
        left: 0,
        top: 0,
        right: naturalWidth,
        bottom: naturalHeight
      };

      const contentWidth = Math.max(1, rawBounds.right - rawBounds.left);
      const contentHeight = Math.max(1, rawBounds.bottom - rawBounds.top);
      const padX = contentWidth * config.paddingRatio;
      const padY = contentHeight * config.paddingRatio;
      const croppedBounds = clampCropBounds({
        left: rawBounds.left - padX,
        top: rawBounds.top - padY,
        right: rawBounds.right + padX,
        bottom: rawBounds.bottom + padY
      }, naturalWidth, naturalHeight);

      const cropWidth = Math.max(1, croppedBounds.right - croppedBounds.left);
      const cropHeight = Math.max(1, croppedBounds.bottom - croppedBounds.top);
      const renderCanvas = document.createElement("canvas");
      renderCanvas.width = roundedWidth * 2;
      renderCanvas.height = roundedHeight * 2;
      const renderCtx = renderCanvas.getContext("2d");
      if (!renderCtx) {
        return src;
      }

      renderCtx.clearRect(0, 0, renderCanvas.width, renderCanvas.height);

      const targetBoxWidth = renderCanvas.width * config.fillRatio;
      const targetBoxHeight = renderCanvas.height * config.fillRatio;
      const fitScale = Math.min(targetBoxWidth / cropWidth, targetBoxHeight / cropHeight);
      const drawWidth = cropWidth * fitScale;
      const drawHeight = cropHeight * fitScale;
      const drawX = (renderCanvas.width - drawWidth) / 2;
      const drawY = (renderCanvas.height - drawHeight) / 2;

      renderCtx.drawImage(
        image,
        croppedBounds.left,
        croppedBounds.top,
        cropWidth,
        cropHeight,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );

      return renderCanvas.toDataURL("image/png");
    }).catch(function () {
      return src;
    });

    mobileThumbCropCache.set(cacheKey, buildPromise);
    return buildPromise;
  }

  async function applyMobileThumbnailCropToImage(img) {
    if (!img || !img.isConnected) return;

    if (!img.dataset.originalSrc) {
      img.dataset.originalSrc = img.getAttribute("src") || "";
    }

    const originalSrc = img.dataset.originalSrc;
    if (!originalSrc) return;

    if (!isMobileThumbnailCropViewport()) {
      if (img.getAttribute("src") !== originalSrc) {
        img.setAttribute("src", originalSrc);
      }
      img.style.removeProperty("width");
      img.style.removeProperty("height");
      img.style.removeProperty("max-width");
      img.style.removeProperty("max-height");
      img.style.removeProperty("transform");
      img.style.removeProperty("object-fit");
      img.removeAttribute("data-mobile-thumb-crop-key");
      return;
    }

    const config = classifyMobileThumbnailCropTarget(img);
    if (!config) return;

    const media = img.closest(".preview-option__thumb-media--symbol");
    if (!media) return;

    const mediaRect = media.getBoundingClientRect();
    if (mediaRect.width < 20 || mediaRect.height < 20) return;

    const cropKey = [originalSrc, config.cacheKey, Math.round(mediaRect.width), Math.round(mediaRect.height)].join("|");
    if (img.dataset.mobileThumbCropKey === cropKey) return;

    const croppedSrc = await buildMobileThumbnailCropDataUrl(originalSrc, mediaRect.width, mediaRect.height, config);
    if (!img.isConnected || img.dataset.originalSrc !== originalSrc) return;

    img.setAttribute("src", croppedSrc);
    img.dataset.mobileThumbCropKey = cropKey;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    img.style.transform = "none";
  }

  function scheduleMobileThumbnailAutoCrop() {
    if (mobileThumbCropFrame) {
      cancelAnimationFrame(mobileThumbCropFrame);
    }

    mobileThumbCropFrame = requestAnimationFrame(function () {
      mobileThumbCropFrame = 0;
      getMobileThumbnailCropTargets(document).forEach(function (img) {
        applyMobileThumbnailCropToImage(img);
      });
    });
  }

  function formatGoogleIconLabel(fileName) {
    return toTitleCase(
      String(fileName)
        .replace(/^ic_/, "")
        .replace(/_48px\.svg$/, "")
        .replace(/_/g, " ")
    );
  }

  function getSelectedFeedbackReason() {
    if (!feedbackReasonOptions) return null;
    const selectedInput = feedbackReasonOptions.querySelector('input[name="feedbackReason"]:checked');
    if (!selectedInput) return null;
    const reasonKey = selectedInput.value;
    return {
      key: reasonKey,
      label: FEEDBACK_REASON_LABELS[reasonKey] || reasonKey
    };
  }

  function getSummaryModeLabel() {
    if (!hasDesignModeSelection()) return "Noch offen";
    if (isQrMode() || (isMotifMode() && isQrSelected())) return "QR-Code";
    if (isMotifMode()) {
      if (isMonogramTemplateSelected()) return "Monogramm";
      if (isPhotoMotifSelected()) return "Foto";
      return "Motiv";
    }
    if (isTextMode()) return "Text";
    return "Noch offen";
  }

  function getSummaryContentLabel() {
    if (!hasDesignModeSelection()) return "Noch nichts gewählt";
    const content = getSideSummary(state.activeSide, state.activePendantIndex);
    if (!content) return "Noch nichts gewählt";
    return getPendantCount() > 1 && !isBottleOpenerProduct()
      ? getPendantLabel(state.activePendantIndex) + " · " + content
      : content;
  }

  function buildCustomerSummary() {
    const material = getActiveMaterial();
    const finish = getActiveFinish();
    const productName = getActiveProductDisplayName() || "Noch offen";
    const priceState = calculatePriceSummary();
    const configurationParts = [];
    let priceLabel = "Wird berechnet";
    let priceHint = "Sobald die Auswahl vollständig ist, erscheint hier die passende Preisübersicht.";

    if (isBottleOpenerProduct()) {
      configurationParts.push(productName);
      if (hasDesignModeSelection()) {
        configurationParts.push(getSummaryModeLabel());
      }
      const bottlePriceCents = getBottleOpenerSinglePriceCents();
      if (bottlePriceCents != null) {
        priceLabel = formatEuro(bottlePriceCents) + " / Stk.";
        priceHint = priceState.minQty
          ? "Staffelpreise gelten ab " + priceState.minQty + " Stück."
          : "Preis für die aktuelle Flaschenöffner-Ausführung.";
      }
    } else {
      configurationParts.push(productName === "Noch offen" ? "Schmuckanhänger" : productName);
      if (finish) {
        configurationParts.push(finish.name);
      }
      if (hasSetSelection()) {
        configurationParts.push(getActiveSetOption().shortLabel);
      }
      if (hasAnyPendantSizeSelection()) {
        configurationParts.push(getPendantCount() > 1 ? buildSizeSummaryLabel() : buildSizeSummaryLabel());
      }
      if (hasDesignModeSelection()) {
        configurationParts.push(getSideLabel(state.activeSide));
        configurationParts.push(getSummaryModeLabel());
      }
    }

    if (!isBottleOpenerProduct() && priceState.items.length) {
      priceLabel = formatEuro(priceState.totalCents);
      priceHint = priceState.discountRate
        ? "Gesamtpreis inklusive Set-Rabatt."
        : "Gesamtpreis für die aktuelle Auswahl.";
    } else if (!isBottleOpenerProduct() && priceState.invalidReason) {
      priceHint = priceState.invalidReason;
    }

    return {
      configurationLabel: configurationParts.filter(Boolean).join(" · ") || (material ? material.name : "Noch offen"),
      contentLabel: getSummaryContentLabel(),
      priceLabel: priceLabel,
      priceHint: priceHint
    };
  }

  function getFilesystemLabelBase(fileName) {
    return String(fileName)
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatFilesystemVariantLabel(fileName, allFiles) {
    const stem = getFilesystemLabelBase(fileName);
    const match = stem.match(/^(.*?)(?:\s+0*([0-9]+))$/);
    const candidateBase = match ? match[1].trim() : stem;
    const variantNumber = match ? String(parseInt(match[2], 10)) : "";
    const normalizedBase = candidateBase || stem;

    const duplicateCount = (allFiles || []).filter(function (otherFileName) {
      const otherStem = getFilesystemLabelBase(otherFileName);
      const otherMatch = otherStem.match(/^(.*?)(?:\s+0*([0-9]+))$/);
      const otherBase = otherMatch ? otherMatch[1].trim() : otherStem;
      return otherBase === normalizedBase;
    }).length;

    return toTitleCase(
      duplicateCount > 1 && variantNumber
        ? normalizedBase + " " + variantNumber
        : normalizedBase
    );
  }

  function applyPreviewCardConfig(button, config) {
    if (!button || !config) return;
    if (config.profile) {
      button.classList.add("preview-option--preview-profile-" + config.profile);
      button.setAttribute("data-preview-profile", config.profile);
    }
    if (config.scale != null) {
      button.style.setProperty("--preview-scale", String(config.scale));
    }
    if (config.offsetX != null) {
      button.style.setProperty("--preview-offset-x", config.offsetX);
    }
    if (config.offsetY != null) {
      button.style.setProperty("--preview-offset-y", config.offsetY);
    }
    if (config.maxWidth != null) {
      button.style.setProperty("--preview-asset-max-width", config.maxWidth);
    }
    if (config.maxHeight != null) {
      button.style.setProperty("--preview-asset-max-height", config.maxHeight);
    }
    if (config.thumbHeight != null) {
      button.style.setProperty("--symbol-thumb-height", config.thumbHeight);
    }
    if (config.thumbPadding != null) {
      button.style.setProperty("--symbol-thumb-padding", config.thumbPadding);
    }
    if (config.mediaPadding != null) {
      button.style.setProperty("--symbol-media-padding", config.mediaPadding);
    }
  }

  function getActiveCategoryPreviewConfig(categoryId) {
    const normalized = String(categoryId || "").toLowerCase();
    const categoryConfigMap = {
      "tiere": {
        profile: "category-symbol",
        scale: 1.36,
        offsetX: "0%",
        offsetY: "3%",
        maxWidth: "100%",
        maxHeight: "100%",
        thumbHeight: "192px",
        thumbPadding: "8px",
        mediaPadding: "6px"
      },
      "google-symbole": {
        profile: "category-symbol",
        scale: 1.56,
        offsetX: "0%",
        offsetY: "1%",
        maxWidth: "100%",
        maxHeight: "100%",
        thumbHeight: "192px",
        thumbPadding: "8px",
        mediaPadding: "6px"
      },
      "runen": {
        profile: "category-rune",
        scale: 1.8,
        offsetX: "0%",
        offsetY: "0%",
        maxWidth: "100%",
        maxHeight: "100%",
        thumbHeight: "196px",
        thumbPadding: "8px",
        mediaPadding: "8px"
      },
      "outdoor": {
        profile: "category-wide",
        scale: 2.18,
        offsetX: "0%",
        offsetY: "12%",
        maxWidth: "100%",
        maxHeight: "100%",
        thumbHeight: "196px",
        thumbPadding: "6px",
        mediaPadding: "4px"
      }
    };

    return categoryConfigMap[normalized] || {
      profile: "category-symbol",
      scale: 1.24,
      offsetX: "0%",
      offsetY: "0%",
      maxWidth: "100%",
      maxHeight: "100%"
    };
  }

  function getOutdoorVariantPreviewConfig(fileName) {
    const normalized = String(fileName || "").toLowerCase();
    const outdoorConfigMap = {
      "berg-waldlinie-01.png": { profile: "motif-wide", scale: 2.02, offsetX: "0%", offsetY: "16%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "224px", thumbPadding: "4px", mediaPadding: "2px" },
      "bergkette-fein-01.png": { profile: "motif-wide", scale: 1.94, offsetX: "0%", offsetY: "12%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "224px", thumbPadding: "4px", mediaPadding: "2px" },
      "berg-panorama-tal-wasser.png": { profile: "motif-wide", scale: 1.84, offsetX: "0%", offsetY: "10%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "226px", thumbPadding: "4px", mediaPadding: "2px" },
      "bergpanorama-wald-vorne.png": { profile: "motif-wide", scale: 1.76, offsetX: "0%", offsetY: "8%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "230px", thumbPadding: "4px", mediaPadding: "2px" },
      "einzelberg-schraffur.png": { profile: "motif-compact", scale: 1.86, offsetX: "0%", offsetY: "8%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "236px", thumbPadding: "4px", mediaPadding: "2px" },
      "kompass-berg-wald-weg.png": { profile: "motif-round", scale: 1.74, offsetX: "0%", offsetY: "4%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "242px", thumbPadding: "4px", mediaPadding: "2px" },
      "kompassring-berg-wald.png": { profile: "motif-round", scale: 1.92, offsetX: "0%", offsetY: "2%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "242px", thumbPadding: "4px", mediaPadding: "2px" },
      "topo-berg-konturlinien-01.png": { profile: "motif-wide", scale: 1.8, offsetX: "0%", offsetY: "8%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "228px", thumbPadding: "4px", mediaPadding: "2px" },
      "trailrunnerin-berglandschaft-kreis.png": { profile: "motif-round", scale: 1.72, offsetX: "0%", offsetY: "5%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "242px", thumbPadding: "4px", mediaPadding: "2px" },
      "wanderer-grat-kreis.png": { profile: "motif-round", scale: 1.74, offsetX: "0%", offsetY: "5%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "242px", thumbPadding: "4px", mediaPadding: "2px" },
      "zelt-berge-kreis.png": { profile: "motif-round", scale: 1.86, offsetX: "0%", offsetY: "4%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "242px", thumbPadding: "4px", mediaPadding: "2px" },
      "wanderer-trail-kompakt-01.png": { profile: "motif-compact", scale: 1.9, offsetX: "0%", offsetY: "10%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "236px", thumbPadding: "4px", mediaPadding: "2px" },
      "wanderer-trail-kompakt-02.png": { profile: "motif-compact", scale: 1.96, offsetX: "0%", offsetY: "10%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "236px", thumbPadding: "4px", mediaPadding: "2px" },
      "mountainbike-berglandschaft-detail.png": { profile: "motif-compact", scale: 1.82, offsetX: "0%", offsetY: "8%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "236px", thumbPadding: "4px", mediaPadding: "2px" },
      "mountainbike-kompakt.png": { profile: "motif-compact", scale: 2.08, offsetX: "1%", offsetY: "8%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "238px", thumbPadding: "4px", mediaPadding: "2px" },
      "lagerfeuer-berge-kreis.png": { profile: "motif-round", scale: 1.92, offsetX: "0%", offsetY: "6%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "242px", thumbPadding: "4px", mediaPadding: "2px" },
      "lagerfeuer-berge-offen.png": { profile: "motif-compact", scale: 2.0, offsetX: "0%", offsetY: "12%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "238px", thumbPadding: "4px", mediaPadding: "2px" },
      "gipfelkreuz-landschaft-detail.png": { profile: "motif-compact", scale: 1.78, offsetX: "0%", offsetY: "7%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "236px", thumbPadding: "4px", mediaPadding: "2px" },
      "gipfelkreuz-berge-kompakt.png": { profile: "motif-compact", scale: 2.08, offsetX: "0%", offsetY: "8%", maxWidth: "100%", maxHeight: "100%", thumbHeight: "238px", thumbPadding: "4px", mediaPadding: "2px" }
    };

    return outdoorConfigMap[normalized] || {
      profile: "motif-compact",
      scale: 1.45,
      offsetX: "0%",
      offsetY: "0%",
      maxWidth: "100%",
      maxHeight: "100%"
    };
  }

  function getCustomFilesystemSymbolCategoryById(categoryId) {
    const categories = Array.isArray(symbolSourceRegistry && symbolSourceRegistry.custom && symbolSourceRegistry.custom.categories)
      ? symbolSourceRegistry.custom.categories
      : [];

    return categories.find(function (category) {
      return category.id === categoryId && category.sourceType === "filesystem-svg" && Array.isArray(category.files);
    }) || null;
  }

  function buildFilesystemSvgVariantsForCategory(categoryId) {
    const category = getCustomFilesystemSymbolCategoryById(categoryId);
    if (!category || !category.sourcePath) return [];

    const kindId = "custom-filesystem-" + categoryId;
    return category.files.map(function (fileName) {
      return {
        id: kindId + "-" + fileName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase(),
        kindId: kindId,
        parentId: "emblem",
        name: formatFilesystemVariantLabel(fileName, category.files),
        description: "",
        imageSrc: category.sourcePath.replace(/\/$/, "") + "/" + fileName
      };
    });
  }

  function getVariantMetaText(variant) {
    const description = variant && typeof variant.description === "string" ? variant.description.trim() : "";
    if (!description) return "";
    if (/^[a-z0-9-]+\/svg\/production\/.+\.svg$/i.test(description)) {
      return "";
    }
    return description;
  }

  function getGoogleRegistryCategoryById(categoryId) {
    const categories = Array.isArray(symbolSourceRegistry && symbolSourceRegistry.google && symbolSourceRegistry.google.categories)
      ? symbolSourceRegistry.google.categories
      : [];

    return categories.find(function (category) {
      return category.id === categoryId;
    }) || null;
  }

  function getGoogleBrowserGroups() {
    return GOOGLE_BROWSER_GROUP_IDS.map(function (groupId) {
      const registryCategory = getGoogleRegistryCategoryById(groupId);
      const files = GOOGLE_BROWSER_GROUP_FILES[groupId] || [];
      const previewFile = files[0] || "";

      return {
        id: groupId,
        kindId: "google-group-" + groupId,
        label: groupId,
        registryLabel: registryCategory ? registryCategory.label : groupId,
        previewSrc: previewFile
          ? "/assets/tools/vorschau/google/material-design-icons-3.0.0/" + groupId + "/svg/production/" + previewFile
          : "",
        visibleCount: files.length
      };
    }).filter(function (group) {
      return Boolean(group.previewSrc);
    });
  }

  function buildGoogleBrowserVariants() {
    return GOOGLE_BROWSER_GROUP_IDS.reduce(function (allVariants, groupId) {
      const kindId = "google-group-" + groupId;
      return allVariants.concat((GOOGLE_BROWSER_GROUP_FILES[groupId] || []).map(function (fileName) {
        return {
          id: "google-group-" + groupId + "-" + fileName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase(),
          kindId: kindId,
          parentId: "emblem",
          name: formatGoogleIconLabel(fileName),
          description: groupId + "/svg/production/" + fileName,
          imageSrc: "/assets/tools/vorschau/google/material-design-icons-3.0.0/" + groupId + "/svg/production/" + fileName
        };
      }));
    }, []);
  }

  function createSideState() {
    return {
      designMode: null,
      templateId: null,
      animalGroupId: null,
      motifVariantId: null,
      emblemVariantId: null,
      uploadedImage: null,
      uploadedImageSrc: "",
      uploadedFileName: "",
      monogramValue: "",
      monogramFontId: MONOGRAM_FONT_LIBRARY[0].id,
      qrValue: "",
      qrCodeModel: null,
      qrCodeModelValue: "",
      emblemKindId: null,
      symbolTemplateCategoryId: null,
      googleSymbolGroupId: null,
      emblemSourceMode: "template",
      scalePercent: 100,
      stretchXPercent: 100,
      stretchYPercent: 100,
      offsetX: 0,
      offsetY: 0,
      rotationDeg: 0,
      textValue: "",
      textScalePercent: 100,
      textFontId: TEXT_FONT_LIBRARY[0].id,
      textStyles: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false
      },
      textOffsetX: 0,
      textOffsetY: 0
    };
  }

  function createPendantState() {
    return {
      sizeId: null,
      backSideEnabled: false,
      sides: {
        front: createSideState(),
        back: createSideState()
      }
    };
  }

  function createInitialState() {
    return {
      materialId: null,
      productFamilyId: null,
      productId: null,
      finishId: null,
      setId: SET_LIBRARY[0].id,
      activePendantIndex: 0,
      activeSide: "front",
      pendants: [createPendantState()],
      motifOverlayStep: "groups",
      isDragging: false,
      dragOrigin: null,
      isMotifVariantOverlayOpen: false
    };
  }

  function bindEvents() {
    window.addEventListener("resize", scheduleMobileThumbnailAutoCrop);
    enableBackSideButton.addEventListener("click", enableBackSide);

    sideFrontButton.addEventListener("click", function () {
      setActiveSide("front");
    });

    sideBackButton.addEventListener("click", function () {
      setActiveSide("back");
    });

    scaleSlider.addEventListener("input", function () {
      getActiveSideState().scalePercent = Number(scaleSlider.value);
      clampPlacement();
      syncUi();
      queueRender();
    });

    if (stretchXSlider) {
      stretchXSlider.addEventListener("input", function () {
        getActiveSideState().stretchXPercent = clamp(Number(stretchXSlider.value), 70, 140);
        clampPlacement();
        syncUi();
        queueRender();
      });
    }

    if (stretchYSlider) {
      stretchYSlider.addEventListener("input", function () {
        getActiveSideState().stretchYPercent = clamp(Number(stretchYSlider.value), 70, 140);
        clampPlacement();
        syncUi();
        queueRender();
      });
    }

    if (rotationSlider) {
      rotationSlider.addEventListener("input", function () {
        getActiveSideState().rotationDeg = clamp(Number(rotationSlider.value), -180, 180);
        syncUi();
        queueRender();
      });
    }

    textSizeSlider.addEventListener("input", function () {
      getActiveSideState().textScalePercent = Number(textSizeSlider.value);
      clampTextPlacement();
      syncUi();
      queueRender();
    });

    textInput.addEventListener("input", function () {
      const activeSideState = getActiveSideState();
      activeSideState.textValue = normalizeTextValue(textInput.value);
      if (textInput.value !== activeSideState.textValue) {
        textInput.value = activeSideState.textValue;
      }
      clampTextPlacement();
      syncUi();
      queueRender();
    });

    textFontSelect.addEventListener("change", function () {
      getActiveSideState().textFontId = textFontSelect.value;
      syncFontSelectPreview(textFontSelect, TEXT_FONT_LIBRARY);
      clampTextPlacement();
      syncUi();
      queueRender();
    });

    qrInput.addEventListener("input", function () {
      const activeSideState = getActiveSideState();
      activeSideState.qrValue = normalizeQrValue(qrInput.value);
      activeSideState.qrCodeModel = null;
      activeSideState.qrCodeModelValue = "";
      if (qrInput.value !== activeSideState.qrValue) {
        qrInput.value = activeSideState.qrValue;
      }
      clampPlacement();
      syncUi();
      queueRender();
    });

    if (monogramInput) {
      monogramInput.addEventListener("input", function () {
        const activeSideState = getActiveSideState();
        activeSideState.monogramValue = normalizeMonogramValue(monogramInput.value);
        if (monogramInput.value !== activeSideState.monogramValue) {
          monogramInput.value = activeSideState.monogramValue;
        }
        clampPlacement();
        syncUi();
        queueRender();
      });
    }

    if (monogramFontSelect) {
      monogramFontSelect.addEventListener("change", function () {
        getActiveSideState().monogramFontId = monogramFontSelect.value;
        syncFontSelectPreview(monogramFontSelect, MONOGRAM_FONT_LIBRARY);
        clampPlacement();
        syncUi();
        queueRender();
      });
    }

    document.querySelectorAll("[data-text-style]").forEach((button) => {
      button.addEventListener("click", function () {
        const styleName = button.getAttribute("data-text-style");
        const activeSideState = getActiveSideState();
        if (!Object.prototype.hasOwnProperty.call(activeSideState.textStyles, styleName)) return;
        activeSideState.textStyles[styleName] = !activeSideState.textStyles[styleName];
        clampTextPlacement();
        syncUi();
        queueRender();
      });
    });

    uploadInput.addEventListener("change", onUploadChange);
    motifVariantOverlayBackdrop.addEventListener("click", closeMotifVariantOverlay);
    closeMotifVariantOverlayButton.addEventListener("click", closeMotifVariantOverlay);
    motifVariantOverlayBackButton.addEventListener("click", showAnimalGroupOverlay);
    if (openFeedbackOverlayButton) {
      openFeedbackOverlayButton.addEventListener("click", openFeedbackOverlay);
    }
    if (feedbackOverlayBackdrop) {
      feedbackOverlayBackdrop.addEventListener("click", closeFeedbackOverlay);
    }
    if (closeFeedbackOverlayButton) {
      closeFeedbackOverlayButton.addEventListener("click", closeFeedbackOverlay);
    }
    if (submitFeedbackButton) {
      submitFeedbackButton.addEventListener("click", submitFeedbackReport);
    }
    if (toggleSummaryButton) {
      toggleSummaryButton.addEventListener("click", toggleSummaryPanel);
    }
    if (openSummaryMobileButton) {
      openSummaryMobileButton.addEventListener("click", toggleSummaryPanel);
    }
    if (openSummaryMobileFooterButton) {
      openSummaryMobileFooterButton.addEventListener("click", toggleSummaryPanel);
    }
    if (previewSummaryBackdrop) {
      previewSummaryBackdrop.addEventListener("click", function () {
        setSummaryOpen(false);
      });
    }
    if (closeSummaryButton) {
      closeSummaryButton.addEventListener("click", function () {
        setSummaryOpen(false);
      });
    }
    clearTextButton.addEventListener("click", clearText);
    clearQrButton.addEventListener("click", clearQrValue);
    if (emblemSourceTemplateButton) {
      emblemSourceTemplateButton.addEventListener("click", function () {
        setEmblemSourceMode("template");
        if (isMotifMode() && isEmblemTemplateSelected()) {
          openMotifVariantOverlay("emblemVariants");
        }
      });
    }

    initializeFontSelectPreviews();
    if (emblemSourceUploadButton) {
      emblemSourceUploadButton.addEventListener("click", function () {
        setEmblemSourceMode("upload");
        openEmblemUpload();
      });
    }
    if (motifOverlayUploadButton) {
      motifOverlayUploadButton.addEventListener("click", openEmblemUpload);
    }
    if (motifOverlayUploadRemoveButton) {
      motifOverlayUploadRemoveButton.addEventListener("click", function () {
        if (!isEmblemUploadSelected()) return;
        clearUploadedImage();
      });
    }
    if (clearEmblemUploadButton) {
      clearEmblemUploadButton.addEventListener("click", function () {
        if (!isEmblemUploadSelected()) return;
        clearUploadedImage();
      });
    }
    if (resetPlacementButton) {
      resetPlacementButton.addEventListener("click", resetAllSelections);
    }
    centerPlacementButton.addEventListener("click", centerPlacement);
    centerTextButton.addEventListener("click", centerTextPlacement);
    [downloadPreviewButton, downloadPreviewButtonMobile].filter(Boolean).forEach((button) => {
      button.addEventListener("click", downloadPreview);
    });
    requestWhatsappLink.addEventListener("click", closeRequestMenu);
    requestEmailLink.addEventListener("click", closeRequestMenu);
    if (requestWhatsappLinkMobile) {
      requestWhatsappLinkMobile.addEventListener("click", closeRequestMenu);
    }
    if (requestEmailLinkMobile) {
      requestEmailLinkMobile.addEventListener("click", closeRequestMenu);
    }

    document.querySelectorAll("[data-nudge]").forEach((button) => {
      button.addEventListener("click", function () {
        nudgePlacement(button.getAttribute("data-nudge"));
      });
    });

    document.querySelectorAll("[data-text-nudge]").forEach((button) => {
      button.addEventListener("click", function () {
        nudgeTextPlacement(button.getAttribute("data-text-nudge"));
      });
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
    if (mobileCanvas) {
      mobileCanvas.style.touchAction = "none";
      mobileCanvas.addEventListener("pointerdown", onMobilePreviewPointerDown);
      mobileCanvas.addEventListener("pointermove", onMobilePreviewPointerMove);
      mobileCanvas.addEventListener("pointerup", onMobilePreviewPointerUp);
      mobileCanvas.addEventListener("pointercancel", onMobilePreviewPointerUp);
      mobileCanvas.addEventListener("pointerleave", onMobilePreviewPointerUp);
    }
    canvas.addEventListener("keydown", onCanvasKeydown);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);
    canvas.tabIndex = 0;
  }

  function getPendantState(pendantIndex) {
    return state.pendants[pendantIndex] || state.pendants[0];
  }

  function getActivePendantState() {
    return getPendantState(state.activePendantIndex);
  }

  function getSetOptionById(setId) {
    return SET_LIBRARY.find((option) => option.id === setId) || SET_LIBRARY[0];
  }

  function getActiveSetOption() {
    return getSetOptionById(state.setId);
  }

  function getPendantCount() {
    return getActiveSetOption().count;
  }

  function requiresFinishSelection() {
    const productFamily = getActiveProductFamily();
    return Boolean(productFamily && Array.isArray(productFamily.finishes) && productFamily.finishes.length > 0);
  }

  function hasFinishSelection() {
    return !requiresFinishSelection() || Boolean(state.finishId);
  }

  function getPendantIndices() {
    return Array.from({ length: getPendantCount() }, function (_, index) {
      return index;
    });
  }

  function getPendantLabel(pendantIndex) {
    return "Anhänger " + (pendantIndex + 1);
  }

  function getPendantTabLabel(pendantIndex) {
    const size = getActiveSize(pendantIndex);
    return size ? getPendantLabel(pendantIndex) + " · " + size.label : getPendantLabel(pendantIndex);
  }

  function buildPendantSizeSummaryText() {
    return getPendantIndices().map(function (pendantIndex) {
      const size = getActiveSize(pendantIndex);
      return getPendantLabel(pendantIndex) + ": " + (size ? size.label : "offen");
    }).join(" · ");
  }

  function buildSizeSummaryLabel() {
    if (!hasAnyPendantSizeSelection()) {
      return "Offen";
    }

    const labels = getPendantIndices().map(function (pendantIndex) {
      const size = getActiveSize(pendantIndex);
      return size ? size.label : "offen";
    });
    const uniqueLabels = Array.from(new Set(labels));

    return uniqueLabels.length === 1 ? uniqueLabels[0] : "individuell";
  }

  function getSideState(sideId, pendantIndex) {
    return getPendantState(pendantIndex == null ? state.activePendantIndex : pendantIndex).sides[sideId || state.activeSide];
  }

  function getActiveSideState() {
    return getSideState(state.activeSide);
  }

  function isBackSideEnabled(pendantIndex) {
    return getPendantState(pendantIndex == null ? state.activePendantIndex : pendantIndex).backSideEnabled;
  }

  function getSideLabel(sideId) {
    return sideId === "back" ? "Rückseite" : "Vorderseite";
  }

  function hasAnyBackSideEnabled() {
    return getPendantIndices().some(function (pendantIndex) {
      return isBackSideEnabled(pendantIndex);
    });
  }

  function getSizeGroup(size) {
    if (!size) return null;
    if (size.diameterMm <= 12) return "S";
    if (size.diameterMm === 15) return "M";
    return "L";
  }

  function getBasePriceForSize(size) {
    const sizeGroup = getSizeGroup(size);
    return sizeGroup ? PRICE_BY_SIZE_GROUP_CENTS[sizeGroup] : 0;
  }

  function getSetDiscountRate(pendantCount) {
    return SET_DISCOUNT_RATES[pendantCount] || 0;
  }

  function getJewelrySetBasePriceCents(count) {
    return JEWELRY_SET_BASE_PRICES_CENTS[count] || JEWELRY_SET_BASE_PRICES_CENTS[1];
  }

  function roundCentsToFive(cents) {
    return Math.round(cents / 5) * 5;
  }

  function getSelectedSideType(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    if (!sideState.designMode) return null;

    if (sideState.designMode === "text") {
      return "text";
    }

    if (sideState.designMode === "qr") {
      return "qr";
    }

    const template = getActiveTemplate(sideId, pendantIndex);
    if (!template) return null;

    if (template.category === "photo") {
      return "photo";
    }

    if (template.category === "monogram") {
      return "motif";
    }

    if (template.category === "emblem" && getSideState(sideId, pendantIndex).emblemVariantId === "qr") {
      return "qr";
    }

    return "motif";
  }

  function getSideContentType(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    if (!sideState.designMode) return null;

    if (sideState.designMode === "text") {
      return sideState.textValue.trim() ? "text" : null;
    }

    if (sideState.designMode === "qr") {
      return sideState.qrValue.trim() ? "qr" : null;
    }

    const template = getActiveTemplate(sideId, pendantIndex);
    if (!template) return null;

    if (template.category === "photo") {
      return sideState.uploadedImageSrc ? "photo" : null;
    }

    if (template.category === "monogram") {
      return hasMonogramValue(sideId, pendantIndex) ? "motif" : null;
    }

    if (template.category === "emblem" && getSideState(sideId, pendantIndex).emblemVariantId === "qr") {
      return getSideState(sideId, pendantIndex).qrValue.trim() ? "qr" : null;
    }

    if (template.category === "emblem" && isEmblemUploadSelected(sideId, pendantIndex)) {
      return sideState.uploadedImageSrc ? "motif" : null;
    }

    if (template.category === "animal-symbols") {
      return getSideState(sideId, pendantIndex).motifVariantId ? "motif" : null;
    }

    if (template.category === "emblem") {
      return getSideState(sideId, pendantIndex).emblemVariantId ? "motif" : null;
    }

    return "motif";
  }

  function isSideConfigured(sideId, pendantIndex) {
    if (sideId === "back" && !isBackSideEnabled(pendantIndex)) {
      return true;
    }

    return Boolean(getSideContentType(sideId, pendantIndex));
  }

  function canUsePhotoOnPendant(pendantIndex) {
    const size = getActiveSize(pendantIndex);
    return Boolean(size && size.diameterMm >= 12);
  }

  function getPhotoIdentityKey(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return sideState.uploadedImageSrc || "";
  }

  function hasAnyPhotoSelection() {
    return getPendantIndices().some(function (pendantIndex) {
      return SIDE_IDS.some(function (sideId) {
        return isPhotoMotifSelected(sideId, pendantIndex);
      });
    });
  }

  function priceEuroToCents(value) {
    if (value == null || value === "") return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Math.round(numeric * 100);
  }

  function getBottleOpenerPricingVariant() {
    const pricingProducts = EXTERNAL_PRICING && EXTERNAL_PRICING.products;
    const metalPricing = pricingProducts && pricingProducts.metall;
    const variants = metalPricing && metalPricing.variants;
    return variants && variants.flaschenoeffner ? variants.flaschenoeffner : null;
  }

  function getBottleOpenerSinglePriceCents() {
    const pricingVariant = getBottleOpenerPricingVariant();
    return pricingVariant ? priceEuroToCents(pricingVariant.singlePrice) : null;
  }

  function getBottleOpenerLowestTierPriceCents() {
    const pricingVariant = getBottleOpenerPricingVariant();
    if (!pricingVariant || !Array.isArray(pricingVariant.tiers)) return null;

    const tierPrices = pricingVariant.tiers.map(function (tier) {
      return priceEuroToCents(tier.price);
    }).filter(function (priceCents) {
      return priceCents != null;
    });

    if (!tierPrices.length) return null;
    return Math.min.apply(Math, tierPrices);
  }

  function formatBottleOpenerTierLabel(tier) {
    if (!tier) return "Staffel";
    const min = Number.isFinite(Number(tier.min)) ? Number(tier.min) : null;
    const max = Number.isFinite(Number(tier.max)) ? Number(tier.max) : null;

    if (min != null && max != null) {
      return min + "–" + max + " Stk.";
    }
    if (min != null) {
      return "ab " + min + " Stk.";
    }
    if (max != null) {
      return "bis " + max + " Stk.";
    }
    return "Staffel";
  }

  function getBottleOpenerPriceItems() {
    const pricingVariant = getBottleOpenerPricingVariant();
    const singlePriceCents = getBottleOpenerSinglePriceCents();
    const items = [];

    if (singlePriceCents != null) {
      items.push({
        label: "Einzelstück",
        sizeLabel: "",
        totalCents: singlePriceCents,
        displayPrice: formatEuro(singlePriceCents) + " / Stk.",
        metaParts: ["Privatkundenpreis"],
        isOnRequest: false,
        isSinglePrice: true
      });
    }

    if (pricingVariant && Array.isArray(pricingVariant.tiers) && pricingVariant.tiers.length) {
      return items.concat(pricingVariant.tiers.map(function (tier) {
        const cents = priceEuroToCents(tier.price);
        return {
          label: formatBottleOpenerTierLabel(tier),
          sizeLabel: "",
          totalCents: cents || 0,
          displayPrice: cents != null ? formatEuro(cents) + " / Stk." : (tier.note || "Auf Anfrage"),
          metaParts: cents != null ? ["Basispreis pro Stück"] : [tier.note || "Preis auf Anfrage"],
          isOnRequest: cents == null
        };
      }));
    }

    return items.length ? items : [
      {
        label: "Startpreis",
        sizeLabel: "",
        totalCents: BOTTLE_OPENER_FALLBACK_START_CENTS,
        displayPrice: formatEuro(BOTTLE_OPENER_FALLBACK_START_CENTS) + " / Stk.",
        metaParts: ["Aktuell nur oberste Gravurfläche berücksichtigt."],
        isOnRequest: false
      }
    ];
  }

  function calculatePriceSummary() {
    const result = {
      isReady: false,
      subtotalCents: 0,
      discountCents: 0,
      totalCents: 0,
      discountRate: getSetDiscountRate(getPendantCount()),
      pendantCount: getPendantCount(),
      hasPhoto: false,
      hasPhotoAt12mm: false,
      invalidReason: "",
      items: []
    };

    if (isBottleOpenerProduct()) {
      const pricingVariant = getBottleOpenerPricingVariant();
      const priceItems = getBottleOpenerPriceItems();
      const firstPricedItem = priceItems.find(function (item) {
        return !item.isOnRequest && item.totalCents > 0;
      }) || null;

      result.pricingMode = "bottle-opener";
      result.discountRate = 0;
      result.minQty = pricingVariant && pricingVariant.minQty ? pricingVariant.minQty : 1;
      result.items = priceItems;
      result.subtotalCents = firstPricedItem ? firstPricedItem.totalCents : 0;
      result.totalCents = result.subtotalCents;
      result.discountCents = 0;
      result.isReady = true;
      result.invalidReason = pricingVariant && Array.isArray(pricingVariant.tiers) && pricingVariant.tiers.length
        ? "Preis pro Stück laut bestehender Staffel im Kalkulator. Aktuell berücksichtigt ist die oberste Gravurfläche."
        : "Startpreis für die aktuell programmierte Gravurfläche.";
      return result;
    }

    if (!hasMaterialSelection() || !hasProductSelection() || !hasSetSelection()) {
      result.invalidReason = "Preis wird berechnet, sobald Material, Produkt und Set gewählt sind.";
      return result;
    }

    const hasAnyPhotoInPendantSet = getPendantIndices().some(function (pendantIndex) {
      return SIDE_IDS.some(function (sideId) {
        if (sideId === "back" && !isBackSideEnabled(pendantIndex)) {
          return false;
        }
        return getSelectedSideType(sideId, pendantIndex) === "photo";
      });
    });

    if (!hasAnyPhotoInPendantSet) {
      const baseSetPriceCents = getJewelrySetBasePriceCents(getPendantCount());
      result.discountRate = 0;
      result.subtotalCents = baseSetPriceCents;
      result.items.push({
        label: getActiveSetOption().name,
        sizeLabel: "",
        baseCents: baseSetPriceCents,
        backCents: 0,
        totalCents: baseSetPriceCents,
        displayPrice: formatEuro(baseSetPriceCents),
        metaParts: ["Basispreis"]
      });

      for (let pendantIndex = 0; pendantIndex < getPendantCount(); pendantIndex += 1) {
        const size = getActiveSize(pendantIndex);
        if (!size) {
          result.invalidReason = "Preis wird berechnet, sobald alle Anhänger eine Größe haben.";
          return result;
        }

        if (!isBackSideEnabled(pendantIndex)) {
          continue;
        }

        result.subtotalCents += BACK_SIDE_STANDARD_CENTS;
        result.items.push({
          pendantIndex: pendantIndex,
          label: getPendantLabel(pendantIndex),
          sizeLabel: getSideLabel("back"),
          baseCents: 0,
          backCents: BACK_SIDE_STANDARD_CENTS,
          totalCents: BACK_SIDE_STANDARD_CENTS,
          displayPrice: formatEuro(BACK_SIDE_STANDARD_CENTS),
          metaParts: ["Rückseite +" + formatEuro(BACK_SIDE_STANDARD_CENTS)]
        });
      }

      result.totalCents = result.subtotalCents;
      result.discountCents = 0;
      result.isReady = true;
      result.invalidReason = "Preis basiert auf dem Setpreis und optional aktivierten Rückseiten.";
      return result;
    }

    const preparedPhotoKeys = new Set();

    function getChargeForPhotoSide(sideId, pendantIndex) {
      const size = getActiveSize(pendantIndex);
      if (!canUsePhotoOnPendant(pendantIndex)) {
        result.invalidReason = "Foto ist erst ab 12 mm möglich.";
        return 0;
      }

      result.hasPhoto = true;
      if (size && size.diameterMm === 12) {
        result.hasPhotoAt12mm = true;
      }

      const sideType = getSideContentType(sideId, pendantIndex);
      const photoKey = sideType === "photo"
        ? getPhotoIdentityKey(sideId, pendantIndex)
        : "pending-photo-" + pendantIndex + "-" + sideId;

      if (!preparedPhotoKeys.has(photoKey)) {
        preparedPhotoKeys.add(photoKey);
        return PHOTO_NEW_PREP_CENTS;
      }

      return sideId === "front" ? PHOTO_REPEAT_FRONT_CENTS : PHOTO_REPEAT_BACK_CENTS;
    }

    for (let pendantIndex = 0; pendantIndex < getPendantCount(); pendantIndex += 1) {
      const size = getActiveSize(pendantIndex);
      if (!size) {
        result.invalidReason = "Preis wird berechnet, sobald alle Anhänger eine Größe haben.";
        return result;
      }

      const frontSelectedType = getSelectedSideType("front", pendantIndex);
      const backSelectedType = isBackSideEnabled(pendantIndex) ? getSelectedSideType("back", pendantIndex) : null;
      const item = {
        pendantIndex: pendantIndex,
        label: getPendantLabel(pendantIndex),
        sizeLabel: size.label,
        baseCents: 0,
        backCents: 0,
        totalCents: 0,
        metaParts: []
      };

      item.baseCents = frontSelectedType === "photo"
        ? getChargeForPhotoSide("front", pendantIndex)
        : getBasePriceForSize(size);
      item.metaParts.push((frontSelectedType === "photo" ? "Foto Vorderseite " : "Basis ") + formatEuro(item.baseCents));

      if (isBackSideEnabled(pendantIndex)) {
        item.backCents = backSelectedType === "photo"
          ? getChargeForPhotoSide("back", pendantIndex)
          : BACK_SIDE_STANDARD_CENTS;
        item.metaParts.push((backSelectedType === "photo" ? "Foto Rückseite " : "Rückseite +") + formatEuro(item.backCents));
      }

      item.totalCents = item.baseCents + item.backCents;
      result.subtotalCents += item.totalCents;
      result.items.push(item);
    }

    const discountMultiplier = 1 - result.discountRate;
    const discountedCents = Math.round(result.subtotalCents * discountMultiplier);
    result.totalCents = roundCentsToFive(discountedCents);
    result.discountCents = Math.max(0, result.subtotalCents - result.totalCents);
    result.isReady = true;

    if (!result.invalidReason) {
      result.invalidReason = result.hasPhoto
        ? "Foto wird bei identischem Bild automatisch rabattiert. Ohne identische Bilddatei wird zunächst neue Aufbereitung gerechnet."
        : "Preis basiert auf Größenwahl, aktivierten Rückseiten und Set-Rabatt.";
    }

    return result;
  }

  function getEnabledSideIds() {
    return hasAnyBackSideEnabled() ? SIDE_IDS.slice() : ["front"];
  }

  function hasMeaningfulSideConfiguration(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);

    if (!sideState.designMode) {
      return false;
    }

    if (sideState.designMode === "motif") {
      if (sideState.uploadedImage) {
        return true;
      }

      const template = getActiveTemplate(sideId, pendantIndex);
      if (!template) {
        return false;
      }

      if (template.category === "photo") {
        return false;
      }

      if (template.category === "monogram") {
        return hasMonogramValue(sideId, pendantIndex);
      }

      if (template.category === "animal-symbols") {
        return Boolean(getSideState(sideId, pendantIndex).motifVariantId);
      }

      if (template.category === "emblem") {
        if (isEmblemUploadSelected(sideId, pendantIndex)) {
          return Boolean(getSideState(sideId, pendantIndex).uploadedImage);
        }
        if (getSideState(sideId, pendantIndex).emblemVariantId === "qr") {
          return getSideState(sideId, pendantIndex).qrValue.trim().length > 0;
        }
        return Boolean(getSideState(sideId, pendantIndex).emblemVariantId);
      }

      return true;
    }

    if (sideState.designMode === "text") {
      return sideState.textValue.trim().length > 0;
    }

    return false;
  }

  function isFrontConfigured(pendantIndex) {
    return hasMeaningfulSideConfiguration("front", pendantIndex == null ? state.activePendantIndex : pendantIndex);
  }

  function enableBackSide() {
    const activePendantState = getActivePendantState();
    if (!hasSizeSelection() || isBackSideEnabled() || !isFrontConfigured()) return;
    activePendantState.backSideEnabled = true;
    activePendantState.sides.back = createSideState();
    state.isMotifVariantOverlayOpen = false;
    state.activeSide = "back";
    syncUi();
    queueRender();
    requestAnimationFrame(scrollToBackSideConfiguration);
  }

  function resetAllSelections() {
    const initialState = createInitialState();

    Object.keys(initialState).forEach((key) => {
      state[key] = initialState[key];
    });

    uploadInput.value = "";
    textInput.value = "";
    scaleSlider.value = "100";
    if (stretchXSlider) {
      stretchXSlider.value = "100";
    }
    if (stretchYSlider) {
      stretchYSlider.value = "100";
    }
    if (rotationSlider) {
      rotationSlider.value = "0";
    }
    textSizeSlider.value = "100";
    textFontSelect.value = TEXT_FONT_LIBRARY[0].id;
    syncFontSelectPreview(textFontSelect, TEXT_FONT_LIBRARY);
    syncFontSelectPreview(monogramFontSelect, MONOGRAM_FONT_LIBRARY);
    closeRequestMenu();
    renderProductOptions();
    renderFinishOptions();
    renderSetOptions();
    renderSizeOptions();
    renderPendantTabs();
    syncUi();
    queueRender();
  }

  function setActiveSide(sideId) {
    if (sideId === "back" && !isBackSideEnabled()) return;
    if (!SIDE_IDS.includes(sideId) || state.activeSide === sideId) return;
    state.activeSide = sideId;
    state.isMotifVariantOverlayOpen = false;
    syncUi();
    queueRender();
  }

  function setActivePendant(pendantIndex) {
    if (pendantIndex < 0 || pendantIndex >= getPendantCount()) return;
    if (state.activePendantIndex === pendantIndex) return;
    state.activePendantIndex = pendantIndex;
    if (state.activeSide === "back" && !isBackSideEnabled(pendantIndex)) {
      state.activeSide = "front";
    }
    state.isMotifVariantOverlayOpen = false;
    renderSizeOptions();
    syncUi();
    queueRender();
  }

  function syncPendantStateCount() {
    const nextCount = getPendantCount();
    const nextPendants = [];

    for (let index = 0; index < nextCount; index += 1) {
      nextPendants.push(state.pendants[index] || createPendantState());
    }

    state.pendants = nextPendants;
    state.activePendantIndex = clamp(state.activePendantIndex, 0, Math.max(0, nextCount - 1));
  }

  function applyStepSelection(stepId, value) {
    const definition = STEP_DEFINITIONS[stepId];
    if (!definition || !isStepAvailable(stepId)) return;

    clearSelectionsAfter(stepId);

    if (stepId === "designMode") {
      getActiveSideState().designMode = value;
    } else {
      const nextValue = definition.getNextValue ? definition.getNextValue(value) : { [definition.stateKey]: value };
      Object.keys(nextValue).forEach((key) => {
        state[key] = nextValue[key];
      });
    }

    if (stepId === "material") {
      renderProductOptions();
      renderFinishOptions();
      renderSetOptions();
      renderSizeOptions();
    }

    if (stepId === "product") {
      renderFinishOptions();
      renderSetOptions();
      renderSizeOptions();
    }

    if (stepId === "finish") {
      renderSetOptions();
      renderSizeOptions();
    }

    if (stepId === "set") {
      syncPendantStateCount();
      renderPendantTabs();
      renderSizeOptions();
    }

    if (stepId === "size") {
      resetImagePlacement(false);
      resetTextPlacement(false);
    }

    closeRequestMenu();
    syncUi();
    queueRender();
  }

  function clearSelectionsAfter(stepId) {
    const startIndex = ACTIVE_STEP_SEQUENCE.indexOf(stepId);
    if (startIndex === -1) return;

    const stepStateKeys = getFlowStepIds()
      .slice(startIndex + 1)
      .map(function (activeStepId) {
        return STEP_DEFINITIONS[activeStepId].stateKey;
      });

    stepStateKeys.forEach(function (key) {
      state[key] = null;
    });

    if (stepId !== "designMode") {
      state.activePendantIndex = 0;
      state.activeSide = "front";
      state.pendants = Array.from({ length: getPendantCount() }, function () {
        return createPendantState();
      });
    }

    state.isMotifVariantOverlayOpen = false;
    uploadInput.value = "";
    textInput.value = "";
    resetImagePlacement(false);
    resetTextPlacement(false);
    textFontSelect.value = TEXT_FONT_LIBRARY[0].id;
    syncFontSelectPreview(textFontSelect, TEXT_FONT_LIBRARY);
    syncFontSelectPreview(monogramFontSelect, MONOGRAM_FONT_LIBRARY);
  }

  function getFlowStepIds() {
    if (isBottleOpenerProduct()) {
      return ["material", "product", "designMode"];
    }

    return ACTIVE_STEP_SEQUENCE.filter(function (stepId) {
      if (stepId === "finish") {
        return requiresFinishSelection();
      }
      return true;
    });
  }

  function getStepOrder(stepId) {
    return getFlowStepIds().indexOf(stepId);
  }

  function getPreviousStepId(stepId) {
    const currentIndex = getStepOrder(stepId);
    if (currentIndex <= 0) return null;
    return getFlowStepIds()[currentIndex - 1] || null;
  }

  function isStepAvailable(stepId) {
    if (stepId === "designMode") {
      if (isBottleOpenerProduct()) {
        return hasProductSelection();
      }
      return hasSizeSelection();
    }
    if (stepId === "finish" && !requiresFinishSelection()) {
      return false;
    }
    if (getStepOrder(stepId) === 0) return true;
    return getFlowStepIds()
      .slice(0, getStepOrder(stepId))
      .every(function (previousStepId) {
        return isStepComplete(previousStepId);
      });
  }

  function isStepComplete(stepId) {
    if (stepId === "size") {
      return haveAllPendantSizes();
    }
    if (stepId === "designMode") {
      if (isBottleOpenerProduct()) {
        return hasDesignModeSelection();
      }
      return getPendantIndices().every(function (pendantIndex) {
        return hasDesignModeSelection("front", pendantIndex);
      });
    }
    if (stepId === "finish") {
      return hasFinishSelection();
    }
    const definition = STEP_DEFINITIONS[stepId];
    return Boolean(definition && state[definition.stateKey]);
  }

  function getCurrentStepId() {
    const flowStepIds = getFlowStepIds();

    for (let index = 0; index < flowStepIds.length; index += 1) {
      const stepId = flowStepIds[index];
      if (!isStepComplete(stepId)) {
        return stepId;
      }
    }

    return flowStepIds[flowStepIds.length - 1];
  }

  function getStepVisualState(stepId) {
    if (!isStepAvailable(stepId)) return "locked";
    if (getCurrentStepId() === stepId && !isStepComplete(stepId)) return "active";
    if (isStepComplete(stepId)) return "completed";
    return "idle";
  }

  function getStepSummary(stepId) {
    if (stepId === "material") {
      const material = getActiveMaterial();
      return material ? material.name : "Offen";
    }

    if (stepId === "product") {
      const productFamily = getActiveProductFamily();
      return productFamily ? productFamily.name : "Offen";
    }

    if (stepId === "finish") {
      const finish = getActiveFinish();
      return finish ? finish.name : "Offen";
    }

    if (stepId === "set") {
      const setOption = getActiveSetOption();
      return state.setId ? setOption.shortLabel : "Offen";
    }

    if (stepId === "size") {
      return buildSizeSummaryLabel();
    }

    if (stepId === "designMode") {
      if (!hasDesignModeSelection()) return "Offen";
      if (isQrMode()) return "QR";
      return isMotifMode() ? "Motiv" : "Text";
    }

    return "";
  }

  function renderMaterialOptions() {
    materialOptionsEl.innerHTML = "";

    CATALOG.materials.forEach((material) => {
      const button = document.createElement("button");
      const metaText = material.isComingSoon ? "Wird vorbereitet" : material.description;
      button.type = "button";
      button.className = "preview-option";
      if (material.isComingSoon) {
        button.classList.add("preview-option--coming-soon-minor");
      }
      button.setAttribute("data-material-id", material.id);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(material.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(metaText) + "</span>";

      button.addEventListener("click", function () {
        if (material.isComingSoon) return;
        if (state.materialId === material.id) return;
        applyStepSelection("material", material.id);
      });

      materialOptionsEl.appendChild(button);
    });
  }

  function resetMotifOverlayViewport() {
    if (motifVariantOverlayPanel) {
      motifVariantOverlayPanel.scrollTop = 0;
    }
    if (motifOverlayOptionsEl) {
      motifOverlayOptionsEl.scrollTop = 0;
    }
  }

  function focusMotifOverlayPrimaryControl() {
    const focusTarget = !motifVariantOverlayBackButton.hidden
      ? motifVariantOverlayBackButton
      : closeMotifVariantOverlayButton;
    if (focusTarget && typeof focusTarget.focus === "function") {
      focusTarget.focus({ preventScroll: true });
    }
  }

  function renderProductOptions() {
    productOptionsEl.innerHTML = "";

    const material = getActiveMaterial();
    if (!material) return;

    getAvailableProductFamilies(material).forEach((productFamily) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-product-id", productFamily.id);
      const startingPriceCents = getProductFamilyStartingPriceCents(productFamily);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(productFamily.name) + "</span>" +
        (startingPriceCents != null
          ? '<span class="preview-option__price">ab <strong>' + escapeHtml(formatEuro(startingPriceCents)) + "</strong></span>"
          : "") +
        '<span class="preview-option__meta">' + escapeHtml(productFamily.description) + "</span>";

      button.addEventListener("click", function () {
        if (productFamily.isComingSoon) return;
        if (state.productFamilyId === productFamily.id) return;
        applyStepSelection("product", productFamily.id);
      });

      productOptionsEl.appendChild(button);
    });
  }

  function renderFinishOptions() {
    if (!finishOptionsEl) return;
    finishOptionsEl.innerHTML = "";

    const productFamily = getActiveProductFamily();
    const finishes = getAvailableFinishes(productFamily);
    if (!productFamily || !finishes.length) return;

    finishes.forEach(function (finish) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-finish-id", finish.id);
      button.innerHTML =
        buildFinishThumbMarkup(finish) +
        '<span class="preview-option__title">' + escapeHtml(finish.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(finish.description) + "</span>";

      button.addEventListener("click", function () {
        if (state.finishId === finish.id) return;
        applyStepSelection("finish", finish.id);
        focusNextSectionAfterFinishSelection();
      });

      finishOptionsEl.appendChild(button);
    });
  }

  function buildFinishThumbMarkup(finish) {
    const palette = getPendantFinishPalette(finish && finish.id);

    return (
      '<span class="preview-option__thumb" aria-hidden="true">' +
        '<span class="preview-option__thumb-media" style="' + escapeHtml(
          'background:' + palette.thumbBackground + ';'
        ) + '">' +
          '<svg viewBox="0 0 160 160" width="120" height="120" aria-hidden="true">' +
            '<defs>' +
              '<linearGradient id="finish-disc-' + escapeHtml(finish.id) + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                '<stop offset="0%" stop-color="' + escapeHtml(palette.baseStart) + '"></stop>' +
                '<stop offset="48%" stop-color="' + escapeHtml(palette.baseMid) + '"></stop>' +
                '<stop offset="100%" stop-color="' + escapeHtml(palette.baseEnd) + '"></stop>' +
              '</linearGradient>' +
              '<linearGradient id="finish-ring-' + escapeHtml(finish.id) + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                '<stop offset="0%" stop-color="' + escapeHtml(palette.ringStart) + '"></stop>' +
                '<stop offset="55%" stop-color="' + escapeHtml(palette.ringMid) + '"></stop>' +
                '<stop offset="100%" stop-color="' + escapeHtml(palette.ringEnd) + '"></stop>' +
              '</linearGradient>' +
            '</defs>' +
            '<circle cx="80" cy="92" r="44" fill="url(#finish-disc-' + escapeHtml(finish.id) + ')" stroke="' + escapeHtml(palette.edgeColor) + '" stroke-width="2"></circle>' +
            '<circle cx="80" cy="92" r="36" fill="none" stroke="' + escapeHtml(palette.innerStroke) + '" stroke-width="1.5" opacity="0.7"></circle>' +
            '<circle cx="80" cy="35" r="14" fill="url(#finish-ring-' + escapeHtml(finish.id) + ')"></circle>' +
            '<circle cx="80" cy="35" r="7" fill="' + escapeHtml(palette.thumbBackgroundCenter) + '"></circle>' +
            '<rect x="68" y="46" width="24" height="28" rx="12" fill="url(#finish-ring-' + escapeHtml(finish.id) + ')"></rect>' +
            '<ellipse cx="63" cy="66" rx="26" ry="12" fill="' + escapeHtml(palette.highlightSoft) + '" opacity="0.28"></ellipse>' +
            '<ellipse cx="95" cy="78" rx="18" ry="46" fill="' + escapeHtml(palette.highlightStrong) + '" opacity="0.24" transform="rotate(32 95 78)"></ellipse>' +
          '</svg>' +
        '</span>' +
      '</span>'
    );
  }

  function renderSetOptions() {
    setOptionsEl.innerHTML = "";

    SET_LIBRARY.forEach((setOption) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option preview-option--set";
      button.setAttribute("data-set-id", setOption.id);
      button.innerHTML =
        buildSetThumbMarkup(setOption.count) +
        '<span class="preview-option__title">' + escapeHtml(setOption.name) + "</span>" +
        '<span class="preview-option__price">ab <strong>' + escapeHtml(formatEuro(getSetStartingPriceCents(setOption.count))) + "</strong></span>" +
        '<span class="preview-option__meta">' + escapeHtml(setOption.description) + "</span>";

      button.addEventListener("click", function () {
        if (state.setId === setOption.id) return;
        applyStepSelection("set", setOption.id);
      });

      setOptionsEl.appendChild(button);
    });
  }

  function renderPendantTabs() {
    if (!pendantTabs) return;
    pendantTabs.innerHTML = "";

    getPendantIndices().forEach(function (pendantIndex) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-side-switch__button preview-side-switch__button--pendant";
      button.setAttribute("role", "tab");
      button.setAttribute("data-pendant-index", String(pendantIndex));
      button.textContent = getPendantTabLabel(pendantIndex);
      button.addEventListener("click", function () {
        setActivePendant(pendantIndex);
      });
      pendantTabs.appendChild(button);
    });
  }

  function buildSetThumbMarkup(count) {
    return '<span class="preview-option__thumb preview-option__thumb--set" aria-hidden="true">' + buildSetThumbSvg(count) + "</span>";
  }

  function getSetStartingPriceCents(count) {
    return getJewelrySetBasePriceCents(count);
  }

  function getProductFamilyStartingPriceCents(productFamily) {
    if (!productFamily) return null;

    if (productFamily.id === "jewelry-pendant") {
      return getJewelrySetBasePriceCents(1);
    }

    if (productFamily.id === "bottle-opener") {
      return getBottleOpenerLowestTierPriceCents();
    }

    return null;
  }

  function renderSizeOptions() {
    sizeOptionsEl.innerHTML = "";

    const product = getActiveProduct();
    if (!product) return;

    product.sizes.forEach((size) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-size-chip";
      button.setAttribute("data-size-id", size.id);
      button.textContent = size.label;

      button.addEventListener("click", function () {
        const activePendantState = getActivePendantState();
        if (activePendantState.sizeId === size.id) return;
        activePendantState.sizeId = size.id;
        sanitizePhotoSelectionsForPendant(state.activePendantIndex);
        resetImagePlacement(false);
        resetTextPlacement(false);
        renderPendantTabs();
        closeRequestMenu();
        syncUi();
        queueRender();
      });

      sizeOptionsEl.appendChild(button);
    });
  }

  function renderDesignModeOptions() {
    designModeOptionsEl.innerHTML = "";

    getAvailableDesignModes().forEach((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-design-mode", mode.id);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(mode.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(mode.description) + "</span>";

      button.addEventListener("click", function () {
        setDesignMode(mode.id);
      });

      designModeOptionsEl.appendChild(button);
    });
  }

  function renderTemplateOptions() {
    templateOptionsEl.innerHTML = "";

    getAvailableTemplates().forEach((template) => {
      const button = document.createElement("button");
      const metaMarkup = template.description
        ? '<span class="preview-option__meta">' + escapeHtml(template.description) + "</span>"
        : "";
      button.type = "button";
      button.className = "preview-option";
      if (template.id === "symbol-template") {
        button.classList.add("preview-option--template-symbol-template");
      }
      button.setAttribute("data-template-id", template.id);
      button.innerHTML =
        buildTemplateThumbMarkup(template) +
        '<span class="preview-option__title">' + escapeHtml(template.name) + "</span>" +
        metaMarkup;

      button.addEventListener("click", function () {
        selectMotifTemplate(template.id);
      });

      templateOptionsEl.appendChild(button);
    });
  }

  function buildTemplateThumbMarkup(template) {
    if (template.category === "monogram") {
      return (
        '<span class="preview-option__thumb">' +
          '<span class="preview-option__thumb-media preview-option__thumb-media--monogram" style="font:700 68px \\"Cinzel\\", Georgia, serif;color:#000;-webkit-text-fill-color:#000;opacity:1;filter:none;mix-blend-mode:normal;text-shadow:none;">LB</span>' +
        "</span>"
      );
    }

    let thumbClass = "preview-option__thumb-media";
    if (template.category === "photo") {
      thumbClass += " preview-option__thumb-media--photo";
    }
    if (template.category === "emblem") {
      thumbClass += " preview-option__thumb-media--symbol preview-option__thumb-media--emblem";
    }
    if (template.category === "qr-shortcut") {
      thumbClass += " preview-option__thumb-media--symbol preview-option__thumb-media--emblem";
    }
    if (template.category === "animal-symbols") {
      thumbClass += " preview-option__thumb-media--symbol preview-option__thumb-media--animal-root";
    }

    return (
      '<span class="preview-option__thumb">' +
        '<span class="' + thumbClass + '">' +
          '<img src="' + template.imageSrc + '" alt="">' +
        "</span>" +
      "</span>"
    );
  }

  function getAvailableDesignModes() {
    return isBottleOpenerProduct() ? BOTTLE_OPENER_MODE_LIBRARY : MODE_LIBRARY;
  }

  function getAvailableTemplates() {
    if (!isBottleOpenerProduct()) {
      return TEMPLATE_LIBRARY.filter(function (template) {
        return template.hideFromMainSelection !== true;
      });
    }

    return TEMPLATE_LIBRARY.filter(function (template) {
      return template.category !== "photo" && template.hideFromMainSelection !== true;
    });
  }

  function getSymbolTemplateCategories() {
    const customCategories = Array.isArray(symbolSourceRegistry && symbolSourceRegistry.custom && symbolSourceRegistry.custom.categories)
      ? symbolSourceRegistry.custom.categories
      : [];
    const preferredOrder = [
      "wappen",
      "embleme",
      "tiere",
      "google-symbole",
      "ornamente",
      "runen",
      "herzen",
      "outdoor",
      "handwerk",
      "maritim",
      "fantasy-mystik",
      "totenkopf-dark-rockig"
    ];

    return preferredOrder.map(function (categoryId) {
      return customCategories.find(function (category) {
        return category.id === categoryId;
      });
    }).filter(Boolean);
  }

  function applyFontSelectOptionStyles(selectElement, fontLibrary) {
    if (!selectElement) return;
    Array.from(selectElement.options).forEach(function (option) {
      const font = fontLibrary.find(function (entry) {
        return entry.id === option.value;
      });
      if (!font) return;
      option.style.fontFamily = font.family;
      option.style.fontWeight = "600";
    });
  }

  function syncFontSelectPreview(selectElement, fontLibrary) {
    if (!selectElement) return;
    const font = fontLibrary.find(function (entry) {
      return entry.id === selectElement.value;
    }) || fontLibrary[0];
    if (!font) return;
    selectElement.style.fontFamily = font.family;
    selectElement.style.fontWeight = "600";
  }

  function initializeFontSelectPreviews() {
    applyFontSelectOptionStyles(textFontSelect, TEXT_FONT_LIBRARY);
    applyFontSelectOptionStyles(monogramFontSelect, MONOGRAM_FONT_LIBRARY);
    syncFontSelectPreview(textFontSelect, TEXT_FONT_LIBRARY);
    syncFontSelectPreview(monogramFontSelect, MONOGRAM_FONT_LIBRARY);
  }

  function buildAnimalGroupThumbMarkup(animalGroup) {
    return (
      '<span class="preview-option__thumb">' +
        '<span class="preview-option__thumb-media preview-option__thumb-media--symbol preview-option__thumb-media--animal-group">' +
          '<img src="' + animalGroup.imageSrc + '" alt="">' +
        "</span>" +
      "</span>"
    );
  }

  function buildOverlaySectionLabelMarkup(label) {
    return '<div class="preview-option-grid__section-label">' + escapeHtml(label) + "</div>";
  }

  function renderMotifOverlayOptions() {
    motifOverlayOptionsEl.innerHTML = "";
    motifOverlayOptionsEl.setAttribute("data-overlay-step", state.motifOverlayStep || "");
    motifOverlayOptionsEl.setAttribute("data-overlay-kind", getActiveEmblemKindId() || "");

    if (state.motifOverlayStep === "symbolCategories") {
      const allCategories = getSymbolTemplateCategories();
      const availableCategories = allCategories.filter(function (category) {
        return category.sourceType !== "custom-library-placeholder";
      });
      const upcomingCategories = allCategories.filter(function (category) {
        return category.sourceType === "custom-library-placeholder";
      });

      if (availableCategories.length) {
        motifOverlayOptionsEl.insertAdjacentHTML("beforeend", buildOverlaySectionLabelMarkup("Verfügbar"));
      }

      availableCategories.forEach(function (category) {
        const button = document.createElement("button");
        const previewSrc = category.previewTemplate || "/assets/tools/vorschau/vorlage-emblem.png";
        const metaText = "Kategorie jetzt öffnen.";
        const previewConfig = getActiveCategoryPreviewConfig(category.id);

        button.type = "button";
        button.className = "preview-option preview-option--symbol-card preview-option--symbol-category";
        button.setAttribute("data-symbol-category-id", category.id);
        button.setAttribute("data-category-status", "active");
        applyPreviewCardConfig(button, previewConfig);
        button.innerHTML =
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--symbol preview-option__thumb-media--emblem"><img src="' + previewSrc + '" alt=""></span></span>' +
          '<span class="preview-option__title">' + escapeHtml(category.label) + "</span>" +
          '<span class="preview-option__meta">' + escapeHtml(metaText) + "</span>";

        button.addEventListener("click", function () {
          selectSymbolTemplateCategory(category.id);
        });

        motifOverlayOptionsEl.appendChild(button);
      });

      if (upcomingCategories.length) {
        motifOverlayOptionsEl.insertAdjacentHTML("beforeend", buildOverlaySectionLabelMarkup("Bald verfügbar"));
      }

      upcomingCategories.forEach(function (category) {
        const button = document.createElement("button");
        const previewSrc = category.previewTemplate || "/assets/tools/vorschau/vorlage-emblem.png";

        button.type = "button";
        button.className = "preview-option preview-option--symbol-card preview-option--symbol-category is-disabled";
        button.setAttribute("data-symbol-category-id", category.id);
        button.setAttribute("data-category-status", "coming-soon");
        button.innerHTML =
          '<span class="preview-option__status-badge">Bald verfügbar</span>' +
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--symbol preview-option__thumb-media--emblem"><img src="' + previewSrc + '" alt=""></span></span>' +
          '<span class="preview-option__title">' + escapeHtml(category.label) + "</span>" +
          '<span class="preview-option__meta">Kategorie ist vorbereitet.</span>';

        button.disabled = true;
        motifOverlayOptionsEl.appendChild(button);
      });
      return;
    }

    if (state.motifOverlayStep === "googleGroups") {
      getGoogleBrowserGroups().forEach(function (group) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "preview-option preview-option--symbol-card";
        button.setAttribute("data-google-browser-group-id", group.id);
        button.innerHTML =
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--symbol preview-option__thumb-media--emblem"><img src="' + group.previewSrc + '" alt=""></span></span>' +
          '<span class="preview-option__title">' + escapeHtml(group.label) + "</span>" +
          '<span class="preview-option__meta">' + escapeHtml(group.registryLabel + " · " + group.visibleCount + " Symbole") + "</span>";

        button.addEventListener("click", function () {
          selectGoogleBrowserGroup(group.id);
        });

        motifOverlayOptionsEl.appendChild(button);
      });
      return;
    }

    if (state.motifOverlayStep === "emblemKinds") {
      EMBLEM_KIND_LIBRARY.filter(function (variant) {
        return !variant.isQr;
      }).forEach((variant) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "preview-option";
        button.setAttribute("data-emblem-kind-id", variant.id);
        button.innerHTML =
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--emblem"><img src="' + variant.imageSrc + '" alt=""></span></span>' +
          '<span class="preview-option__title">' + escapeHtml(variant.name) + "</span>" +
          '<span class="preview-option__meta">' + escapeHtml(variant.description) + "</span>";

        button.addEventListener("click", function () {
          selectEmblemKind(variant.id);
        });

        motifOverlayOptionsEl.appendChild(button);
      });
      return;
    }

    if (state.motifOverlayStep === "emblemSourceChoice") {
      [
        { id: "template", name: "Vorlage", description: "Passende Vorlage wählen." },
        { id: "upload", name: "Eigene Datei", description: "SVG oder PNG transparent." }
      ].forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "preview-option preview-option--symbol-card";
        button.setAttribute("data-emblem-source-mode", option.id);
        button.innerHTML =
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--symbol preview-option__thumb-media--emblem"><strong style="font:700 24px system-ui, sans-serif;color:#16181c;">' + escapeHtml(option.name) + "</strong></span></span>" +
          '<span class="preview-option__title">' + escapeHtml(option.name) + "</span>" +
          '<span class="preview-option__meta">' + escapeHtml(option.description) + "</span>";

        button.addEventListener("click", function () {
          selectEmblemSourceChoice(option.id);
        });

        motifOverlayOptionsEl.appendChild(button);
      });
      return;
    }

    if (state.motifOverlayStep === "emblemUpload") {
      return;
    }

    if (state.motifOverlayStep === "emblemVariants") {
      EMBLEM_VARIANT_LIBRARY.filter((variant) => !variant.isQr && variant.kindId === getActiveEmblemKindId()).forEach((variant) => {
        const button = document.createElement("button");
        const metaText = getVariantMetaText(variant);
        const outdoorPreviewConfig = getActiveEmblemKindId() === "custom-filesystem-outdoor"
          ? getOutdoorVariantPreviewConfig(variant.imageSrc.split("/").pop() || "")
          : null;
        button.type = "button";
        button.className = "preview-option preview-option--symbol-card";
        if (outdoorPreviewConfig) {
          applyPreviewCardConfig(button, outdoorPreviewConfig);
        }
        button.setAttribute("data-emblem-variant-id", variant.id);
        button.innerHTML =
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--symbol preview-option__thumb-media--emblem"><img src="' + variant.imageSrc + '" alt=""></span></span>' +
          '<span class="preview-option__title">' + escapeHtml(variant.name) + "</span>" +
          (metaText ? '<span class="preview-option__meta">' + escapeHtml(metaText) + "</span>" : "");

        button.addEventListener("click", function () {
          if (getActiveSideState().emblemVariantId === variant.id) return;
          selectEmblemVariant(variant.id);
          closeMotifVariantOverlay();
        });

        motifOverlayOptionsEl.appendChild(button);
      });
      return;
    }

    if (state.motifOverlayStep === "groups") {
      ANIMAL_GROUP_LIBRARY.forEach((animalGroup) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "preview-option preview-option--symbol-card";
        button.setAttribute("data-animal-group-id", animalGroup.id);
        button.innerHTML =
          buildAnimalGroupThumbMarkup(animalGroup) +
          '<span class="preview-option__title">' + escapeHtml(animalGroup.name) + "</span>" +
          '<span class="preview-option__meta">' + escapeHtml(animalGroup.description) + "</span>";

        button.addEventListener("click", function () {
          selectAnimalGroup(animalGroup.id);
        });

        motifOverlayOptionsEl.appendChild(button);
      });
      return;
    }

    const activeAnimalGroup = getActiveAnimalGroup();
    const variants = activeAnimalGroup
      ? MOTIF_VARIANT_LIBRARY.filter((variant) => variant.parentId === activeAnimalGroup.id)
      : [];

    variants.forEach((variant) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-motif-variant-id", variant.id);
      button.innerHTML =
        '<span class="preview-option__thumb"><img src="' + variant.imageSrc + '" alt=""></span>' +
        '<span class="preview-option__title">' + escapeHtml(variant.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(variant.description) + "</span>";

      button.addEventListener("click", function () {
        if (getActiveSideState().motifVariantId === variant.id) return;
        selectMotifVariant(variant.id);
        closeMotifVariantOverlay();
      });

      motifOverlayOptionsEl.appendChild(button);
    });
  }

  function selectMotifTemplate(templateId) {
    const template = getTemplateById(templateId);
    if (!template) return;
    if (template.category === "photo" && !canUsePhotoOnPendant()) return;

    const activeSideState = getActiveSideState();
    const isPhotoTemplate = template.category === "photo";
    const isAnimalSymbolsTemplate = template.category === "animal-symbols";
    const isEmblemTemplate = template.category === "emblem";
    const isQrShortcutTemplate = template.category === "qr-shortcut";
    const isSameTemplate = activeSideState.templateId === template.id;

    if (isAnimalSymbolsTemplate && isSameTemplate) {
      state.motifOverlayStep = "groups";
      openMotifVariantOverlay("groups");
      return;
    }

    if (isEmblemTemplate && isSameTemplate) {
      state.motifOverlayStep = "symbolCategories";
      openMotifVariantOverlay("symbolCategories");
      return;
    }

    if (!isPhotoTemplate) {
      clearUploadedImage(false);
    }

    closeMotifVariantOverlay();
    activeSideState.templateId = isQrShortcutTemplate ? "symbol-template" : template.id;
    activeSideState.symbolTemplateCategoryId = null;
    activeSideState.googleSymbolGroupId = null;
    activeSideState.animalGroupId = null;
    activeSideState.motifVariantId = null;
    activeSideState.emblemVariantId = null;
    activeSideState.emblemKindId = null;
    activeSideState.emblemSourceMode = (isEmblemTemplate || isQrShortcutTemplate) ? "template" : activeSideState.emblemSourceMode;
    activeSideState.qrValue = "";
    state.motifOverlayStep = "groups";

    resetImagePlacement(false);
    renderMotifOverlayOptions();
    syncUi();
    queueRender();

    if (isPhotoTemplate) {
      openPhotoUpload();
    }

    if (isAnimalSymbolsTemplate) {
      openMotifVariantOverlay("groups");
    }

    if (isEmblemTemplate) {
      openMotifVariantOverlay("symbolCategories");
    }

    if (isQrShortcutTemplate) {
      selectEmblemKind("qr");
    }

  }

  function selectAnimalGroup(animalGroupId) {
    const animalGroup = getAnimalGroupById(animalGroupId);
    if (!animalGroup) return;

    const activeSideState = getActiveSideState();
    activeSideState.animalGroupId = animalGroup.id;
    activeSideState.motifVariantId = null;
    state.motifOverlayStep = "variants";
    clearUploadedImage(false);
    resetImagePlacement(false);
    renderMotifOverlayOptions();
    syncUi();
    queueRender();
    openMotifVariantOverlay("variants");
  }

  function selectSymbolTemplateCategory(categoryId) {
    const activeSideState = getActiveSideState();
    activeSideState.symbolTemplateCategoryId = categoryId;

    if (categoryId === "wappen") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "crest";
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "embleme") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "emblem";
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "ornamente") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "ornament";
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "outdoor") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "custom-filesystem-outdoor";
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "runen") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "custom-filesystem-runen";
      activeSideState.googleSymbolGroupId = null;
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "herzen") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "google-hearts";
      activeSideState.googleSymbolGroupId = null;
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "motorsport") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = "google-motorsport";
      activeSideState.googleSymbolGroupId = null;
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("emblemVariants");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "tiere") {
      activeSideState.templateId = "animal-symbols";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = null;
      activeSideState.googleSymbolGroupId = null;
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("groups");
      syncUi();
      queueRender();
      return;
    }

    if (categoryId === "google-symbole") {
      activeSideState.templateId = "symbol-template";
      activeSideState.animalGroupId = null;
      activeSideState.motifVariantId = null;
      activeSideState.emblemVariantId = null;
      activeSideState.emblemKindId = null;
      activeSideState.googleSymbolGroupId = null;
      activeSideState.emblemSourceMode = "template";
      clearUploadedImage(false);
      resetImagePlacement(false);
      openMotifVariantOverlay("googleGroups");
      syncUi();
      queueRender();
    }
  }

  function selectGoogleBrowserGroup(groupId) {
    const group = getGoogleBrowserGroups().find(function (entry) {
      return entry.id === groupId;
    });
    if (!group) return;

    const activeSideState = getActiveSideState();
    activeSideState.templateId = "symbol-template";
    activeSideState.animalGroupId = null;
    activeSideState.motifVariantId = null;
    activeSideState.emblemVariantId = null;
    activeSideState.googleSymbolGroupId = group.id;
    activeSideState.emblemKindId = group.kindId;
    activeSideState.emblemSourceMode = "template";
    clearUploadedImage(false);
    resetImagePlacement(false);
    openMotifVariantOverlay("emblemVariants");
    syncUi();
    queueRender();
  }

  function selectMotifVariant(variantId) {
    const variant = getMotifVariantById(variantId);
    if (!variant) return;

    const activeSideState = getActiveSideState();
    activeSideState.motifVariantId = variant.id;
    clearUploadedImage(false);
    resetImagePlacement(false);
    syncUi();
    queueRender();
    closeMotifVariantOverlay();
  }

  function selectEmblemVariant(variantId) {
    const variant = getEmblemVariantById(variantId);
    if (!variant) return;

    const activeSideState = getActiveSideState();
    activeSideState.emblemVariantId = variant.id;
    if (isBottleOpenerProduct()) {
      activeSideState.designMode = variant.isQr ? "qr" : "motif";
    }
    if (!variant.isQr) {
      activeSideState.qrValue = "";
    }
    activeSideState.qrCodeModel = null;
    activeSideState.qrCodeModelValue = "";
    clearUploadedImage(false);
    resetImagePlacement(false);
    syncUi();
    queueRender();
  }

  function selectEmblemKind(kindId) {
    const variant = getEmblemKindById(kindId);
    if (!variant) return;

    const activeSideState = getActiveSideState();
    activeSideState.emblemKindId = kindId;
    activeSideState.googleSymbolGroupId = null;

    if (variant.isQr) {
      activeSideState.emblemSourceMode = "template";
      selectEmblemVariant(kindId);
      closeMotifVariantOverlay();
      return;
    }

    activeSideState.emblemVariantId = null;
    clearUploadedImage(false);
    resetImagePlacement(false);
    openMotifVariantOverlay("emblemSourceChoice");
    syncUi();
    queueRender();
  }

  function selectEmblemSourceChoice(mode) {
    if (!isEmblemTemplateSelected()) return;
    if (mode !== "template" && mode !== "upload") return;

    setEmblemSourceMode(mode);

    if (mode === "template") {
      openMotifVariantOverlay("emblemVariants");
      return;
    }

    openMotifVariantOverlay("emblemUpload");
    setTimeout(function () {
      openEmblemUpload();
    }, 0);
  }

  function setEmblemSourceMode(mode) {
    if (!isEmblemTemplateSelected()) return;
    if (mode !== "template" && mode !== "upload") return;

    const activeSideState = getActiveSideState();
    activeSideState.emblemSourceMode = mode;
    if (mode === "upload") {
      activeSideState.emblemVariantId = null;
      if (isBottleOpenerProduct()) {
        activeSideState.designMode = "motif";
      }
    } else {
      clearUploadedImage(false);
    }
    syncUi();
    queueRender();
  }

  function setDesignMode(modeId) {
    if (!isStepAvailable("designMode")) return;
    if (!getAvailableDesignModes().some((mode) => mode.id === modeId)) return;
    if (getActiveSideState().designMode === modeId) return;
    applyStepSelection("designMode", modeId);
  }

  function openPhotoUpload() {
    if (!isMotifMode() || !isPhotoMotifSelected()) return;
    uploadInput.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
    uploadInput.click();
  }

  function openEmblemUpload() {
    if (!isMotifMode() || !isEmblemUploadSelected()) return;
    uploadInput.accept = "image/png,image/svg+xml,.png,.svg";
    uploadInput.click();
  }

  function openMotifVariantOverlay(step) {
    if (!isMotifMode()) return;
    if (!state.isMotifVariantOverlayOpen) {
      lastMotifOverlayTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    if (isAnimalSymbolsSelected()) {
      state.motifOverlayStep = step === "variants" ? "variants" : "groups";
    } else if (isEmblemTemplateSelected()) {
      state.motifOverlayStep = step || "symbolCategories";
    } else {
      return;
    }
    state.isMotifVariantOverlayOpen = true;
    renderMotifOverlayOptions();
    updateMotifVariantOverlayCopy();
    syncUi();
    requestAnimationFrame(function () {
      resetMotifOverlayViewport();
      focusMotifOverlayPrimaryControl();
    });
  }

  function closeMotifVariantOverlay() {
    if (!state.isMotifVariantOverlayOpen) return;
    state.isMotifVariantOverlayOpen = false;
    state.motifOverlayStep = "groups";
    renderMotifOverlayOptions();
    syncUi();
    if (lastMotifOverlayTrigger && document.contains(lastMotifOverlayTrigger)) {
      lastMotifOverlayTrigger.focus({ preventScroll: true });
    }
    lastMotifOverlayTrigger = null;
  }

  function showAnimalGroupOverlay() {
    if (!isMotifMode()) return;
    if (isAnimalSymbolsSelected()) {
      state.motifOverlayStep = "groups";
    } else if (isEmblemTemplateSelected()) {
      if (state.motifOverlayStep === "emblemVariants" && getActiveSideState().symbolTemplateCategoryId === "google-symbole") {
        state.motifOverlayStep = "googleGroups";
      } else {
        state.motifOverlayStep = ["emblemVariants", "emblemUpload"].includes(state.motifOverlayStep) ? "emblemSourceChoice" : "symbolCategories";
      }
    } else {
      return;
    }
    state.isMotifVariantOverlayOpen = true;
    renderMotifOverlayOptions();
    updateMotifVariantOverlayCopy();
    syncUi();
    requestAnimationFrame(function () {
      resetMotifOverlayViewport();
      focusMotifOverlayPrimaryControl();
    });
  }

  function onUploadChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const targetSideState = getActiveSideState();
    const isEmblemUpload = isEmblemUploadSelected();
    const loader = isEmblemUpload
      ? validateAndReadEmblemUpload(file)
      : readFileAsDataUrl(file);

    loader
      .then(function (fileDataUrl) {
        return loadImage(String(fileDataUrl)).then(function (image) {
          targetSideState.uploadedImage = image;
          targetSideState.uploadedImageSrc = String(fileDataUrl);
          targetSideState.uploadedFileName = file.name;
          targetSideState.scalePercent = 100;
          targetSideState.stretchXPercent = 100;
          targetSideState.stretchYPercent = 100;
          targetSideState.offsetX = 0;
          targetSideState.offsetY = 0;
          syncUi();
          queueRender();
          if (state.isMotifVariantOverlayOpen || isEmblemUpload) {
            closeMotifVariantOverlay();
          }
        });
      })
      .catch(function () {
        if (!isEmblemUpload) {
          closeMotifVariantOverlay();
        }
      })
      .finally(function () {
        uploadInput.value = "";
      });
  }

  function clearUploadedImage(shouldRender) {
    const activeSideState = getActiveSideState();
    activeSideState.uploadedImage = null;
    activeSideState.uploadedImageSrc = "";
    activeSideState.uploadedFileName = "";
    uploadInput.value = "";
    resetImagePlacement(false);

    if (shouldRender !== false) {
      syncUi();
      queueRender();
    }
  }

  function clearPhotoState(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    sideState.templateId = null;
    sideState.uploadedImage = null;
    sideState.uploadedImageSrc = "";
    sideState.uploadedFileName = "";
    sideState.animalGroupId = null;
    sideState.motifVariantId = null;
    sideState.emblemVariantId = null;
    sideState.qrValue = "";
    sideState.qrCodeModel = null;
    sideState.qrCodeModelValue = "";
    sideState.scalePercent = 100;
    sideState.stretchXPercent = 100;
    sideState.stretchYPercent = 100;
    sideState.offsetX = 0;
    sideState.offsetY = 0;

    if ((pendantIndex == null ? state.activePendantIndex : pendantIndex) === state.activePendantIndex && state.activeSide === sideId) {
      uploadInput.value = "";
    }
  }

  function sanitizePhotoSelectionsForPendant(pendantIndex) {
    if (canUsePhotoOnPendant(pendantIndex)) return;

    SIDE_IDS.forEach(function (sideId) {
      if (isPhotoMotifSelected(sideId, pendantIndex)) {
        clearPhotoState(sideId, pendantIndex);
      }
    });

    if (state.activeSide === "back" && !isBackSideEnabled(pendantIndex)) {
      state.activeSide = "front";
    }
  }

  function clearText() {
    const activeSideState = getActiveSideState();
    activeSideState.textValue = "";
    textInput.value = "";
    activeSideState.textScalePercent = 100;
    textSizeSlider.value = "100";
    activeSideState.textFontId = TEXT_FONT_LIBRARY[0].id;
    textFontSelect.value = activeSideState.textFontId;
    activeSideState.textStyles.bold = false;
    activeSideState.textStyles.italic = false;
    activeSideState.textStyles.underline = false;
    activeSideState.textStyles.strikethrough = false;
    resetTextPlacement(false);
    syncUi();
    queueRender();
  }

  function clearQrValue() {
    const activeSideState = getActiveSideState();
    activeSideState.qrValue = "";
    activeSideState.qrCodeModel = null;
    activeSideState.qrCodeModelValue = "";
    qrInput.value = "";
    syncUi();
    queueRender();
  }

  function resetBottleOpenerRotation() {
    const activeSideState = getActiveSideState();
    activeSideState.rotationDeg = 0;
    if (rotationSlider) {
      rotationSlider.value = "0";
    }
    syncUi();
    queueRender();
  }

  function resetImagePlacement(shouldRender) {
    const activeSideState = getActiveSideState();
    activeSideState.scalePercent = 100;
    activeSideState.stretchXPercent = 100;
    activeSideState.stretchYPercent = 100;
    activeSideState.offsetX = 0;
    activeSideState.offsetY = 0;
    scaleSlider.value = "100";
    if (stretchXSlider) {
      stretchXSlider.value = "100";
    }
    if (stretchYSlider) {
      stretchYSlider.value = "100";
    }
    clampPlacement();

    if (shouldRender !== false) {
      syncUi();
      queueRender();
    }
  }

  function resetTextPlacement(shouldRender) {
    const activeSideState = getActiveSideState();
    activeSideState.textScalePercent = 100;
    textSizeSlider.value = "100";
    activeSideState.textOffsetX = 0;
    activeSideState.textOffsetY = getDefaultTextOffsetY(state.activePendantIndex);
    clampTextPlacement();

    if (shouldRender !== false) {
      syncUi();
      queueRender();
    }
  }

  function centerPlacement() {
    const activeSideState = getActiveSideState();
    activeSideState.offsetX = 0;
    activeSideState.offsetY = 0;
    syncUi();
    queueRender();
  }

  function resetStretch() {
    const activeSideState = getActiveSideState();
    activeSideState.stretchXPercent = 100;
    activeSideState.stretchYPercent = 100;
    if (stretchXSlider) {
      stretchXSlider.value = "100";
    }
    if (stretchYSlider) {
      stretchYSlider.value = "100";
    }
    clampPlacement();
    syncUi();
    queueRender();
  }

  function centerTextPlacement() {
    const activeSideState = getActiveSideState();
    activeSideState.textOffsetX = 0;
    activeSideState.textOffsetY = getDefaultTextOffsetY(state.activePendantIndex);
    clampTextPlacement();
    syncUi();
    queueRender();
  }

  function nudgePlacement(direction) {
    const canNudgeMotif = isMotifMode() && hasActiveMotifContent();
    const canNudgeBottleOpenerQr = isBottleOpenerProduct() && isQrMode();
    if (!canNudgeMotif && !canNudgeBottleOpenerQr) return;

    const activeSideState = getActiveSideState();
    const step = 14;

    if (direction === "up") activeSideState.offsetY -= step;
    if (direction === "down") activeSideState.offsetY += step;
    if (direction === "left") activeSideState.offsetX -= step;
    if (direction === "right") activeSideState.offsetX += step;

    clampPlacement();
    syncUi();
    queueRender();
  }

  function nudgeTextPlacement(direction) {
    if (!isTextMode() || !hasText()) return;

    const activeSideState = getActiveSideState();
    const step = 14;

    if (direction === "up") activeSideState.textOffsetY -= step;
    if (direction === "down") activeSideState.textOffsetY += step;
    if (direction === "left") activeSideState.textOffsetX -= step;
    if (direction === "right") activeSideState.textOffsetX += step;

    clampTextPlacement();
    syncUi();
    queueRender();
  }

  function onCanvasKeydown(event) {
    const canNudgeMotif = isMotifMode() && hasActiveMotifContent();
    const canNudgeBottleOpenerQr = isBottleOpenerProduct() && isQrMode();
    if (!canNudgeMotif && !canNudgeBottleOpenerQr) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      nudgePlacement("up");
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      nudgePlacement("down");
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nudgePlacement("left");
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nudgePlacement("right");
    }
  }

  function onDocumentClick(event) {
    if (isMenuInteraction(event.target)) return;
    if (requestMenuPanel.hidden && (!requestMenuPanelMobile || requestMenuPanelMobile.hidden)) return;
    closeRequestMenu();
  }

  function onDocumentKeydown(event) {
    if (event.key === "Escape") {
      closeRequestMenu();
      closeMotifVariantOverlay();
      closeFeedbackOverlay();
    }
  }

  function closeRequestMenu() {
    setRequestMenuOpen(false);
  }

  function setRequestMenuOpen(isOpen) {
    requestMenuPanel.hidden = !isOpen;
    if (requestMenuPanelMobile) {
      requestMenuPanelMobile.hidden = !isOpen;
    }
    [downloadPreviewButton, downloadPreviewButtonMobile].filter(Boolean).forEach((button) => {
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function isMenuInteraction(target) {
    return [downloadPreviewButton, downloadPreviewButtonMobile, requestMenuPanel, requestMenuPanelMobile]
      .filter(Boolean)
      .some(function (element) {
        return element === target || element.contains(target);
      });
  }

  function openFeedbackOverlay() {
    if (!feedbackOverlay) return;
    lastFeedbackOverlayTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    feedbackStatus.textContent = "";
    feedbackOverlay.hidden = false;
    requestAnimationFrame(function () {
      const checkedReason = feedbackReasonOptions
        ? feedbackReasonOptions.querySelector('input[name="feedbackReason"]:checked')
        : null;
      if (checkedReason) {
        checkedReason.focus({ preventScroll: true });
      } else if (closeFeedbackOverlayButton) {
        closeFeedbackOverlayButton.focus({ preventScroll: true });
      }
    });
  }

  function closeFeedbackOverlay() {
    if (!feedbackOverlay || feedbackOverlay.hidden) return;
    feedbackOverlay.hidden = true;
    if (feedbackStatus) {
      feedbackStatus.textContent = "";
    }
    if (lastFeedbackOverlayTrigger && document.contains(lastFeedbackOverlayTrigger)) {
      lastFeedbackOverlayTrigger.focus({ preventScroll: true });
    }
    lastFeedbackOverlayTrigger = null;
  }

  function setSummaryOpen(isOpen) {
    if (!previewSummaryPanel) return;
    previewSummaryPanel.hidden = !isOpen;
    if (toggleSummaryButton) {
      toggleSummaryButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    if (openSummaryMobileButton) {
      openSummaryMobileButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    if (openSummaryMobileFooterButton) {
      openSummaryMobileFooterButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    if (previewSummarySection) {
      previewSummarySection.classList.toggle("is-mobile-open", isOpen);
    }
    if (summaryToggleMeta) {
      summaryToggleMeta.textContent = isOpen ? "Ausblenden" : "Anzeigen";
    }
  }

  function toggleSummaryPanel() {
    if (!previewSummaryPanel) return;
    setSummaryOpen(previewSummaryPanel.hidden);
  }

  function syncSummaryCard() {
    const summary = buildCustomerSummary();
    if (summaryConfiguration) summaryConfiguration.textContent = summary.configurationLabel;
    if (summaryContent) summaryContent.textContent = summary.contentLabel;
    if (summaryPrice) summaryPrice.textContent = summary.priceLabel;
    if (summaryPriceHint) summaryPriceHint.textContent = summary.priceHint;
    if (summaryToggleMeta) {
      summaryToggleMeta.textContent = previewSummaryPanel && !previewSummaryPanel.hidden ? "Ausblenden" : "Anzeigen";
    }
  }

  function syncSummaryPreviewCanvas() {
    if (!summaryPreviewCtx || !summaryPreviewCanvas) return;
    summaryPreviewCtx.clearRect(0, 0, summaryPreviewCanvas.width, summaryPreviewCanvas.height);
    const targetAspect = summaryPreviewCanvas.width / summaryPreviewCanvas.height;
    const sourceWidth = isBottleOpenerProduct() ? 980 : 1040;
    const sourceHeight = Math.round(sourceWidth / targetAspect);
    const centerX = canvas.width / 2;
    const centerY = isBottleOpenerProduct() ? 560 : 650;
    const sx = clamp(Math.round(centerX - sourceWidth / 2), 0, Math.max(0, canvas.width - sourceWidth));
    const sy = clamp(Math.round(centerY - sourceHeight / 2), 0, Math.max(0, canvas.height - sourceHeight));
    summaryPreviewCtx.drawImage(
      canvas,
      sx,
      sy,
      sourceWidth,
      sourceHeight,
      0,
      0,
      summaryPreviewCanvas.width,
      summaryPreviewCanvas.height
    );
  }

  function submitFeedbackReport() {
    const selectedReason = getSelectedFeedbackReason();
    if (!selectedReason || !submitFeedbackButton || !feedbackStatus) return;
    const message = feedbackMessage ? String(feedbackMessage.value || "").trim().slice(0, MAX_FEEDBACK_MESSAGE_LENGTH) : "";
    const summary = buildCustomerSummary();

    submitFeedbackButton.disabled = true;
    feedbackStatus.textContent = "Meldung wird gespeichert …";

    fetch("/api/vorschau-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reasonKey: selectedReason.key,
        reasonLabel: selectedReason.label,
        message: message,
        summary: summary,
        pagePath: window.location.pathname
      })
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Feedback konnte nicht gespeichert werden.");
      }
      return response.json();
    }).then(function () {
      feedbackStatus.textContent = "Danke, die Rückmeldung wurde gespeichert.";
      if (feedbackMessage) {
        feedbackMessage.value = "";
      }
      window.setTimeout(function () {
        closeFeedbackOverlay();
      }, 900);
    }).catch(function () {
      feedbackStatus.textContent = "Die Meldung konnte gerade nicht gespeichert werden.";
    }).finally(function () {
      submitFeedbackButton.disabled = false;
    });
  }

  function onPointerDown(event) {
    const pendantIndex = getPendantIndexAtClientPoint(event.clientX, event.clientY);
    const clickedDifferentPendant = pendantIndex !== -1 && pendantIndex !== state.activePendantIndex;
    if (clickedDifferentPendant) {
      setActivePendant(pendantIndex);
    }

    if (clickedDifferentPendant) {
      return;
    }

    const canDragMotif = isMotifMode() && hasActiveMotifContent();
    const canDragBottleOpenerQr = isBottleOpenerProduct() && isQrMode();
    if (!canDragMotif && !canDragBottleOpenerQr) return;

    const activeSideState = getActiveSideState();
    canvas.setPointerCapture(event.pointerId);
    state.isDragging = true;
    state.dragOrigin = {
      x: event.clientX,
      y: event.clientY,
      offsetX: activeSideState.offsetX,
      offsetY: activeSideState.offsetY
    };
    canvas.classList.add("is-dragging");
  }

  function onPointerMove(event) {
    if (!state.isDragging || !state.dragOrigin) return;

    const rect = canvas.getBoundingClientRect();
    const ratioX = canvas.width / rect.width;
    const ratioY = canvas.height / rect.height;
    const deltaX = (event.clientX - state.dragOrigin.x) * ratioX;
    const deltaY = (event.clientY - state.dragOrigin.y) * ratioY;
    const activeSideState = getActiveSideState();

    activeSideState.offsetX = state.dragOrigin.offsetX + deltaX;
    activeSideState.offsetY = state.dragOrigin.offsetY + deltaY;
    clampPlacement();
    syncUi();
    queueRender();
  }

  function onPointerUp(event) {
    if (!state.isDragging) return;

    state.isDragging = false;
    state.dragOrigin = null;
    canvas.classList.remove("is-dragging");

    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
  }

  function onMobilePreviewPointerDown(event) {
    if (!mobileCanvas || !hasAnyPendantSizeSelection() || isBottleOpenerProduct()) return;

    const viewport = getMobilePreviewViewport(
      mobileCanvas.width / mobileCanvas.height,
      true
    );
    if (!viewport) return;

    mobileCanvas.setPointerCapture(event.pointerId);
    mobilePreviewDragOrigin = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: mobilePreviewPanX,
      panY: mobilePreviewPanY,
      moved: false
    };
  }

  function onMobilePreviewPointerMove(event) {
    if (!mobileCanvas || !mobilePreviewDragOrigin) return;

    const viewport = getMobilePreviewViewport(
      mobileCanvas.width / mobileCanvas.height,
      true
    );
    if (!viewport) return;

    const rect = mobileCanvas.getBoundingClientRect();
    const ratioX = viewport.sourceWidth / rect.width;
    const ratioY = viewport.sourceHeight / rect.height;
    const movementX = event.clientX - mobilePreviewDragOrigin.x;
    const movementY = event.clientY - mobilePreviewDragOrigin.y;
    if (!mobilePreviewDragOrigin.moved) {
      const movementDistance = Math.sqrt(movementX * movementX + movementY * movementY);
      if (movementDistance >= MOBILE_PREVIEW_TAP_SLOP) {
        mobilePreviewDragOrigin.moved = true;
      } else {
        return;
      }
    }

    const deltaX = (event.clientX - mobilePreviewDragOrigin.x) * ratioX;
    const deltaY = (event.clientY - mobilePreviewDragOrigin.y) * ratioY;

    mobilePreviewPanX = clamp(mobilePreviewDragOrigin.panX - deltaX, -viewport.maxPanX, viewport.maxPanX);
    mobilePreviewPanY = clamp(mobilePreviewDragOrigin.panY - deltaY, -viewport.maxPanY, viewport.maxPanY);
    syncMobilePreviewCanvas();
  }

  function onMobilePreviewPointerUp(event) {
    if (!mobilePreviewDragOrigin || !mobileCanvas) return;
    const wasTap = !mobilePreviewDragOrigin.moved;

    if (wasTap) {
      const tappedPendantIndex = getPendantIndexAtMobileClientPoint(event.clientX, event.clientY);
      if (tappedPendantIndex !== -1) {
        setActivePendant(tappedPendantIndex);
      }
    }

    mobilePreviewDragOrigin = null;

    try {
      mobileCanvas.releasePointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
  }

  function getPendantIndexAtClientPoint(clientX, clientY) {
    if (!hasAnyPendantSizeSelection()) return -1;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return getPendantLayouts().findIndex(function (layout, pendantIndex) {
      const size = getActiveSize(pendantIndex);
      const dx = x - layout.x;
      const dy = y - layout.y;
      const radius = (size ? size.productRadius : 116) * layout.scale;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  function getPendantIndexAtMobileClientPoint(clientX, clientY) {
    if (!mobileCanvas || !hasAnyPendantSizeSelection()) return -1;

    const viewport = getMobilePreviewViewport(
      mobileCanvas.width / mobileCanvas.height,
      true
    );
    if (!viewport) return -1;

    const rect = mobileCanvas.getBoundingClientRect();
    const localX = (clientX - rect.left) * (mobileCanvas.width / rect.width);
    const localY = (clientY - rect.top) * (mobileCanvas.height / rect.height);
    const sourceX = (localX / mobileCanvas.width) * viewport.sourceWidth + (viewport.centerX - viewport.sourceWidth / 2);
    const sourceY = (localY / mobileCanvas.height) * viewport.sourceHeight + (viewport.centerY - viewport.sourceHeight / 2);

    let bestPendantIndex = -1;
    let bestDistanceRatio = Infinity;

    getPendantLayouts().forEach(function (layout, pendantIndex) {
      const size = getActiveSize(pendantIndex);
      const dx = sourceX - layout.x;
      const dy = sourceY - layout.y;
      const radius = (size ? size.productRadius : 116) * layout.scale;
      const distanceRatio = Math.sqrt(dx * dx + dy * dy) / Math.max(radius, 1);
      if (distanceRatio <= 1 && distanceRatio < bestDistanceRatio) {
        bestDistanceRatio = distanceRatio;
        bestPendantIndex = pendantIndex;
      }
    });

    return bestPendantIndex;
  }

  function getPlacementClampDistance(areaSize, contentSize, axis) {
    const safeAreaSize = Number(areaSize) || 0;
    const safeContentSize = Number(contentSize) || 0;
    if (!safeAreaSize || !safeContentSize) return 0;

    const contentVisibleRatio = safeContentSize <= safeAreaSize ? 0.78 : 0.28;
    const areaVisibleRatio = axis === "y" ? 0.22 : 0.28;
    const minVisibleSize = Math.min(
      safeContentSize,
      safeAreaSize * 0.9,
      Math.max(safeContentSize * contentVisibleRatio, safeAreaSize * areaVisibleRatio)
    );

    return Math.max(0, (safeAreaSize + safeContentSize) / 2 - minVisibleSize);
  }

  function clampPlacement() {
    if (isBottleOpenerProduct()) {
      const box = getBottleOpenerDesignBox();
      if (!box) return;

      const activeSideState = getActiveSideState();
      let contentWidth = 0;
      let contentHeight = 0;

      if (isQrMode() && hasQrValue()) {
        const qrLayout = getBottleOpenerQrLayout();
        if (!qrLayout) return;

        if (activeSideState.scalePercent > qrLayout.maxScalePercent) {
          activeSideState.scalePercent = qrLayout.maxScalePercent;
          scaleSlider.value = String(activeSideState.scalePercent);
        }

        contentWidth = qrLayout.outerSize;
        contentHeight = qrLayout.outerSize;
      } else {
        if (isMonogramTemplateSelected()) {
          if (!hasMonogramValue()) return;
          const monogramLayout = getBottleOpenerMonogramLayout();
          contentWidth = monogramLayout.drawWidth;
          contentHeight = monogramLayout.drawHeight;
        } else {
          const image = getActiveImage();
          if (!image) return;

          const motifLayout = getBottleOpenerMotifLayout(image);
          contentWidth = motifLayout.width;
          contentHeight = motifLayout.height;
        }
      }

      const maxOffsetX = getPlacementClampDistance(box.width, contentWidth, "x");
      const maxOffsetY = getPlacementClampDistance(box.height, contentHeight, "y");

      activeSideState.offsetX = clamp(activeSideState.offsetX, -maxOffsetX, maxOffsetX);
      activeSideState.offsetY = clamp(activeSideState.offsetY, -maxOffsetY, maxOffsetY);
      return;
    }

    const motifMask = getMotifMask(state.activePendantIndex);
    if (!motifMask) return;

    const activeSideState = getActiveSideState();
    let drawBox;
    if (isMonogramTemplateSelected()) {
      if (!hasMonogramValue()) return;
      drawBox = getMonogramLayout(state.activePendantIndex);
      drawBox = {
        width: drawBox.drawWidth,
        height: drawBox.drawHeight
      };
    } else {
      const image = getActiveImage();
      if (!image) return;
      drawBox = getMotifDrawBox(image);
    }
    const maxOffsetX = getPlacementClampDistance(motifMask.width, drawBox.width, "x");
    const maxOffsetY = getPlacementClampDistance(motifMask.height, drawBox.height, "y");

    activeSideState.offsetX = clamp(activeSideState.offsetX, -maxOffsetX, maxOffsetX);
    activeSideState.offsetY = clamp(activeSideState.offsetY, -maxOffsetY, maxOffsetY);
  }

  function clampTextPlacement() {
    if (isBottleOpenerProduct()) {
      const activeSideState = getActiveSideState();
      const box = getBottleOpenerDesignBox();

      if (!box) {
        activeSideState.textOffsetX = 0;
        activeSideState.textOffsetY = 0;
        return;
      }

      if (!hasText()) {
        activeSideState.textOffsetX = 0;
        activeSideState.textOffsetY = 0;
        return;
      }

      const textLayout = getBottleOpenerTextLayout(activeSideState.textValue);
      const maxOffsetX = getPlacementClampDistance(box.width, textLayout.width, "x");
      const maxOffsetY = getPlacementClampDistance(box.height, textLayout.height, "y");

      activeSideState.textOffsetX = clamp(activeSideState.textOffsetX, -maxOffsetX, maxOffsetX);
      activeSideState.textOffsetY = clamp(activeSideState.textOffsetY, -maxOffsetY, maxOffsetY);
      return;
    }

    const motifMask = getMotifMask(state.activePendantIndex);
    const activeSideState = getActiveSideState();

    if (!motifMask) {
      activeSideState.textOffsetX = 0;
      activeSideState.textOffsetY = 0;
      return;
    }

    if (!hasText()) {
      activeSideState.textOffsetX = 0;
      activeSideState.textOffsetY = getDefaultTextOffsetY(state.activePendantIndex);
      return;
    }

    const textLayout = getTextLayout(activeSideState.textValue);
    const maxOffsetX = getPlacementClampDistance(motifMask.width, textLayout.width, "x");
    const defaultOffsetY = getDefaultTextOffsetY(state.activePendantIndex);
    const maxOffsetY = getPlacementClampDistance(motifMask.height, textLayout.height, "y");

    activeSideState.textOffsetX = clamp(activeSideState.textOffsetX, -maxOffsetX, maxOffsetX);
    activeSideState.textOffsetY = clamp(activeSideState.textOffsetY, Math.min(defaultOffsetY, -maxOffsetY), maxOffsetY);
  }

  function syncUi() {
    const activeMaterial = getActiveMaterial();
    const activeProduct = getActiveProduct();
    const activeProductFamily = getActiveProductFamily();
    const activeFinish = getActiveFinish();
    const activeProductDisplayName = getActiveProductDisplayName() || (activeProductFamily ? activeProductFamily.name : "");
    const activeSize = getActiveSize();
    const activeTemplate = getActiveTemplate();
    const activeSideState = getActiveSideState();
    const priceState = calculatePriceSummary();
    const readyForExport = isConfigurationReady();

    syncStepGroups();

    if (previewStageTitle) {
      previewStageTitle.textContent = hasProductSelection()
        ? (isBottleOpenerProduct() ? "Metall-Flaschenöffner" : "Rundes Edelstahl-Plättchen")
        : "Vorschau";
    }

    if (!hasMaterialSelection()) {
      previewProductName.textContent = "Noch nichts ausgewählt";
      previewProductHint.textContent = "Material wählen.";
      previewModeChip.textContent = "Start";
    } else if (!hasProductSelection()) {
      previewProductName.textContent = activeMaterial.name;
      previewProductHint.textContent = activeMaterial.id === "metal"
        ? "Wähle jetzt Schmuckanhänger oder Flaschenöffner."
        : "Die Struktur für diese Materialwelt ist vorbereitet.";
      previewModeChip.textContent = "Produkt wählen";
    } else if (isBottleOpenerProduct()) {
      if (!hasDesignModeSelection()) {
        previewProductName.textContent = "Flaschenöffner";
        previewProductHint.textContent = "Die große Hauptfläche ist aktiv. Wähle jetzt Motiv, Text oder QR.";
        previewModeChip.textContent = "Gestaltungsart wählen";
      } else {
        previewProductName.textContent = "Flaschenöffner";
        previewProductHint.textContent = "Große äußere Hauptfläche · Vorderseite";
        previewModeChip.textContent = isQrMode() ? "QR" : (isMotifMode() ? "Motiv" : "Text");
      }
    } else if (requiresFinishSelection() && !hasFinishSelection()) {
      previewProductName.textContent = activeProductFamily.name;
      previewProductHint.textContent = "Wähle jetzt die Ausführung für deinen Edelstahl-Schmuckanhänger.";
      previewModeChip.textContent = "Ausführung wählen";
    } else if (!hasSetSelection()) {
      previewProductName.textContent = activeProductDisplayName;
      previewProductHint.textContent = "Lege jetzt fest, wie viele Anhänger im Set gezeigt werden.";
      previewModeChip.textContent = "Set wählen";
    } else if (!hasSizeSelection()) {
      previewProductName.textContent = activeProductDisplayName + " · " + getActiveSetOption().shortLabel;
      previewProductHint.textContent = "Wähle jetzt die passende Größe für " + getPendantLabel(state.activePendantIndex) + ".";
      previewModeChip.textContent = "Größe wählen";
    } else if (!hasDesignModeSelection()) {
      previewProductName.textContent = activeProductDisplayName + " · " + getActiveSetOption().shortLabel + " · " + activeSize.label;
      previewProductHint.textContent = isBackSideEnabled()
        ? "Die Rückseite für " + getPendantLabel(state.activePendantIndex) + " ist zusätzlich verfügbar."
        : "Wähle jetzt Motiv oder Text für " + getPendantLabel(state.activePendantIndex) + ".";
      previewModeChip.textContent = "Gestaltungsart wählen";
    } else {
      previewProductName.textContent = activeProductDisplayName + " · " + getActiveSetOption().shortLabel + " · " + activeSize.label;
      previewProductHint.textContent = "Metall · " + activeSize.diameterMm + " mm · " + getPendantLabel(state.activePendantIndex) + " · " + getSideLabel(state.activeSide);
      previewModeChip.textContent = getPendantLabel(state.activePendantIndex) + " · " + getSideLabel(state.activeSide) + " · " + (isMotifMode() ? "Motiv" : "Text");
    }

    previewSetLabel.textContent = isBottleOpenerProduct() ? "Standard" : (hasSetSelection() ? getActiveSetOption().shortLabel : "Einzel");
    previewPendantLabel.textContent = isBottleOpenerProduct() ? "Produkt" : getPendantTabLabel(state.activePendantIndex);
    previewActiveSideLabel.textContent = isBottleOpenerProduct() ? "Vorderseite" : getSideLabel(state.activeSide);
    if (previewProductNameMobile) {
      previewProductNameMobile.textContent = previewProductName.textContent;
    }
    if (previewModeChipMobile) {
      previewModeChipMobile.textContent = previewModeChip.textContent;
    }
    if (previewActiveSideLabelMobile) {
      previewActiveSideLabelMobile.textContent = previewActiveSideLabel.textContent;
    }
    previewModeLabel.textContent = isBottleOpenerProduct()
      ? (hasDesignModeSelection() ? (isQrMode() ? "QR" : (isMotifMode() ? "Motiv" : "Text")) : "Offen")
      : (hasDesignModeSelection() ? (isQrMode() ? "QR" : (isMotifMode() ? "Motiv" : "Text")) : "Offen");
    previewSourceLabel.textContent = getActiveSourceLabel(activeTemplate);

    scaleSlider.value = String(activeSideState.scalePercent);
    if (stretchXSlider) {
      stretchXSlider.value = String(clamp(activeSideState.stretchXPercent || 100, 70, 140));
    }
    if (stretchYSlider) {
      stretchYSlider.value = String(clamp(activeSideState.stretchYPercent || 100, 70, 140));
    }
    if (rotationSlider) {
      rotationSlider.value = String(clamp(activeSideState.rotationDeg || 0, -180, 180));
    }
    textSizeSlider.value = String(activeSideState.textScalePercent);
    scaleValueLabel.textContent = activeSideState.scalePercent + "%";
    if (stretchXValueLabel) {
      stretchXValueLabel.textContent = String(clamp(activeSideState.stretchXPercent || 100, 70, 140)) + "%";
    }
    if (stretchYValueLabel) {
      stretchYValueLabel.textContent = String(clamp(activeSideState.stretchYPercent || 100, 70, 140)) + "%";
    }
    if (rotationValueLabel) {
      rotationValueLabel.textContent = String(clamp(activeSideState.rotationDeg || 0, -180, 180)) + "°";
    }
    textSizeValueLabel.textContent = activeSideState.textScalePercent + "%";
    textCharacterCount.textContent = activeSideState.textValue.length + " / " + MAX_TEXT_LENGTH;
    textInput.value = activeSideState.textValue;
    textFontSelect.value = activeSideState.textFontId;
    qrCharacterCount.textContent = activeSideState.qrValue.length + " / " + MAX_QR_LENGTH;
    qrInput.value = activeSideState.qrValue;
    if (monogramCharacterCount) {
      monogramCharacterCount.textContent = activeSideState.monogramValue.length + " / 3";
    }
    if (monogramInput) {
      monogramInput.value = activeSideState.monogramValue;
    }
    if (monogramFontSelect) {
      monogramFontSelect.value = activeSideState.monogramFontId;
    }

    requestWhatsappLink.href = readyForExport ? buildWhatsappUrl() : "#";
    requestEmailLink.href = readyForExport ? buildMailtoUrl() : "#";
    if (requestWhatsappLinkMobile) {
      requestWhatsappLinkMobile.href = requestWhatsappLink.href;
    }
    if (requestEmailLinkMobile) {
      requestEmailLinkMobile.href = requestEmailLink.href;
    }
    [downloadPreviewButton, downloadPreviewButtonMobile].filter(Boolean).forEach((button) => {
      button.disabled = !readyForExport;
    });
    if (!readyForExport) {
      closeRequestMenu();
    }

    const canShowBackSideSection = !isBottleOpenerProduct() && hasSizeSelection() && (isFrontConfigured() || isBackSideEnabled());
    const canShowPendantSection = !isBottleOpenerProduct() && hasSetSelection() && getPendantCount() > 1;
    pendantSwitchGroup.hidden = !canShowPendantSection;
    if (canShowPendantSection) {
      pendantSwitchStatus.textContent = getPendantLabel(state.activePendantIndex) + " wird gerade bearbeitet";
      pendantSwitchHint.textContent = hasSizeSelection()
        ? "Anhänger wählen."
        : "Anhänger wählen, dann Größe festlegen.";
    }
    sideSwitchGroup.hidden = !canShowBackSideSection;
    sideSwitchGroup.setAttribute("aria-hidden", canShowBackSideSection ? "false" : "true");
    sideTabs.hidden = !isBackSideEnabled();
    enableBackSideButton.hidden = isBackSideEnabled();
    sideSwitchStatus.textContent = isBackSideEnabled()
      ? (state.activeSide === "back" ? "Rückseite von " + getPendantLabel(state.activePendantIndex) : "Rückseite für " + getPendantLabel(state.activePendantIndex) + " aktiv")
      : "Rückseite optional";
    sideSwitchHint.textContent = isBackSideEnabled()
      ? "Zwischen Vorder- und Rückseite wechseln."
      : "Bei Bedarf aktivieren.";

    const surchargeHint = getBackSideSurchargeHint();
    if (!isBackSideEnabled()) {
      sideSwitchHint.textContent = "Bei Bedarf Rückseite aktivieren." + (surchargeHint ? " " + surchargeHint : "");
    } else if (surchargeHint) {
      sideSwitchHint.textContent += " " + surchargeHint;
    }

    sideFrontButton.classList.toggle("is-active", state.activeSide === "front");
    sideBackButton.classList.toggle("is-active", state.activeSide === "back");
    sideFrontButton.setAttribute("aria-selected", state.activeSide === "front" ? "true" : "false");
    sideBackButton.setAttribute("aria-selected", state.activeSide === "back" ? "true" : "false");

    setSectionVisibility(motifTemplateGroup, isMotifMode());
    setSectionVisibility(
      motifAdjustGroup,
      (isMotifMode() && hasActiveMotifContent() && !isQrSelected()) ||
      (isBottleOpenerProduct() && isQrMode())
    );
    setSectionVisibility(monogramGroup, isMotifMode() && isMonogramTemplateSelected());
    setSectionVisibility(emblemGroup, isMotifMode() && isEmblemTemplateSelected() && hasSelectedEmblemKind() && !isQrSelected());
    setSectionVisibility(rotationGroup, hasDesignModeSelection());
    setSectionVisibility(qrCodeGroup, isQrMode() || (isMotifMode() && isQrSelected()));
    setSectionVisibility(textGroup, isTextMode());
    if (emblemSourceTemplateButton) {
      emblemSourceTemplateButton.setAttribute("aria-pressed", isEmblemTemplateSelected() && !isEmblemUploadSelected() ? "true" : "false");
    }
    if (emblemSourceUploadButton) {
      emblemSourceUploadButton.setAttribute("aria-pressed", isEmblemUploadSelected() ? "true" : "false");
    }
    if (emblemUploadHint) {
      emblemUploadHint.hidden = !(isMotifMode() && isEmblemUploadSelected());
    }

    const motifHint = getMotifSizeHint();
    motifSizeHint.hidden = !motifHint;
    motifSizeHint.textContent = motifHint;
    photoPricingHint.hidden = !(priceState.hasPhoto || hasAnyPhotoSelection());
    photoPricingHint.textContent = photoPricingHint.hidden ? "" : PHOTO_DISCOUNT_HINT;

    const shouldShowPriceBox = hasMaterialSelection() && hasProductSelection() && (isBottleOpenerProduct() || hasSetSelection());
    priceSummaryBox.hidden = !shouldShowPriceBox;
    if (shouldShowPriceBox) {
      if (priceState.items.length) {
        priceBreakdown.innerHTML = priceState.items.map(function (item) {
          const itemHeadline = item.sizeLabel ? item.label + " · " + item.sizeLabel : item.label;
          const itemPriceText = item.displayPrice || formatEuro(item.totalCents);
          const itemMetaText = item.metaParts && item.metaParts.length ? escapeHtml(item.metaParts.join(" · ")) : "";
          return (
            '<div class="preview-price-box__item">' +
              '<div class="preview-price-box__item-head">' +
                '<span>' + escapeHtml(itemHeadline) + '</span>' +
                '<strong>' + escapeHtml(itemPriceText) + "</strong>" +
              "</div>" +
              '<div class="preview-price-box__item-meta">' + itemMetaText + "</div>" +
            "</div>"
          );
        }).join("");
      } else {
        priceBreakdown.innerHTML = "";
      }

      if (isBottleOpenerProduct()) {
        const singlePriceCents = getBottleOpenerSinglePriceCents();
        if (priceSubtotalLabel) priceSubtotalLabel.textContent = "";
        priceSubtotal.textContent = "";
        priceDiscountRow.hidden = true;
        if (priceTotalLabel) priceTotalLabel.textContent = "Einzelpreis";
        priceTotal.textContent = singlePriceCents != null
          ? formatEuro(singlePriceCents) + " / Stk."
          : "—";
        priceSummaryHint.textContent = priceState.minQty
          ? "Staffelpreise gelten ab " + priceState.minQty + " Stück."
          : "";
        if (priceSummarySubhint) {
          priceSummarySubhint.textContent = "";
          priceSummarySubhint.hidden = true;
        }
      } else {
        if (priceSubtotalLabel) priceSubtotalLabel.textContent = "Zwischensumme";
        priceSubtotal.textContent = priceState.items.length ? formatEuro(priceState.subtotalCents) : "—";
        priceDiscountLabel.textContent = "Set-Rabatt" + (priceState.discountRate ? " (" + Math.round(priceState.discountRate * 100) + "%)" : "");
        priceDiscount.textContent = priceState.items.length ? "-" + formatEuro(priceState.discountCents) : "—";
        priceDiscountRow.hidden = !priceState.items.length || !priceState.discountRate;
        if (priceTotalLabel) priceTotalLabel.textContent = "Gesamtpreis";
        priceTotal.textContent = priceState.items.length ? formatEuro(priceState.totalCents) : "—";
        priceSummaryHint.textContent = priceState.items.length
          ? (priceState.hasPhotoAt12mm ? PHOTO_SIZE_12_HINT : priceState.invalidReason)
          : priceState.invalidReason;
        if (priceSummarySubhint) {
          priceSummarySubhint.textContent = "Schmuckträger nicht enthalten. Preis bezieht sich auf die aktuell konfigurierten Anhänger.";
          priceSummarySubhint.hidden = false;
        }
      }
    }

    if (!isMotifMode() || (!isAnimalSymbolsSelected() && !isEmblemTemplateSelected())) {
      state.isMotifVariantOverlayOpen = false;
      state.motifOverlayStep = "groups";
    }
    motifVariantOverlay.hidden = !state.isMotifVariantOverlayOpen;
    motifVariantOverlayBackButton.hidden = !state.isMotifVariantOverlayOpen || !["variants", "googleGroups", "emblemSourceChoice", "emblemVariants", "emblemUpload"].includes(state.motifOverlayStep);
    if (motifOverlayUploadActions) {
      motifOverlayUploadActions.hidden = !(state.isMotifVariantOverlayOpen && state.motifOverlayStep === "emblemUpload");
    }
    if (motifOverlayUploadButton) {
      motifOverlayUploadButton.hidden = !(state.isMotifVariantOverlayOpen && state.motifOverlayStep === "emblemUpload");
    }
    if (motifOverlayUploadHint) {
      motifOverlayUploadHint.hidden = !(state.isMotifVariantOverlayOpen && state.motifOverlayStep === "emblemUpload");
    }
    if (motifOverlayUploadRemoveButton) {
      motifOverlayUploadRemoveButton.hidden = !(state.isMotifVariantOverlayOpen && state.motifOverlayStep === "emblemUpload" && Boolean(getActiveSideState().uploadedImage));
    }

    materialOptionsEl.querySelectorAll("[data-material-id]").forEach((button) => {
      const material = getMaterialById(button.getAttribute("data-material-id"));
      button.classList.toggle("is-active", button.getAttribute("data-material-id") === state.materialId);
      button.classList.toggle("is-disabled", material.isComingSoon === true);
      button.disabled = material.isComingSoon === true;
    });

    productOptionsEl.querySelectorAll("[data-product-id]").forEach((button) => {
      const productFamily = getProductFamilyById(button.getAttribute("data-product-id"));
      const isComingSoon = Boolean(productFamily && productFamily.isComingSoon);
      button.classList.toggle("is-active", button.getAttribute("data-product-id") === state.productFamilyId);
      button.classList.toggle("is-disabled", isComingSoon);
      button.disabled = isComingSoon;
    });

    finishOptionsEl.querySelectorAll("[data-finish-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-finish-id") === state.finishId);
    });

    sizeOptionsEl.querySelectorAll("[data-size-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-size-id") === getActivePendantState().sizeId);
    });

    designModeOptionsEl.querySelectorAll("[data-design-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-design-mode") === activeSideState.designMode);
    });

    setOptionsEl.querySelectorAll("[data-set-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-set-id") === state.setId);
    });

    if (pendantTabs) {
      pendantTabs.querySelectorAll("[data-pendant-index]").forEach((button) => {
        const pendantIndex = Number(button.getAttribute("data-pendant-index"));
        const isActive = pendantIndex === state.activePendantIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    templateOptionsEl.querySelectorAll("[data-template-id]").forEach((button) => {
      const template = getTemplateById(button.getAttribute("data-template-id"));
      const activeTopLevelId = getActiveTopLevelTemplateId();
      const isPhotoDisabled = Boolean(template && template.category === "photo" && !canUsePhotoOnPendant());
      button.classList.toggle("is-active", template && template.id === activeTopLevelId);
      button.classList.toggle("is-disabled", isPhotoDisabled);
      button.disabled = isPhotoDisabled;
    });

    motifOverlayOptionsEl.querySelectorAll("[data-animal-group-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-animal-group-id") === activeSideState.animalGroupId);
    });

    motifOverlayOptionsEl.querySelectorAll("[data-symbol-category-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-symbol-category-id") === activeSideState.symbolTemplateCategoryId);
    });

    motifOverlayOptionsEl.querySelectorAll("[data-google-browser-group-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-google-browser-group-id") === activeSideState.googleSymbolGroupId);
    });

    motifOverlayOptionsEl.querySelectorAll("[data-motif-variant-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-motif-variant-id") === activeSideState.motifVariantId);
    });

    motifOverlayOptionsEl.querySelectorAll("[data-emblem-variant-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-emblem-variant-id") === activeSideState.emblemVariantId);
    });

    document.querySelectorAll("[data-text-style]").forEach((button) => {
      const styleName = button.getAttribute("data-text-style");
      const isActive = Boolean(activeSideState.textStyles[styleName]);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    scheduleMobileThumbnailAutoCrop();
    syncSummaryCard();
  }

  function syncStepGroups() {
    const flowStepIds = getFlowStepIds();
    const stepTitles = {
      material: "Material wählen",
      product: "Produkt wählen",
      finish: "Ausführung wählen",
      set: "Set wählen",
      size: "Größe wählen",
      designMode: "Gestaltungsart wählen"
    };

    Object.keys(STEP_DEFINITIONS).forEach(function (stepId) {
      const definition = STEP_DEFINITIONS[stepId];
      if (!definition.groupEl) return;

      const isPartOfFlow = flowStepIds.includes(stepId);
      const titleRow = definition.groupEl.querySelector(".preview-control-title-row");
      const titleEl = titleRow ? titleRow.querySelector("h3") : null;

      if (!isPartOfFlow) {
        definition.groupEl.hidden = true;
        definition.groupEl.setAttribute("data-step-state", "locked");
        definition.groupEl.setAttribute("data-step-id", stepId);
        if (titleRow) {
          titleRow.removeAttribute("data-step-summary");
        }
        return;
      }

      const isVisible = stepId === "material" ? true : isStepAvailable(stepId);
      const visualState = getStepVisualState(stepId);
      const summary = getStepSummary(stepId);

      definition.groupEl.hidden = !isVisible;
      definition.groupEl.setAttribute("data-step-state", visualState);
      definition.groupEl.setAttribute("data-step-id", stepId);
      if (titleEl && stepTitles[stepId]) {
        titleEl.textContent = stepTitles[stepId];
      }
      if (titleRow) {
        titleRow.setAttribute("data-step-summary", summary);
      }
    });

    if (motifTemplateGroup) {
      const motifTemplateTitle = motifTemplateGroup.querySelector(".preview-control-title-row h3");
      if (motifTemplateTitle) {
        motifTemplateTitle.textContent = "Motivart wählen";
      }
    }
  }

  function getActiveSourceLabel(activeTemplate) {
    if (!hasMaterialSelection()) return "Offen";
    if (!hasProductSelection()) return "Weiter mit Produkt";
    if (isBottleOpenerProduct() && !hasDesignModeSelection()) return "Weiter mit Gestaltungsart";
    if (!hasSetSelection()) return "Weiter mit Set";
    if (!hasSizeSelection()) return "Weiter mit Größe von " + getPendantLabel(state.activePendantIndex);
    if (!hasDesignModeSelection()) return "Weiter mit Gestaltungsart";

    if (isQrMode()) {
      return hasQrValue() ? "QR-Code" : "QR-Code offen";
    }

    if (isMotifMode()) {
      if (isMonogramTemplateSelected()) {
        return hasMonogramValue() ? "Monogramm: " + getActiveSideState().monogramValue : "Monogramm offen";
      }
      if (getActiveSideState().uploadedImage) {
        return isEmblemUploadSelected() ? "Datei: " + getActiveSideState().uploadedFileName : "Foto: " + getActiveSideState().uploadedFileName;
      }
      if (isAnimalSymbolsSelected()) {
        const variant = getActiveMotifVariant();
        const animalGroup = getActiveAnimalGroup();
        if (variant && animalGroup) {
          return animalGroup.name + ": " + variant.name;
        }
        if (animalGroup) {
          return "Tiermotiv: " + animalGroup.name;
        }
        return "Tiermotiv";
      }
      if (isEmblemTemplateSelected()) {
        const emblemVariant = getActiveEmblemVariant();
        if (isEmblemUploadSelected()) return getActiveSideState().uploadedImage ? "Datei: " + getActiveSideState().uploadedFileName : "Eigene Datei offen";
        if (emblemVariant) {
          return "Wappen / Emblem: " + emblemVariant.name;
        }
        return "Wappen / Emblem";
      }
      if (activeTemplate) {
        return activeTemplate.name;
      }
      return "Noch kein Motiv";
    }

    return hasText() ? "Text: " + getActiveSideState().textValue : "Noch kein Text";
  }

  function setSectionVisibility(section, isVisible) {
    section.hidden = !isVisible;
    section.querySelectorAll("input, button, select, textarea").forEach((element) => {
      element.disabled = !isVisible;
    });
  }

  function scrollToBackSideConfiguration() {
    const targetSection = getBackSideScrollTarget();
    if (!targetSection) return;

    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function getBackSideScrollTarget() {
    if (!isBackSideEnabled()) {
      return null;
    }

    if (!hasDesignModeSelection()) {
      return designModeGroup;
    }

    if (isMotifMode()) {
      return motifTemplateGroup.hidden ? designModeGroup : motifTemplateGroup;
    }

    if (isTextMode()) {
      return textGroup.hidden ? designModeGroup : textGroup;
    }

    return designModeGroup;
  }

  function getNextFinishFocusTarget() {
    const candidates = [setGroup, pendantSwitchGroup, sizeGroup, designModeGroup];
    return candidates.find(function (section) {
      return section && !section.hidden;
    }) || null;
  }

  function focusNextSectionAfterFinishSelection() {
    if (!controlCard) return;

    pendingAfterRenderAction = function () {
      const targetSection = getNextFinishFocusTarget();
      if (!targetSection || targetSection.hidden) return;

      const cardRect = controlCard.getBoundingClientRect();
      const targetRect = targetSection.getBoundingClientRect();
      const currentScrollTop = controlCard.scrollTop;
      const targetTop = targetSection.offsetTop;
      const targetBottom = targetTop + targetSection.offsetHeight;
      const visibleTop = currentScrollTop;
      const visibleBottom = currentScrollTop + controlCard.clientHeight;
      const titleOffset = 22;
      const desiredTop = Math.max(0, targetTop - titleOffset);
      const maxScrollTop = Math.max(0, controlCard.scrollHeight - controlCard.clientHeight);
      const nextScrollTop = Math.min(desiredTop, maxScrollTop);
      const isAlreadyWellVisible =
        targetTop >= visibleTop + 8 &&
        targetBottom <= visibleBottom - 24 &&
        targetRect.top >= cardRect.top + 8 &&
        targetRect.top <= cardRect.top + Math.round(controlCard.clientHeight * 0.45);

      if (isAlreadyWellVisible || Math.abs(nextScrollTop - currentScrollTop) < 10) return;

      controlCard.scrollTo({
        top: nextScrollTop,
        behavior: "smooth"
      });
    };
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;

    requestAnimationFrame(function () {
      renderQueued = false;
      renderPreview();
      if (pendingAfterRenderAction) {
        const afterRenderAction = pendingAfterRenderAction;
        pendingAfterRenderAction = null;
        afterRenderAction();
      }
    });
  }

  function renderPreview() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackdrop();

    if (!hasMaterialSelection()) {
      drawEmptyState("Material wählen", "");
      syncMobilePreviewCanvas();
      return;
    }

    if (!hasProductSelection()) {
      drawEmptyState("Produkt wählen", "");
      syncMobilePreviewCanvas();
      return;
    }

    if (isBottleOpenerProduct()) {
      drawBottleOpenerPreview();
      syncMobilePreviewCanvas();
      return;
    }

    if (!hasSetSelection()) {
      drawEmptyState("Set wählen", "");
      syncMobilePreviewCanvas();
      return;
    }

    if (!hasAnyPendantSizeSelection()) {
      drawSetSelectionPreview();
      syncMobilePreviewCanvas();
      return;
    }

    const material = getActiveMaterial();
    const product = getActiveProduct();

    getPendantLayouts().forEach(function (layout, pendantIndex) {
      const pendantSize = getActiveSize(pendantIndex);
      if (pendantSize) {
        renderPendantPreview(pendantSize, pendantIndex, layout);
      } else {
        drawSchematicPendant(layout, pendantIndex === state.activePendantIndex);
      }
    });

    drawPreviewLabels(material, product);
    syncMobilePreviewCanvas();
  }

  function renderPendantPreview(size, pendantIndex, layout) {
    withPendantTransform(layout, function () {
      drawRoundTagBase(size);
      drawMotifMask(size, pendantIndex);

      if (hasDesignModeSelection(state.activeSide, pendantIndex)) {
        if (isMotifMode(state.activeSide, pendantIndex)) {
          if (isMonogramTemplateSelected(state.activeSide, pendantIndex)) {
            if (hasMonogramValue(state.activeSide, pendantIndex)) {
              drawMonogramMotif(size, pendantIndex);
            } else if (pendantIndex === state.activePendantIndex) {
              drawMotifPrompt("Monogramm", "1–3 Zeichen eingeben.");
            }
          } else {
            const image = getActiveImage(state.activeSide, pendantIndex);
            if (image) {
              drawMotif(size, image, pendantIndex);
            } else if (isEmblemTemplateSelected(state.activeSide, pendantIndex)) {
              if (isEmblemUploadSelected(state.activeSide, pendantIndex)) {
                if (pendantIndex === state.activePendantIndex) {
                  drawMotifPrompt("Eigene Datei", "SVG oder PNG transparent.");
                }
              } else if (isQrSelected(state.activeSide, pendantIndex)) {
                if (hasQrValue(state.activeSide, pendantIndex)) {
                  drawQrMotif(size, pendantIndex);
                } else if (pendantIndex === state.activePendantIndex) {
                  drawMotifPrompt("QR-Inhalt eingeben", "Link oder kurze Information für den QR-Code festlegen.");
                }
              } else if (pendantIndex === state.activePendantIndex) {
                drawMotifPrompt("Vorlage wählen", "Wappen oder Emblem.");
              }
            } else if (pendantIndex === state.activePendantIndex) {
                drawMotifPrompt(
                isAnimalSymbolsSelected(state.activeSide, pendantIndex) && getActiveAnimalGroup(state.activeSide, pendantIndex)
                  ? "Variante wählen"
                  : isAnimalSymbolsSelected(state.activeSide, pendantIndex)
                    ? "Tiergruppe wählen"
                    : "Motivart wählen",
                isAnimalSymbolsSelected(state.activeSide, pendantIndex) && getActiveAnimalGroup(state.activeSide, pendantIndex)
                  ? "Variante wählen."
                  : isAnimalSymbolsSelected(state.activeSide, pendantIndex)
                    ? "Tiergruppe wählen."
                    : "Motivart wählen."
              );
            }
          }
        }

        if (isTextMode(state.activeSide, pendantIndex)) {
          if (hasText(state.activeSide, pendantIndex)) {
            drawTextOverlay(size, pendantIndex);
          } else if (pendantIndex === state.activePendantIndex) {
            drawMotifPrompt("Text eingeben", "Name, Initialen oder kurzes Wort.");
          }
        }
      } else if (pendantIndex === state.activePendantIndex) {
        drawMotifPrompt(
          state.activeSide === "back" && isBackSideEnabled() ? "Rückseite gestalten" : "Gestaltungsart wählen",
          state.activeSide === "back" && isBackSideEnabled()
            ? "Rückseite gestalten oder frei lassen."
            : "Motiv oder Text wählen."
        );
      }

      drawProductHighlights(size);
    });

    drawPendantSelectionHalo(size, layout, pendantIndex);
  }

  function withPendantTransform(layout, callback) {
    ctx.save();
    ctx.translate(layout.x, layout.y);
    ctx.scale(layout.scale, layout.scale);
    ctx.translate(-600, -650);
    callback();
    ctx.restore();
  }

  function drawPendantSelectionHalo(size, layout, pendantIndex) {
    const radius = size.productRadius * layout.scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(layout.x, layout.y, radius + 18, 0, Math.PI * 2);
    ctx.strokeStyle = pendantIndex === state.activePendantIndex
      ? "rgba(219,16,33,0.64)"
      : "rgba(255,255,255,0.12)";
    ctx.lineWidth = pendantIndex === state.activePendantIndex ? 3 : 1.5;
    ctx.stroke();

    if (pendantIndex === state.activePendantIndex) {
      ctx.shadowColor = "rgba(219,16,33,0.28)";
      ctx.shadowBlur = 18;
      ctx.stroke();

      ctx.fillStyle = "rgba(10,10,14,0.76)";
      drawRoundedRect(ctx, layout.x - 78, layout.y + radius + 22, 156, 38, 19);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "600 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(getPendantLabel(pendantIndex), layout.x, layout.y + radius + 47);
    }

    ctx.restore();
  }

  function getPendantLayouts(countValue) {
    const count = countValue || getPendantCount();
    const useStaticLayout = countValue != null;
    const centerX = 600;
    const centerY = 676;
    let layouts;

    if (count === 2) {
      layouts = [
        { x: 448, y: 664, scale: 0.84 },
        { x: 752, y: 664, scale: 0.84 }
      ];
    } else if (count === 3) {
      layouts = [
        { x: 600, y: 470, scale: 0.69 },
        { x: 412, y: 786, scale: 0.69 },
        { x: 788, y: 786, scale: 0.69 }
      ];
    } else if (count === 4) {
      layouts = [
        { x: 420, y: 492, scale: 0.62 },
        { x: 780, y: 492, scale: 0.62 },
        { x: 420, y: 826, scale: 0.62 },
        { x: 780, y: 826, scale: 0.62 }
      ];
    } else if (count === 5) {
      layouts = [
        { x: 600, y: 390, scale: 0.56 },
        { x: 420, y: 604, scale: 0.56 },
        { x: 780, y: 604, scale: 0.56 },
        { x: 476, y: 836, scale: 0.56 },
        { x: 724, y: 836, scale: 0.56 }
      ];
    } else {
      layouts = [
        { x: 600, y: 650, scale: 1 }
      ];
    }

    if (useStaticLayout || count === 1) {
      return layouts;
    }

    const maxDiameter = getPendantIndices().reduce(function (maxValue, pendantIndex) {
      const size = getActiveSize(pendantIndex);
      return Math.max(maxValue, size ? size.diameterMm : 8);
    }, 8);
    const spreadRatio = (maxDiameter - 8) / 12;
    const spreadFactor = 1 + spreadRatio * 0.5;
    const verticalOffset = 22 + spreadRatio * 46;

    const projectedLayouts = layouts.map(function (layout) {
      return {
        x: Number((centerX + (layout.x - centerX) * spreadFactor).toFixed(1)),
        y: Number((centerY + (layout.y - centerY) * spreadFactor + verticalOffset).toFixed(1)),
        scale: layout.scale
      };
    });

    if (count === 5 && projectedLayouts.length === 5) {
      projectedLayouts[0].y = Number((projectedLayouts[0].y - 8).toFixed(1));
      projectedLayouts[1].x = Number((projectedLayouts[1].x - 30).toFixed(1));
      projectedLayouts[2].x = Number((projectedLayouts[2].x + 30).toFixed(1));
      projectedLayouts[1].y = Number((projectedLayouts[1].y + 18).toFixed(1));
      projectedLayouts[2].y = Number((projectedLayouts[2].y + 18).toFixed(1));
      projectedLayouts[3].x = Number((projectedLayouts[3].x - 52).toFixed(1));
      projectedLayouts[4].x = Number((projectedLayouts[4].x + 52).toFixed(1));
      projectedLayouts[3].y = Number((projectedLayouts[3].y + 12).toFixed(1));
      projectedLayouts[4].y = Number((projectedLayouts[4].y + 12).toFixed(1));
    }

    return projectedLayouts;
  }

  function drawSetSelectionPreview() {
    const product = getActiveProduct();
    const setOption = getActiveSetOption();
    const layouts = getPendantLayouts(setOption.count);

    layouts.forEach(function (layout, pendantIndex) {
      drawSchematicPendant(layout, pendantIndex === state.activePendantIndex);
    });

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(getActiveProductDisplayName() + " · " + setOption.shortLabel, 86, 86);

    ctx.fillStyle = "rgba(210,207,206,0.66)";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Set-Vorschau", 86, 122);

    drawRoundedRect(ctx, 220, 948, 760, 134, 28);
    ctx.fillStyle = "rgba(11, 10, 14, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.font = "700 34px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Größe wählen", 600, 1002);

    ctx.fillStyle = "rgba(210,207,206,0.72)";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Größe für " + getPendantLabel(state.activePendantIndex) + " wählen.", 600, 1046);
    ctx.restore();
  }

  function drawBottleOpenerPreview() {
    const image = BOTTLE_OPENER_ASSET.image;
    if (!image) {
      drawEmptyState("Flaschenöffner aktiviert", "Die statische Produktvorschau wird geladen.");
      return;
    }

    const sourceBox = getBottleOpenerSourceBox();
    const renderBox = getBottleOpenerRenderBox(sourceBox);
    ctx.save();
    ctx.drawImage(
      image,
      sourceBox.x,
      sourceBox.y,
      sourceBox.width,
      sourceBox.height,
      renderBox.x,
      renderBox.y,
      renderBox.width,
      renderBox.height
    );
    ctx.restore();

    if (!hasDesignModeSelection()) {
      return;
    }

    if (isMotifMode()) {
      if (isMonogramTemplateSelected()) {
        if (hasMonogramValue()) {
          drawBottleOpenerMonogramContent();
        }
        return;
      }
      drawBottleOpenerMotifContent();
      return;
    }

    if (isTextMode()) {
      drawBottleOpenerTextContent();
      return;
    }

    if (isQrMode()) {
      drawBottleOpenerQrContent();
    }
  }

  function getBottleOpenerSourceBox() {
    return {
      x: 329,
      y: 383,
      width: 965,
      height: 288
    };
  }

  function getBottleOpenerRenderBox(sourceBox) {
    const targetWidth = 960;
    const scale = targetWidth / sourceBox.width;
    const width = Math.round(sourceBox.width * scale);
    const height = Math.round(sourceBox.height * scale);

    return {
      x: Math.round((canvas.width - width) / 2),
      y: Math.round((canvas.height - height) / 2) + 18,
      width: width,
      height: height
    };
  }

  function getBottleOpenerDesignBox() {
    const sourceBox = getBottleOpenerSourceBox();
    const renderBox = getBottleOpenerRenderBox(sourceBox);
    const scale = renderBox.width / sourceBox.width;

    return {
      x: renderBox.x + Math.round(136 * scale),
      y: renderBox.y + Math.round(62 * scale),
      width: Math.round(560 * scale),
      height: Math.round(124 * scale)
    };
  }

  function getBottleOpenerMotifLayout(image) {
    const box = getBottleOpenerDesignBox();
    const activeSideState = getActiveSideState();
    const fitScale = Math.min(box.width / image.width, box.height / image.height);
    const scaleFactor = Math.max(0.01, activeSideState.scalePercent / 100);
    const stretchXFactor = getStretchFactor(activeSideState.stretchXPercent);
    const stretchYFactor = getStretchFactor(activeSideState.stretchYPercent);

    return {
      width: image.width * fitScale * scaleFactor * stretchXFactor,
      height: image.height * fitScale * scaleFactor * stretchYFactor
    };
  }

  function getBottleOpenerTextLayout(text) {
    const box = getBottleOpenerDesignBox();
    const activeSideState = getActiveSideState();
    const baseFontSize = Math.max(34, box.height * 0.46);
    const fontSize = baseFontSize * (activeSideState.textScalePercent / 100);
    let metrics = measureBottleOpenerText(text, fontSize);
    let textHeight = Math.max(fontSize * 0.92, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);

    return {
      fontSize: fontSize,
      font: buildBottleOpenerTextFont(fontSize),
      width: metrics.width,
      height: textHeight
    };
  }

  function getBottleOpenerQrLayout() {
    const box = getBottleOpenerDesignBox();
    const activeSideState = getActiveSideState();
    if (!box) return null;

    const quietZone = 4;
    const fallbackModuleCount = 21;
    const qrModel = getQrCodeModel(state.activeSide, state.activePendantIndex);
    const moduleCount = qrModel ? qrModel.getModuleCount() : fallbackModuleCount;

    const baseSize = Math.min(box.width, box.height) * 0.84;
    const minSize = Math.min(box.width, box.height) * 0.66;
    const maxOuterSize = Math.min(box.width, box.height);
    const maxScalePercent = Math.max(1, Math.round((maxOuterSize / baseSize) * 100));
    const requestedOuterSize = Math.max(minSize, baseSize * (activeSideState.scalePercent / 100));
    const outerSize = Math.min(maxOuterSize, requestedOuterSize);

    const totalModules = moduleCount + quietZone * 2;
    const moduleSize = outerSize / totalModules;
    const normalizedOuterSize = moduleSize * totalModules;

    const maxOffsetX = Math.max(0, (box.width - normalizedOuterSize) / 2);
    const maxOffsetY = Math.max(0, (box.height - normalizedOuterSize) / 2);

    const clampedOffsetX = clamp(activeSideState.offsetX, -maxOffsetX, maxOffsetX);
    const clampedOffsetY = clamp(activeSideState.offsetY, -maxOffsetY, maxOffsetY);

    return {
      moduleCount: moduleCount,
      quietZone: quietZone,
      moduleSize: moduleSize,
      outerSize: normalizedOuterSize,
      maxScalePercent: maxScalePercent,
      x: box.x + (box.width - normalizedOuterSize) / 2 + clampedOffsetX,
      y: box.y + (box.height - normalizedOuterSize) / 2 + clampedOffsetY
    };
  }

  function getBottleOpenerRotationRadians() {
    return clamp(getActiveSideState().rotationDeg || 0, -180, 180) * (Math.PI / 180);
  }

  function getPendantRotationRadians(pendantIndex) {
    return clamp(getSideState(state.activeSide, pendantIndex).rotationDeg || 0, -180, 180) * (Math.PI / 180);
  }

  function applyPendantContentRotation(centerX, centerY, pendantIndex) {
    const rotationRadians = getPendantRotationRadians(pendantIndex);
    if (!rotationRadians) return;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRadians);
    ctx.translate(-centerX, -centerY);
  }

  function applyBottleOpenerContentRotation(centerX, centerY) {
    const rotationRadians = getBottleOpenerRotationRadians();
    if (!rotationRadians) return;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRadians);
    ctx.translate(-centerX, -centerY);
  }

  function getBottleOpenerEngravingImage(image) {
    if (!image) return null;
    if (bottleOpenerEngravingCache && bottleOpenerEngravingCache.has(image)) {
      return bottleOpenerEngravingCache.get(image);
    }

    const buffer = document.createElement("canvas");
    buffer.width = image.width;
    buffer.height = image.height;
    const bufferCtx = buffer.getContext("2d");
    bufferCtx.drawImage(image, 0, 0);

    const imageData = bufferCtx.getImageData(0, 0, buffer.width, buffer.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
      const originalAlpha = data[index + 3] / 255;
      if (!originalAlpha) continue;

      const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const darkness = (1 - (luminance / 255)) * originalAlpha;

      if (darkness <= 0.015) {
        data[index + 3] = 0;
        continue;
      }

      data[index] = 210;
      data[index + 1] = 207;
      data[index + 2] = 206;
      data[index + 3] = Math.round(Math.min(1, darkness * 1.05) * 255);
    }

    bufferCtx.putImageData(imageData, 0, 0);

    if (bottleOpenerEngravingCache) {
      bottleOpenerEngravingCache.set(image, buffer);
    }

    return buffer;
  }

  function drawBottleOpenerMotifContent() {
    const image = getActiveImage();
    if (!image) return;

    const box = getBottleOpenerDesignBox();
    const activeSideState = getActiveSideState();
    const motifLayout = getBottleOpenerMotifLayout(image);
    const engravingImage = getBottleOpenerEngravingImage(image);
    const drawWidth = motifLayout.width;
    const drawHeight = motifLayout.height;
    const x = box.x + (box.width - drawWidth) / 2 + activeSideState.offsetX;
    const y = box.y + (box.height - drawHeight) / 2 + activeSideState.offsetY;

    ctx.save();
    ctx.beginPath();
    drawRoundedRectPath(ctx, box.x, box.y, box.width, box.height, Math.min(20, box.height / 4));
    ctx.clip();
    applyBottleOpenerContentRotation(x + drawWidth / 2, y + drawHeight / 2);
    ctx.drawImage(engravingImage || image, x, y, drawWidth, drawHeight);
    ctx.restore();
  }

  function drawBottleOpenerMonogramContent() {
    const box = getBottleOpenerDesignBox();
    const activeSideState = getActiveSideState();
    const monogramLayout = getBottleOpenerMonogramLayout();
    const x = box.x + box.width / 2 + activeSideState.offsetX;
    const y = box.y + box.height / 2 + activeSideState.offsetY;
    const stretchXFactor = getStretchFactor(activeSideState.stretchXPercent);
    const stretchYFactor = getStretchFactor(activeSideState.stretchYPercent);

    ctx.save();
    ctx.beginPath();
    drawRoundedRectPath(ctx, box.x, box.y, box.width, box.height, Math.min(20, box.height / 4));
    ctx.clip();
    applyBottleOpenerContentRotation(x, y);
    ctx.translate(x, y);
    ctx.scale(stretchXFactor, stretchYFactor);
    ctx.translate(-x, -y);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = monogramLayout.font;
    ctx.fillStyle = BOTTLE_OPENER_ENGRAVING_FILL;
    ctx.fillText(activeSideState.monogramValue, x, y);
    ctx.restore();
  }

  function drawBottleOpenerTextContent() {
    const activeSideState = getActiveSideState();
    if (!activeSideState.textValue) return;

    const box = getBottleOpenerDesignBox();
    const textLayout = getBottleOpenerTextLayout(activeSideState.textValue);

    const x = box.x + box.width / 2 + activeSideState.textOffsetX;
    const y = box.y + box.height / 2 + activeSideState.textOffsetY;

    ctx.save();
    ctx.beginPath();
    drawRoundedRectPath(ctx, box.x, box.y, box.width, box.height, Math.min(20, box.height / 4));
    ctx.clip();
    applyBottleOpenerContentRotation(x, y);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = textLayout.font;
    ctx.fillStyle = BOTTLE_OPENER_ENGRAVING_FILL;
    ctx.fillText(activeSideState.textValue, x, y);
    ctx.restore();
  }

  function drawBottleOpenerQrContent() {
    const box = getBottleOpenerDesignBox();
    const qrLayout = getBottleOpenerQrLayout();
    if (!box || !qrLayout) return;

    const qrModel = getQrCodeModel(state.activeSide, state.activePendantIndex);

    ctx.save();
    ctx.beginPath();
    drawRoundedRectPath(ctx, box.x, box.y, box.width, box.height, Math.min(20, box.height / 4));
    ctx.clip();
    applyBottleOpenerContentRotation(qrLayout.x + qrLayout.outerSize / 2, qrLayout.y + qrLayout.outerSize / 2);

    if (!qrModel) {
      ctx.strokeStyle = BOTTLE_OPENER_ENGRAVING_STROKE;
      ctx.lineWidth = Math.max(2, qrLayout.outerSize * 0.035);
      ctx.strokeRect(qrLayout.x, qrLayout.y, qrLayout.outerSize, qrLayout.outerSize);

      ctx.fillStyle = BOTTLE_OPENER_ENGRAVING_FILL;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 " + Math.max(12, qrLayout.outerSize * 0.16) + "px system-ui, sans-serif";
      ctx.fillText("QR", qrLayout.x + qrLayout.outerSize / 2, qrLayout.y + qrLayout.outerSize * 0.42);
      ctx.font = "700 " + Math.max(9, qrLayout.outerSize * 0.11) + "px system-ui, sans-serif";
      ctx.fillText("FEHLT", qrLayout.x + qrLayout.outerSize / 2, qrLayout.y + qrLayout.outerSize * 0.62);
      ctx.restore();
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = BOTTLE_OPENER_ENGRAVING_FILL;
    for (let row = 0; row < qrLayout.moduleCount; row += 1) {
      for (let column = 0; column < qrLayout.moduleCount; column += 1) {
        if (!qrModel.isDark(row, column)) continue;
        const x = qrLayout.x + (column + qrLayout.quietZone) * qrLayout.moduleSize;
        const y = qrLayout.y + (row + qrLayout.quietZone) * qrLayout.moduleSize;
        ctx.fillRect(x, y, qrLayout.moduleSize, qrLayout.moduleSize);
      }
    }

    ctx.strokeStyle = "rgba(210,207,206,0.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(qrLayout.x + 0.5, qrLayout.y + 0.5, qrLayout.outerSize - 1, qrLayout.outerSize - 1);
    ctx.restore();
  }

  function drawSchematicPendant(layout, isActive) {
    const radius = getSmallestPendantRadius() * layout.scale;
    const centerX = layout.x;
    const centerY = layout.y + 8;
    const ringY = centerY - radius - 46 * layout.scale;
    const ringOuter = 20 * layout.scale;
    const ringInner = 10 * layout.scale;
    const finishPalette = getPendantFinishPalette();

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 26 * layout.scale;
    ctx.shadowOffsetY = 9 * layout.scale;

    const pendantGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    pendantGradient.addColorStop(0, finishPalette.baseStart);
    pendantGradient.addColorStop(0.5, finishPalette.baseMid);
    pendantGradient.addColorStop(1, finishPalette.baseEnd);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = pendantGradient;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = finishPalette.edgeHighlight;
    ctx.lineWidth = Math.max(1.2, 1.35 * layout.scale);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = finishPalette.surfaceLines;
    ctx.lineWidth = 0.8;
    for (let index = 0; index < 22; index += 1) {
      const y = centerY - radius + index * ((radius * 2) / 22);
      ctx.beginPath();
      ctx.moveTo(centerX - radius - 8, y);
      ctx.lineTo(centerX + radius + 8, y - 6);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, ringY, ringOuter, 0, Math.PI * 2);
    ctx.arc(centerX, ringY, ringInner, 0, Math.PI * 2, true);
    const ringGradient = ctx.createLinearGradient(centerX - ringOuter, ringY - ringOuter, centerX + ringOuter, ringY + ringOuter);
    ringGradient.addColorStop(0, finishPalette.ringStart);
    ringGradient.addColorStop(0.5, finishPalette.ringMid);
    ringGradient.addColorStop(1, finishPalette.ringEnd);
    ctx.fillStyle = ringGradient;
    ctx.fill("evenodd");

    if (isActive) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(219,16,33,0.58)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  function getSmallestPendantRadius() {
    const product = getActiveProduct();
    if (!product || !Array.isArray(product.sizes) || !product.sizes.length) {
      return 116;
    }

    return product.sizes.reduce(function (minRadius, size) {
      const nextRadius = Number(size && size.productRadius);
      if (!Number.isFinite(nextRadius) || nextRadius <= 0) {
        return minRadius;
      }
      return Math.min(minRadius, nextRadius);
    }, Number(product.sizes[0] && product.sizes[0].productRadius) || 116);
  }

  function getMobilePendantPreviewCenterY(sourceHeight) {
    if (isBottleOpenerProduct() || getPendantCount() <= 1 || !hasAnyPendantSizeSelection()) {
      return 650;
    }

    const compositionBounds = getMobilePendantCompositionBounds();
    if (!compositionBounds) {
      return 650;
    }

    const minSourceTop = Math.max(0, compositionBounds.bottom - sourceHeight);
    const maxSourceTop = Math.max(0, compositionBounds.top);
    const preferredSourceTop = Math.max(0, compositionBounds.centerY - sourceHeight / 2);
    const sourceTop = minSourceTop <= maxSourceTop
      ? clamp(preferredSourceTop, minSourceTop, maxSourceTop)
      : preferredSourceTop;

    return sourceTop + sourceHeight / 2;
  }

  function getMobilePendantCompositionBounds() {
    if (isBottleOpenerProduct() || getPendantCount() <= 1 || !hasAnyPendantSizeSelection()) {
      return null;
    }

    const layouts = getPendantLayouts();
    if (!layouts.length) return null;

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    layouts.forEach(function (layout, pendantIndex) {
      const size = getActiveSize(pendantIndex) || getActiveSize(0);
      if (!size) return;

      const scale = layout.scale || 1;
      const radius = size.productRadius * scale;
      const horizontalPadding = 24 * scale;
      const topAttachment = (650 - (size.ringY - size.ringOuter)) * scale;
      const left = layout.x - radius - horizontalPadding;
      const top = layout.y - topAttachment;
      const right = layout.x + radius + horizontalPadding;
      const bottom = layout.y + radius + 24 * scale;

      if (left < minLeft) minLeft = left;
      if (top < minTop) minTop = top;
      if (right > maxRight) maxRight = right;
      if (bottom > maxBottom) maxBottom = bottom;
    });

    if (!Number.isFinite(minLeft) || !Number.isFinite(minTop) || !Number.isFinite(maxRight) || !Number.isFinite(maxBottom)) {
      return null;
    }

    const safeLeft = 36;
    const safeTop = 34;
    const safeRight = 36;
    const safeBottom = 30;
    return {
      left: Math.max(0, minLeft - safeLeft),
      top: Math.max(0, minTop - safeTop),
      right: Math.min(canvas.width, maxRight + safeRight),
      bottom: Math.min(canvas.height, maxBottom + safeBottom),
      centerX: (minLeft + maxRight) / 2,
      centerY: (minTop + maxBottom) / 2
    };
  }

  function getMobilePreviewGeometryKey() {
    if (isBottleOpenerProduct()) {
      return "bottle-opener";
    }

    if (!hasAnyPendantSizeSelection()) {
      return "empty";
    }

    return [
      state.productFamilyId || "",
      state.setId || "",
      getPendantIndices().map(function (pendantIndex) {
        const size = getActiveSize(pendantIndex);
        return size ? size.id : "none";
      }).join("|")
    ].join("::");
  }

  function getMobilePreviewViewport(targetAspect, keepPan) {
    const sourceWidthFallback = canvas.width;
    const sourceHeightFallback = Math.round(sourceWidthFallback / targetAspect);

    if (isBottleOpenerProduct() || getPendantCount() <= 1 || !hasAnyPendantSizeSelection()) {
      return {
        sourceWidth: sourceWidthFallback,
        sourceHeight: sourceHeightFallback,
        centerX: canvas.width / 2,
        centerY: isBottleOpenerProduct() ? 560 : 650,
        maxPanX: 0,
        maxPanY: Math.max(0, (canvas.height - sourceHeightFallback) / 2)
      };
    }

    const geometryKey = getMobilePreviewGeometryKey();
    if (!keepPan && mobilePreviewGeometryKey !== geometryKey) {
      mobilePreviewPanX = 0;
      mobilePreviewPanY = 0;
      mobilePreviewGeometryKey = geometryKey;
    }

    const bounds = getMobilePendantCompositionBounds();
    if (!bounds) {
      return {
        sourceWidth: sourceWidthFallback,
        sourceHeight: sourceHeightFallback,
        centerX: canvas.width / 2,
        centerY: 650,
        maxPanX: 0,
        maxPanY: Math.max(0, (canvas.height - sourceHeightFallback) / 2)
      };
    }

    let sourceWidth = Math.max(bounds.right - bounds.left, (bounds.bottom - bounds.top) * targetAspect);
    sourceWidth = clamp(sourceWidth, Math.min(860, canvas.width), canvas.width);
    const sourceHeight = Math.round(sourceWidth / targetAspect);

    const minCenterX = sourceWidth / 2;
    const maxCenterX = canvas.width - sourceWidth / 2;
    const minCenterY = sourceHeight / 2;
    const maxCenterY = canvas.height - sourceHeight / 2;
    const baseCenterX = clamp(bounds.centerX, minCenterX, maxCenterX);
    const baseCenterY = clamp(bounds.centerY, minCenterY, maxCenterY);
    const maxPanX = Math.max(0, Math.min(baseCenterX - minCenterX, maxCenterX - baseCenterX));
    const maxPanY = Math.max(0, Math.min(baseCenterY - minCenterY, maxCenterY - baseCenterY));

    if (!keepPan) {
      mobilePreviewPanX = clamp(mobilePreviewPanX, -maxPanX, maxPanX);
      mobilePreviewPanY = clamp(mobilePreviewPanY, -maxPanY, maxPanY);
    }

    return {
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
      centerX: baseCenterX + clamp(mobilePreviewPanX, -maxPanX, maxPanX),
      centerY: baseCenterY + clamp(mobilePreviewPanY, -maxPanY, maxPanY),
      maxPanX: maxPanX,
      maxPanY: maxPanY
    };
  }

  function syncMobilePreviewCanvas() {
    if (mobileCtx && mobileCanvas) {
      mobileCtx.clearRect(0, 0, mobileCanvas.width, mobileCanvas.height);
    }
    const targetAspect = mobileCtx && mobileCanvas
      ? mobileCanvas.width / mobileCanvas.height
      : (summaryPreviewCanvas ? summaryPreviewCanvas.width / summaryPreviewCanvas.height : 1);
    const viewport = getMobilePreviewViewport(targetAspect, false);
    const sx = clamp(Math.round(viewport.centerX - viewport.sourceWidth / 2), 0, Math.max(0, canvas.width - viewport.sourceWidth));
    const sy = clamp(Math.round(viewport.centerY - viewport.sourceHeight / 2), 0, Math.max(0, canvas.height - viewport.sourceHeight));
    if (mobileCtx && mobileCanvas) {
      mobileCtx.drawImage(canvas, sx, sy, viewport.sourceWidth, viewport.sourceHeight, 0, 0, mobileCanvas.width, mobileCanvas.height);
    }
    syncSummaryPreviewCanvas();
  }

  function drawBackdrop() {
    const gradient = ctx.createRadialGradient(220, 180, 20, 600, 600, 980);
    gradient.addColorStop(0, "rgba(219, 16, 33, 0.20)");
    gradient.addColorStop(0.4, "rgba(88, 26, 34, 0.10)");
    gradient.addColorStop(1, "rgba(8, 7, 10, 0.98)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let index = 0; index < 18; index += 1) {
      const y = 86 + index * 58;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(1160, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEmptyState(title, description) {
    ctx.save();

    const panelX = 172;
    const panelY = 396;
    const panelWidth = 856;
    const panelHeight = 408;

    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 34);
    ctx.fillStyle = "rgba(11, 10, 14, 0.84)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(219,16,33,0.22)";
    drawRoundedRect(ctx, panelX + 34, panelY + 40, 190, 42, 21);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Geführter Start", panelX + 129, panelY + 68);

    ctx.font = "700 56px system-ui, sans-serif";
    ctx.fillText(title, 600, 560);

    ctx.fillStyle = "rgba(210,207,206,0.72)";
    ctx.font = "500 28px system-ui, sans-serif";
    if (description) {
      ctx.fillText(description, 600, 622);
    }

    ctx.restore();
  }

  function drawRoundTagBase(size) {
    const centerX = 600;
    const centerY = 650;
    const radius = size.productRadius;
    const ringX = 600;
    const ringY = size.ringY;
    const finishPalette = getPendantFinishPalette();

    const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    gradient.addColorStop(0, finishPalette.baseStart);
    gradient.addColorStop(0.45, finishPalette.baseMid);
    gradient.addColorStop(1, finishPalette.baseEnd);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    drawRing(ringX, ringY, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    const metalSheen = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    metalSheen.addColorStop(0, finishPalette.highlightStrong);
    metalSheen.addColorStop(0.18, finishPalette.highlightSoft);
    metalSheen.addColorStop(0.52, "rgba(255,255,255,0)");
    metalSheen.addColorStop(0.84, finishPalette.shadowTone);
    metalSheen.addColorStop(1, finishPalette.highlightEdge);
    ctx.fillStyle = metalSheen;
    ctx.fillRect(centerX - radius - 30, centerY - radius - 30, radius * 2 + 60, radius * 2 + 60);

    ctx.strokeStyle = finishPalette.edgeHighlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = finishPalette.surfaceLines;
    ctx.lineWidth = 1;
    for (let index = 0; index < 40; index += 1) {
      const y = centerY - radius + index * ((radius * 2) / 40);
      ctx.beginPath();
      ctx.moveTo(centerX - radius - 16, y);
      ctx.lineTo(centerX + radius + 16, y - 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawRing(x, y, size) {
    const finishPalette = getPendantFinishPalette();
    const ringGradient = ctx.createLinearGradient(x - 42, y - 50, x + 68, y + 78);
    ringGradient.addColorStop(0, finishPalette.ringStart);
    ringGradient.addColorStop(0.5, finishPalette.ringMid);
    ringGradient.addColorStop(1, finishPalette.ringEnd);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = ringGradient;

    ctx.beginPath();
    ctx.arc(x, y, size.ringOuter, 0, Math.PI * 2);
    ctx.arc(x, y, size.ringInner, 0, Math.PI * 2, true);
    ctx.fill("evenodd");

    ctx.beginPath();
    drawRoundedRectPath(ctx, x - 34, y + size.ringInner - 4, 68, size.lift, 34);
    ctx.fill();
    ctx.restore();
  }

  function getPendantFinishPalette(finishId) {
    const effectiveFinishId = finishId || (getActiveFinish() ? getActiveFinish().id : "silver");

    if (effectiveFinishId === "gold") {
      return {
        effectiveFinishId: "gold",
        baseStart: "#fff3bf",
        baseMid: "#c89d3a",
        baseEnd: "#f6e0a2",
        ringStart: "#fff8de",
        ringMid: "#bb8c2f",
        ringEnd: "#ecd08b",
        edgeColor: "rgba(115,82,14,0.34)",
        innerStroke: "rgba(255,248,220,0.72)",
        edgeHighlight: "rgba(255,248,214,0.38)",
        highlightStrong: "rgba(255,246,200,0.42)",
        highlightSoft: "rgba(255,239,184,0.14)",
        highlightEdge: "rgba(255,244,205,0.12)",
        shadowTone: "rgba(86,58,10,0.18)",
        surfaceLines: "rgba(105,78,22,0.08)",
        thumbBackground: "radial-gradient(circle at top, rgba(255,248,224,.92), rgba(255,236,180,.34) 42%, rgba(255,232,168,.10) 76%), linear-gradient(180deg, rgba(255,248,232,.99), rgba(239,221,176,.98))",
        thumbBackgroundCenter: "#fff5d3"
      };
    }

    return {
      effectiveFinishId: "silver",
      baseStart: "#f4f0ed",
      baseMid: "#aaa6a2",
      baseEnd: "#fcfaf8",
      ringStart: "#fcfaf8",
      ringMid: "#9e9a96",
      ringEnd: "#e9e5e2",
      edgeColor: "rgba(120,120,126,0.22)",
      innerStroke: "rgba(255,255,255,0.7)",
      edgeHighlight: "rgba(255,255,255,0.24)",
      highlightStrong: "rgba(255,255,255,0.30)",
      highlightSoft: "rgba(255,255,255,0.05)",
      highlightEdge: "rgba(255,255,255,0.06)",
      shadowTone: "rgba(0,0,0,0.20)",
      surfaceLines: "rgba(18,18,22,0.08)",
      thumbBackground: "radial-gradient(circle at top, rgba(255,255,255,.82), rgba(255,255,255,.28) 42%, rgba(255,255,255,.08) 76%), linear-gradient(180deg, rgba(248,244,240,.99), rgba(231,224,218,.98))",
      thumbBackgroundCenter: "#f5f1ed"
    };
  }

  function drawMotifMask(size, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    if (!motifMask) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(10, 12, 16, 0.14)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawMotif(size, image, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const drawBox = getMotifDrawBox(image, pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const x = motifMask.x + motifMask.width / 2 - drawBox.width / 2 + activeSideState.offsetX;
    const y = motifMask.y + motifMask.height / 2 - drawBox.height / 2 + activeSideState.offsetY;

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.clip();
    applyPendantContentRotation(x + drawBox.width / 2, y + drawBox.height / 2, pendantIndex);

    ctx.filter = "grayscale(1) contrast(1.15) brightness(0.82)";
    ctx.globalAlpha = 0.62;
    ctx.drawImage(image, x, y, drawBox.width, drawBox.height);
    ctx.filter = "none";

    ctx.fillStyle = "rgba(18, 22, 28, 0.24)";
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "screen";
    const sheen = ctx.createLinearGradient(motifMask.x, motifMask.y, motifMask.x + motifMask.width, motifMask.y + motifMask.height);
    sheen.addColorStop(0, "rgba(255,255,255,0.14)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    sheen.addColorStop(1, "rgba(255,255,255,0.08)");
    ctx.fillStyle = sheen;
    ctx.fillRect(motifMask.x, motifMask.y, motifMask.width, motifMask.height);

    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1;
    for (let index = 0; index < 18; index += 1) {
      const lineY = motifMask.y + 8 + index * (motifMask.height / 18);
      ctx.beginPath();
      ctx.moveTo(motifMask.x - 18, lineY);
      ctx.lineTo(motifMask.x + motifMask.width + 18, lineY - 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMonogramMotif(size, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const monogramLayout = getMonogramLayout(pendantIndex);
    const x = motifMask.x + motifMask.width / 2 + activeSideState.offsetX;
    const y = motifMask.y + motifMask.height / 2 + activeSideState.offsetY;
    const stretchXFactor = getStretchFactor(activeSideState.stretchXPercent);
    const stretchYFactor = getStretchFactor(activeSideState.stretchYPercent);

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.clip();
    applyPendantContentRotation(x, y, pendantIndex);
    ctx.translate(x, y);
    ctx.scale(stretchXFactor, stretchYFactor);
    ctx.translate(-x, -y);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = monogramLayout.font;
    ctx.fillStyle = "rgba(22, 24, 28, 0.88)";
    ctx.fillText(activeSideState.monogramValue, x, y);
    ctx.restore();
  }

  function drawQrMotif(size, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const qrModel = getQrCodeModel(state.activeSide, pendantIndex);
    if (!qrModel || !motifMask) {
      drawMotifPrompt("QR-Code nicht bereit", "Bitte Inhalt prüfen oder kurz erneut versuchen.");
      return;
    }

    const moduleCount = qrModel.getModuleCount();
    const quietZone = 4;
    const availableSize = Math.floor(motifMask.width * 0.82);
    const moduleSize = Math.max(2, Math.floor(availableSize / (moduleCount + quietZone * 2)));
    const outerSize = moduleSize * (moduleCount + quietZone * 2);
    const squareX = Math.round(motifMask.x + (motifMask.width - outerSize) / 2);
    const squareY = Math.round(motifMask.y + (motifMask.height - outerSize) / 2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.clip();
    applyPendantContentRotation(squareX + outerSize / 2, squareY + outerSize / 2, pendantIndex);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#f7f4f0";
    ctx.fillRect(squareX, squareY, outerSize, outerSize);

    ctx.fillStyle = "#14181c";
    for (let row = 0; row < moduleCount; row += 1) {
      for (let column = 0; column < moduleCount; column += 1) {
        if (!qrModel.isDark(row, column)) continue;
        const x = squareX + (column + quietZone) * moduleSize;
        const y = squareY + (row + quietZone) * moduleSize;
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }

    ctx.strokeStyle = "rgba(12,16,18,0.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(squareX + 0.5, squareY + 0.5, outerSize - 1, outerSize - 1);

    ctx.restore();
  }

  function drawTextOverlay(size, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const textLayout = getTextLayout(activeSideState.textValue, pendantIndex);
    const x = motifMask.x + motifMask.width / 2 + activeSideState.textOffsetX;
    const y = motifMask.y + motifMask.height / 2 + activeSideState.textOffsetY;
    const decorationLineWidth = Math.max(3, textLayout.fontSize * 0.06);

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.clip();
    applyPendantContentRotation(x, y, pendantIndex);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = textLayout.font;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(250, 246, 242, 0.78)";
    ctx.lineWidth = Math.max(6, textLayout.fontSize * 0.11);
    ctx.globalAlpha = 0.92;
    ctx.strokeText(activeSideState.textValue, x, y);

    ctx.fillStyle = "rgba(22, 24, 28, 0.84)";
    ctx.fillText(activeSideState.textValue, x, y);

    if (activeSideState.textStyles.underline || activeSideState.textStyles.strikethrough) {
      ctx.strokeStyle = "rgba(22, 24, 28, 0.84)";
      ctx.lineWidth = decorationLineWidth;
      ctx.lineCap = "round";

      if (activeSideState.textStyles.underline) {
        const underlineY = y + textLayout.height * 0.34;
        ctx.beginPath();
        ctx.moveTo(x - textLayout.width / 2, underlineY);
        ctx.lineTo(x + textLayout.width / 2, underlineY);
        ctx.stroke();
      }

      if (activeSideState.textStyles.strikethrough) {
        const strikeY = y - textLayout.height * 0.04;
        ctx.beginPath();
        ctx.moveTo(x - textLayout.width / 2, strikeY);
        ctx.lineTo(x + textLayout.width / 2, strikeY);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(x, y + textLayout.height * 0.18, textLayout.width * 0.46, Math.max(10, textLayout.height * 0.18), 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();

    ctx.restore();
  }

  function drawMotifPrompt(title, description) {
    const motifMask = getMotifMask(state.activePendantIndex);
    if (!motifMask) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(motifMask.x, motifMask.y, motifMask.width, motifMask.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(14,16,18,0.44)";
    ctx.font = "600 34px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, 600, 638);
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillStyle = "rgba(14,16,18,0.30)";
    ctx.fillText(description, 600, 684);
    ctx.restore();
  }

  function drawProductHighlights(size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, size.productRadius, 0, Math.PI * 2);
    ctx.clip();

    const highlight = ctx.createLinearGradient(240, 220, 980, 1040);
    highlight.addColorStop(0, "rgba(255,255,255,0.22)");
    highlight.addColorStop(0.12, "rgba(255,255,255,0.04)");
    highlight.addColorStop(0.5, "rgba(255,255,255,0)");
    highlight.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }

  function drawPreviewLabels(material, product) {
    const activeSize = getActiveSize();
    const previewPendantIndex = activeSize
      ? state.activePendantIndex
      : getPendantIndices().find(function (pendantIndex) {
          return Boolean(getActiveSize(pendantIndex));
        });
    const motifMask = previewPendantIndex == null ? null : getMotifMask(previewPendantIndex);
    if (!motifMask) return;

    ctx.save();
    drawRoundedRect(ctx, 60, 52, 474, 106, 26);
    ctx.fillStyle = "rgba(9, 8, 12, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(material.name + " · " + getActiveProductDisplayName() + " · " + getActiveSetOption().shortLabel, 86, 92);

    ctx.fillStyle = "rgba(210,207,206,0.64)";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Größen " + buildSizeSummaryLabel() + " · " + getPendantLabel(state.activePendantIndex) + (activeSize ? " aktiv" : " auswählen"), 86, 128);

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText("Orientierungsbereich", motifMask.x + 6, Math.max(176, motifMask.y - 20));
    ctx.restore();
  }

  function downloadPreview() {
    if (!isConfigurationReady()) return;

    closeRequestMenu();
    const exportCanvas = createExportCanvas();
    const filename = buildExportFilename();

    if (exportCanvas.toBlob) {
      exportCanvas.toBlob(function (blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        triggerDownload(url, filename, true);
        setRequestMenuOpen(true);
      }, "image/png");
      return;
    }

    triggerDownload(exportCanvas.toDataURL("image/png"), filename, false);
    setRequestMenuOpen(true);
  }

  function triggerDownload(url, filename, revokeAfter) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (revokeAfter) {
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1500);
    }
  }

  function createExportCanvas() {
    const sideIds = getEnabledSideIds();
    const capturedSides = captureExportPreviews(sideIds);
    const exportCanvas = document.createElement("canvas");
    const exportCtx = exportCanvas.getContext("2d");
    const width = 1200;
    const headerHeight = 170;
    const footerHeight = 140;
    const outerPadding = 48;
    const cardGap = 28;
    const cardPadding = 24;
    const previewSize = Math.min(920, width - outerPadding * 2 - cardPadding * 2);
    const summaryHeight = 96;
    const cardHeight = cardPadding + 58 + previewSize + 24 + summaryHeight + 24;
    const totalHeight = headerHeight + sideIds.length * cardHeight + Math.max(0, sideIds.length - 1) * cardGap + footerHeight;

    exportCanvas.width = width;
    exportCanvas.height = totalHeight;

    drawExportBackground(exportCtx, width, totalHeight);
    drawExportHeader(exportCtx, width, headerHeight);

    sideIds.forEach(function (sideId, index) {
      const cardY = headerHeight + index * (cardHeight + cardGap);
      drawExportSideCard(exportCtx, {
        x: outerPadding,
        y: cardY,
        width: width - outerPadding * 2,
        height: cardHeight,
        previewSize: previewSize,
        cardPadding: cardPadding,
        sideId: sideId,
        previewCanvas: capturedSides[sideId]
      });
    });

    drawExportFooter(exportCtx, totalHeight - footerHeight, width, footerHeight);
    return exportCanvas;
  }

  function captureExportPreviews(sideIds) {
    const previousSide = state.activeSide;
    const previousPendantIndex = state.activePendantIndex;
    const previews = {};

    sideIds.forEach(function (sideId) {
      state.activeSide = sideId;
      if (sideId === "back") {
        const firstBackPendantIndex = getPendantIndices().find(function (pendantIndex) {
          return isBackSideEnabled(pendantIndex);
        });
        if (typeof firstBackPendantIndex === "number") {
          state.activePendantIndex = firstBackPendantIndex;
        }
      } else {
        state.activePendantIndex = previousPendantIndex;
      }
      renderPreview();

      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d").drawImage(canvas, 0, 0);
      previews[sideId] = snapshot;
    });

    state.activeSide = previousSide;
    state.activePendantIndex = previousPendantIndex;
    syncUi();
    renderPreview();

    return previews;
  }

  function drawExportBackground(targetCtx, width, height) {
    const gradient = targetCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0f0c11");
    gradient.addColorStop(1, "#07060a");
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, width, height);

    targetCtx.save();
    targetCtx.strokeStyle = "rgba(255,255,255,0.03)";
    targetCtx.lineWidth = 1;
    for (let index = 0; index < Math.ceil(height / 64); index += 1) {
      const y = 40 + index * 64;
      targetCtx.beginPath();
      targetCtx.moveTo(40, y);
      targetCtx.lineTo(width - 40, y);
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function drawExportHeader(targetCtx, width, height) {
    const product = getActiveProduct();
    const material = getActiveMaterial();

    targetCtx.save();
    targetCtx.fillStyle = "rgba(219,16,33,0.18)";
    targetCtx.fillRect(0, 0, width, 8);

    targetCtx.fillStyle = "#f5f3f1";
    targetCtx.font = "700 38px system-ui, sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.fillText("Luderbein Vorschau", 52, 68);

    targetCtx.fillStyle = "rgba(210,207,206,0.74)";
    targetCtx.font = "500 22px system-ui, sans-serif";
    targetCtx.fillText(material.name + " · " + getActiveProductDisplayName() + " · " + getActiveSetOption().shortLabel + " · " + buildSizeSummaryLabel(), 52, 108);
    targetCtx.fillText(
      hasAnyBackSideEnabled()
        ? "Export mit individuellen Vorder- und Rückseiten"
        : "Export der aktiven Standardseite Vorderseite",
      52,
      140
    );
    targetCtx.restore();
  }

  function drawExportSideCard(targetCtx, config) {
    const sideLabel = getSideLabel(config.sideId);
    const cardRadius = 26;
    const previewX = config.x + config.cardPadding;
    const previewY = config.y + config.cardPadding + 58;
    const summaryY = previewY + config.previewSize + 36;
    const modeLabel = getActiveSetOption().name;

    targetCtx.save();
    drawRoundedRect(targetCtx, config.x, config.y, config.width, config.height, cardRadius);
    targetCtx.fillStyle = "rgba(19,16,22,0.92)";
    targetCtx.fill();
    targetCtx.strokeStyle = "rgba(255,255,255,0.08)";
    targetCtx.lineWidth = 2;
    targetCtx.stroke();

    targetCtx.fillStyle = "#f5f3f1";
    targetCtx.font = "700 28px system-ui, sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.fillText(sideLabel, config.x + config.cardPadding, config.y + config.cardPadding + 6);

    targetCtx.fillStyle = "rgba(210,207,206,0.68)";
    targetCtx.font = "500 18px system-ui, sans-serif";
    targetCtx.fillText(modeLabel, config.x + config.cardPadding, config.y + config.cardPadding + 34);

    targetCtx.drawImage(config.previewCanvas, previewX, previewY, config.previewSize, config.previewSize);

    targetCtx.fillStyle = "rgba(255,255,255,0.92)";
    targetCtx.font = "600 20px system-ui, sans-serif";
    targetCtx.fillText("Inhalt", config.x + config.cardPadding, summaryY);

    targetCtx.fillStyle = "rgba(210,207,206,0.72)";
    targetCtx.font = "500 18px system-ui, sans-serif";
    wrapTextToCanvas(targetCtx, buildSideSummaryText(config.sideId), config.x + config.cardPadding, summaryY + 30, config.width - config.cardPadding * 2, 26, 3);
    targetCtx.restore();
  }

  function drawExportFooter(targetCtx, startY, width, height) {
    targetCtx.save();
    targetCtx.fillStyle = "rgba(255,255,255,0.05)";
    targetCtx.fillRect(0, startY, width, 1);

    targetCtx.fillStyle = "rgba(210,207,206,0.72)";
    targetCtx.font = "500 18px system-ui, sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.fillText("Diese Vorschau ist unverbindlich. Finale Gravuraufbereitung und technische Ausarbeitung erfolgen vor Fertigung durch Luderbein.", 52, startY + 46);

    if (hasAnyBackSideEnabled()) {
      targetCtx.fillText("Die Rückseiten wurden pro Anhänger individuell aktiviert und hier gemeinsam mit den Vorderseiten dargestellt.", 52, startY + 78);
    }

    targetCtx.restore();
  }

  function wrapTextToCanvas(targetCtx, text, x, startY, maxWidth, lineHeight, maxLines) {
    const words = String(text).trim().split(/\s+/);
    const lines = [];
    let currentLine = "";
    let y = startY;

    words.forEach(function (word) {
      const next = currentLine ? currentLine + " " + word : word;
      if (targetCtx.measureText(next).width <= maxWidth || !currentLine) {
        currentLine = next;
      } else if (lines.length < maxLines) {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    lines.forEach(function (line) {
      targetCtx.fillText(line, x, y);
      y += lineHeight;
    });
  }

  function buildWhatsappUrl() {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(buildRequestMessage());
  }

  function buildMailtoUrl() {
    return "mailto:" + REQUEST_EMAIL + "?subject=" + encodeURIComponent(buildRequestSubject()) + "&body=" + encodeURIComponent(buildRequestMessage());
  }

  function buildRequestSubject() {
    if (isBottleOpenerProduct()) {
      return "Anfrage zur Motiv-Vorschau – " + (getActiveProductDisplayName() || "Flaschenöffner") + " · " + (isQrMode() ? "QR" : (isMotifMode() ? "Motiv" : "Text"));
    }

    return "Anfrage zur Motiv-Vorschau – " + getActiveProductDisplayName() + " · " + getActiveSetOption().shortLabel + " · " + (getPendantCount() > 1 ? "individuelle Größen" : getActiveSize().label);
  }

  function buildRequestMessage() {
    const priceState = calculatePriceSummary();
    if (isBottleOpenerProduct()) {
      const lines = [
        "Hallo Luderbein,",
        "",
        "ich habe eine Anfrage zur Motiv-Vorschau. Hier sind die ersten Infos:",
        "",
        "Material: " + getActiveMaterial().name,
        "Produkt: " + (getActiveProductDisplayName() || "Flaschenöffner"),
        "Gestaltungsart: " + (isQrMode() ? "QR" : (isMotifMode() ? "Motiv" : "Text")),
        "Inhalt: " + buildSideSummaryText("front"),
        "",
        "Viele Grüße"
      ];

      return lines.join("\n");
    }

    const lines = [
      "Hallo Luderbein,",
      "",
      "ich habe eine Anfrage zur Motiv-Vorschau. Hier sind die ersten Infos:",
      "",
      "Material: " + getActiveMaterial().name,
      "Produkt: " + getActiveProductDisplayName(),
      "Set: " + getActiveSetOption().name,
      "Größen: " + buildPendantSizeSummaryText(),
      "Vorderseite: " + buildSideSummaryText("front"),
      "Rückseite: " + buildSideSummaryText("back")
    ];

    if (priceState.isReady) {
      lines.push("Zwischensumme: " + formatEuro(priceState.subtotalCents));
      if (priceState.discountRate) {
        lines.push("Set-Rabatt (" + Math.round(priceState.discountRate * 100) + "%): -" + formatEuro(priceState.discountCents));
      }
      lines.push("Gesamtpreis: " + formatEuro(priceState.totalCents));
    } else if (priceState.invalidReason) {
      lines.push("Preisstatus: " + priceState.invalidReason);
    }

    lines.push("");
    lines.push("Viele Grüße");

    return lines.join("\n");
  }

  function getPricingHint() {
    const priceState = calculatePriceSummary();
    if (!priceState.isReady) {
      return "";
    }

    const parts = ["Zwischensumme " + formatEuro(priceState.subtotalCents)];
    if (priceState.discountRate) {
      parts.push("Set-Rabatt " + Math.round(priceState.discountRate * 100) + "%");
    }
    parts.push("Gesamtpreis " + formatEuro(priceState.totalCents));
    return parts.join(" · ");
  }

  function buildExportFilename() {
    const activeSideState = getActiveSideState();
    if (isBottleOpenerProduct()) {
      const parts = [
        "luderbein-vorschau",
        slugify(getActiveMaterial().name),
        slugify(getActiveProductDisplayName() || "flaschenoeffner")
      ];

      if (isQrMode() && activeSideState.qrValue) {
        parts.push("qr");
      } else if (isTextMode() && hasText()) {
        parts.push("text");
        parts.push(slugify(activeSideState.textValue).slice(0, 28));
      } else if (isMotifMode()) {
        parts.push("motiv");
        if (activeSideState.uploadedImage) {
          parts.push("eigene-datei");
        } else if (getActiveMotifVariant()) {
          parts.push(slugify(getActiveMotifVariant().name));
        } else if (getActiveEmblemVariant()) {
          parts.push(slugify(getActiveEmblemVariant().name));
        } else if (getActiveTemplate()) {
          parts.push(slugify(getActiveTemplate().name));
        }
      }

      return parts.filter(Boolean).join("-") + ".png";
    }

    const parts = [
      "luderbein-vorschau",
      slugify(getActiveMaterial().name),
      slugify(getActiveProductDisplayName()),
      slugify(getActiveSetOption().shortLabel)
    ];

    if (hasAnyBackSideEnabled()) {
      parts.push("mit-rueckseite");
    } else {
      parts.push("vorderseite");
    }

    parts.push(getPendantCount() > 1 ? "individuelle-groessen" : slugify(getActiveSize().label));

    if (isMotifMode()) {
      parts.push("motiv");
      if (activeSideState.uploadedImage) {
        parts.push("eigene-datei");
      } else if (isQrSelected()) {
        parts.push("qr-code");
      } else if (getActiveMotifVariant()) {
        parts.push(slugify(getActiveMotifVariant().name));
      } else if (getActiveEmblemVariant()) {
        parts.push(slugify(getActiveEmblemVariant().name));
      } else if (getActiveTemplate()) {
        parts.push(slugify(getActiveTemplate().name));
      }
    } else if (isTextMode() && hasText()) {
      parts.push("text");
      parts.push(slugify(activeSideState.textValue).slice(0, 28));
    }

    return parts.filter(Boolean).join("-") + ".png";
  }

  function getBackSideSurchargeHint() {
    return "Rückseite je Anhänger: +" + formatEuro(BACK_SIDE_STANDARD_CENTS) + ".";
  }

  function hasMaterialSelection() {
    return Boolean(state.materialId);
  }

  function hasProductSelection() {
    return Boolean(state.productFamilyId);
  }

  function hasSetSelection() {
    return Boolean(state.setId);
  }

  function hasSizeSelection(pendantIndex) {
    return Boolean(getPendantState(pendantIndex == null ? state.activePendantIndex : pendantIndex).sizeId);
  }

  function hasAnyPendantSizeSelection() {
    return getPendantIndices().some(function (pendantIndex) {
      return hasSizeSelection(pendantIndex);
    });
  }

  function haveAllPendantSizes() {
    return getPendantIndices().every(function (pendantIndex) {
      return hasSizeSelection(pendantIndex);
    });
  }

  function hasDesignModeSelection(sideId, pendantIndex) {
    if (sideId === "back" && !isBackSideEnabled(pendantIndex)) return false;
    return Boolean(getSideState(sideId, pendantIndex).designMode);
  }

  function isConfigurationReady() {
    if (isBottleOpenerProduct()) {
      return hasMaterialSelection() &&
        hasProductSelection() &&
        hasDesignModeSelection() &&
        (
          (isMotifMode() && hasActiveMotifContent()) ||
          (isTextMode() && hasText()) ||
          (isQrMode() && hasQrValue())
        );
    }

    const priceState = calculatePriceSummary();
    return hasMaterialSelection() &&
      hasProductSelection() &&
      hasSetSelection() &&
      haveAllPendantSizes() &&
      getPendantIndices().every(function (pendantIndex) {
        if (!isSideConfigured("front", pendantIndex)) {
          return false;
        }
        if (isBackSideEnabled(pendantIndex) && !isSideConfigured("back", pendantIndex)) {
          return false;
        }
        return true;
      }) &&
      priceState.isReady;
  }

  function hasActiveMotifContent(sideId) {
    const sideState = getSideState(sideId);
    if (sideState.designMode === "qr") {
      return sideState.qrValue.trim().length > 0;
    }
    if (isMonogramTemplateSelected(sideId)) {
      return hasMonogramValue(sideId);
    }
    if (sideState.uploadedImage) {
      return true;
    }

    const activeTemplate = getActiveTemplate(sideId);
    if (!activeTemplate) {
      return false;
    }

    if (activeTemplate.category === "photo") {
      return Boolean(sideState.uploadedImage);
    }

    if (activeTemplate.category === "animal-symbols") {
      return Boolean(sideState.motifVariantId);
    }

    if (activeTemplate.category === "emblem") {
      if (isEmblemUploadSelected(sideId, state.activePendantIndex)) {
        return Boolean(sideState.uploadedImage);
      }
      if (sideState.emblemVariantId === "qr") {
        return sideState.qrValue.trim().length > 0;
      }
      return Boolean(sideState.emblemVariantId);
    }

    return Boolean(sideState.templateId);
  }

  function hasText(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).textValue.length > 0;
  }

  function isMotifMode(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).designMode === "motif";
  }

  function isTextMode(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).designMode === "text";
  }

  function isQrMode(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).designMode === "qr";
  }

  function getSideSummary(sideId, pendantIndex) {
    if (sideId === "back" && !isBackSideEnabled(pendantIndex)) {
      return "nicht aktiviert";
    }

    const sideState = getSideState(sideId, pendantIndex);
    const sideTemplate = getActiveTemplate(sideId, pendantIndex);
    const sideVariant = getActiveMotifVariant(sideId, pendantIndex);

    if (!sideState.designMode) {
      return sideId === "back" ? "aktiviert, noch offen" : "offen";
    }

    if (sideState.designMode === "motif") {
      if (isMonogramTemplateSelected(sideId, pendantIndex)) {
        return hasMonogramValue(sideId, pendantIndex)
          ? "Motiv · Monogramm · " + getSideState(sideId, pendantIndex).monogramValue
          : "Motiv · Monogramm offen";
      }
      if (isPhotoMotifSelected(sideId, pendantIndex)) {
        return sideState.uploadedImage ? "Foto · " + sideState.uploadedFileName : "Foto · offen";
      }
      if (sideState.emblemVariantId === "qr") {
        return sideState.qrValue ? "Motiv · QR-Code · " + truncateText(sideState.qrValue, 46) : "Motiv · QR-Code offen";
      }
      if (sideTemplate) {
        return "Motiv · " + getMotifSourceSummary(sideTemplate, sideVariant, sideId, pendantIndex);
      }
      return "Motiv · offen";
    }

    if (sideState.designMode === "qr") {
      return sideState.qrValue ? "QR · " + truncateText(sideState.qrValue, 46) : "QR · offen";
    }

    if (!sideState.textValue) {
      return "Text · offen";
    }

    return "Text · " + sideState.textValue;
  }

  function buildSideSummaryText(sideId) {
    return getPendantIndices().map(function (pendantIndex) {
      return getPendantLabel(pendantIndex) + ": " + getSideSummary(sideId, pendantIndex);
    }).join(" · ");
  }

  function getMotifSourceSummary(activeTemplate, activeMotifVariant, sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);

    if (sideState.uploadedImage) {
      return "Foto mit eigener Datei";
    }

    if (!activeTemplate) {
      return "Noch kein Motiv";
    }

    if (activeTemplate.category === "animal-symbols") {
      const animalGroup = getActiveAnimalGroup(sideId, pendantIndex);
      if (!animalGroup) {
        return "Tiermotiv · offen";
      }
      return activeMotifVariant ? animalGroup.name + " · " + activeMotifVariant.name : animalGroup.name;
    }

    if (activeTemplate.category === "emblem") {
      if (isEmblemUploadSelected(sideId, pendantIndex)) {
        return sideState.uploadedImage ? "Eigene Datei" : "Eigene Datei · offen";
      }
      const emblemVariant = getActiveEmblemVariant(sideId, pendantIndex);
      if (!emblemVariant) {
        return "Wappen / Emblem · offen";
      }
      if (emblemVariant.isQr) {
        return getSideState(sideId, pendantIndex).qrValue ? "QR-Code" : "QR-Code offen";
      }
      return emblemVariant.name;
    }

    return activeTemplate.name;
  }

  function getTemplateById(templateId) {
    return TEMPLATE_LIBRARY.find((template) => template.id === templateId) || null;
  }

  function getAnimalGroupById(animalGroupId) {
    return ANIMAL_GROUP_LIBRARY.find((animalGroup) => animalGroup.id === animalGroupId) || null;
  }

  function getMotifVariantById(variantId) {
    return MOTIF_VARIANT_LIBRARY.find((variant) => variant.id === variantId) || null;
  }

  function getEmblemVariantById(variantId) {
    return EMBLEM_VARIANT_LIBRARY.find((variant) => variant.id === variantId) || null;
  }

  function getEmblemKindById(kindId) {
    return EMBLEM_KIND_LIBRARY.find((variant) => variant.id === kindId) || null;
  }

  function getDefaultMotifVariantId(parentId) {
    const firstVariant = MOTIF_VARIANT_LIBRARY.find((variant) => variant.parentId === parentId);
    return firstVariant ? firstVariant.id : null;
  }

  function getActiveTopLevelTemplateId(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    if (sideState.templateId === "symbol-template" && isQrSelected(sideId, pendantIndex)) {
      return "qr-code";
    }
    if (sideState.templateId === "animal-symbols") {
      return "symbol-template";
    }
    if (sideState.symbolTemplateCategoryId) {
      return "symbol-template";
    }
    return sideState.templateId;
  }

  function getActiveTemplate(sideId, pendantIndex) {
    return getTemplateById(getSideState(sideId, pendantIndex).templateId);
  }

  function getActiveMotifVariant(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return sideState.motifVariantId ? getMotifVariantById(sideState.motifVariantId) : null;
  }

  function getActiveEmblemVariant(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return sideState.emblemVariantId ? getEmblemVariantById(sideState.emblemVariantId) : null;
  }

  function getActiveAnimalGroup(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return sideState.animalGroupId ? getAnimalGroupById(sideState.animalGroupId) : null;
  }

  function getActiveImage(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    const activeVariant = getActiveMotifVariant(sideId, pendantIndex);
    const activeTemplate = getActiveTemplate(sideId, pendantIndex);

    if (sideState.uploadedImage) {
      return sideState.uploadedImage;
    }

    if (activeTemplate && activeTemplate.category === "animal-symbols") {
      return activeVariant ? activeVariant.image : null;
    }

    if (activeTemplate && activeTemplate.category === "emblem") {
      const emblemVariant = getActiveEmblemVariant(sideId, pendantIndex);
      return emblemVariant && !emblemVariant.isQr ? emblemVariant.image : null;
    }

    return (activeTemplate ? activeTemplate.image : null) || null;
  }

  function isPhotoMotifSelected(sideId, pendantIndex) {
    const template = getActiveTemplate(sideId, pendantIndex);
    return Boolean(template && template.category === "photo");
  }

  function isMonogramTemplateSelected(sideId, pendantIndex) {
    const template = getActiveTemplate(sideId, pendantIndex);
    return Boolean(template && template.category === "monogram");
  }

  function isAnimalPawsSelected(sideId, pendantIndex) {
    const template = getActiveTemplate(sideId, pendantIndex);
    return Boolean(template && template.category === "animal-symbols");
  }

  function isAnimalMotifSelected(sideId, pendantIndex) {
    return isAnimalPawsSelected(sideId, pendantIndex);
  }

  function isEmblemTemplateSelected(sideId, pendantIndex) {
    const template = getActiveTemplate(sideId, pendantIndex);
    return Boolean(template && template.category === "emblem");
  }

  function isEmblemUploadSelected(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return isEmblemTemplateSelected(sideId, pendantIndex) && sideState.emblemSourceMode === "upload";
  }

  function isQrSelected(sideId, pendantIndex) {
    const emblemVariant = getActiveEmblemVariant(sideId, pendantIndex);
    return Boolean(emblemVariant && emblemVariant.isQr);
  }

  function hasMonogramValue(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).monogramValue.trim().length > 0;
  }

  function hasQrValue(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).qrValue.trim().length > 0;
  }

  function getActiveEmblemKindId(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).emblemKindId;
  }

  function hasSelectedEmblemKind(sideId, pendantIndex) {
    return Boolean(getActiveEmblemKindId(sideId, pendantIndex));
  }

  function updateMotifVariantOverlayCopy() {
    const activeTemplate = getActiveTemplate();
    const activeAnimalGroup = getActiveAnimalGroup();
    if (!activeTemplate || activeTemplate.category !== "animal-symbols") {
      if (isEmblemTemplateSelected()) {
        if (state.motifOverlayStep === "symbolCategories") {
          motifVariantOverlayTitle.textContent = "Symbolvorlage";
          motifVariantOverlayHelp.textContent = "Kategorie wählen.";
        } else if (state.motifOverlayStep === "googleGroups") {
          motifVariantOverlayTitle.textContent = "Google-Symbole";
          motifVariantOverlayHelp.textContent = "Google-Hauptgruppe wählen.";
        } else if (state.motifOverlayStep === "emblemKinds") {
          motifVariantOverlayTitle.textContent = "Weg wählen";
          motifVariantOverlayHelp.textContent = "Wappen, Emblem oder QR-Code.";
        } else if (state.motifOverlayStep === "emblemSourceChoice") {
          motifVariantOverlayTitle.textContent = getActiveEmblemKindId() === "crest" ? "Wappen" : (getActiveEmblemKindId() === "ornament" ? "Ornamente" : (getActiveEmblemKindId() === "custom-filesystem-outdoor" ? "Outdoor" : (getActiveEmblemKindId() === "custom-filesystem-runen" ? "Runen" : (getActiveEmblemKindId() === "google-hearts" ? "Herzen" : (getActiveEmblemKindId() === "google-motorsport" ? "Mobilität" : "Embleme")))));
          motifVariantOverlayHelp.textContent = "Vorlage oder eigene Datei.";
        } else if (state.motifOverlayStep === "emblemUpload") {
          motifVariantOverlayTitle.textContent = getActiveEmblemKindId() === "crest" ? "Wappen" : (getActiveEmblemKindId() === "ornament" ? "Ornamente" : (getActiveEmblemKindId() === "custom-filesystem-outdoor" ? "Outdoor" : (getActiveEmblemKindId() === "custom-filesystem-runen" ? "Runen" : (getActiveEmblemKindId() === "google-hearts" ? "Herzen" : (getActiveEmblemKindId() === "google-motorsport" ? "Mobilität" : "Embleme")))));
          motifVariantOverlayHelp.textContent = "Datei wählen.";
        } else {
          motifVariantOverlayTitle.textContent = getActiveEmblemKindId() && getActiveEmblemKindId().indexOf("google-group-") === 0
            ? getActiveEmblemKindId().replace("google-group-", "")
            : "Vorlage";
          motifVariantOverlayHelp.textContent = getActiveEmblemKindId() === "crest" ? "Wappen wählen." : (getActiveEmblemKindId() === "ornament" ? "Ornament wählen." : (getActiveEmblemKindId() === "custom-filesystem-outdoor" ? "Motiv wählen." : (getActiveEmblemKindId() === "custom-filesystem-runen" ? "Rune wählen." : (getActiveEmblemKindId() === "google-hearts" ? "Herz wählen." : (getActiveEmblemKindId() === "google-motorsport" ? "Symbol wählen." : (getActiveEmblemKindId() && getActiveEmblemKindId().indexOf("google-group-") === 0 ? "Google-Symbol wählen." : "Emblem wählen."))))));
        }
      } else {
        motifVariantOverlayTitle.textContent = "Tiermotiv";
        motifVariantOverlayHelp.textContent = "Wähle eine Tiergruppe.";
      }
      return;
    }

    if (state.motifOverlayStep === "groups" || !activeAnimalGroup) {
      motifVariantOverlayTitle.textContent = "Tiergruppe wählen";
      motifVariantOverlayHelp.textContent = "Tiergruppe wählen.";
      return;
    }

    motifVariantOverlayTitle.textContent = activeAnimalGroup.name + " wählen";
    motifVariantOverlayHelp.textContent = "Variante wählen.";
  }

  function isAnimalSymbolsSelected(sideId, pendantIndex) {
    return isAnimalMotifSelected(sideId, pendantIndex);
  }

  function getMotifSizeHint(sideId, pendantIndex) {
    const template = getActiveTemplate(sideId, pendantIndex);
    const size = getActiveSize(pendantIndex);
    if (!template || !size || !isMotifMode(sideId, pendantIndex)) return "";

    if (template.category === "photo" && size.diameterMm <= 12) {
      return size.diameterMm <= 10 ? "" : PHOTO_SIZE_12_HINT;
    }

    if (template.category === "emblem") {
      if (isQrSelected(sideId, pendantIndex) && size.diameterMm <= 12) {
        return size.diameterMm <= 10
          ? "Bei 8 oder 10 mm kann ein QR-Code nur eingeschränkt lesbar wirken. Für QR ist meist ein größerer Anhänger die sicherere Wahl."
          : "Bei 12 mm ist ein QR-Code möglich, wirkt aber auf größeren Anhängern meist klarer und ruhiger lesbar.";
      }

      if (!isQrSelected(sideId, pendantIndex) && size.diameterMm <= 10) {
        return "Feine Linien in Wappen oder Emblemen wirken auf 8 oder 10 mm zurückhaltender. Größere Anhänger geben solchen Motiven meist mehr Ruhe.";
      }
    }

    return "";
  }

  function getMaterialById(materialId) {
    return CATALOG.materials.find((material) => material.id === materialId) || null;
  }

  function getActiveMaterial() {
    return getMaterialById(state.materialId);
  }

  function getAvailableProductFamilies(material) {
    return material && Array.isArray(material.productFamilies) ? material.productFamilies : [];
  }

  function getProductFamilyById(productFamilyId) {
    const material = getActiveMaterial();
    const families = getAvailableProductFamilies(material);
    return families.find((family) => family.id === productFamilyId) || null;
  }

  function getActiveProductFamily() {
    return state.productFamilyId ? getProductFamilyById(state.productFamilyId) : null;
  }

  function isBottleOpenerProduct() {
    const productFamily = getActiveProductFamily();
    return Boolean(productFamily && productFamily.id === "bottle-opener");
  }

  function getActiveProduct() {
    const productFamily = getActiveProductFamily();
    if (!productFamily) return null;
    return productFamily.products.find((product) => product.id === state.productId) || null;
  }

  function getAvailableFinishes(productFamily) {
    return productFamily && Array.isArray(productFamily.finishes) ? productFamily.finishes : [];
  }

  function getActiveFinish() {
    const productFamily = getActiveProductFamily();
    return getAvailableFinishes(productFamily).find((finish) => finish.id === state.finishId) || null;
  }

  function getActiveProductDisplayName() {
    const productFamily = getActiveProductFamily();
    if (!productFamily) return "";

    if (productFamily.id === "jewelry-pendant") {
      const finish = getActiveFinish();
      return finish
        ? "Edelstahl-Schmuckanhänger · " + finish.name
        : "Edelstahl-Schmuckanhänger";
    }

    if (productFamily.id === "bottle-opener") {
      return "Flaschenöffner";
    }

    return productFamily.name;
  }

  function getActiveSize(pendantIndex) {
    const product = getActiveProduct();
    const targetPendantState = getPendantState(pendantIndex == null ? state.activePendantIndex : pendantIndex);
    if (!product) return null;
    return product.sizes.find((size) => size.id === targetPendantState.sizeId) || null;
  }

  function getActiveTextFont(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return TEXT_FONT_LIBRARY.find((font) => font.id === sideState.textFontId) || TEXT_FONT_LIBRARY[0];
  }

  function getActiveMonogramFont(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    return MONOGRAM_FONT_LIBRARY.find((font) => font.id === sideState.monogramFontId) || MONOGRAM_FONT_LIBRARY[0];
  }

  function normalizeMonogramValue(value) {
    return String(value)
      .replace(/\s+/g, "")
      .slice(0, 3)
      .toUpperCase();
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function readImageFromDataUrl(dataUrl) {
    return loadImage(dataUrl);
  }

  function validateAndReadEmblemUpload(file) {
    const mimeType = (file.type || "").toLowerCase();
    const extension = file.name.toLowerCase().split(".").pop();
    const isSvg = mimeType === "image/svg+xml" || extension === "svg";
    const isPng = mimeType === "image/png" || extension === "png";
    const invalidMessage = "Falsches Dateiformat oder unzulässige Datei. Erlaubt sind nur SVG oder PNG transparent, nur Schwarz-Weiß, ohne Grau, Schatten oder Verlauf.";

    if (!isSvg && !isPng) {
      window.alert(invalidMessage);
      return Promise.reject(new Error("invalid-emblem-file"));
    }

    if (isSvg) {
      return readFileAsText(file).then(function (svgText) {
        const normalized = svgText.toLowerCase();
        if (/(lineargradient|radialgradient|filter|fedropshadow|fegaussianblur|pattern|mask)/.test(normalized)) {
          window.alert(invalidMessage);
          throw new Error("invalid-emblem-svg");
        }
        const invalidColor = /#(?!000(?:000)?\b|fff(?:fff)?\b)[0-9a-f]{3,6}\b|rgba?\(|hsla?\(|\bgray\b|\bgrey\b|\bsilver\b/.test(normalized);
        if (invalidColor) {
          window.alert(invalidMessage);
          throw new Error("invalid-emblem-svg");
        }
        return buildInlineSvgDataUri(svgText);
      });
    }

    return readFileAsDataUrl(file)
      .then(function (dataUrl) {
        return readImageFromDataUrl(dataUrl).then(function (image) {
          const buffer = document.createElement("canvas");
          buffer.width = image.width;
          buffer.height = image.height;
          const bufferCtx = buffer.getContext("2d");
          bufferCtx.drawImage(image, 0, 0);
          const data = bufferCtx.getImageData(0, 0, buffer.width, buffer.height).data;
          let hasTransparency = false;

          for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3];
            if (alpha < 250) {
              if (alpha > 0) {
                hasTransparency = true;
              }
              continue;
            }

            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const maxChannelDiff = Math.max(Math.abs(red - green), Math.abs(red - blue), Math.abs(green - blue));
            const average = (red + green + blue) / 3;

            if (maxChannelDiff > 12 || (average > 24 && average < 231)) {
              window.alert(invalidMessage);
              throw new Error("invalid-emblem-png");
            }
          }

          if (!hasTransparency) {
            window.alert(invalidMessage);
            throw new Error("invalid-emblem-png");
          }

          return dataUrl;
        });
      });
  }

  function getMotifMask(pendantIndex) {
    const size = getActiveSize(pendantIndex);
    if (!size) return null;

    const radius = size.productRadius * size.engravingRatio;
    return {
      x: 600 - radius,
      y: 650 - radius,
      width: radius * 2,
      height: radius * 2,
      radius: radius
    };
  }

  function buildMonogramFont(fontSize, sideId, pendantIndex) {
    const font = getActiveMonogramFont(sideId, pendantIndex);
    return "700 " + fontSize + "px " + font.family;
  }

  function measureMonogram(text, fontSize, sideId, pendantIndex) {
    ctx.save();
    ctx.font = buildMonogramFont(fontSize, sideId, pendantIndex);
    const metrics = ctx.measureText(text);
    ctx.restore();
    return metrics;
  }

  function getMonogramLayout(pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const sideState = getSideState(state.activeSide, pendantIndex);
    const text = sideState.monogramValue || "";
    const length = Math.max(1, text.length);
    const baseSizeByLength = length === 1 ? motifMask.width * 0.68 : (length === 2 ? motifMask.width * 0.54 : motifMask.width * 0.42);
    const fontSize = Math.max(44, baseSizeByLength) * (sideState.scalePercent / 100);
    const metrics = measureMonogram(text, fontSize, state.activeSide, pendantIndex);

    return {
      font: buildMonogramFont(fontSize, state.activeSide, pendantIndex),
      width: metrics.width,
      height: Math.max(fontSize * 0.9, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent),
      drawWidth: metrics.width * getStretchFactor(sideState.stretchXPercent),
      drawHeight: Math.max(fontSize * 0.9, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * getStretchFactor(sideState.stretchYPercent)
    };
  }

  function getBottleOpenerMonogramLayout() {
    const box = getBottleOpenerDesignBox();
    const sideState = getActiveSideState();
    const text = sideState.monogramValue || "";
    const length = Math.max(1, text.length);
    const baseSizeByLength = length === 1 ? box.height * 1.02 : (length === 2 ? box.height * 0.84 : box.height * 0.66);
    const fontSize = Math.max(34, baseSizeByLength) * (sideState.scalePercent / 100);
    const metrics = measureMonogram(text, fontSize, state.activeSide, state.activePendantIndex);

    return {
      font: buildMonogramFont(fontSize, state.activeSide, state.activePendantIndex),
      width: metrics.width,
      height: Math.max(fontSize * 0.88, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent),
      drawWidth: metrics.width * getStretchFactor(sideState.stretchXPercent),
      drawHeight: Math.max(fontSize * 0.88, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * getStretchFactor(sideState.stretchYPercent)
    };
  }

  function getMotifDrawBox(image, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const fitScale = Math.max(motifMask.width / image.width, motifMask.height / image.height);
    const scaleFactor = activeSideState.scalePercent / 100;
    const stretchXFactor = getStretchFactor(activeSideState.stretchXPercent);
    const stretchYFactor = getStretchFactor(activeSideState.stretchYPercent);
    return {
      width: image.width * fitScale * scaleFactor * stretchXFactor,
      height: image.height * fitScale * scaleFactor * stretchYFactor
    };
  }

  function getStretchFactor(percentValue) {
    return clamp(Number(percentValue) || 100, 70, 140) / 100;
  }

  function getTextLayout(text, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const baseFontSize = Math.max(34, motifMask.width * 0.19);
    let fontSize = Math.max(22, baseFontSize * (activeSideState.textScalePercent / 100));
    const metrics = measureText(text, fontSize, pendantIndex);


    return {
      fontSize: fontSize,
      font: buildTextFont(fontSize, pendantIndex),
      width: metrics.width,
      height: Math.max(fontSize * 0.92, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
    };
  }

  function buildTextFont(fontSize, pendantIndex) {
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const font = getActiveTextFont(state.activeSide, pendantIndex);
    const fontParts = [];

    if (activeSideState.textStyles.italic) {
      fontParts.push("italic");
    }

    fontParts.push(activeSideState.textStyles.bold ? "700" : "600");
    fontParts.push(fontSize + "px");
    fontParts.push(font.family);

    return fontParts.join(" ");
  }

  function buildBottleOpenerTextFont(fontSize) {
    const activeSideState = getActiveSideState();
    const font = getActiveTextFont(state.activeSide, state.activePendantIndex);
    const fontParts = [];

    if (activeSideState.textStyles.italic) {
      fontParts.push("italic");
    }

    fontParts.push(activeSideState.textStyles.bold ? "700" : "600");
    fontParts.push(fontSize + "px");
    fontParts.push(font.family);

    return fontParts.join(" ");
  }

  function getDefaultTextOffsetY(pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    return motifMask ? motifMask.height * 0.04 : 0;
  }

  function measureText(text, fontSize, pendantIndex) {
    ctx.save();
    ctx.font = buildTextFont(fontSize, pendantIndex);
    const metrics = ctx.measureText(text);
    ctx.restore();
    return metrics;
  }

  function measureBottleOpenerText(text, fontSize) {
    ctx.save();
    ctx.font = buildBottleOpenerTextFont(fontSize);
    const metrics = ctx.measureText(text);
    ctx.restore();
    return metrics;
  }

  function drawRoundedRect(targetCtx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    targetCtx.beginPath();
    targetCtx.moveTo(x + r, y);
    targetCtx.lineTo(x + width - r, y);
    targetCtx.quadraticCurveTo(x + width, y, x + width, y + r);
    targetCtx.lineTo(x + width, y + height - r);
    targetCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    targetCtx.lineTo(x + r, y + height);
    targetCtx.quadraticCurveTo(x, y + height, x, y + height - r);
    targetCtx.lineTo(x, y + r);
    targetCtx.quadraticCurveTo(x, y, x + r, y);
    targetCtx.closePath();
  }

  function drawRoundedRectPath(targetCtx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    targetCtx.moveTo(x + r, y);
    targetCtx.lineTo(x + width - r, y);
    targetCtx.quadraticCurveTo(x + width, y, x + width, y + r);
    targetCtx.lineTo(x + width, y + height - r);
    targetCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    targetCtx.lineTo(x + r, y + height);
    targetCtx.quadraticCurveTo(x, y + height, x, y + height - r);
    targetCtx.lineTo(x, y + r);
    targetCtx.quadraticCurveTo(x, y, x + r, y);
    targetCtx.closePath();
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function getQrCodeModel(sideId, pendantIndex) {
    const sideState = getSideState(sideId, pendantIndex);
    const qrValue = sideState.qrValue.trim();
    if (!qrValue) {
      return null;
    }

    if (sideState.qrCodeModel && sideState.qrCodeModelValue === qrValue) {
      return sideState.qrCodeModel;
    }

    if (typeof window.qrcode !== "function") {
      return null;
    }

    const levels = qrValue.length <= 60 ? ["Q", "M", "L"] : ["M", "L"];

    for (let index = 0; index < levels.length; index += 1) {
      try {
        const qrModel = window.qrcode(0, levels[index]);
        qrModel.addData(qrValue, "Byte");
        qrModel.make();
        sideState.qrCodeModel = qrModel;
        sideState.qrCodeModelValue = qrValue;
        return qrModel;
      } catch (_) {
        // try lower error correction level
      }
    }

    sideState.qrCodeModel = null;
    sideState.qrCodeModelValue = "";
    return null;
  }

  function normalizeQrValue(value) {
    return String(value)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_QR_LENGTH);
  }

  function truncateText(value, maxLength) {
    const text = String(value);
    if (text.length <= maxLength) return text;
    return text.slice(0, Math.max(0, maxLength - 1)) + "…";
  }

  function buildInlineSvgDataUri(svg) {
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function buildSetThumbSvg(count) {
    const palette = getPendantFinishPalette();
    const layouts = getPendantLayouts(count).map(function (layout) {
      return {
        x: Number((100 + (layout.x - 600) * 0.188).toFixed(1)),
        y: Number((58 + (layout.y - 650) * 0.188).toFixed(1)),
        scale: layout.scale
      };
    });

    if (count === 5 && layouts.length === 5) {
      layouts[0].y = Number((layouts[0].y + 10.5).toFixed(1));
      layouts[1].x = Number((layouts[1].x - 12.5).toFixed(1));
      layouts[2].x = Number((layouts[2].x + 12.5).toFixed(1));
      layouts[3].x = Number((layouts[3].x - 14.5).toFixed(1));
      layouts[4].x = Number((layouts[4].x + 14.5).toFixed(1));
    }

    const circles = layouts.map(function (layout, index) {
      const radius = Number((25.7 * layout.scale).toFixed(1));
      const ringOuter = Number((5.1 * layout.scale).toFixed(1));
      const ringInner = Number((2.5 * layout.scale).toFixed(1));
      const ringY = Number((layout.y - radius - 8.8 * layout.scale).toFixed(1));
      const activeStroke = index === 0 ? ' stroke="#db1021" stroke-width="1.2"' : ' stroke="#ffffff" stroke-width="0"';
      const shadowY = Number((layout.y + radius * 0.78).toFixed(1));
      const shadowRx = Number((radius * 0.78).toFixed(1));
      const shadowRy = Number((radius * 0.22).toFixed(1));
      const innerStrokeOpacity = palette.effectiveFinishId === "gold" ? ".26" : ".16";

      return (
        '<g>' +
          '<ellipse cx="' + layout.x + '" cy="' + shadowY + '" rx="' + shadowRx + '" ry="' + shadowRy + '" fill="#000000" opacity=".22"/>' +
          '<circle cx="' + layout.x + '" cy="' + layout.y + '" r="' + radius + '" fill="url(#setPendantFill)" stroke="' + palette.edgeColor + '" stroke-width="1.6"/>' +
          '<circle cx="' + layout.x + '" cy="' + layout.y + '" r="' + (radius - 2.1) + '" fill="none" stroke="' + palette.innerStroke + '" stroke-opacity="' + innerStrokeOpacity + '" stroke-width="1"/>' +
          '<circle cx="' + layout.x + '" cy="' + ringY + '" r="' + ringOuter + '" fill="none" stroke="' + palette.edgeColor + '" stroke-width="1.05"/>' +
          '<circle cx="' + layout.x + '" cy="' + ringY + '" r="' + ringInner + '" fill="none" stroke="' + palette.innerStroke + '" stroke-opacity="' + innerStrokeOpacity + '" stroke-width=".7"/>' +
          '<circle cx="' + layout.x + '" cy="' + layout.y + '" r="' + (radius + 3.8) + '"' + activeStroke + ' fill="none"/>' +
        '</g>'
      );
    }).join("");

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 112" role="img" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="setPendantFill" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="' + palette.baseStart + '"/>' +
            '<stop offset="42%" stop-color="' + palette.baseMid + '"/>' +
            '<stop offset="100%" stop-color="' + palette.baseEnd + '"/>' +
          '</linearGradient>' +
        '</defs>' +
        circles +
      '</svg>'
    );
  }

  function normalizeTextValue(value) {
    return String(value)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_TEXT_LENGTH);
  }

  function formatEuro(cents) {
    return (cents / 100).toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR"
    });
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
