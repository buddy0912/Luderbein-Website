(() => {
  const JSON_TARGETS = [
    "/assets/reel-werkstatt.json",
    "/assets/reel-holz.json",
    "/assets/reel-metall.json",
    "/assets/reel-glas.json",
    "/assets/reel-acryl.json"
  ];
  const CATS = ["holz", "glas", "schiefer", "metall", "acryl", "schwibbboegen", "custom"];
  const TAGS = ["Material", "Person", "Projekt", "QA"];
  const LS = {
    target: "reelLabeler.target",
    index: "reelLabeler.index"
  };

  const el = {
    jsonTarget: document.getElementById("jsonTarget"),
    btnLoad: document.getElementById("btnLoad"),
    placeholderSetup: document.getElementById("placeholderSetup"),
    placeholderCount: document.getElementById("placeholderCount"),
    fileExt: document.getElementById("fileExt"),
    btnCreatePlaceholders: document.getElementById("btnCreatePlaceholders"),
    status: document.getElementById("status"),
    newRange: document.getElementById("newRange"),
    newProgress: document.getElementById("newProgress"),
    preview: document.getElementById("preview"),
    imgError: document.getElementById("imgError"),
    counter: document.getElementById("counter"),
    cap: document.getElementById("cap"),
    alt: document.getElementById("alt"),
    autoText: document.getElementById("autoText"),
    syncAltCap: document.getElementById("syncAltCap"),
    autoAdvance: document.getElementById("autoAdvance"),
    freeTag: document.getElementById("freeTag"),
    catButtons: document.getElementById("catButtons"),
    tagButtons: document.getElementById("tagButtons"),
    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
    btnNextNew: document.getElementById("btnNextNew"),
    btnCopy: document.getElementById("btnCopy"),
    btnCopyNew: document.getElementById("btnCopyNew"),
    btnDownload: document.getElementById("btnDownload")
  };

  let entries = [];
  let index = 0;
  let newRange = null;

  function text(v) { return String(v ?? "").trim(); }
  function current() { return entries[index] || null; }

  function setStatus(msg, bad = false) {
    el.status.textContent = msg;
    el.status.style.color = bad ? "#ffb4b4" : "";
  }

  function resolvePreviewSrc(rawSrc) {
    const src = text(rawSrc);
    if (!src) return "";
    if (src.startsWith("/")) return src;
    return `/assets/reel/${src.replace(/^\.\//, "")}`;
  }

  function buildButtons(list, root, key) {
    root.innerHTML = "";
    list.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "rl-chip";
      b.textContent = item;
      b.addEventListener("click", () => {
        const cur = current();
        if (!cur) return;
        cur[key] = item;
        if (el.autoText.checked) autoCapAlt();
        render();
        if (el.autoAdvance.checked) {
          if (key === "cat") {
            el.freeTag.focus();
          } else if (key === "tag") {
            if (!text(cur.cap)) {
              el.cap.focus();
            } else if (!text(cur.alt)) {
              el.alt.focus();
            } else {
              goToNextNew();
            }
          }
        }
      });
      root.appendChild(b);
    });
  }

  function updateActiveButtons() {
    const cur = current();
    const cat = text(cur?.cat).toLowerCase();
    const tag = text(cur?.tag);

    [...el.catButtons.children].forEach((b) => {
      b.classList.toggle("is-active", b.textContent.toLowerCase() === cat);
    });
    [...el.tagButtons.children].forEach((b) => {
      b.classList.toggle("is-active", b.textContent === tag);
    });
  }

  function autoCapAlt() {
    const cur = current();
    if (!cur) return;
    const cat = text(cur.cat);
    const tag = text(cur.tag);
    const generated = [tag, cat].filter(Boolean).join(" • ") || `Eintrag ${index + 1}`;
    cur.cap = generated;
    if (el.syncAltCap.checked) cur.alt = generated;
  }

  function onMissingImage(src) {
    el.imgError.hidden = false;
    el.imgError.innerHTML = `Bild nicht gefunden – bitte prüfen: <code>${src || "/assets/reel/reel-XX.webp"}</code>`;
  }

  function isNewEntryDone(item) {
    return Boolean(text(item?.cat) && (text(item?.cap) || text(item?.alt)));
  }

  function renderNewStats() {
    if (!newRange) {
      el.newRange.hidden = true;
      el.newProgress.hidden = true;
      return;
    }
    const startHuman = newRange.start + 1;
    const endHuman = newRange.end + 1;
    el.newRange.hidden = false;
    el.newRange.textContent = `Neu: ${startHuman}–${endHuman}`;

    const total = newRange.end - newRange.start + 1;
    let done = 0;
    for (let i = newRange.start; i <= newRange.end; i += 1) {
      if (isNewEntryDone(entries[i])) done += 1;
    }
    el.newProgress.hidden = false;
    el.newProgress.textContent = `Neu-Einträge: ${done} / ${total} fertig`;
  }

  function render() {
    if (!entries.length) {
      el.counter.textContent = "0 / 0";
      el.preview.removeAttribute("src");
      el.cap.value = "";
      el.alt.value = "";
      renderNewStats();
      return;
    }

    const cur = current();
    el.counter.textContent = `${index + 1} / ${entries.length}`;
    el.preview.alt = text(cur.alt);
    const resolvedSrc = resolvePreviewSrc(cur.src);
    el.preview.src = resolvedSrc;
    el.imgError.hidden = true;

    el.cap.value = text(cur.cap);
    el.alt.value = text(cur.alt);
    el.freeTag.value = TAGS.includes(text(cur.tag)) ? "" : text(cur.tag);

    updateActiveButtons();
    renderNewStats();
    localStorage.setItem(LS.index, String(index));
  }

  async function loadTarget(target) {
    try {
      const res = await fetch(target, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("JSON ist kein Array");
      entries = json;
      index = Math.min(Number(localStorage.getItem(LS.index) || 0), Math.max(0, entries.length - 1));
      newRange = null;
      setStatus(`Geladen: ${target} (${entries.length} Einträge)`);
      render();
    } catch (err) {
      entries = [];
      newRange = null;
      render();
      setStatus(`Fehler beim Laden von ${target}: ${err.message}`, true);
    }
  }

  function updateCurrentFromInputs() {
    const cur = current();
    if (!cur) return;
    cur.cap = el.cap.value;
    cur.alt = el.alt.value;
    const freeTag = text(el.freeTag.value);
    if (freeTag) cur.tag = freeTag;
    updateActiveButtons();
    renderNewStats();
  }

  function createPlaceholders() {
    if (!entries.length) {
      setStatus("Bitte zuerst eine JSON laden.", true);
      return;
    }
    const count = Number(el.placeholderCount.value);
    if (!Number.isInteger(count) || count <= 0) {
      setStatus("Bitte eine gültige Anzahl > 0 eingeben.", true);
      return;
    }

    const ext = [".webp", ".jpg", ".png"].includes(el.fileExt.value) ? el.fileExt.value : ".webp";
    const start = entries.length;

    for (let i = 0; i < count; i += 1) {
      const reelNumber = start + i + 1;
      entries.push({
        src: `/assets/reel/reel-${reelNumber}${ext}`,
        cap: "",
        alt: "",
        tag: "",
        cat: ""
      });
    }

    newRange = { start, end: entries.length - 1 };
    index = newRange.start;
    setStatus(`Leere Einträge angelegt: ${count} (reel-${start + 1} bis reel-${entries.length})`);
    render();
  }

  async function copyAll() {
    const payload = JSON.stringify(entries, null, 2);
    await navigator.clipboard.writeText(payload);
    setStatus("Komplette JSON in Zwischenablage kopiert.");
  }

  async function copyNewOnly() {
    if (!newRange) {
      setStatus("Noch keine neuen Einträge angelegt.", true);
      return;
    }
    const slice = entries.slice(newRange.start, newRange.end + 1);
    await navigator.clipboard.writeText(JSON.stringify(slice, null, 2));
    setStatus(`Nur neue Einträge (${newRange.start + 1}–${newRange.end + 1}) kopiert.`);
  }

  function downloadAll() {
    const payload = JSON.stringify(entries, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = text(el.jsonTarget.value).split("/").pop() || "reel-export.json";
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(`JSON heruntergeladen: ${name}`);
  }

  function goToNextNew() {
    updateCurrentFromInputs();
    if (newRange && index < newRange.end) {
      index += 1;
      render();
      return;
    }
    if (!newRange && index < entries.length - 1) {
      index += 1;
      render();
      return;
    }
    setStatus("Letzter relevanter Eintrag erreicht.");
  }

  function initTargets() {
    JSON_TARGETS.forEach((target) => {
      const o = document.createElement("option");
      o.value = target;
      o.textContent = target;
      el.jsonTarget.appendChild(o);
    });

    const saved = localStorage.getItem(LS.target);
    el.jsonTarget.value = JSON_TARGETS.includes(saved) ? saved : JSON_TARGETS[0];
    el.placeholderSetup.hidden = true;
  }

  el.btnLoad.addEventListener("click", async () => {
    localStorage.setItem(LS.target, el.jsonTarget.value);
    index = 0;
    localStorage.setItem(LS.index, "0");
    await loadTarget(el.jsonTarget.value);
    el.placeholderSetup.hidden = false;
    el.placeholderCount.focus();
  });

  el.jsonTarget.addEventListener("change", () => {
    localStorage.setItem(LS.target, el.jsonTarget.value);
  });

  el.btnCreatePlaceholders.addEventListener("click", createPlaceholders);

  el.preview.addEventListener("error", () => onMissingImage(resolvePreviewSrc(text(current()?.src))));
  el.btnPrev.addEventListener("click", () => { updateCurrentFromInputs(); if (index > 0) index -= 1; render(); });
  el.btnNext.addEventListener("click", () => { updateCurrentFromInputs(); if (index < entries.length - 1) index += 1; render(); });
  el.btnNextNew.addEventListener("click", goToNextNew);

  document.addEventListener("keydown", (ev) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    if (ev.key === "ArrowLeft") el.btnPrev.click();
    if (ev.key === "ArrowRight") el.btnNext.click();
  });

  el.cap.addEventListener("input", updateCurrentFromInputs);
  el.alt.addEventListener("input", updateCurrentFromInputs);
  el.freeTag.addEventListener("input", updateCurrentFromInputs);
  el.autoText.addEventListener("change", () => { if (el.autoText.checked) { autoCapAlt(); render(); } });
  el.syncAltCap.addEventListener("change", () => { if (el.syncAltCap.checked && current()) { current().alt = current().cap || ""; render(); } });

  el.btnCopy.addEventListener("click", async () => {
    try {
      await copyAll();
    } catch {
      setStatus("Kopieren fehlgeschlagen (Zwischenablage blockiert).", true);
    }
  });
  el.btnCopyNew.addEventListener("click", async () => {
    try {
      await copyNewOnly();
    } catch {
      setStatus("Kopieren fehlgeschlagen (Zwischenablage blockiert).", true);
    }
  });
  el.btnDownload.addEventListener("click", downloadAll);

  buildButtons(CATS, el.catButtons, "cat");
  buildButtons(TAGS, el.tagButtons, "tag");
  initTargets();
})();
