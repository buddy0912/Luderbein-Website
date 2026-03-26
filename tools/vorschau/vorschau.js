(function () {
  "use strict";

  const canvas = document.getElementById("previewCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const materialOptionsEl = document.getElementById("materialOptions");
  const productOptionsEl = document.getElementById("productOptions");
  const sizeOptionsEl = document.getElementById("sizeOptions");
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
  const scaleSlider = document.getElementById("scaleSlider");
  const textSizeSlider = document.getElementById("textSizeSlider");
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

  const state = {
    materialId: CATALOG.materials[0].id,
    productId: CATALOG.materials[0].products[0].id,
    sizeId: CATALOG.materials[0].products[0].sizes[2].id,
    designMode: MODE_LIBRARY[0].id,
    templateId: TEMPLATE_LIBRARY[0].id,
    uploadedImage: null,
    uploadedFileName: "",
    scalePercent: 100,
    offsetX: 0,
    offsetY: 0,
    textValue: "",
    textScalePercent: 100,
    textOffsetX: 0,
    textOffsetY: 130,
    isDragging: false,
    dragOrigin: null
  };

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

    uploadInput.addEventListener("change", onUploadChange);
    clearUploadButton.addEventListener("click", clearUploadedImage);
    clearTextButton.addEventListener("click", clearText);
    resetPlacementButton.addEventListener("click", resetPlacement);
    centerPlacementButton.addEventListener("click", centerPlacement);
    centerTextButton.addEventListener("click", centerTextPlacement);
    downloadPreviewButton.addEventListener("click", downloadPreview);

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
    canvas.tabIndex = 0;
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
        state.materialId = material.id;
        const firstProduct = material.products[0];
        state.productId = firstProduct.id;
        state.sizeId = firstProduct.sizes[0].id;
        resetPlacement();
        renderProductOptions();
        renderSizeOptions();
      });

      materialOptionsEl.appendChild(button);
    });
  }

  function renderProductOptions() {
    productOptionsEl.innerHTML = "";

    getActiveMaterial().products.forEach((product) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-option";
      button.setAttribute("data-product-id", product.id);
      button.innerHTML =
        '<span class="preview-option__title">' + escapeHtml(product.name) + "</span>" +
        '<span class="preview-option__meta">' + escapeHtml(product.description) + "</span>";

      button.addEventListener("click", function () {
        state.productId = product.id;
        state.sizeId = product.sizes[0].id;
        renderSizeOptions();
        resetPlacement();
      });

      productOptionsEl.appendChild(button);
    });
  }

  function renderSizeOptions() {
    sizeOptionsEl.innerHTML = "";

    getActiveProduct().sizes.forEach((size) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preview-size-chip";
      button.setAttribute("data-size-id", size.id);
      button.textContent = size.label;

      button.addEventListener("click", function () {
        state.sizeId = size.id;
        resetPlacement();
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
          resetImagePlacement();
        } else {
          syncUi();
          queueRender();
        }
      });

      templateOptionsEl.appendChild(button);
    });
  }

  function setDesignMode(modeId) {
    if (!MODE_LIBRARY.some((mode) => mode.id === modeId)) return;
    state.designMode = modeId;
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
          resetImagePlacement();
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
    resetImagePlacement();
  }

  function clearText() {
    state.textValue = "";
    textInput.value = "";
    state.textScalePercent = 100;
    textSizeSlider.value = String(state.textScalePercent);
    state.textOffsetX = 0;
    state.textOffsetY = getDefaultTextOffsetY();
    syncUi();
    queueRender();
  }

  function resetPlacement() {
    if (isMotifMode()) {
      resetImagePlacement();
      return;
    }

    resetTextPlacement();
  }

  function resetImagePlacement(shouldRender) {
    state.offsetX = 0;
    state.offsetY = 0;
    state.scalePercent = 100;
    scaleSlider.value = String(state.scalePercent);
    clampPlacement();

    if (shouldRender !== false) {
      syncUi();
      queueRender();
    }
  }

  function resetTextPlacement(shouldRender) {
    state.textScalePercent = 100;
    textSizeSlider.value = String(state.textScalePercent);
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
    if (!isMotifMode()) return;

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
    if (!isMotifMode()) return;

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

  function onPointerDown(event) {
    if (!isMotifMode() || !getActiveImage()) return;

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
    if (!image) return;

    const motifMask = getMotifMask();
    const drawBox = getMotifDrawBox(image);
    const maxOffsetX = Math.max((drawBox.width - motifMask.width) * 0.52, motifMask.width * 0.2);
    const maxOffsetY = Math.max((drawBox.height - motifMask.height) * 0.52, motifMask.height * 0.2);

    state.offsetX = clamp(state.offsetX, -maxOffsetX, maxOffsetX);
    state.offsetY = clamp(state.offsetY, -maxOffsetY, maxOffsetY);
  }

  function clampTextPlacement() {
    if (!hasText()) {
      state.textOffsetX = 0;
      state.textOffsetY = getDefaultTextOffsetY();
      return;
    }

    const motifMask = getMotifMask();
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
    const material = getActiveMaterial();
    const product = getActiveProduct();
    const size = getActiveSize();
    const template = getActiveTemplate();
    const modeName = isMotifMode() ? "Motiv" : "Text";
    const sourceText = isMotifMode()
      ? (state.uploadedImage ? "Eigene Datei: " + state.uploadedFileName : "Vorlage: " + template.name)
      : (hasText() ? "Text: " + state.textValue : "Noch kein Text eingegeben");

    previewProductName.textContent = product.name + " · " + size.label;
    previewProductHint.textContent = material.name + " · " + size.diameterMm + " mm · Motivwirkung frei bis nah an den Rand.";
    previewModeChip.textContent = modeName + "modus";
    previewModeLabel.textContent = modeName;
    previewSourceLabel.textContent = sourceText;
    scaleValueLabel.textContent = state.scalePercent + "%";
    textSizeValueLabel.textContent = state.textScalePercent + "%";
    textCharacterCount.textContent = state.textValue.length + " / " + MAX_TEXT_LENGTH;
    textInput.value = state.textValue;
    uploadStatus.textContent = state.uploadedImage
      ? "Eigene Datei aktiv: " + state.uploadedFileName + ". Ziehen und Größe anpassen, um die Wirkung grob zu prüfen."
      : "Keine eigene Datei geladen. Aktuell wird die gewählte Vorlage gezeigt.";
    resetPlacementButton.textContent = isMotifMode() ? "Bild zurücksetzen" : "Text zurücksetzen";

    setSectionVisibility(motifTemplateGroup, isMotifMode());
    setSectionVisibility(motifUploadGroup, isMotifMode());
    setSectionVisibility(motifAdjustGroup, isMotifMode());
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
    const material = getActiveMaterial();
    const product = getActiveProduct();
    const size = getActiveSize();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackdrop();
    drawRoundTagBase(size);
    drawMotifMask(size);

    if (isMotifMode()) {
      const image = getActiveImage();

      if (image) {
        drawMotif(size, image);
      } else {
        drawPlaceholder(size);
      }
    }

    if (isTextMode() && hasText()) {
      drawTextOverlay(size);
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

    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(x, y + textLayout.height * 0.18, textLayout.width * 0.46, Math.max(10, textLayout.height * 0.18), 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();

    ctx.restore();
  }

  function drawPlaceholder(size) {
    const motifMask = getMotifMask();

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 650, motifMask.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(motifMask.x, motifMask.y, motifMask.width, motifMask.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(14,16,18,0.42)";
    ctx.font = "600 36px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Motivvorschau", 600, 640);
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillStyle = "rgba(14,16,18,0.28)";
    ctx.fillText(size.label + " Edelstahl", 600, 684);
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
    const filename = "luderbein-vorschau-" + state.materialId + "-" + state.productId + "-" + state.sizeId + ".png";

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        triggerDownload(url, filename, true);
      }, "image/png");
      return;
    }

    triggerDownload(canvas.toDataURL("image/png"), filename, false);
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

  function getActiveMaterial() {
    return CATALOG.materials.find((material) => material.id === state.materialId) || CATALOG.materials[0];
  }

  function getActiveProduct() {
    const material = getActiveMaterial();
    return material.products.find((product) => product.id === state.productId) || material.products[0];
  }

  function getActiveSize() {
    const product = getActiveProduct();
    return product.sizes.find((size) => size.id === state.sizeId) || product.sizes[0];
  }

  function getActiveTemplate() {
    return TEMPLATE_LIBRARY.find((template) => template.id === state.templateId) || TEMPLATE_LIBRARY[0];
  }

  function getActiveImage() {
    return state.uploadedImage || getActiveTemplate().image || null;
  }

  function getMotifMask() {
    const size = getActiveSize();
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
      font: "600 " + fontSize + "px system-ui, sans-serif",
      width: metrics.width,
      height: Math.max(fontSize * 0.92, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
    };
  }

  function getDefaultTextOffsetY() {
    return getMotifMask().height * 0.22;
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
    ctx.font = "600 " + fontSize + "px system-ui, sans-serif";
    const metrics = ctx.measureText(text);
    ctx.restore();
    return metrics;
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
