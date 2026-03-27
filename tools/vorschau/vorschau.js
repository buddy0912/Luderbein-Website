(function () {
  "use strict";

  const canvas = document.getElementById("previewCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const materialGroup = document.getElementById("materialGroup");
  const materialOptionsEl = document.getElementById("materialOptions");
  const productGroup = document.getElementById("productGroup");
  const productOptionsEl = document.getElementById("productOptions");
  const sizeGroup = document.getElementById("sizeGroup");
  const sizeOptionsEl = document.getElementById("sizeOptions");
  const designModeGroup = document.getElementById("designModeGroup");
  const designModeOptionsEl = document.getElementById("designModeOptions");
  const templateOptionsEl = document.getElementById("templateOptions");
  const motifTemplateGroup = document.getElementById("motifTemplateGroup");
  const motifVariantOptionsEl = document.getElementById("motifVariantOptions");
  const motifVariantOverlay = document.getElementById("motifVariantOverlay");
  const motifVariantOverlayBackdrop = document.getElementById("motifVariantOverlayBackdrop");
  const closeMotifVariantOverlayButton = document.getElementById("closeMotifVariantOverlayButton");
  const motifAdjustGroup = document.getElementById("motifAdjustGroup");
  const textGroup = document.getElementById("textGroup");
  const uploadInput = document.getElementById("uploadInput");
  const clearTextButton = document.getElementById("clearTextButton");
  const resetPlacementButton = document.getElementById("resetPlacementButton");
  const centerPlacementButton = document.getElementById("centerPlacementButton");
  const centerTextButton = document.getElementById("centerTextButton");
  const downloadPreviewButton = document.getElementById("downloadPreviewButton");
  const requestMenuPanel = document.getElementById("requestMenuPanel");
  const requestWhatsappLink = document.getElementById("requestWhatsappLink");
  const requestEmailLink = document.getElementById("requestEmailLink");
  const scaleSlider = document.getElementById("scaleSlider");
  const textSizeSlider = document.getElementById("textSizeSlider");
  const textFontSelect = document.getElementById("textFontSelect");
  const scaleValueLabel = document.getElementById("scaleValueLabel");
  const textSizeValueLabel = document.getElementById("textSizeValueLabel");
  const previewProductName = document.getElementById("previewProductName");
  const previewProductHint = document.getElementById("previewProductHint");
  const previewModeChip = document.getElementById("previewModeChip");
  const previewActiveSideLabel = document.getElementById("previewActiveSideLabel");
  const previewModeLabel = document.getElementById("previewModeLabel");
  const previewSourceLabel = document.getElementById("previewSourceLabel");
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
  const WHATSAPP_NUMBER = "491725925858";
  const REQUEST_EMAIL = "luderbein_gravur@icloud.com";
  const ACTIVE_STEP_SEQUENCE = ["material", "product", "size", "designMode"];
  const SIDE_IDS = ["front", "back"];
  const BACK_SIDE_OPTION = {
    surchargeCents: 0,
    surchargeLabel: ""
  };

  const MODE_LIBRARY = [
    {
      id: "motif",
      name: "Motiv",
      description: "Vorlage oder eigenes Bild nutzen. Für diese Produktgröße die klarere Wahl, wenn eine Form oder ein Symbol im Fokus steht."
    },
    {
      id: "text",
      name: "Text",
      description: "Kurzen Namen, Initialen oder ein kleines Wort setzen. Für kleine Plättchen bewusst ohne zusätzliches Motiv."
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
        description: "Aktiver Startzustand für Version 1.",
        pricing: {
          fromCents: 0,
          surchargeCents: 0
        },
        productFamilies: [
          {
            id: "single-pendant",
            name: "Einzelner Anhänger",
            description: "Aktuell die geführte Startfamilie. Weitere Familien können später als eigener Schritt ergänzt werden.",
            pricing: {
              fromCents: 0,
              surchargeCents: 0
            },
            products: [
              {
                id: "round-tag",
                name: "Rundes Edelstahl-Plättchen",
                description: "Runder Anhänger als erster realer Produkttyp.",
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
        description: "Noch nicht aktiv in der UI, aber in der Struktur für spätere Schritte vorbereitet.",
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
      description: "Reduziertes Initial-Beispiel.",
      imageSrc: "/assets/tools/vorschau/vorlage-monogramm.png",
      category: "monogram"
    },
    {
      id: "photo-portrait",
      name: "Foto / Porträt",
      description: "Eigenes Bild hochladen oder eine fotoartige Silhouettenwirkung grob prüfen.",
      imageSrc: "/assets/tools/vorschau/vorlage-portraet.png",
      category: "photo",
      prefersUpload: true
    },
    {
      id: "animal-paws",
      name: "Tierpfoten",
      description: "Pfotenmotive als klare Symbolrichtung. Mit vorbereiteter Variantenstruktur.",
      imageSrc: "/assets/tools/vorschau/vorlage-pfote.png",
      category: "animal-paws",
      hasVariants: true
    },
    {
      id: "emblem",
      name: "Wappen / Emblem",
      description: "Klare Zeichen-, Logo- oder Wappenwirkung.",
      imageSrc: "/assets/tools/vorschau/vorlage-emblem.png",
      category: "emblem"
    }
  ];

  const MOTIF_VARIANT_LIBRARY = [
    {
      id: "paw-classic",
      parentId: "animal-paws",
      name: "Klassische Pfote",
      description: "Erste Basisvariante für Tierpfoten.",
      imageSrc: "/assets/tools/vorschau/vorlage-pfote.png"
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
    size: {
      id: "size",
      stateKey: "sizeId",
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
    TEMPLATE_LIBRARY.concat(MOTIF_VARIANT_LIBRARY).map((entry) =>
      loadImage(entry.imageSrc).then((image) => {
        entry.image = image;
      })
    )
  ).then(init);

  function init() {
    renderMaterialOptions();
    renderProductOptions();
    renderSizeOptions();
    renderDesignModeOptions();
    renderTemplateOptions();
    renderMotifVariantOptions();
    bindEvents();
    syncUi();
    queueRender();
  }

  function createSideState() {
    return {
      designMode: null,
      templateId: null,
      motifVariantId: null,
      uploadedImage: null,
      uploadedFileName: "",
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

  function createInitialState() {
    return {
      materialId: null,
      productFamilyId: null,
      productId: null,
      sizeId: null,
      activeSide: "front",
      backSideEnabled: false,
      sides: {
        front: createSideState(),
        back: createSideState()
      },
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
    clearTextButton.addEventListener("click", clearText);
    resetPlacementButton.addEventListener("click", resetAllSelections);
    centerPlacementButton.addEventListener("click", centerPlacement);
    centerTextButton.addEventListener("click", centerTextPlacement);
    downloadPreviewButton.addEventListener("click", downloadPreview);
    requestWhatsappLink.addEventListener("click", closeRequestMenu);
    requestEmailLink.addEventListener("click", closeRequestMenu);

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

  function getSideState(sideId) {
    return state.sides[sideId || state.activeSide];
  }

  function getActiveSideState() {
    return getSideState(state.activeSide);
  }

  function isBackSideEnabled() {
    return state.backSideEnabled;
  }

  function getSideLabel(sideId) {
    return sideId === "back" ? "Rückseite" : "Vorderseite";
  }

  function getEnabledSideIds() {
    return isBackSideEnabled() ? SIDE_IDS.slice() : ["front"];
  }

  function hasMeaningfulSideConfiguration(sideId) {
    const sideState = getSideState(sideId);

    if (!sideState.designMode) {
      return false;
    }

    if (sideState.designMode === "motif") {
      if (sideState.uploadedImage) {
        return true;
      }

      const template = getActiveTemplate(sideId);
      if (!template) {
        return false;
      }

      if (template.category === "photo") {
        return false;
      }

      return true;
    }

    if (sideState.designMode === "text") {
      return sideState.textValue.trim().length > 0;
    }

    return false;
  }

  function isFrontConfigured() {
    return hasMeaningfulSideConfiguration("front");
  }

  function enableBackSide() {
    if (!hasSizeSelection() || isBackSideEnabled() || !isFrontConfigured()) return;
    state.backSideEnabled = true;
    state.sides.back = createSideState();
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
    renderSizeOptions();
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
      renderSizeOptions();
    }

    if (stepId === "product") {
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
      state.activeSide = "front";
      state.backSideEnabled = false;
      state.sides.front = createSideState();
      state.sides.back = createSideState();
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
    if (getStepOrder(stepId) === 0) return true;
    const previousStepId = getPreviousStepId(stepId);
    return previousStepId ? isStepComplete(previousStepId) : true;
  }

  function isStepComplete(stepId) {
    if (stepId === "designMode") {
      return hasDesignModeSelection();
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
      return material ? material.name : "Noch nicht gewählt";
    }

    if (stepId === "product") {
      const product = getActiveProduct();
      return product ? product.name : "Noch nicht gewählt";
    }

    if (stepId === "size") {
      const size = getActiveSize();
      return size ? size.label : "Noch nicht gewählt";
    }

    if (stepId === "designMode") {
      if (!hasDesignModeSelection()) return "Noch nicht gewählt";
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
        if (state.sizeId === size.id) return;
        applyStepSelection("size", size.id);
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
        '<span class="preview-option__thumb"><img src="' + template.imageSrc + '" alt=""></span>' +
        '<span class="preview-option__title">' + escapeHtml(template.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(template.description) + "</span>";

      button.addEventListener("click", function () {
        selectMotifTemplate(template.id);
      });

      templateOptionsEl.appendChild(button);
    });
  }

  function renderMotifVariantOptions() {
    motifVariantOptionsEl.innerHTML = "";

    MOTIF_VARIANT_LIBRARY.forEach((variant) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-size-chip";
      button.setAttribute("data-motif-variant-id", variant.id);
      button.textContent = variant.name;

      button.addEventListener("click", function () {
        if (getActiveSideState().motifVariantId === variant.id) return;
        selectMotifVariant(variant.id);
        closeMotifVariantOverlay();
      });

      motifVariantOptionsEl.appendChild(button);
    });
  }

  function selectMotifTemplate(templateId) {
    const template = getTemplateById(templateId);
    if (!template) return;

    const activeSideState = getActiveSideState();
    const isPhotoTemplate = template.category === "photo";
    const isPawTemplate = template.category === "animal-paws";

    if (!isPhotoTemplate) {
      clearUploadedImage(false);
    }

    closeMotifVariantOverlay();
    activeSideState.templateId = template.id;
    activeSideState.motifVariantId = isPawTemplate ? getDefaultMotifVariantId(template.id) : null;

    if (isPawTemplate && activeSideState.motifVariantId) {
      const variant = getMotifVariantById(activeSideState.motifVariantId);
      if (variant) {
        activeSideState.templateId = variant.id;
      }
    }

    resetImagePlacement(false);
    syncUi();
    queueRender();

    if (isPhotoTemplate) {
      openPhotoUpload();
    }

    if (isPawTemplate) {
      openMotifVariantOverlay();
    }
  }

  function selectMotifVariant(variantId) {
    const variant = getMotifVariantById(variantId);
    if (!variant) return;

    const activeSideState = getActiveSideState();
    activeSideState.motifVariantId = variant.id;
    activeSideState.templateId = variant.id;
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

  function openMotifVariantOverlay() {
    if (!isMotifMode() || !isAnimalPawsSelected()) return;
    state.isMotifVariantOverlayOpen = true;
    syncUi();
  }

  function closeMotifVariantOverlay() {
    if (!state.isMotifVariantOverlayOpen) return;
    state.isMotifVariantOverlayOpen = false;
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
    activeSideState.textOffsetY = getDefaultTextOffsetY();
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
    activeSideState.textOffsetY = getDefaultTextOffsetY();
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
    if (requestMenuPanel.hidden) return;
    if (event.target === downloadPreviewButton || downloadPreviewButton.contains(event.target)) return;
    if (requestMenuPanel.contains(event.target)) return;
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
    downloadPreviewButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function onPointerDown(event) {
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

  function clampPlacement() {
    const image = getActiveImage();
    const motifMask = getMotifMask();
    if (!image || !motifMask) return;

    const activeSideState = getActiveSideState();
    const drawBox = getMotifDrawBox(image);
    const maxOffsetX = Math.max((drawBox.width - motifMask.width) * 0.52, motifMask.width * 0.2);
    const maxOffsetY = Math.max((drawBox.height - motifMask.height) * 0.52, motifMask.height * 0.2);

    activeSideState.offsetX = clamp(activeSideState.offsetX, -maxOffsetX, maxOffsetX);
    activeSideState.offsetY = clamp(activeSideState.offsetY, -maxOffsetY, maxOffsetY);
  }

  function clampTextPlacement() {
    const motifMask = getMotifMask();
    const activeSideState = getActiveSideState();

    if (!motifMask) {
      activeSideState.textOffsetX = 0;
      activeSideState.textOffsetY = 0;
      return;
    }

    if (!hasText()) {
      activeSideState.textOffsetX = 0;
      activeSideState.textOffsetY = getDefaultTextOffsetY();
      return;
    }

    const textLayout = getTextLayout(activeSideState.textValue);
    const safeHalfWidth = Math.max(motifMask.width * 0.08, (motifMask.width - textLayout.width) / 2);
    const safeHalfHeight = Math.max(motifMask.height * 0.12, (motifMask.height - textLayout.height) / 2);
    const maxOffsetX = Math.max(0, safeHalfWidth);
    const defaultOffsetY = getDefaultTextOffsetY();
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
      previewProductHint.textContent = "Wähle zuerst ein Material. Danach schaltet sich der Ablauf Schritt für Schritt frei.";
      previewModeChip.textContent = "Start";
    } else if (!hasProductSelection()) {
      previewProductName.textContent = "Material gewählt: " + activeMaterial.name;
      previewProductHint.textContent = "Wähle jetzt das passende Produkt.";
      previewModeChip.textContent = "Schritt 2";
    } else if (!hasSizeSelection()) {
      previewProductName.textContent = "Produkt gewählt: " + activeProduct.name;
      previewProductHint.textContent = "Wähle jetzt die passende Größe.";
      previewModeChip.textContent = "Schritt 3";
    } else if (!hasDesignModeSelection()) {
      previewProductName.textContent = activeProduct.name + " · " + activeSize.label;
      previewProductHint.textContent = isBackSideEnabled()
        ? "Die Vorderseite bleibt der Standard. Die Rückseite ist jetzt als Zusatzseite zugeschaltet."
        : "Arbeite jetzt zuerst die Vorderseite durch. Die optionale Rückseite erscheint erst ganz unten nach der Vorderseiten-Konfiguration.";
      previewModeChip.textContent = "Schritt 4";
    } else {
      previewProductName.textContent = activeProduct.name + " · " + activeSize.label;
      previewProductHint.textContent = activeMaterial.name + " · " + activeSize.diameterMm + " mm · aktive Seite: " + getSideLabel(state.activeSide) + ".";
      previewModeChip.textContent = getSideLabel(state.activeSide) + " · " + (isMotifMode() ? "Motivmodus" : "Textmodus");
    }

    previewActiveSideLabel.textContent = getSideLabel(state.activeSide);
    previewModeLabel.textContent = hasDesignModeSelection() ? (isMotifMode() ? "Motiv" : "Text") : "Noch offen";
    previewSourceLabel.textContent = getActiveSourceLabel(activeTemplate);

    scaleSlider.value = String(activeSideState.scalePercent);
    textSizeSlider.value = String(activeSideState.textScalePercent);
    scaleValueLabel.textContent = activeSideState.scalePercent + "%";
    textSizeValueLabel.textContent = activeSideState.textScalePercent + "%";
    textCharacterCount.textContent = activeSideState.textValue.length + " / " + MAX_TEXT_LENGTH;
    textInput.value = activeSideState.textValue;
    textFontSelect.value = activeSideState.textFontId;

    requestWhatsappLink.href = readyForExport ? buildWhatsappUrl() : "#";
    requestEmailLink.href = readyForExport ? buildMailtoUrl() : "#";
    downloadPreviewButton.disabled = !readyForExport;
    if (!readyForExport) {
      closeRequestMenu();
    }

    const canShowBackSideSection = hasSizeSelection() && (isFrontConfigured() || isBackSideEnabled());
    sideSwitchGroup.hidden = !canShowBackSideSection;
    sideSwitchGroup.setAttribute("aria-hidden", canShowBackSideSection ? "false" : "true");
    sideTabs.hidden = !isBackSideEnabled();
    enableBackSideButton.hidden = isBackSideEnabled();
    sideSwitchStatus.textContent = isBackSideEnabled()
      ? (state.activeSide === "back" ? "Rückseite wird jetzt als Zusatzseite bearbeitet" : "Vorderseite fertig, Rückseite ist zusätzlich freigeschaltet")
      : "Vorderseite fertig. Rückseite ist als Zusatzoption verfügbar";
    sideSwitchHint.textContent = isBackSideEnabled()
      ? "Jetzt kannst du zwischen Vorderseite und Rückseite umschalten. Beide Seiten behalten ihren eigenen Zustand."
      : "Wenn du zusätzlich eine Rückseite gestalten möchtest, kannst du sie hier unten jetzt freischalten.";

    const surchargeHint = getBackSideSurchargeHint();
    if (!isBackSideEnabled()) {
      sideSwitchHint.textContent = "Wenn du zusätzlich eine Rückseite gestalten möchtest, kannst du sie hier unten jetzt freischalten." + (surchargeHint ? " " + surchargeHint : "");
    } else if (surchargeHint) {
      sideSwitchHint.textContent += " " + surchargeHint;
    }

    sideFrontButton.classList.toggle("is-active", state.activeSide === "front");
    sideBackButton.classList.toggle("is-active", state.activeSide === "back");
    sideFrontButton.setAttribute("aria-selected", state.activeSide === "front" ? "true" : "false");
    sideBackButton.setAttribute("aria-selected", state.activeSide === "back" ? "true" : "false");

    setSectionVisibility(motifTemplateGroup, isMotifMode());
    setSectionVisibility(motifAdjustGroup, isMotifMode() && hasActiveMotifContent());
    setSectionVisibility(textGroup, isTextMode());

    if (!isMotifMode() || !isAnimalPawsSelected()) {
      state.isMotifVariantOverlayOpen = false;
    }
    motifVariantOverlay.hidden = !state.isMotifVariantOverlayOpen;

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
      button.classList.toggle("is-active", button.getAttribute("data-size-id") === state.sizeId);
    });

    designModeOptionsEl.querySelectorAll("[data-design-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-design-mode") === activeSideState.designMode);
    });

    templateOptionsEl.querySelectorAll("[data-template-id]").forEach((button) => {
      const template = getTemplateById(button.getAttribute("data-template-id"));
      const activeTopLevelId = getActiveTopLevelTemplateId();
      button.classList.toggle("is-active", template && template.id === activeTopLevelId);
    });

    motifVariantOptionsEl.querySelectorAll("[data-motif-variant-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-motif-variant-id") === activeSideState.motifVariantId);
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
    if (!hasMaterialSelection()) return "Noch keine Auswahl";
    if (!hasProductSelection()) return "Als Nächstes: Produkt wählen";
    if (!hasSizeSelection()) return "Als Nächstes: Größe wählen";
    if (!hasDesignModeSelection()) return "Als Nächstes: Gestaltungsart wählen";

    if (isMotifMode()) {
      if (getActiveSideState().uploadedImage) {
        return "Foto / Porträt: " + getActiveSideState().uploadedFileName;
      }
      if (isAnimalPawsSelected()) {
        const variant = getActiveMotifVariant();
        return variant ? "Tierpfoten: " + variant.name : "Tierpfoten";
      }
      if (activeTemplate) {
        return "Motivart: " + activeTemplate.name;
      }
      return "Noch kein Motiv gewählt";
    }

    return hasText() ? "Text: " + getActiveSideState().textValue : "Noch kein Text eingegeben";
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
    if (!state.backSideEnabled) {
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
      drawEmptyState("1. Material wählen", "Danach baut sich die Vorschau Schritt für Schritt auf.");
      return;
    }

    if (!hasProductSelection()) {
      drawEmptyState("2. Produkt wählen", "Material ist gewählt. Wähle jetzt den passenden Anhänger.");
      return;
    }

    if (!hasSizeSelection()) {
      drawEmptyState("3. Größe wählen", "Produkt ist gewählt. Lege jetzt die Größe fest.");
      return;
    }

    const size = getActiveSize();
    const material = getActiveMaterial();
    const product = getActiveProduct();

    drawRoundTagBase(size);
    drawMotifMask(size);

    if (!hasDesignModeSelection()) {
      drawMotifPrompt(
        state.activeSide === "back" && isBackSideEnabled() ? "Rückseite gestalten" : "4. Gestaltungsart wählen",
        state.activeSide === "back" && isBackSideEnabled()
          ? "Die Rückseite ist optional aktiviert. Du kannst sie leer lassen oder separat gestalten."
          : "Die Vorderseite ist der Standard. Danach wird der passende Bearbeitungsbereich freigeschaltet."
      );
      drawProductHighlights(size);
      drawPreviewLabels(material, product, size);
      return;
    }

    if (isMotifMode()) {
      const image = getActiveImage();
      if (image) {
        drawMotif(size, image);
      } else {
        drawMotifPrompt("Motivart wählen", "Wähle Monogramm, Foto / Porträt, Tierpfoten oder Emblem.");
      }
    }

    if (isTextMode()) {
      if (hasText()) {
        drawTextOverlay(size);
      } else {
        drawMotifPrompt("Kurzen Text eingeben", "Name, Initialen oder kurzes Wort ruhig und kompakt platzieren.");
      }
    }

    drawProductHighlights(size);
    drawPreviewLabels(material, product, size);
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

  function drawMotifMask(size) {
    const motifMask = getMotifMask();
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

  function drawMotif(size, image) {
    const motifMask = getMotifMask();
    const drawBox = getMotifDrawBox(image);
    const activeSideState = getActiveSideState();
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

  function drawTextOverlay(size) {
    const motifMask = getMotifMask();
    const activeSideState = getActiveSideState();
    const textLayout = getTextLayout(activeSideState.textValue);
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
    const motifMask = getMotifMask();
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

  function drawPreviewLabels(material, product, size) {
    const motifMask = getMotifMask();
    if (!motifMask) return;

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(material.name + " · " + product.name, 86, 86);

    ctx.fillStyle = "rgba(210,207,206,0.64)";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Große " + size.label + " · freie Motivwirkung bis nah an den Rand", 86, 122);

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText("Orientierungsbereich", motifMask.x + 6, motifMask.y - 18);
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
    const previews = {};

    sideIds.forEach(function (sideId) {
      state.activeSide = sideId;
      renderPreview();

      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d").drawImage(canvas, 0, 0);
      previews[sideId] = snapshot;
    });

    state.activeSide = previousSide;
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
    const size = getActiveSize();
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
    targetCtx.fillText(material.name + " · " + product.name + " · " + size.label, 52, 108);
    targetCtx.fillText(
      isBackSideEnabled()
        ? "Export mit Vorderseite und zugeschalteter Rückseite"
        : "Export der aktiven Standardseite Vorderseite",
      52,
      140
    );
    targetCtx.restore();
  }

  function drawExportSideCard(targetCtx, config) {
    const sideLabel = getSideLabel(config.sideId);
    const sideState = getSideState(config.sideId);
    const cardRadius = 26;
    const previewX = config.x + config.cardPadding;
    const previewY = config.y + config.cardPadding + 58;
    const summaryY = previewY + config.previewSize + 36;
    const modeLabel = sideState.designMode ? (sideState.designMode === "motif" ? "Motiv" : "Text") : "Leer";

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
    wrapTextToCanvas(targetCtx, getSideSummary(config.sideId), config.x + config.cardPadding, summaryY + 30, config.width - config.cardPadding * 2, 26, 2);
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

    if (isBackSideEnabled()) {
      targetCtx.fillText("Die Rückseite wurde als Zusatzoption aktiviert und ist hier gemeinsam mit der Vorderseite dargestellt.", 52, startY + 78);
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
    return "Anfrage zur Motiv-Vorschau – " + getActiveProduct().name + " " + getActiveSize().label;
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
      "Größe: " + getActiveSize().label,
      "Vorderseite: " + getSideSummary("front"),
      "Rückseite: " + getSideSummary("back")
    ];

    if (pricingHint) {
      lines.push("Preisstruktur: " + pricingHint);
    }

    lines.push("");
    lines.push("Viele Grüße");

    return lines.join("\n");
  }

  function getPricingHint() {
    const priceParts = [getActiveMaterial(), getActiveProductFamily(), getActiveProduct(), getActiveSize()]
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
      slugify(getActiveSize().label)
    ];

    if (isBackSideEnabled()) {
      parts.push("mit-rueckseite");
    } else {
      parts.push("vorderseite");
    }

    if (isMotifMode()) {
      parts.push("motiv");
      if (activeSideState.uploadedImage) {
        parts.push("eigene-datei");
      } else if (getActiveMotifVariant()) {
        parts.push(slugify(getActiveMotifVariant().name));
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

  function hasSizeSelection() {
    return Boolean(state.sizeId);
  }

  function hasDesignModeSelection(sideId) {
    if (sideId === "back" && !isBackSideEnabled()) return false;
    return Boolean(getSideState(sideId).designMode);
  }

  function isConfigurationReady() {
    return hasMaterialSelection() && hasProductSelection() && hasSizeSelection() && hasDesignModeSelection("front");
  }

  function hasActiveMotifContent(sideId) {
    const sideState = getSideState(sideId);
    return Boolean(sideState.uploadedImage || sideState.templateId);
  }

  function hasText(sideId) {
    return getSideState(sideId).textValue.length > 0;
  }

  function isMotifMode(sideId) {
    return getSideState(sideId).designMode === "motif";
  }

  function isTextMode(sideId) {
    return getSideState(sideId).designMode === "text";
  }

  function getSideSummary(sideId) {
    if (sideId === "back" && !isBackSideEnabled()) {
      return "nicht aktiviert";
    }

    const sideState = getSideState(sideId);
    const sideTemplate = getActiveTemplate(sideId);
    const sideVariant = getActiveMotifVariant(sideId);

    if (!sideState.designMode) {
      return sideId === "back" ? "aktiviert, aktuell leer" : "noch nicht gestaltet";
    }

    if (sideState.designMode === "motif") {
      if (sideState.uploadedImage) {
        return "Motiv · Foto / Porträt · " + sideState.uploadedFileName;
      }
      if (sideTemplate) {
        return "Motiv · " + getMotifSourceSummary(sideTemplate, sideVariant, sideId);
      }
      return "Motiv · noch keine Auswahl";
    }

    if (!sideState.textValue) {
      return "Text · leer";
    }

    return "Text · " + sideState.textValue;
  }

  function getMotifSourceSummary(activeTemplate, activeMotifVariant, sideId) {
    const sideState = getSideState(sideId);

    if (sideState.uploadedImage) {
      return "Foto / Porträt mit eigener Datei";
    }

    if (!activeTemplate) {
      return "Noch kein Motiv gewählt";
    }

    if (activeTemplate.category === "animal-paws") {
      return activeMotifVariant ? "Tierpfoten · " + activeMotifVariant.name : "Tierpfoten";
    }

    return activeTemplate.name;
  }

  function getTemplateById(templateId) {
    return TEMPLATE_LIBRARY.find((template) => template.id === templateId) || null;
  }

  function getMotifVariantById(variantId) {
    return MOTIF_VARIANT_LIBRARY.find((variant) => variant.id === variantId) || null;
  }

  function getDefaultMotifVariantId(parentId) {
    const firstVariant = MOTIF_VARIANT_LIBRARY.find((variant) => variant.parentId === parentId);
    return firstVariant ? firstVariant.id : null;
  }

  function getActiveTopLevelTemplateId(sideId) {
    const sideState = getSideState(sideId);

    if (sideState.motifVariantId) {
      const variant = getMotifVariantById(sideState.motifVariantId);
      return variant ? variant.parentId : sideState.templateId;
    }

    return sideState.templateId;
  }

  function getActiveTemplate(sideId) {
    const topLevelTemplateId = getActiveTopLevelTemplateId(sideId);
    return getTemplateById(topLevelTemplateId);
  }

  function getActiveMotifVariant(sideId) {
    const sideState = getSideState(sideId);
    return sideState.motifVariantId ? getMotifVariantById(sideState.motifVariantId) : null;
  }

  function getActiveImage(sideId) {
    const sideState = getSideState(sideId);
    const activeVariant = getActiveMotifVariant(sideId);
    return sideState.uploadedImage || (activeVariant ? activeVariant.image : null) || (getActiveTemplate(sideId) ? getActiveTemplate(sideId).image : null) || null;
  }

  function isPhotoMotifSelected(sideId) {
    const template = getActiveTemplate(sideId);
    return Boolean(template && template.category === "photo");
  }

  function isAnimalPawsSelected(sideId) {
    const template = getActiveTemplate(sideId);
    return Boolean(template && template.category === "animal-paws");
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

  function getActiveSize() {
    const product = getActiveProduct();
    if (!product) return null;
    return product.sizes.find((size) => size.id === state.sizeId) || null;
  }

  function getActiveTextFont(sideId) {
    const sideState = getSideState(sideId);
    return TEXT_FONT_LIBRARY.find((font) => font.id === sideState.textFontId) || TEXT_FONT_LIBRARY[0];
  }

  function getMotifMask() {
    const size = getActiveSize();
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

  function getMotifDrawBox(image) {
    const motifMask = getMotifMask();
    const activeSideState = getActiveSideState();
    const fitScale = Math.max(motifMask.width / image.width, motifMask.height / image.height);
    const scaleFactor = activeSideState.scalePercent / 100;
    return {
      width: image.width * fitScale * scaleFactor,
      height: image.height * fitScale * scaleFactor
    };
  }

  function getTextLayout(text) {
    const motifMask = getMotifMask();
    const activeSideState = getActiveSideState();
    const maxWidth = motifMask.width * 0.82;
    const baseFontSize = Math.max(34, motifMask.width * 0.19);
    let fontSize = baseFontSize * (activeSideState.textScalePercent / 100);
    let metrics = measureText(text, fontSize);

    if (metrics.width > maxWidth) {
      fontSize *= maxWidth / metrics.width;
      metrics = measureText(text, fontSize);
    }

    const safeFontSize = Math.max(22, fontSize);
    if (safeFontSize !== fontSize) {
      metrics = measureText(text, safeFontSize);
      fontSize = safeFontSize;
    }

    return {
      fontSize: fontSize,
      font: buildTextFont(fontSize),
      width: metrics.width,
      height: Math.max(fontSize * 0.92, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
    };
  }

  function buildTextFont(fontSize) {
    const activeSideState = getActiveSideState();
    const font = getActiveTextFont();
    const fontParts = [];

    if (activeSideState.textStyles.italic) {
      fontParts.push("italic");
    }

    fontParts.push(activeSideState.textStyles.bold ? "700" : "600");
    fontParts.push(fontSize + "px");
    fontParts.push(font.family);

    return fontParts.join(" ");
  }

  function getDefaultTextOffsetY() {
    const motifMask = getMotifMask();
    return motifMask ? motifMask.height * 0.22 : 0;
  }

  function measureText(text, fontSize) {
    ctx.save();
    ctx.font = buildTextFont(fontSize);
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
