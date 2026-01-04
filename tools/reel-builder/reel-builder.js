(function () {
  function $(id) { return document.getElementById(id); }
  function safeTrim(v) { return String(v || "").trim(); }

  const elSrc = $("src");
  const elCap = $("cap");
  const elAlt = $("alt");

  const elTagPreset = $("tagPreset");
  const elTagCustomOn = $("tagCustomOn");
  const elTagCustom = $("tagCustom");

  const btnUseLastTag = $("btnUseLastTag");
  const elLockTag = $("lockTag");

  const outEntry = $("outEntry");
  const outJson = $("outJson");
  const status = $("status");

  const previewBox = $("previewBox");
  const previewImg = $("previewImg");

  const elJsonIn = $("jsonIn");
  const elJsonSrc = $("jsonSrc");

  // Buttons (optional, existieren nach dem HTML-Patch)
  const btnLoadFromSrc = $("btnLoadFromSrc");
  const btnLoadWorking = $("btnLoadWorking");
  const btnResetWorking = $("btnResetWorking");

  // Persistenz (iPad-friendly)
  const LS_KEY_TAG = "reelBuilder.lastTag";
  const LS_KEY_MODE = "reelBuilder.lastTagMode"; // "preset" | "custom"
  const LS_KEY_LOCK = "reelBuilder.lockTag";     // "1" | "0"

  // Arbeits-JSON Persistenz
  const LS_WORK_JSON = "reelBuilder.workingJson";
  const LS_JSON_SRC = "reelBuilder.jsonSrc";

  function getSaved(key, fallback = "") {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }
  function setSaved(key, val) {
    try { localStorage.setItem(key, String(val)); } catch {}
  }

  function validateSrc(src) {
    if (!src) return { ok: false, msg: "Bitte Bildpfad eintragen." };
    if (!src.startsWith("/assets/")) return { ok: false, msg: "Bildpfad muss mit /assets/ beginnen." };
    const lower = src.toLowerCase();
    const okExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].some((e) => lower.endsWith(e));
    if (!okExt) return { ok: false, msg: "Tipp: Endung sollte .jpg/.png/.webp sein." };
    return { ok: true, msg: "OK" };
  }

  function syncTagUI() {
    const useCustom = !!elTagCustomOn.checked;
    elTagCustom.disabled = !useCustom;
    if (!useCustom) elTagCustom.value = "";
  }

  function currentTag() {
    const useCustom = !!elTagCustomOn.checked;
    if (useCustom) return safeTrim(elTagCustom.value);
    return safeTrim(elTagPreset.value);
  }

  function saveLastTagFromUI() {
    const tag = currentTag();
    if (!tag) return;
    const mode = elTagCustomOn.checked ? "custom" : "preset";
    setSaved(LS_KEY_TAG, tag);
    setSaved(LS_KEY_MODE, mode);
  }

  function applyLastTag() {
    const last = safeTrim(getSaved(LS_KEY_TAG, ""));
    if (!last) {
      status.innerHTML = `<span class="rb-bad">✖ Kein letztes Tag gespeichert.</span>`;
      return;
    }

    const mode = getSaved(LS_KEY_MODE, "preset");

    if (mode === "custom") {
      elTagCustomOn.checked = true;
      syncTagUI();
      elTagCustom.value = last;
    } else {
      elTagCustomOn.checked = false;
      syncTagUI();

      const opt = Array.from(elTagPreset.options).find(o => o.value === last);
      if (opt) {
        elTagPreset.value = last;
      } else {
        elTagCustomOn.checked = true;
        syncTagUI();
        elTagCustom.value = last;
      }
    }

    status.innerHTML = `<span class="rb-ok">✔ Letztes Tag übernommen: ${last}</span>`;
  }

  function isLockTagOn() {
    return getSaved(LS_KEY_LOCK, "0") === "1";
  }

  function buildEntry() {
    const src = safeTrim(elSrc.value);
    const cap = safeTrim(elCap.value);
    const alt = safeTrim(elAlt.value);
    const tag = currentTag();

    const v = validateSrc(src);
    status.innerHTML = v.ok
      ? `<span class="rb-ok">✔ ${v.msg}</span>`
      : `<span class="rb-bad">✖ ${v.msg}</span>`;

    if (src) {
      previewImg.src = src;
      previewImg.alt = alt || "";
      previewBox.style.display = "block";
    } else {
      previewBox.style.display = "none";
    }

    const obj = { src, alt, cap };
    if (tag) obj.tag = tag;

    outEntry.textContent = JSON.stringify(obj, null, 2);
    saveLastTagFromUI();

    return { obj, snippet: JSON.stringify(obj), valid: v.ok };
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  }

  function parseJsonArray(text) {
    const t = safeTrim(text);
    if (!t) return [];
    const parsed = JSON.parse(t);
    if (!Array.isArray(parsed)) throw new Error("JSON muss ein Array sein ( [ ... ] ).");
    return parsed;
  }

  function setWorkingJson(arr, msgOk) {
    const text = JSON.stringify(arr, null, 2);
    outJson.textContent = text;
    elJsonIn.value = text;                 // <- wichtig: Arbeitsfeld aktualisieren
    setSaved(LS_WORK_JSON, text);          // <- wichtig: persistieren
    if (msgOk) status.innerHTML = `<span class="rb-ok">✔ ${msgOk}</span>`;
  }

  function getWorkingJsonText() {
    // Priorität: Arbeitsfeld → Output → localStorage → []
    return safeTrim(elJsonIn.value)
      || safeTrim(outJson.textContent)
      || safeTrim(getSaved(LS_WORK_JSON, ""))
      || "[]";
  }

  async function loadJsonFromSrc(src) {
    const path = safeTrim(src);
    if (!path) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte Quelle angeben, z. B. /assets/reel-custom.json</span>`;
      return;
    }
    if (!path.startsWith("/assets/")) {
      status.innerHTML = `<span class="rb-bad">✖ Quelle muss mit /assets/ beginnen.</span>`;
      return;
    }

    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const arr = parseJsonArray(text);
      setWorkingJson(arr, `JSON geladen (${arr.length} Einträge): ${path}`);
      setSaved(LS_JSON_SRC, path);
      if (elJsonSrc) elJsonSrc.value = path;
    } catch (e) {
      status.innerHTML = `<span class="rb-bad">✖ Konnte JSON nicht laden: ${path} (${e.message})</span>`;
    }
  }

  // --- Buttons / Events ---
  $("btnEntry").addEventListener("click", () => buildEntry());

  $("btnCopyEntry").addEventListener("click", async () => {
    const { snippet } = buildEntry();
    const ok = await copyText(snippet);
    status.innerHTML = ok
      ? `<span class="rb-ok">✔ Eintrag kopiert.</span>`
      : `<span class="rb-bad">✖ Konnte nicht kopieren (Clipboard blockiert).</span>`;
  });

  $("btnClearSrc").addEventListener("click", () => {
    elSrc.value = "";
    elSrc.focus();
    buildEntry();
    status.innerHTML = `<span class="rb-ok">✔ Bildpfad geleert.</span>`;
  });

  $("btnClear").addEventListener("click", () => {
    elSrc.value = "";
    elCap.value = "";
    elAlt.value = "";

    elTagPreset.value = "";
    elTagCustomOn.checked = false;
    elTagCustom.value = "";
    syncTagUI();

    outEntry.textContent = "";
    status.textContent = "";
    previewBox.style.display = "none";
    // Lock bleibt bewusst erhalten
  });

  $("btnAddToJson").addEventListener("click", () => {
    const { obj } = buildEntry();

    if (!safeTrim(obj.src)) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte zuerst einen gültigen Bildpfad eintragen.</span>`;
      return;
    }

    let arr;
    try {
      arr = parseJsonArray(getWorkingJsonText());
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
      return;
    }

    arr.push(obj);
    setWorkingJson(arr, `Zur Arbeits-JSON hinzugefügt (${arr.length} Einträge).`);

    // Speed: Bildpfad leeren und Fokus setzen
    elSrc.value = "";
    elSrc.focus();

    // Wenn Tag NICHT gesperrt: Tag zurücksetzen
    if (!isLockTagOn()) {
      elTagPreset.value = "";
      elTagCustomOn.checked = false;
      elTagCustom.value = "";
      syncTagUI();
    }

    // Output/Preview neu rendern (zeigt jetzt src leer -> das ist ok)
    buildEntry();
  });

  $("btnCopyJson").addEventListener("click", async () => {
    const text = safeTrim(outJson.textContent || "");
    if (!text) {
      status.innerHTML = `<span class="rb-bad">✖ Kein JSON Output vorhanden.</span>`;
      return;
    }
    const ok = await copyText(text);
    status.innerHTML = ok
      ? `<span class="rb-ok">✔ JSON kopiert.</span>`
      : `<span class="rb-bad">✖ Konnte nicht kopieren (Clipboard blockiert).</span>`;
  });

  $("btnFormatJson").addEventListener("click", () => {
    try {
      const arr = parseJsonArray(getWorkingJsonText());
      setWorkingJson(arr, "JSON formatiert.");
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
    }
  });

  // Tag tools
  btnUseLastTag.addEventListener("click", () => {
    applyLastTag();
    buildEntry();
  });

  // Lock persists
  elLockTag.checked = getSaved(LS_KEY_LOCK, "0") === "1";
  elLockTag.addEventListener("change", () => {
    setSaved(LS_KEY_LOCK, elLockTag.checked ? "1" : "0");
  });

  // Live preview
  elSrc.addEventListener("input", () => buildEntry());
  elCap.addEventListener("input", () => buildEntry());
  elAlt.addEventListener("input", () => buildEntry());

  elTagPreset.addEventListener("change", () => buildEntry());
  elTagCustomOn.addEventListener("change", () => { syncTagUI(); buildEntry(); });
  elTagCustom.addEventListener("input", () => buildEntry());

  // Loader UI (optional)
  if (elJsonSrc) {
    const savedSrc = getSaved(LS_JSON_SRC, "");
    if (savedSrc && !elJsonSrc.value) elJsonSrc.value = savedSrc;
  }

  if (btnLoadFromSrc) {
    btnLoadFromSrc.addEventListener("click", () => loadJsonFromSrc(elJsonSrc ? elJsonSrc.value : ""));
  }

  if (btnLoadWorking) {
    btnLoadWorking.addEventListener("click", () => {
      const t = getSaved(LS_WORK_JSON, "");
      if (!safeTrim(t)) {
        status.innerHTML = `<span class="rb-bad">✖ Keine Arbeits-JSON gespeichert.</span>`;
        return;
      }
      try {
        const arr = parseJsonArray(t);
        setWorkingJson(arr, `Arbeits-JSON geladen (${arr.length} Einträge).`);
      } catch (e) {
        status.innerHTML = `<span class="rb-bad">✖ Arbeits-JSON ist kaputt: ${e.message}</span>`;
      }
    });
  }

  if (btnResetWorking) {
    btnResetWorking.addEventListener("click", () => {
      setWorkingJson([], "Arbeits-JSON zurückgesetzt ([])");
    });
  }

  // Init
  syncTagUI();
  outEntry.textContent = "";
  outJson.textContent = "";

  // Auto-load: wenn Arbeits-JSON existiert -> rein
  const savedWork = getSaved(LS_WORK_JSON, "");
  if (safeTrim(savedWork)) {
    try {
      const arr = parseJsonArray(savedWork);
      setWorkingJson(arr, `Arbeits-JSON geladen (${arr.length} Einträge).`);
    } catch {
      // ignore
    }
  } else {
    // Startzustand
    elJsonIn.value = "[]";
    outJson.textContent = "[]";
  }
})();
