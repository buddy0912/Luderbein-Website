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
  const setGroup = document.getElementById("setGroup");
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
  const closeMotifVariantOverlayButton = document.getElementById("closeMotifVariantOverlayButton");
  const motifVariantOverlayBackButton = document.getElementById("motifVariantOverlayBackButton");
  const motifVariantOverlayTitle = document.getElementById("motifVariantOverlayTitle");
  const motifVariantOverlayHelp = document.getElementById("motifVariantOverlayHelp");
  const motifAdjustGroup = document.getElementById("motifAdjustGroup");
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
  const textSizeSlider = document.getElementById("textSizeSlider");
  const textFontSelect = document.getElementById("textFontSelect");
  const qrInput = document.getElementById("qrInput");
  const qrCharacterCount = document.getElementById("qrCharacterCount");
  const scaleValueLabel = document.getElementById("scaleValueLabel");
  const textSizeValueLabel = document.getElementById("textSizeValueLabel");
  const motifSizeHint = document.getElementById("motifSizeHint");
  const previewProductName = document.getElementById("previewProductName");
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
  const WHATSAPP_NUMBER = "491725925858";
  const REQUEST_EMAIL = "luderbein_gravur@icloud.com";
  const ACTIVE_STEP_SEQUENCE = ["material", "product", "set", "size", "designMode"];
  const SIDE_IDS = ["front", "back"];
  const BACK_SIDE_OPTION = {
    surchargeCents: 0,
    surchargeLabel: ""
  };

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
      label: "Sans / modern",
      family: "\"Helvetica Neue\", Arial, sans-serif"
    },
    {
      id: "serif",
      label: "Serif / klassisch",
      family: "Georgia, \"Times New Roman\", serif"
    },
    {
      id: "script",
      label: "Script / elegant",
      family: "\"Brush Script MT\", \"Segoe Script\", cursive"
    }
  ];

  const CATALOG = {
    materials: [
      {
        id: "stainless-steel",
        name: "Edelstahl",
        description: "Klar, langlebig und vielseitig.",
        pricing: {
          fromCents: 0,
          surchargeCents: 0
        },
        productFamilies: [
          {
            id: "single-pendant",
            name: "Einzelner Anhänger",
            description: "Schlichter Anhänger für einen klaren Start.",
            pricing: {
              fromCents: 0,
              surchargeCents: 0
            },
            products: [
              {
                id: "round-tag",
                name: "Rundes Edelstahl-Plättchen",
                description: "Runder Anhänger mit klarer, ruhiger Wirkung.",
                pricing: {
                  fromCents: 0,
                  surchargeCents: 0
                },
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
                    lift: 56,
                    pricing: {
                      fromCents: 0,
                      surchargeCents: 0
                    }
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
                    lift: 64,
                    pricing: {
                      fromCents: 0,
                      surchargeCents: 0
                    }
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
                    lift: 72,
                    pricing: {
                      fromCents: 0,
                      surchargeCents: 0
                    }
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
                    lift: 82,
                    pricing: {
                      fromCents: 0,
                      surchargeCents: 0
                    }
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
                    lift: 98,
                    pricing: {
                      fromCents: 0,
                      surchargeCents: 0
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "wood",
        name: "Holz",
        description: "Folgt später.",
        isComingSoon: true,
        pricing: {
          fromCents: 0,
          surchargeCents: 0
        },
        productFamilies: []
      }
    ]
  };

  const TEMPLATE_LIBRARY = [
    {
      id: "monogram",
      name: "Monogramm",
      description: "Klares Zeichen oder Initial.",
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
      hasVariants: true
    },
    {
      id: "emblem",
      name: "Wappen / Emblem / QR-Code",
      description: "Variante im Symbolbereich wählen.",
      imageSrc: "/assets/tools/vorschau/vorlage-emblem.png",
      category: "emblem"
    }
  ];

  const EMBLEM_VARIANT_LIBRARY = [
    {
      id: "crest",
      parentId: "emblem",
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
      parentId: "emblem",
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
      parentId: "emblem",
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
        const material = getMaterialById(selectedId);
        const families = material ? getAvailableProductFamilies(material) : [];
        return {
          materialId: selectedId,
          productFamilyId: families.length === 1 ? families[0].id : null
        };
      }
    },
    productFamily: {
      id: "productFamily",
      stateKey: "productFamilyId"
    },
    product: {
      id: "product",
      stateKey: "productId",
      groupEl: productGroup
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

  const state = createInitialState();
  let renderQueued = false;

  Promise.all(
    TEMPLATE_LIBRARY.concat(MOTIF_VARIANT_LIBRARY, EMBLEM_VARIANT_LIBRARY).map((entry) =>
      loadImage(entry.imageSrc).then((image) => {
        entry.image = image;
      })
    )
  ).then(init);

  function init() {
    renderMaterialOptions();
    renderProductOptions();
    renderSetOptions();
    renderSizeOptions();
    renderDesignModeOptions();
    renderTemplateOptions();
    renderMotifOverlayOptions();
    renderPendantTabs();
    bindEvents();
    syncUi();
    queueRender();
  }

  function createSideState() {
    return {
      designMode: null,
      templateId: null,
      animalGroupId: null,
      motifVariantId: null,
      emblemVariantId: null,
      uploadedImage: null,
      uploadedFileName: "",
      qrValue: "",
      qrCodeModel: null,
      qrCodeModelValue: "",
      scalePercent: 100,
      offsetX: 0,
      offsetY: 0,
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
    enableBackSideButton.addEventListener("click", enableBackSide);

    sideFrontButton.addEventListener("click", function () {
      setActiveSide("front");
    });

    sideBackButton.addEventListener("click", function () {
      setActiveSide("back");
    });

    scaleSlider.addEventListener("input", function () {
      getActiveSideState().scalePercent = Number(scaleSlider.value);
      syncUi();
      queueRender();
    });

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
      syncUi();
      queueRender();
    });

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
    clearTextButton.addEventListener("click", clearText);
    clearQrButton.addEventListener("click", clearQrValue);
    resetPlacementButton.addEventListener("click", resetAllSelections);
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

      if (template.category === "animal-symbols") {
        return Boolean(getSideState(sideId, pendantIndex).motifVariantId);
      }

      if (template.category === "emblem") {
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
    textSizeSlider.value = "100";
    textFontSelect.value = TEXT_FONT_LIBRARY[0].id;
    closeRequestMenu();
    renderProductOptions();
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
      renderSetOptions();
      renderSizeOptions();
    }

    if (stepId === "product") {
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
  }

  function getFlowStepIds() {
    return ACTIVE_STEP_SEQUENCE.filter(function (stepId) {
      return stepId !== "productFamily";
    });
  }

  function getStepOrder(stepId) {
    return ACTIVE_STEP_SEQUENCE.indexOf(stepId);
  }

  function getPreviousStepId(stepId) {
    const currentIndex = getStepOrder(stepId);
    if (currentIndex <= 0) return null;
    return ACTIVE_STEP_SEQUENCE[currentIndex - 1] || null;
  }

  function isStepAvailable(stepId) {
    if (stepId === "designMode") {
      return hasSizeSelection();
    }
    if (getStepOrder(stepId) === 0) return true;
    const previousStepId = getPreviousStepId(stepId);
    return previousStepId ? isStepComplete(previousStepId) : true;
  }

  function isStepComplete(stepId) {
    if (stepId === "size") {
      return haveAllPendantSizes();
    }
    if (stepId === "designMode") {
      return getPendantIndices().every(function (pendantIndex) {
        return hasDesignModeSelection("front", pendantIndex);
      });
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
      const product = getActiveProduct();
      return product ? product.name : "Offen";
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
      return isMotifMode() ? "Motiv" : "Text";
    }

    return "";
  }

  function renderMaterialOptions() {
    materialOptionsEl.innerHTML = "";

    CATALOG.materials.forEach((material) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-material-id", material.id);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(material.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(material.description) + "</span>";

      button.addEventListener("click", function () {
        if (material.isComingSoon) return;
        if (state.materialId === material.id) return;
        applyStepSelection("material", material.id);
      });

      materialOptionsEl.appendChild(button);
    });
  }

  function renderProductOptions() {
    productOptionsEl.innerHTML = "";

    const productFamily = getActiveProductFamily();
    if (!productFamily) return;

    productFamily.products.forEach((product) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-product-id", product.id);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(product.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(product.description) + "</span>";

      button.addEventListener("click", function () {
        if (state.productId === product.id) return;
        applyStepSelection("product", product.id);
      });

      productOptionsEl.appendChild(button);
    });
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

    MODE_LIBRARY.forEach((mode) => {
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

    TEMPLATE_LIBRARY.forEach((template) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-template-id", template.id);
      button.innerHTML =
        buildTemplateThumbMarkup(template) +
        '<span class="preview-option__title">' + escapeHtml(template.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(template.description) + "</span>";

      button.addEventListener("click", function () {
        selectMotifTemplate(template.id);
      });

      templateOptionsEl.appendChild(button);
    });
  }

  function buildTemplateThumbMarkup(template) {
    let thumbClass = "preview-option__thumb-media";
    if (template.category === "monogram") {
      thumbClass += " preview-option__thumb-media--monogram";
    }
    if (template.category === "photo") {
      thumbClass += " preview-option__thumb-media--photo";
    }
    if (template.category === "emblem") {
      thumbClass += " preview-option__thumb-media--emblem";
    }
    if (template.category === "animal-symbols") {
      thumbClass += " preview-option__thumb-media--animal-root";
    }

    return (
      '<span class="preview-option__thumb">' +
        '<span class="' + thumbClass + '">' +
          '<img src="' + template.imageSrc + '" alt="">' +
        "</span>" +
      "</span>"
    );
  }

  function buildAnimalGroupThumbMarkup(animalGroup) {
    return (
      '<span class="preview-option__thumb">' +
        '<span class="preview-option__thumb-media preview-option__thumb-media--animal-group">' +
          '<img src="' + animalGroup.imageSrc + '" alt="">' +
        "</span>" +
      "</span>"
    );
  }

  function renderMotifOverlayOptions() {
    motifOverlayOptionsEl.innerHTML = "";

    if (state.motifOverlayStep === "emblemVariants") {
      EMBLEM_VARIANT_LIBRARY.forEach((variant) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "preview-option";
        button.setAttribute("data-emblem-variant-id", variant.id);
        button.innerHTML =
          '<span class="preview-option__thumb"><span class="preview-option__thumb-media preview-option__thumb-media--emblem"><img src="' + variant.imageSrc + '" alt=""></span></span>' +
          '<span class="preview-option__title">' + escapeHtml(variant.name) + "</span>" +
          '<span class="preview-option__meta">' + escapeHtml(variant.description) + "</span>";

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
        button.className = "preview-option";
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

    const activeSideState = getActiveSideState();
    const isPhotoTemplate = template.category === "photo";
    const isAnimalSymbolsTemplate = template.category === "animal-symbols";
    const isEmblemTemplate = template.category === "emblem";
    const isSameTemplate = activeSideState.templateId === template.id;

    if (isAnimalSymbolsTemplate && isSameTemplate) {
      state.motifOverlayStep = "groups";
      openMotifVariantOverlay("groups");
      return;
    }

    if (isEmblemTemplate && isSameTemplate) {
      openMotifVariantOverlay("emblemVariants");
      return;
    }

    if (!isPhotoTemplate) {
      clearUploadedImage(false);
    }

    closeMotifVariantOverlay();
    activeSideState.templateId = template.id;
    activeSideState.animalGroupId = null;
    activeSideState.motifVariantId = null;
    activeSideState.emblemVariantId = null;
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
      openMotifVariantOverlay("emblemVariants");
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

  function selectMotifVariant(variantId) {
    const variant = getMotifVariantById(variantId);
    if (!variant) return;

    const activeSideState = getActiveSideState();
    activeSideState.motifVariantId = variant.id;
    clearUploadedImage(false);
    resetImagePlacement(false);
    syncUi();
    queueRender();
  }

  function selectEmblemVariant(variantId) {
    const variant = getEmblemVariantById(variantId);
    if (!variant) return;

    const activeSideState = getActiveSideState();
    activeSideState.emblemVariantId = variant.id;
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

  function setDesignMode(modeId) {
    if (!isStepAvailable("designMode")) return;
    if (!MODE_LIBRARY.some((mode) => mode.id === modeId)) return;
    if (getActiveSideState().designMode === modeId) return;
    applyStepSelection("designMode", modeId);
  }

  function openPhotoUpload() {
    if (!isMotifMode() || !isPhotoMotifSelected()) return;
    uploadInput.click();
  }

  function openMotifVariantOverlay(step) {
    if (!isMotifMode()) return;
    if (isAnimalSymbolsSelected()) {
      state.motifOverlayStep = step === "variants" ? "variants" : "groups";
    } else if (isEmblemTemplateSelected()) {
      state.motifOverlayStep = "emblemVariants";
    } else {
      return;
    }
    state.isMotifVariantOverlayOpen = true;
    renderMotifOverlayOptions();
    updateMotifVariantOverlayCopy();
    syncUi();
  }

  function closeMotifVariantOverlay() {
    if (!state.isMotifVariantOverlayOpen) return;
    state.isMotifVariantOverlayOpen = false;
    state.motifOverlayStep = "groups";
    renderMotifOverlayOptions();
    syncUi();
  }

  function showAnimalGroupOverlay() {
    if (!isMotifMode()) return;
    if (isAnimalSymbolsSelected()) {
      state.motifOverlayStep = "groups";
    } else if (isEmblemTemplateSelected()) {
      state.motifOverlayStep = "emblemVariants";
    } else {
      return;
    }
    state.isMotifVariantOverlayOpen = true;
    renderMotifOverlayOptions();
    updateMotifVariantOverlayCopy();
    syncUi();
  }

  function onUploadChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const targetSideState = getActiveSideState();
    const reader = new FileReader();

    reader.onload = function () {
      loadImage(String(reader.result))
        .then((image) => {
          targetSideState.uploadedImage = image;
          targetSideState.uploadedFileName = file.name;
          targetSideState.scalePercent = 100;
          targetSideState.offsetX = 0;
          targetSideState.offsetY = 0;
          syncUi();
          queueRender();
        })
        .catch(function () {
          closeMotifVariantOverlay();
        });
    };

    reader.readAsDataURL(file);
  }

  function clearUploadedImage(shouldRender) {
    const activeSideState = getActiveSideState();
    activeSideState.uploadedImage = null;
    activeSideState.uploadedFileName = "";
    uploadInput.value = "";
    resetImagePlacement(false);

    if (shouldRender !== false) {
      syncUi();
      queueRender();
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

  function resetImagePlacement(shouldRender) {
    const activeSideState = getActiveSideState();
    activeSideState.scalePercent = 100;
    activeSideState.offsetX = 0;
    activeSideState.offsetY = 0;
    scaleSlider.value = "100";
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

  function centerTextPlacement() {
    const activeSideState = getActiveSideState();
    activeSideState.textOffsetX = 0;
    activeSideState.textOffsetY = getDefaultTextOffsetY(state.activePendantIndex);
    clampTextPlacement();
    syncUi();
    queueRender();
  }

  function nudgePlacement(direction) {
    if (!isMotifMode() || !hasActiveMotifContent()) return;

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
    if (!isMotifMode() || !hasActiveMotifContent()) return;

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

  function onPointerDown(event) {
    const pendantIndex = getPendantIndexAtClientPoint(event.clientX, event.clientY);
    const clickedDifferentPendant = pendantIndex !== -1 && pendantIndex !== state.activePendantIndex;
    if (clickedDifferentPendant) {
      setActivePendant(pendantIndex);
    }

    if (clickedDifferentPendant) {
      return;
    }

    if (!isMotifMode() || !hasActiveMotifContent()) return;

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

  function clampPlacement() {
    const image = getActiveImage();
    const motifMask = getMotifMask(state.activePendantIndex);
    if (!image || !motifMask) return;

    const activeSideState = getActiveSideState();
    const drawBox = getMotifDrawBox(image);
    const maxOffsetX = Math.max((drawBox.width - motifMask.width) * 0.52, motifMask.width * 0.2);
    const maxOffsetY = Math.max((drawBox.height - motifMask.height) * 0.52, motifMask.height * 0.2);

    activeSideState.offsetX = clamp(activeSideState.offsetX, -maxOffsetX, maxOffsetX);
    activeSideState.offsetY = clamp(activeSideState.offsetY, -maxOffsetY, maxOffsetY);
  }

  function clampTextPlacement() {
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
    const safeHalfWidth = Math.max(motifMask.width * 0.08, (motifMask.width - textLayout.width) / 2);
    const safeHalfHeight = Math.max(motifMask.height * 0.12, (motifMask.height - textLayout.height) / 2);
    const maxOffsetX = Math.max(0, safeHalfWidth);
    const defaultOffsetY = getDefaultTextOffsetY(state.activePendantIndex);
    const minOffsetY = -safeHalfHeight;
    const maxOffsetY = safeHalfHeight;

    activeSideState.textOffsetX = clamp(activeSideState.textOffsetX, -maxOffsetX, maxOffsetX);
    activeSideState.textOffsetY = clamp(activeSideState.textOffsetY, Math.min(defaultOffsetY, minOffsetY), maxOffsetY);
  }

  function syncUi() {
    const activeMaterial = getActiveMaterial();
    const activeProduct = getActiveProduct();
    const activeSize = getActiveSize();
    const activeTemplate = getActiveTemplate();
    const activeSideState = getActiveSideState();
    const readyForExport = isConfigurationReady();

    syncStepGroups();

    if (!hasMaterialSelection()) {
      previewProductName.textContent = "Noch nichts ausgewählt";
      previewProductHint.textContent = "Wähle zuerst ein Material.";
      previewModeChip.textContent = "Start";
    } else if (!hasProductSelection()) {
      previewProductName.textContent = activeMaterial.name;
      previewProductHint.textContent = "Wähle jetzt den passenden Anhänger.";
      previewModeChip.textContent = "Schritt 2";
    } else if (!hasSetSelection()) {
      previewProductName.textContent = activeProduct.name;
      previewProductHint.textContent = "Lege jetzt fest, wie viele Anhänger im Set gezeigt werden.";
      previewModeChip.textContent = "Schritt 3";
    } else if (!hasSizeSelection()) {
      previewProductName.textContent = activeProduct.name + " · " + getActiveSetOption().shortLabel;
      previewProductHint.textContent = "Wähle jetzt die passende Größe für " + getPendantLabel(state.activePendantIndex) + ".";
      previewModeChip.textContent = "Schritt 4";
    } else if (!hasDesignModeSelection()) {
      previewProductName.textContent = activeProduct.name + " · " + getActiveSetOption().shortLabel + " · " + activeSize.label;
      previewProductHint.textContent = isBackSideEnabled()
        ? "Die Rückseite für " + getPendantLabel(state.activePendantIndex) + " ist zusätzlich verfügbar."
        : "Wähle jetzt Motiv oder Text für " + getPendantLabel(state.activePendantIndex) + ".";
      previewModeChip.textContent = "Schritt 5";
    } else {
      previewProductName.textContent = activeProduct.name + " · " + getActiveSetOption().shortLabel + " · " + activeSize.label;
      previewProductHint.textContent = activeMaterial.name + " · " + activeSize.diameterMm + " mm · " + getPendantLabel(state.activePendantIndex) + " · " + getSideLabel(state.activeSide);
      previewModeChip.textContent = getPendantLabel(state.activePendantIndex) + " · " + getSideLabel(state.activeSide) + " · " + (isMotifMode() ? "Motiv" : "Text");
    }

    previewSetLabel.textContent = hasSetSelection() ? getActiveSetOption().shortLabel : "Einzel";
    previewPendantLabel.textContent = getPendantTabLabel(state.activePendantIndex);
    previewActiveSideLabel.textContent = getSideLabel(state.activeSide);
    if (previewProductNameMobile) {
      previewProductNameMobile.textContent = previewProductName.textContent;
    }
    if (previewModeChipMobile) {
      previewModeChipMobile.textContent = previewModeChip.textContent;
    }
    if (previewActiveSideLabelMobile) {
      previewActiveSideLabelMobile.textContent = previewActiveSideLabel.textContent;
    }
    previewModeLabel.textContent = hasDesignModeSelection() ? (isMotifMode() ? "Motiv" : "Text") : "Offen";
    previewSourceLabel.textContent = getActiveSourceLabel(activeTemplate);

    scaleSlider.value = String(activeSideState.scalePercent);
    textSizeSlider.value = String(activeSideState.textScalePercent);
    scaleValueLabel.textContent = activeSideState.scalePercent + "%";
    textSizeValueLabel.textContent = activeSideState.textScalePercent + "%";
    textCharacterCount.textContent = activeSideState.textValue.length + " / " + MAX_TEXT_LENGTH;
    textInput.value = activeSideState.textValue;
    textFontSelect.value = activeSideState.textFontId;
    qrCharacterCount.textContent = activeSideState.qrValue.length + " / " + MAX_QR_LENGTH;
    qrInput.value = activeSideState.qrValue;

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

    const canShowBackSideSection = hasSizeSelection() && (isFrontConfigured() || isBackSideEnabled());
    const canShowPendantSection = hasSetSelection() && getPendantCount() > 1;
    pendantSwitchGroup.hidden = !canShowPendantSection;
    if (canShowPendantSection) {
      pendantSwitchStatus.textContent = getPendantLabel(state.activePendantIndex) + " wird gerade bearbeitet";
      pendantSwitchHint.textContent = hasSizeSelection()
        ? "Wähle den Anhänger, den du gerade gestalten möchtest. Größe, Seiten und Gestaltung gelten immer nur für diesen Anhänger."
        : "Wähle zuerst den Anhänger, den du gerade bearbeiten möchtest. Danach legst du die Größe nur für diesen Anhänger fest.";
    }
    sideSwitchGroup.hidden = !canShowBackSideSection;
    sideSwitchGroup.setAttribute("aria-hidden", canShowBackSideSection ? "false" : "true");
    sideTabs.hidden = !isBackSideEnabled();
    enableBackSideButton.hidden = isBackSideEnabled();
    sideSwitchStatus.textContent = isBackSideEnabled()
      ? (state.activeSide === "back" ? "Du gestaltest gerade die Rückseite von " + getPendantLabel(state.activePendantIndex) : "Die Rückseite für " + getPendantLabel(state.activePendantIndex) + " ist verfügbar")
      : "Die Rückseite für " + getPendantLabel(state.activePendantIndex) + " ist optional";
    sideSwitchHint.textContent = isBackSideEnabled()
      ? "Du kannst jetzt für diesen Anhänger zwischen Vorder- und Rückseite wechseln."
      : "Wenn du möchtest, kannst du zusätzlich nur für diesen Anhänger eine Rückseite anlegen.";

    const surchargeHint = getBackSideSurchargeHint();
    if (!isBackSideEnabled()) {
      sideSwitchHint.textContent = "Wenn du möchtest, kannst du zusätzlich eine Rückseite anlegen." + (surchargeHint ? " " + surchargeHint : "");
    } else if (surchargeHint) {
      sideSwitchHint.textContent += " " + surchargeHint;
    }

    sideFrontButton.classList.toggle("is-active", state.activeSide === "front");
    sideBackButton.classList.toggle("is-active", state.activeSide === "back");
    sideFrontButton.setAttribute("aria-selected", state.activeSide === "front" ? "true" : "false");
    sideBackButton.setAttribute("aria-selected", state.activeSide === "back" ? "true" : "false");

    setSectionVisibility(motifTemplateGroup, isMotifMode());
    setSectionVisibility(motifAdjustGroup, isMotifMode() && hasActiveMotifContent() && !isQrSelected());
    setSectionVisibility(qrCodeGroup, isMotifMode() && isQrSelected());
    setSectionVisibility(textGroup, isTextMode());

    const motifHint = getMotifSizeHint();
    motifSizeHint.hidden = !motifHint;
    motifSizeHint.textContent = motifHint;

    if (!isMotifMode() || (!isAnimalSymbolsSelected() && !isEmblemTemplateSelected())) {
      state.isMotifVariantOverlayOpen = false;
      state.motifOverlayStep = "groups";
    }
    motifVariantOverlay.hidden = !state.isMotifVariantOverlayOpen;
    motifVariantOverlayBackButton.hidden = !state.isMotifVariantOverlayOpen || state.motifOverlayStep !== "variants";

    materialOptionsEl.querySelectorAll("[data-material-id]").forEach((button) => {
      const material = getMaterialById(button.getAttribute("data-material-id"));
      button.classList.toggle("is-active", button.getAttribute("data-material-id") === state.materialId);
      button.classList.toggle("is-disabled", material.isComingSoon === true);
      button.disabled = material.isComingSoon === true;
    });

    productOptionsEl.querySelectorAll("[data-product-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-product-id") === state.productId);
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
      button.classList.toggle("is-active", template && template.id === activeTopLevelId);
    });

    motifOverlayOptionsEl.querySelectorAll("[data-animal-group-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-animal-group-id") === activeSideState.animalGroupId);
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
  }

  function syncStepGroups() {
    getFlowStepIds().forEach(function (stepId) {
      const definition = STEP_DEFINITIONS[stepId];
      if (!definition.groupEl) return;

      const isVisible = stepId === "material" ? true : isStepAvailable(stepId);
      const visualState = getStepVisualState(stepId);
      const summary = getStepSummary(stepId);
      const titleRow = definition.groupEl.querySelector(".preview-control-title-row");

      definition.groupEl.hidden = !isVisible;
      definition.groupEl.setAttribute("data-step-state", visualState);
      definition.groupEl.setAttribute("data-step-id", stepId);
      if (titleRow) {
        titleRow.setAttribute("data-step-summary", summary);
      }
    });
  }

  function getActiveSourceLabel(activeTemplate) {
    if (!hasMaterialSelection()) return "Offen";
    if (!hasProductSelection()) return "Weiter mit Produkt";
    if (!hasSetSelection()) return "Weiter mit Set";
    if (!hasSizeSelection()) return "Weiter mit Größe von " + getPendantLabel(state.activePendantIndex);
    if (!hasDesignModeSelection()) return "Weiter mit Gestaltungsart";

    if (isMotifMode()) {
      if (getActiveSideState().uploadedImage) {
        return "Foto: " + getActiveSideState().uploadedFileName;
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
        if (emblemVariant && emblemVariant.isQr) {
          return hasQrValue() ? "QR-Code" : "QR-Code offen";
        }
        if (emblemVariant) {
          return "Wappen / Emblem: " + emblemVariant.name;
        }
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

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;

    requestAnimationFrame(function () {
      renderQueued = false;
      renderPreview();
    });
  }

  function renderPreview() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackdrop();

    if (!hasMaterialSelection()) {
      drawEmptyState("1. Material wählen", "Danach geht es Schritt für Schritt weiter.");
      syncMobilePreviewCanvas();
      return;
    }

    if (!hasProductSelection()) {
      drawEmptyState("2. Produkt wählen", "Wähle jetzt den passenden Anhänger.");
      syncMobilePreviewCanvas();
      return;
    }

    if (!hasSetSelection()) {
      drawEmptyState("3. Set wählen", "Lege fest, ob du einen oder mehrere Anhänger gestalten möchtest.");
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
          const image = getActiveImage(state.activeSide, pendantIndex);
          if (image) {
            drawMotif(size, image, pendantIndex);
          } else if (isEmblemTemplateSelected(state.activeSide, pendantIndex)) {
            if (isQrSelected(state.activeSide, pendantIndex)) {
              if (hasQrValue(state.activeSide, pendantIndex)) {
                drawQrMotif(size, pendantIndex);
              } else if (pendantIndex === state.activePendantIndex) {
                drawMotifPrompt("QR-Inhalt eingeben", "Link oder kurze Information für den QR-Code festlegen.");
              }
            } else if (pendantIndex === state.activePendantIndex) {
              drawMotifPrompt("Variante wählen", "Passende Symbolvariante festlegen.");
            }
          } else if (pendantIndex === state.activePendantIndex) {
            drawMotifPrompt(
              isAnimalSymbolsSelected(state.activeSide, pendantIndex) && getActiveAnimalGroup(state.activeSide, pendantIndex)
                ? "Variante wählen"
                : isAnimalSymbolsSelected(state.activeSide, pendantIndex)
                  ? "Tiergruppe wählen"
                  : "Motivart wählen",
              isAnimalSymbolsSelected(state.activeSide, pendantIndex) && getActiveAnimalGroup(state.activeSide, pendantIndex)
                ? "Wähle die passende Variante."
                : isAnimalSymbolsSelected(state.activeSide, pendantIndex)
                  ? "Wähle zuerst die Tiergruppe."
                  : "Wähle die passende Motivart."
            );
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
          state.activeSide === "back" && isBackSideEnabled() ? "Rückseite gestalten" : "5. Gestaltungsart wählen",
          state.activeSide === "back" && isBackSideEnabled()
            ? "Du kannst die Rückseite dieses Anhängers separat gestalten oder frei lassen."
            : "Wähle jetzt Motiv oder Text für diesen Anhänger."
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
        { x: 470, y: 664, scale: 0.84 },
        { x: 730, y: 664, scale: 0.84 }
      ];
    } else if (count === 3) {
      layouts = [
        { x: 600, y: 488, scale: 0.69 },
        { x: 438, y: 770, scale: 0.69 },
        { x: 762, y: 770, scale: 0.69 }
      ];
    } else if (count === 4) {
      layouts = [
        { x: 446, y: 510, scale: 0.62 },
        { x: 754, y: 510, scale: 0.62 },
        { x: 446, y: 808, scale: 0.62 },
        { x: 754, y: 808, scale: 0.62 }
      ];
    } else if (count === 5) {
      layouts = [
        { x: 600, y: 414, scale: 0.56 },
        { x: 456, y: 612, scale: 0.56 },
        { x: 744, y: 612, scale: 0.56 },
        { x: 510, y: 820, scale: 0.56 },
        { x: 690, y: 820, scale: 0.56 }
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
    ctx.fillText(product.name + " · " + setOption.shortLabel, 86, 86);

    ctx.fillStyle = "rgba(210,207,206,0.66)";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Schematische Set-Vorschau vor der Größenwahl", 86, 122);

    drawRoundedRect(ctx, 220, 948, 760, 134, 28);
    ctx.fillStyle = "rgba(11, 10, 14, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.font = "700 34px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("4. Größe wählen", 600, 1002);

    ctx.fillStyle = "rgba(210,207,206,0.72)";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Die Set-Anordnung steht. Wähle jetzt die passende Größe für " + getPendantLabel(state.activePendantIndex) + ".", 600, 1046);
    ctx.restore();
  }

  function drawSchematicPendant(layout, isActive) {
    const radius = 116 * layout.scale;
    const centerX = layout.x;
    const centerY = layout.y + 8;
    const ringY = centerY - radius - 46 * layout.scale;
    const ringOuter = 20 * layout.scale;
    const ringInner = 10 * layout.scale;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 26 * layout.scale;
    ctx.shadowOffsetY = 9 * layout.scale;

    const pendantGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    pendantGradient.addColorStop(0, "#fcfaf7");
    pendantGradient.addColorStop(0.5, "#c4beb8");
    pendantGradient.addColorStop(1, "#fdfbf9");

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = pendantGradient;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = Math.max(1.2, 1.35 * layout.scale);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(18,18,22,0.05)";
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
    ctx.fillStyle = "rgba(240,236,232,0.98)";
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

  function syncMobilePreviewCanvas() {
    if (!mobileCtx || !mobileCanvas) return;
    mobileCtx.clearRect(0, 0, mobileCanvas.width, mobileCanvas.height);
    mobileCtx.drawImage(canvas, 0, 0, mobileCanvas.width, mobileCanvas.height);
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
    ctx.fillText(description, 600, 622);
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Die nächsten Bereiche bleiben zunächst ruhig ausgeblendet.", 600, 680);

    ctx.restore();
  }

  function drawRoundTagBase(size) {
    const centerX = 600;
    const centerY = 650;
    const radius = size.productRadius;
    const ringX = 600;
    const ringY = size.ringY;

    const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    gradient.addColorStop(0, "#f4f0ed");
    gradient.addColorStop(0.45, "#aaa6a2");
    gradient.addColorStop(1, "#fcfaf8");

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
    metalSheen.addColorStop(0, "rgba(255,255,255,0.30)");
    metalSheen.addColorStop(0.18, "rgba(255,255,255,0.05)");
    metalSheen.addColorStop(0.52, "rgba(255,255,255,0)");
    metalSheen.addColorStop(0.84, "rgba(0,0,0,0.20)");
    metalSheen.addColorStop(1, "rgba(255,255,255,0.06)");
    ctx.fillStyle = metalSheen;
    ctx.fillRect(centerX - radius - 30, centerY - radius - 30, radius * 2 + 60, radius * 2 + 60);

    ctx.strokeStyle = "rgba(255,255,255,0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(18,18,22,0.08)";
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
    const ringGradient = ctx.createLinearGradient(x - 42, y - 50, x + 68, y + 78);
    ringGradient.addColorStop(0, "#fcfaf8");
    ringGradient.addColorStop(0.5, "#9e9a96");
    ringGradient.addColorStop(1, "#e9e5e2");

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
    ctx.fillText(material.name + " · " + product.name + " · " + getActiveSetOption().shortLabel, 86, 92);

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
    targetCtx.fillText(material.name + " · " + product.name + " · " + getActiveSetOption().shortLabel + " · " + buildSizeSummaryLabel(), 52, 108);
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
    return "Anfrage zur Motiv-Vorschau – " + getActiveProduct().name + " · " + getActiveSetOption().shortLabel + " · " + (getPendantCount() > 1 ? "individuelle Größen" : getActiveSize().label);
  }

  function buildRequestMessage() {
    const pricingHint = getPricingHint();
    const lines = [
      "Hallo Luderbein,",
      "",
      "ich habe eine Anfrage zur Motiv-Vorschau. Hier sind die ersten Infos:",
      "",
      "Material: " + getActiveMaterial().name,
      "Produkt: " + getActiveProduct().name,
      "Set: " + getActiveSetOption().name,
      "Größen: " + buildPendantSizeSummaryText(),
      "Vorderseite: " + buildSideSummaryText("front"),
      "Rückseite: " + buildSideSummaryText("back")
    ];

    if (pricingHint) {
      lines.push("Preisstruktur: " + pricingHint);
    }

    lines.push("");
    lines.push("Viele Grüße");

    return lines.join("\n");
  }

  function getPricingHint() {
    const priceParts = [getActiveMaterial(), getActiveProductFamily(), getActiveProduct()]
      .filter(Boolean)
      .map(function (entry) {
        return entry.pricing || null;
      })
      .filter(Boolean);

    const totalFrom = priceParts.reduce(function (sum, pricing) {
      return sum + (pricing.fromCents || 0);
    }, 0);
    const totalSurcharge = priceParts.reduce(function (sum, pricing) {
      return sum + (pricing.surchargeCents || 0);
    }, 0);

    if (totalFrom <= 0 && totalSurcharge <= 0) {
      return "";
    }

    const parts = [];
    if (totalFrom > 0) {
      parts.push("ab " + formatEuro(totalFrom));
    }
    if (totalSurcharge > 0) {
      parts.push("Aufpreis " + formatEuro(totalSurcharge));
    }

    return parts.join(" · ");
  }

  function buildExportFilename() {
    const activeSideState = getActiveSideState();
    const parts = [
      "luderbein-vorschau",
      slugify(getActiveMaterial().name),
      slugify(getActiveProduct().name),
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
    return BACK_SIDE_OPTION.surchargeLabel || "";
  }

  function hasMaterialSelection() {
    return Boolean(state.materialId);
  }

  function hasProductSelection() {
    return Boolean(state.productId);
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
    return hasMaterialSelection() &&
      hasProductSelection() &&
      hasSetSelection() &&
      haveAllPendantSizes() &&
      getPendantIndices().every(function (pendantIndex) {
        return hasDesignModeSelection("front", pendantIndex);
      });
  }

  function hasActiveMotifContent(sideId) {
    const sideState = getSideState(sideId);
    if (sideState.uploadedImage) {
      return true;
    }

    const activeTemplate = getActiveTemplate(sideId);
    if (!activeTemplate) {
      return false;
    }

    if (activeTemplate.category === "animal-symbols") {
      return Boolean(sideState.motifVariantId);
    }

    if (activeTemplate.category === "emblem") {
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
      if (sideState.uploadedImage) {
        return "Motiv · Foto · " + sideState.uploadedFileName;
      }
      if (sideState.emblemVariantId === "qr") {
        return sideState.qrValue ? "Motiv · QR-Code · " + truncateText(sideState.qrValue, 46) : "Motiv · QR-Code offen";
      }
      if (sideTemplate) {
        return "Motiv · " + getMotifSourceSummary(sideTemplate, sideVariant, sideId, pendantIndex);
      }
      return "Motiv · offen";
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

  function getDefaultMotifVariantId(parentId) {
    const firstVariant = MOTIF_VARIANT_LIBRARY.find((variant) => variant.parentId === parentId);
    return firstVariant ? firstVariant.id : null;
  }

  function getActiveTopLevelTemplateId(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).templateId;
  }

  function getActiveTemplate(sideId, pendantIndex) {
    const topLevelTemplateId = getActiveTopLevelTemplateId(sideId, pendantIndex);
    return getTemplateById(topLevelTemplateId);
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

  function isQrSelected(sideId, pendantIndex) {
    const emblemVariant = getActiveEmblemVariant(sideId, pendantIndex);
    return Boolean(emblemVariant && emblemVariant.isQr);
  }

  function hasQrValue(sideId, pendantIndex) {
    return getSideState(sideId, pendantIndex).qrValue.trim().length > 0;
  }

  function updateMotifVariantOverlayCopy() {
    const activeTemplate = getActiveTemplate();
    const activeAnimalGroup = getActiveAnimalGroup();
    if (!activeTemplate || activeTemplate.category !== "animal-symbols") {
      if (isEmblemTemplateSelected()) {
        motifVariantOverlayTitle.textContent = "Wappen / Emblem";
        motifVariantOverlayHelp.textContent = "Variante wählen.";
      } else {
        motifVariantOverlayTitle.textContent = "Tiermotiv";
        motifVariantOverlayHelp.textContent = "Wähle eine Tiergruppe.";
      }
      return;
    }

    if (state.motifOverlayStep === "groups" || !activeAnimalGroup) {
      motifVariantOverlayTitle.textContent = "Tiergruppe wählen";
      motifVariantOverlayHelp.textContent = "Hund, Katze, Pferd oder Vogel auswählen.";
      return;
    }

    motifVariantOverlayTitle.textContent = activeAnimalGroup.name + " wählen";
    motifVariantOverlayHelp.textContent = "Passende Variante auswählen.";
  }

  function isAnimalSymbolsSelected(sideId, pendantIndex) {
    return isAnimalMotifSelected(sideId, pendantIndex);
  }

  function getMotifSizeHint(sideId, pendantIndex) {
    const template = getActiveTemplate(sideId, pendantIndex);
    const size = getActiveSize(pendantIndex);
    if (!template || !size || !isMotifMode(sideId, pendantIndex)) return "";

    if (template.category === "photo" && size.diameterMm <= 12) {
      return size.diameterMm <= 10
        ? "Bei 8 oder 10 mm wirken Fotos oft ruhiger und weniger detailreich. Ein größerer Anhänger zeigt Porträts meist klarer."
        : "Bei 12 mm wirken Fotos meist besser, wenn das Motiv nicht zu fein ist. Für mehr Detail ist oft eine größere Größe sinnvoll.";
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
    return (material.productFamilies || []).filter(function (family) {
      return !family.isComingSoon;
    });
  }

  function getActiveProductFamily() {
    const material = getActiveMaterial();
    if (!material) return null;

    const families = getAvailableProductFamilies(material);
    if (!families.length) return null;

    if (state.productFamilyId) {
      return families.find((family) => family.id === state.productFamilyId) || null;
    }

    if (families.length === 1) {
      state.productFamilyId = families[0].id;
      return families[0];
    }

    return null;
  }

  function getActiveProduct() {
    const productFamily = getActiveProductFamily();
    if (!productFamily) return null;
    return productFamily.products.find((product) => product.id === state.productId) || null;
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

  function getMotifDrawBox(image, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const fitScale = Math.max(motifMask.width / image.width, motifMask.height / image.height);
    const scaleFactor = activeSideState.scalePercent / 100;
    return {
      width: image.width * fitScale * scaleFactor,
      height: image.height * fitScale * scaleFactor
    };
  }

  function getTextLayout(text, pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    const activeSideState = getSideState(state.activeSide, pendantIndex);
    const maxWidth = motifMask.width * 0.82;
    const baseFontSize = Math.max(34, motifMask.width * 0.19);
    let fontSize = baseFontSize * (activeSideState.textScalePercent / 100);
    let metrics = measureText(text, fontSize, pendantIndex);

    if (metrics.width > maxWidth) {
      fontSize *= maxWidth / metrics.width;
      metrics = measureText(text, fontSize, pendantIndex);
    }

    const safeFontSize = Math.max(22, fontSize);
    if (safeFontSize !== fontSize) {
      metrics = measureText(text, safeFontSize, pendantIndex);
      fontSize = safeFontSize;
    }

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

  function getDefaultTextOffsetY(pendantIndex) {
    const motifMask = getMotifMask(pendantIndex);
    return motifMask ? motifMask.height * 0.22 : 0;
  }

  function measureText(text, fontSize, pendantIndex) {
    ctx.save();
    ctx.font = buildTextFont(fontSize, pendantIndex);
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

      return (
        '<g>' +
          '<ellipse cx="' + layout.x + '" cy="' + shadowY + '" rx="' + shadowRx + '" ry="' + shadowRy + '" fill="#000000" opacity=".22"/>' +
          '<circle cx="' + layout.x + '" cy="' + layout.y + '" r="' + radius + '" fill="url(#setPendantFill)" stroke="#191b20" stroke-width="1.6"/>' +
          '<circle cx="' + layout.x + '" cy="' + layout.y + '" r="' + (radius - 2.1) + '" fill="none" stroke="#ffffff" stroke-opacity=".16" stroke-width="1"/>' +
          '<circle cx="' + layout.x + '" cy="' + ringY + '" r="' + ringOuter + '" fill="none" stroke="#171a1f" stroke-width="1.05"/>' +
          '<circle cx="' + layout.x + '" cy="' + ringY + '" r="' + ringInner + '" fill="none" stroke="#ffffff" stroke-opacity=".16" stroke-width=".7"/>' +
          '<circle cx="' + layout.x + '" cy="' + layout.y + '" r="' + (radius + 3.8) + '"' + activeStroke + ' fill="none"/>' +
        '</g>'
      );
    }).join("");

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 112" role="img" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="setPendantFill" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#fbf7f2"/>' +
            '<stop offset="42%" stop-color="#c9c0b8"/>' +
            '<stop offset="100%" stop-color="#f3eee9"/>' +
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
