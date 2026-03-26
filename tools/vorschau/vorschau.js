(function () {
  "use strict";

  const canvas = document.getElementById("previewCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const materialOptionsEl = document.getElementById("materialOptions");
  const productGroup = document.getElementById("productGroup");
  const productOptionsEl = document.getElementById("productOptions");
  const sizeGroup = document.getElementById("sizeGroup");
  const sizeOptionsEl = document.getElementById("sizeOptions");
  const designModeGroup = document.getElementById("designModeGroup");
  const designModeOptionsEl = document.getElementById("designModeOptions");
  const templateOptionsEl = document.getElementById("templateOptions");
  const motifTemplateGroup = document.getElementById("motifTemplateGroup");
  const motifUploadGroup = document.getElementById("motifUploadGroup");
  const motifAdjustGroup = document.getElementById("motifAdjustGroup");
  const textGroup = document.getElementById("textGroup");
  const uploadInput = document.getElementById("uploadInput");
  const clearUploadButton = document.getElementById("clearUploadButton");
  const clearTextButton = document.getElementById("clearTextButton");
  const resetPlacementButton = document.getElementById("resetPlacementButton");
  const centerPlacementButton = document.getElementById("centerPlacementButton");
  const centerTextButton = document.getElementById("centerTextButton");
  const downloadPreviewButton = document.getElementById("downloadPreviewButton");
  const requestMenuToggle = document.getElementById("requestMenuToggle");
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
  const previewModeLabel = document.getElementById("previewModeLabel");
  const previewSourceLabel = document.getElementById("previewSourceLabel");
  const uploadStatus = document.getElementById("uploadStatus");
  const textInput = document.getElementById("textInput");
  const textCharacterCount = document.getElementById("textCharacterCount");

  const MAX_TEXT_LENGTH = 18;
  const WHATSAPP_NUMBER = "491725925858";
  const REQUEST_EMAIL = "luderbein_gravur@icloud.com";
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
        products: [
          {
            id: "round-tag",
            name: "Rundes Edelstahl-Plättchen",
            description: "Runder Anhänger als erster realer Produkttyp.",
            sizes: [
              { id: "8mm", label: "8 mm", diameterMm: 8, productRadius: 180, engravingRatio: 0.94, ringOuter: 54, ringInner: 26, ringY: 362, lift: 56 },
              { id: "10mm", label: "10 mm", diameterMm: 10, productRadius: 210, engravingRatio: 0.95, ringOuter: 58, ringInner: 28, ringY: 334, lift: 64 },
              { id: "12mm", label: "12 mm", diameterMm: 12, productRadius: 238, engravingRatio: 0.955, ringOuter: 62, ringInner: 30, ringY: 306, lift: 72 },
              { id: "15mm", label: "15 mm", diameterMm: 15, productRadius: 272, engravingRatio: 0.96, ringOuter: 68, ringInner: 32, ringY: 272, lift: 82 },
              { id: "20mm", label: "20 mm", diameterMm: 20, productRadius: 326, engravingRatio: 0.965, ringOuter: 78, ringInner: 38, ringY: 214, lift: 98 }
            ]
          }
        ]
      }
    ]
  };

  const TEMPLATE_LIBRARY = [
    {
      id: "monogram",
      name: "Monogramm",
      description: "Reduziertes Initial-Beispiel.",
      imageSrc: "/assets/tools/vorschau/vorlage-monogramm.png"
    },
    {
      id: "paw",
      name: "Pfote",
      description: "Klares Symbolmotiv.",
      imageSrc: "/assets/tools/vorschau/vorlage-pfote.png"
    },
    {
      id: "portrait",
      name: "Porträt",
      description: "Silhouettenartige Fotowirkung.",
      imageSrc: "/assets/tools/vorschau/vorlage-portraet.png"
    },
    {
      id: "emblem",
      name: "Emblem",
      description: "Technische Logo-Anmutung.",
      imageSrc: "/assets/tools/vorschau/vorlage-emblem.png"
    }
  ];

  const state = createInitialState();
  let renderQueued = false;

  Promise.all(
    TEMPLATE_LIBRARY.map((template) =>
      loadImage(template.imageSrc).then((image) => {
        template.image = image;
      })
    )
  ).then(init);

  function init() {
    renderMaterialOptions();
    renderProductOptions();
    renderSizeOptions();
    renderDesignModeOptions();
    renderTemplateOptions();
    bindEvents();
    syncUi();
    queueRender();
  }

  function bindEvents() {
    scaleSlider.addEventListener("input", function () {
      state.scalePercent = Number(scaleSlider.value);
      syncUi();
      queueRender();
    });

    textSizeSlider.addEventListener("input", function () {
      state.textScalePercent = Number(textSizeSlider.value);
      clampTextPlacement();
      syncUi();
      queueRender();
    });

    textInput.addEventListener("input", function () {
      state.textValue = normalizeTextValue(textInput.value);
      if (textInput.value !== state.textValue) {
        textInput.value = state.textValue;
      }
      clampTextPlacement();
      syncUi();
      queueRender();
    });

    textFontSelect.addEventListener("change", function () {
      state.textFontId = textFontSelect.value;
      clampTextPlacement();
      syncUi();
      queueRender();
    });

    document.querySelectorAll("[data-text-style]").forEach((button) => {
      button.addEventListener("click", function () {
        const styleName = button.getAttribute("data-text-style");
        if (!Object.prototype.hasOwnProperty.call(state.textStyles, styleName)) return;
        state.textStyles[styleName] = !state.textStyles[styleName];
        clampTextPlacement();
        syncUi();
        queueRender();
      });
    });

    uploadInput.addEventListener("change", onUploadChange);
    clearUploadButton.addEventListener("click", clearUploadedImage);
    clearTextButton.addEventListener("click", clearText);
    resetPlacementButton.addEventListener("click", resetAllSelections);
    centerPlacementButton.addEventListener("click", centerPlacement);
    centerTextButton.addEventListener("click", centerTextPlacement);
    downloadPreviewButton.addEventListener("click", downloadPreview);
    requestMenuToggle.addEventListener("click", toggleRequestMenu);
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

  function createInitialState() {
    return {
      materialId: null,
      productId: null,
      sizeId: null,
      designMode: null,
      templateId: null,
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
      textOffsetY: 0,
      isDragging: false,
      dragOrigin: null
    };
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
        if (state.materialId === material.id) return;
        state.materialId = material.id;
        state.productId = null;
        state.sizeId = null;
        state.designMode = null;
        closeRequestMenu();
        renderProductOptions();
        renderSizeOptions();
        syncUi();
        queueRender();
      });

      materialOptionsEl.appendChild(button);
    });
  }

  function renderProductOptions() {
    productOptionsEl.innerHTML = "";

    if (!hasMaterialSelection()) return;

    getActiveMaterial().products.forEach((product) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-product-id", product.id);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(product.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(product.description) + "</span>";

      button.addEventListener("click", function () {
        if (state.productId === product.id) return;
        state.productId = product.id;
        state.sizeId = null;
        state.designMode = null;
        closeRequestMenu();
        renderSizeOptions();
        syncUi();
        queueRender();
      });

      productOptionsEl.appendChild(button);
    });
  }

  function renderSizeOptions() {
    sizeOptionsEl.innerHTML = "";

    if (!hasProductSelection()) return;

    getActiveProduct().sizes.forEach((size) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-size-chip";
      button.setAttribute("data-size-id", size.id);
      button.textContent = size.label;

      button.addEventListener("click", function () {
        if (state.sizeId === size.id) return;
        state.sizeId = size.id;
        state.designMode = null;
        closeRequestMenu();
        resetImagePlacement(false);
        resetTextPlacement(false);
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
        '<span class="preview-option__thumb"><img src="' + template.imageSrc + '" alt=""></span>' +
        '<span class="preview-option__title">' + escapeHtml(template.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(template.description) + "</span>";

      button.addEventListener("click", function () {
        state.templateId = template.id;
        if (!state.uploadedImage) {
          resetImagePlacement(false);
        }
        syncUi();
        queueRender();
      });

      templateOptionsEl.appendChild(button);
    });
  }

  function setDesignMode(modeId) {
    if (!hasSizeSelection()) return;
    if (!MODE_LIBRARY.some((mode) => mode.id === modeId)) return;
    state.designMode = modeId;
    closeRequestMenu();
    syncUi();
    queueRender();
  }

  function onUploadChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      loadImage(String(reader.result))
        .then((image) => {
          state.uploadedImage = image;
          state.uploadedFileName = file.name;
          resetImagePlacement(false);
          syncUi();
          queueRender();
        })
        .catch(() => {
          uploadStatus.textContent = "Die Datei konnte nicht geladen werden. Bitte ein anderes Bild versuchen.";
        });
    };

    reader.readAsDataURL(file);
  }

  function clearUploadedImage() {
    state.uploadedImage = null;
    state.uploadedFileName = "";
    uploadInput.value = "";
    resetImagePlacement(false);
    syncUi();
    queueRender();
  }

  function clearText() {
    state.textValue = "";
    textInput.value = "";
    state.textScalePercent = 100;
    textSizeSlider.value = "100";
    state.textFontId = TEXT_FONT_LIBRARY[0].id;
    textFontSelect.value = state.textFontId;
    state.textStyles.bold = false;
    state.textStyles.italic = false;
    state.textStyles.underline = false;
    state.textStyles.strikethrough = false;
    resetTextPlacement(false);
    syncUi();
    queueRender();
  }

  function resetImagePlacement(shouldRender) {
    state.scalePercent = 100;
    state.offsetX = 0;
    state.offsetY = 0;
    scaleSlider.value = "100";
    clampPlacement();

    if (shouldRender !== false) {
      syncUi();
      queueRender();
    }
  }

  function resetTextPlacement(shouldRender) {
    state.textScalePercent = 100;
    textSizeSlider.value = "100";
    state.textOffsetX = 0;
    state.textOffsetY = getDefaultTextOffsetY();
    clampTextPlacement();

    if (shouldRender !== false) {
      syncUi();
      queueRender();
    }
  }

  function centerPlacement() {
    state.offsetX = 0;
    state.offsetY = 0;
    syncUi();
    queueRender();
  }

  function centerTextPlacement() {
    state.textOffsetX = 0;
    state.textOffsetY = getDefaultTextOffsetY();
    clampTextPlacement();
    syncUi();
    queueRender();
  }

  function nudgePlacement(direction) {
    if (!isMotifMode() || !hasActiveMotifContent()) return;

    const step = 14;

    if (direction === "up") state.offsetY -= step;
    if (direction === "down") state.offsetY += step;
    if (direction === "left") state.offsetX -= step;
    if (direction === "right") state.offsetX += step;

    clampPlacement();
    syncUi();
    queueRender();
  }

  function nudgeTextPlacement(direction) {
    if (!isTextMode() || !hasText()) return;

    const step = 14;

    if (direction === "up") state.textOffsetY -= step;
    if (direction === "down") state.textOffsetY += step;
    if (direction === "left") state.textOffsetX -= step;
    if (direction === "right") state.textOffsetX += step;

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
    if (event.target === requestMenuToggle || requestMenuToggle.contains(event.target)) return;
    if (requestMenuPanel.contains(event.target)) return;
    closeRequestMenu();
  }

  function onDocumentKeydown(event) {
    if (event.key === "Escape") {
      closeRequestMenu();
    }
  }

  function toggleRequestMenu() {
    if (requestMenuToggle.disabled) return;
    setRequestMenuOpen(requestMenuPanel.hidden);
  }

  function closeRequestMenu() {
    setRequestMenuOpen(false);
  }

  function setRequestMenuOpen(isOpen) {
    requestMenuPanel.hidden = !isOpen;
    requestMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function onPointerDown(event) {
    if (!isMotifMode() || !hasActiveMotifContent()) return;

    canvas.setPointerCapture(event.pointerId);
    state.isDragging = true;
    state.dragOrigin = {
      x: event.clientX,
      y: event.clientY,
      offsetX: state.offsetX,
      offsetY: state.offsetY
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

    state.offsetX = state.dragOrigin.offsetX + deltaX;
    state.offsetY = state.dragOrigin.offsetY + deltaY;
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

    const drawBox = getMotifDrawBox(image);
    const maxOffsetX = Math.max((drawBox.width - motifMask.width) * 0.52, motifMask.width * 0.2);
    const maxOffsetY = Math.max((drawBox.height - motifMask.height) * 0.52, motifMask.height * 0.2);

    state.offsetX = clamp(state.offsetX, -maxOffsetX, maxOffsetX);
    state.offsetY = clamp(state.offsetY, -maxOffsetY, maxOffsetY);
  }

  function clampTextPlacement() {
    const motifMask = getMotifMask();
    if (!motifMask) {
      state.textOffsetX = 0;
      state.textOffsetY = 0;
      return;
    }

    if (!hasText()) {
      state.textOffsetX = 0;
      state.textOffsetY = getDefaultTextOffsetY();
      return;
    }

    const textLayout = getTextLayout(state.textValue);
    const safeHalfWidth = Math.max(motifMask.width * 0.08, (motifMask.width - textLayout.width) / 2);
    const safeHalfHeight = Math.max(motifMask.height * 0.12, (motifMask.height - textLayout.height) / 2);
    const maxOffsetX = Math.max(0, safeHalfWidth);
    const defaultOffsetY = getDefaultTextOffsetY();
    const minOffsetY = -safeHalfHeight;
    const maxOffsetY = safeHalfHeight;

    state.textOffsetX = clamp(state.textOffsetX, -maxOffsetX, maxOffsetX);
    state.textOffsetY = clamp(state.textOffsetY, Math.min(defaultOffsetY, minOffsetY), maxOffsetY);
  }

  function syncUi() {
    const activeMaterial = getActiveMaterial();
    const activeProduct = getActiveProduct();
    const activeSize = getActiveSize();
    const activeTemplate = getActiveTemplate();
    const readyForDesign = hasSizeSelection();
    const readyForExport = isConfigurationReady();
    const sourceText = getActiveSourceLabel(activeTemplate);

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
      previewProductHint.textContent = "Wähle jetzt, ob du mit Motiv oder mit Text arbeiten möchtest.";
      previewModeChip.textContent = "Schritt 4";
    } else {
      previewProductName.textContent = activeProduct.name + " · " + activeSize.label;
      previewProductHint.textContent = activeMaterial.name + " · " + activeSize.diameterMm + " mm · Motivwirkung frei bis nah an den Rand.";
      previewModeChip.textContent = isMotifMode() ? "Motivmodus" : "Textmodus";
    }

    previewModeLabel.textContent = hasDesignModeSelection() ? (isMotifMode() ? "Motiv" : "Text") : "Noch offen";
    previewSourceLabel.textContent = sourceText;
    scaleValueLabel.textContent = state.scalePercent + "%";
    textSizeValueLabel.textContent = state.textScalePercent + "%";
    textCharacterCount.textContent = state.textValue.length + " / " + MAX_TEXT_LENGTH;
    textInput.value = state.textValue;
    textFontSelect.value = state.textFontId;
    uploadStatus.textContent = state.uploadedImage
      ? "Eigene Datei aktiv: " + state.uploadedFileName + ". Ziehen und Größe anpassen, um die Wirkung grob zu prüfen."
      : "Keine eigene Datei geladen. Aktuell wird die gewählte Vorlage gezeigt.";

    requestWhatsappLink.href = readyForExport ? buildWhatsappUrl() : "#";
    requestEmailLink.href = readyForExport ? buildMailtoUrl() : "#";
    downloadPreviewButton.disabled = !readyForExport;
    requestMenuToggle.disabled = !readyForExport;
    if (!readyForExport) {
      closeRequestMenu();
    }

    setSectionVisibility(productGroup, hasMaterialSelection());
    setSectionVisibility(sizeGroup, hasProductSelection());
    setSectionVisibility(designModeGroup, readyForDesign);
    setSectionVisibility(motifTemplateGroup, isMotifMode());
    setSectionVisibility(motifUploadGroup, isMotifMode());
    setSectionVisibility(motifAdjustGroup, isMotifMode() && hasActiveMotifContent());
    setSectionVisibility(textGroup, isTextMode());

    materialOptionsEl.querySelectorAll("[data-material-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-material-id") === state.materialId);
    });

    productOptionsEl.querySelectorAll("[data-product-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-product-id") === state.productId);
    });

    sizeOptionsEl.querySelectorAll("[data-size-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-size-id") === state.sizeId);
    });

    designModeOptionsEl.querySelectorAll("[data-design-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-design-mode") === state.designMode);
    });

    templateOptionsEl.querySelectorAll("[data-template-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-template-id") === state.templateId);
    });

    document.querySelectorAll("[data-text-style]").forEach((button) => {
      const styleName = button.getAttribute("data-text-style");
      const isActive = Boolean(state.textStyles[styleName]);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function getActiveSourceLabel(activeTemplate) {
    if (!hasMaterialSelection()) return "Noch keine Auswahl";
    if (!hasProductSelection()) return "Als Nächstes: Produkt wählen";
    if (!hasSizeSelection()) return "Als Nächstes: Größe wählen";
    if (!hasDesignModeSelection()) return "Als Nächstes: Gestaltungsart wählen";

    if (isMotifMode()) {
      if (state.uploadedImage) {
        return "Eigene Datei: " + state.uploadedFileName;
      }
      if (activeTemplate) {
        return "Vorlage: " + activeTemplate.name;
      }
      return "Noch kein Motiv gewählt";
    }

    return hasText() ? "Text: " + state.textValue : "Noch kein Text eingegeben";
  }

  function setSectionVisibility(section, isVisible) {
    section.hidden = !isVisible;
    section.querySelectorAll("input, button, select, textarea").forEach((element) => {
      element.disabled = !isVisible;
    });
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
      drawMotifPrompt("4. Gestaltungsart wählen", "Danach wird der passende Bearbeitungsbereich freigeschaltet.");
      drawProductHighlights(size);
      drawPreviewLabels(material, product, size);
      return;
    }

    if (isMotifMode()) {
      const image = getActiveImage();
      if (image) {
        drawMotif(size, image);
      } else {
        drawMotifPrompt("Vorlage wählen oder Bild laden", "Wähle eine Vorlage oder lade eine eigene Datei hoch.");
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
    for (let i = 0; i < 18; i += 1) {
      const y = 86 + i * 58;
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
    for (let i = 0; i < 40; i += 1) {
      const y = centerY - radius + i * ((radius * 2) / 40);
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
    drawRoundedRectPath(
      ctx,
      x - 34,
      y + size.ringInner - 4,
      68,
      size.lift,
      34
    );
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
    const x = motifMask.x + motifMask.width / 2 - drawBox.width / 2 + state.offsetX;
    const y = motifMask.y + motifMask.height / 2 - drawBox.height / 2 + state.offsetY;

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
    for (let i = 0; i < 18; i += 1) {
      const lineY = motifMask.y + 8 + i * (motifMask.height / 18);
      ctx.beginPath();
      ctx.moveTo(motifMask.x - 18, lineY);
      ctx.lineTo(motifMask.x + motifMask.width + 18, lineY - 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawTextOverlay(size) {
    const motifMask = getMotifMask();
    const textLayout = getTextLayout(state.textValue);
    const x = motifMask.x + motifMask.width / 2 + state.textOffsetX;
    const y = motifMask.y + motifMask.height / 2 + state.textOffsetY;
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
    ctx.strokeText(state.textValue, x, y);

    ctx.fillStyle = "rgba(22, 24, 28, 0.84)";
    ctx.fillText(state.textValue, x, y);

    if (state.textStyles.underline || state.textStyles.strikethrough) {
      ctx.strokeStyle = "rgba(22, 24, 28, 0.84)";
      ctx.lineWidth = decorationLineWidth;
      ctx.lineCap = "round";

      if (state.textStyles.underline) {
        const underlineY = y + textLayout.height * 0.34;
        ctx.beginPath();
        ctx.moveTo(x - textLayout.width / 2, underlineY);
        ctx.lineTo(x + textLayout.width / 2, underlineY);
        ctx.stroke();
      }

      if (state.textStyles.strikethrough) {
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
      }, "image/png");
      return;
    }

    triggerDownload(exportCanvas.toDataURL("image/png"), filename, false);
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
    const exportCanvas = document.createElement("canvas");
    const exportCtx = exportCanvas.getContext("2d");
    const infoHeight = 332;

    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height + infoHeight;

    exportCtx.fillStyle = "#09080b";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(canvas, 0, 0);

    drawExportInfoPanel(exportCtx, canvas.height, exportCanvas.width, infoHeight);

    return exportCanvas;
  }

  function drawExportInfoPanel(targetCtx, startY, width, height) {
    const primaryFields = [
      { label: "Material", value: getActiveMaterial().name },
      { label: "Produkt", value: getActiveProduct().name },
      { label: "Größe", value: getActiveSize().label },
      { label: "Gestaltungsart", value: isMotifMode() ? "Motiv" : "Text" }
    ];
    const modeFields = isMotifMode() ? getMotifExportFields() : getTextExportFields();
    const topPadding = 34;
    const panelY = startY;
    const leftX = 52;
    const rightX = width / 2 + 14;
    const columnWidth = width / 2 - 66;

    targetCtx.save();

    const panelGradient = targetCtx.createLinearGradient(0, panelY, 0, panelY + height);
    panelGradient.addColorStop(0, "#111015");
    panelGradient.addColorStop(1, "#0b0a0e");
    targetCtx.fillStyle = panelGradient;
    targetCtx.fillRect(0, panelY, width, height);

    targetCtx.fillStyle = "rgba(255,255,255,0.06)";
    targetCtx.fillRect(0, panelY, width, 1);

    targetCtx.fillStyle = "rgba(255,255,255,0.03)";
    targetCtx.fillRect(width / 2, panelY + 26, 1, height - 52);

    targetCtx.fillStyle = "rgba(219,16,33,0.18)";
    targetCtx.fillRect(0, panelY, width, 8);

    targetCtx.fillStyle = "#f5f3f1";
    targetCtx.font = "700 34px system-ui, sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.fillText("Luderbein Vorschau", leftX, panelY + topPadding);

    targetCtx.fillStyle = "rgba(210,207,206,0.74)";
    targetCtx.font = "500 20px system-ui, sans-serif";
    targetCtx.fillText("Unverbindliche Orientierung mit den aktuell gewählten Daten", leftX, panelY + topPadding + 34);

    drawExportFieldColumn(targetCtx, primaryFields, leftX, panelY + 104, columnWidth);
    drawExportFieldColumn(targetCtx, modeFields, rightX, panelY + 104, columnWidth);

    targetCtx.fillStyle = "rgba(210,207,206,0.70)";
    targetCtx.font = "500 18px system-ui, sans-serif";
    targetCtx.fillText("Finale technische Ausarbeitung und Produktionsdetails erfolgen vor Fertigung durch Luderbein.", leftX, panelY + height - 34);

    targetCtx.restore();
  }

  function drawExportFieldColumn(targetCtx, fields, x, startY, maxWidth) {
    let y = startY;

    fields.forEach((field) => {
      const label = field.label + ":";
      const valueLines = wrapText(targetCtx, field.value || "—", maxWidth, "600 22px system-ui, sans-serif");

      targetCtx.fillStyle = "rgba(210,207,206,0.62)";
      targetCtx.font = "600 16px system-ui, sans-serif";
      targetCtx.fillText(label, x, y);
      y += 24;

      targetCtx.fillStyle = "#f5f3f1";
      targetCtx.font = "600 22px system-ui, sans-serif";
      valueLines.forEach((line) => {
        targetCtx.fillText(line, x, y);
        y += 30;
      });

      y += 14;
    });
  }

  function wrapText(targetCtx, text, maxWidth, font) {
    const normalized = String(text || "—").trim();
    const words = normalized.split(/\s+/);
    const lines = [];
    let currentLine = "";

    targetCtx.save();
    targetCtx.font = font;

    words.forEach((word) => {
      const candidate = currentLine ? currentLine + " " + word : word;
      if (targetCtx.measureText(candidate).width <= maxWidth || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    targetCtx.restore();

    return lines.slice(0, 3).map((line, index, allLines) => {
      if (index !== 2 || allLines.length <= 3) return line;
      return truncateToWidth(targetCtx, line, maxWidth, font);
    });
  }

  function truncateToWidth(targetCtx, text, maxWidth, font) {
    let output = text;

    targetCtx.save();
    targetCtx.font = font;

    while (output.length > 1 && targetCtx.measureText(output + " …").width > maxWidth) {
      output = output.slice(0, -1).trimEnd();
    }

    targetCtx.restore();
    return output + " …";
  }

  function getMotifExportFields() {
    return [
      {
        label: "Motivquelle",
        value: state.uploadedImage ? "Eigene Datei" : (getActiveTemplate() ? getActiveTemplate().name : "Noch kein Motiv gewählt")
      },
      {
        label: "Datei",
        value: state.uploadedImage ? state.uploadedFileName : (getActiveTemplate() ? "Vorlage aus dem Vorschau-Tool" : "—")
      }
    ];
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
    const lines = [
      "Hallo Luderbein,",
      "",
      "ich habe eine Anfrage zur Motiv-Vorschau. Hier sind die ersten Infos:",
      "",
      "Material: " + getActiveMaterial().name,
      "Produkt: " + getActiveProduct().name,
      "Größe: " + getActiveSize().label,
      "Gestaltungsart: " + (isMotifMode() ? "Motiv" : "Text")
    ];

    if (isMotifMode()) {
      lines.push("Motivquelle: " + (state.uploadedImage ? "Eigene Datei verwendet" : (getActiveTemplate() ? "Vorlage " + getActiveTemplate().name : "Noch kein Motiv gewählt")));
      if (state.uploadedImage) {
        lines.push("Datei: " + state.uploadedFileName);
      }
    } else {
      lines.push("Textinhalt: " + (hasText() ? state.textValue : "Noch kein Text eingegeben"));
      lines.push("Schriftart: " + getActiveTextFont().label);
      lines.push("Textstile: " + (getActiveTextStyleLabels().join(", ") || "Standard"));
      lines.push("Textgröße: " + state.textScalePercent + "%");
    }

    lines.push("");
    lines.push("Viele Grüße");

    return lines.join("\n");
  }

  function getTextExportFields() {
    return [
      {
        label: "Textinhalt",
        value: hasText() ? state.textValue : "Kein Text eingegeben"
      },
      {
        label: "Schriftart",
        value: getActiveTextFont().label
      },
      {
        label: "Textstil",
        value: getActiveTextStyleLabels().join(", ") || "Standard"
      }
    ];
  }

  function getActiveTextStyleLabels() {
    const labels = [];

    if (state.textStyles.bold) labels.push("Fett");
    if (state.textStyles.italic) labels.push("Kursiv");
    if (state.textStyles.underline) labels.push("Unterstrichen");
    if (state.textStyles.strikethrough) labels.push("Durchgestrichen");

    return labels;
  }

  function buildExportFilename() {
    const parts = [
      "luderbein-vorschau",
      slugify(getActiveMaterial().name),
      slugify(getActiveProduct().name),
      slugify(getActiveSize().label),
      isMotifMode() ? "motiv" : "text"
    ];

    if (isMotifMode()) {
      parts.push(state.uploadedImage ? "eigene-datei" : (getActiveTemplate() ? slugify(getActiveTemplate().name) : "ohne-motiv"));
    } else if (hasText()) {
      parts.push(slugify(state.textValue).slice(0, 28));
    }

    return parts.filter(Boolean).join("-") + ".png";
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

  function hasDesignModeSelection() {
    return Boolean(state.designMode);
  }

  function isConfigurationReady() {
    return hasMaterialSelection() && hasProductSelection() && hasSizeSelection() && hasDesignModeSelection();
  }

  function hasActiveMotifContent() {
    return Boolean(state.uploadedImage || state.templateId);
  }

  function getActiveMaterial() {
    return CATALOG.materials.find((material) => material.id === state.materialId) || null;
  }

  function getActiveProduct() {
    const material = getActiveMaterial();
    if (!material) return null;
    return material.products.find((product) => product.id === state.productId) || null;
  }

  function getActiveSize() {
    const product = getActiveProduct();
    if (!product) return null;
    return product.sizes.find((size) => size.id === state.sizeId) || null;
  }

  function getActiveTemplate() {
    return TEMPLATE_LIBRARY.find((template) => template.id === state.templateId) || null;
  }

  function getActiveImage() {
    return state.uploadedImage || (getActiveTemplate() ? getActiveTemplate().image : null) || null;
  }

  function getActiveTextFont() {
    return TEXT_FONT_LIBRARY.find((font) => font.id === state.textFontId) || TEXT_FONT_LIBRARY[0];
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
    const fitScale = Math.max(motifMask.width / image.width, motifMask.height / image.height);
    const scaleFactor = state.scalePercent / 100;
    return {
      width: image.width * fitScale * scaleFactor,
      height: image.height * fitScale * scaleFactor
    };
  }

  function getTextLayout(text) {
    const motifMask = getMotifMask();
    const maxWidth = motifMask.width * 0.82;
    const baseFontSize = Math.max(34, motifMask.width * 0.19);
    let fontSize = baseFontSize * (state.textScalePercent / 100);
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
    const font = getActiveTextFont();
    const fontParts = [];

    if (state.textStyles.italic) {
      fontParts.push("italic");
    }

    fontParts.push(state.textStyles.bold ? "700" : "600");
    fontParts.push(fontSize + "px");
    fontParts.push(font.family);

    return fontParts.join(" ");
  }

  function getDefaultTextOffsetY() {
    const motifMask = getMotifMask();
    return motifMask ? motifMask.height * 0.22 : 0;
  }

  function hasText() {
    return state.textValue.length > 0;
  }

  function isMotifMode() {
    return state.designMode === "motif";
  }

  function isTextMode() {
    return state.designMode === "text";
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
