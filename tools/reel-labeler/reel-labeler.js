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
    status: document.getElementById("status"),
    preview: document.getElementById("preview"),
    imgError: document.getElementById("imgError"),
    counter: document.getElementById("counter"),
    cap: document.getElementById("cap"),
    alt: document.getElementById("alt"),
    autoText: document.getElementById("autoText"),
    syncAltCap: document.getElementById("syncAltCap"),
    freeTag: document.getElementById("freeTag"),
    catButtons: document.getElementById("catButtons"),
    tagButtons: document.getElementById("tagButtons"),
    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
    btnCopy: document.getElementById("btnCopy"),
    btnDownload: document.getElementById("btnDownload")
  };

  let entries = [];
  let index = 0;

  function text(v) { return String(v ?? "").trim(); }
  function current() { return entries[index] || null; }

  function setStatus(msg, bad = false) {
    el.status.textContent = msg;
    el.status.style.color = bad ? "#ffb4b4" : "";
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
    el.imgError.innerHTML = `Bild fehlt oder lädt nicht: <code>${src || "(leer)"}</code>`;
  }

  function render() {
    if (!entries.length) {
      el.counter.textContent = "0 / 0";
      el.preview.removeAttribute("src");
      el.cap.value = "";
      el.alt.value = "";
      return;
    }

    const cur = current();
    el.counter.textContent = `${index + 1} / ${entries.length}`;
    el.preview.alt = text(cur.alt);
    el.preview.src = text(cur.src);
    el.imgError.hidden = true;

    el.cap.value = text(cur.cap);
    el.alt.value = text(cur.alt);
    el.freeTag.value = TAGS.includes(text(cur.tag)) ? "" : text(cur.tag);

    updateActiveButtons();
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
      setStatus(`Geladen: ${target} (${entries.length} Einträge)`);
      render();
    } catch (err) {
      entries = [];
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
  }

  async function copyAll() {
    const payload = JSON.stringify(entries, null, 2);
    await navigator.clipboard.writeText(payload);
    setStatus("Komplette JSON in Zwischenablage kopiert.");
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

  function initTargets() {
    JSON_TARGETS.forEach((target) => {
      const o = document.createElement("option");
      o.value = target;
      o.textContent = target;
      el.jsonTarget.appendChild(o);
    });

    const saved = localStorage.getItem(LS.target);
    el.jsonTarget.value = JSON_TARGETS.includes(saved) ? saved : JSON_TARGETS[0];
    loadTarget(el.jsonTarget.value);
  }

  el.jsonTarget.addEventListener("change", () => {
    localStorage.setItem(LS.target, el.jsonTarget.value);
    index = 0;
    localStorage.setItem(LS.index, "0");
    loadTarget(el.jsonTarget.value);
  });

  el.preview.addEventListener("error", () => onMissingImage(text(current()?.src)));
  el.btnPrev.addEventListener("click", () => { updateCurrentFromInputs(); if (index > 0) index -= 1; render(); });
  el.btnNext.addEventListener("click", () => { updateCurrentFromInputs(); if (index < entries.length - 1) index += 1; render(); });

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
  el.btnDownload.addEventListener("click", downloadAll);

  buildButtons(CATS, el.catButtons, "cat");
  buildButtons(TAGS, el.tagButtons, "tag");
  initTargets();
})();
