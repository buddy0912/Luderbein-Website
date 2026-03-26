(function () {
  "use strict";

  const canvas = document.getElementById("previewCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const materialOptionsEl = document.getElementById("materialOptions");
  const productOptionsEl = document.getElementById("productOptions");
  const sizeOptionsEl = document.getElementById("sizeOptions");
  const templateOptionsEl = document.getElementById("templateOptions");
  const uploadInput = document.getElementById("uploadInput");
  const clearUploadButton = document.getElementById("clearUploadButton");
  const resetPlacementButton = document.getElementById("resetPlacementButton");
  const centerPlacementButton = document.getElementById("centerPlacementButton");
  const downloadPreviewButton = document.getElementById("downloadPreviewButton");
  const scaleSlider = document.getElementById("scaleSlider");
  const scaleValueLabel = document.getElementById("scaleValueLabel");
  const previewProductName = document.getElementById("previewProductName");
  const previewProductHint = document.getElementById("previewProductHint");
  const previewSourceLabel = document.getElementById("previewSourceLabel");
  const uploadStatus = document.getElementById("uploadStatus");

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
      imageSrc: "/tools/vorschau/assets/templates/monogramm.svg"
    },
    {
      id: "paw",
      name: "Pfote",
      description: "Klares Symbolmotiv.",
      imageSrc: "/tools/vorschau/assets/templates/pfote.svg"
    },
    {
      id: "portrait",
      name: "Porträt",
      description: "Silhouettenartige Fotowirkung.",
      imageSrc: "/tools/vorschau/assets/templates/portraet.svg"
    },
    {
      id: "emblem",
      name: "Emblem",
      description: "Technische Logo-Anmutung.",
      imageSrc: "/tools/vorschau/assets/templates/emblem.svg"
    }
  ];

  const state = {
    materialId: CATALOG.materials[0].id,
    productId: CATALOG.materials[0].products[0].id,
    sizeId: CATALOG.materials[0].products[0].sizes[2].id,
    templateId: TEMPLATE_LIBRARY[0].id,
    uploadedImage: null,
    uploadedFileName: "",
    scalePercent: 100,
    offsetX: 0,
    offsetY: 0,
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

    uploadInput.addEventListener("change", onUploadChange);
    clearUploadButton.addEventListener("click", clearUploadedImage);
    resetPlacementButton.addEventListener("click", resetPlacement);
    centerPlacementButton.addEventListener("click", centerPlacement);
    downloadPreviewButton.addEventListener("click", downloadPreview);

    document.querySelectorAll("[data-nudge]").forEach((button) => {
      button.addEventListener("click", function () {
        nudgePlacement(button.getAttribute("data-nudge"));
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
          resetPlacement();
        } else {
          syncUi();
          queueRender();
        }
      });

      templateOptionsEl.appendChild(button);
    });
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
          resetPlacement();
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
    resetPlacement();
  }

  function resetPlacement() {
    state.offsetX = 0;
    state.offsetY = 0;
    state.scalePercent = 100;
    scaleSlider.value = String(state.scalePercent);
    syncUi();
    queueRender();
  }

  function centerPlacement() {
    state.offsetX = 0;
    state.offsetY = 0;
    syncUi();
    queueRender();
  }

  function nudgePlacement(direction) {
    const step = 14;

    if (direction === "up") state.offsetY -= step;
    if (direction === "down") state.offsetY += step;
    if (direction === "left") state.offsetX -= step;
    if (direction === "right") state.offsetX += step;

    clampPlacement();
    syncUi();
    queueRender();
  }

  function onCanvasKeydown(event) {
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
    if (!getActiveImage()) return;

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

  function syncUi() {
    const material = getActiveMaterial();
    const product = getActiveProduct();
    const size = getActiveSize();
    const template = getActiveTemplate();
    const sourceText = state.uploadedImage
      ? "Eigene Datei: " + state.uploadedFileName
      : "Vorlage: " + template.name;

    previewProductName.textContent = product.name + " · " + size.label;
    previewProductHint.textContent = material.name + " · " + size.diameterMm + " mm · Motivwirkung frei bis nah an den Rand.";
    previewSourceLabel.textContent = sourceText;
    scaleValueLabel.textContent = state.scalePercent + "%";
    uploadStatus.textContent = state.uploadedImage
      ? "Eigene Datei aktiv: " + state.uploadedFileName + ". Ziehen und Größe anpassen, um die Wirkung grob zu prüfen."
      : "Keine eigene Datei geladen. Aktuell wird die gewählte Vorlage gezeigt.";

    materialOptionsEl.querySelectorAll("[data-material-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-material-id") === state.materialId);
    });

    productOptionsEl.querySelectorAll("[data-product-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-product-id") === state.productId);
    });

    sizeOptionsEl.querySelectorAll("[data-size-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-size-id") === state.sizeId);
    });

    templateOptionsEl.querySelectorAll("[data-template-id]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-template-id") === state.templateId);
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
    const image = getActiveImage();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackdrop();
    drawRoundTagBase(size);
    drawMotifMask(size);

    if (image) {
      drawMotif(size, image);
    } else {
      drawPlaceholder(size);
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
