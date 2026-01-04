// tools/reel-builder/reel-builder.js
(function () {
  function $(id) { return document.getElementById(id); }
  function safeTrim(v) { return String(v || "").trim(); }

  // --- Entry fields
  const elSrcFolder = $("srcFolder");
  const elSrcFile = $("srcFile");
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

  // --- JSON section
  const elJsonTarget = $("jsonTarget");
  const btnLoadJson = $("btnLoadJson");
  const btnRememberJson = $("btnRememberJson");
  const jsonIn = $("jsonIn");

  // Buttons
  const btnEntry = $("btnEntry");
  const btnCopyEntry = $("btnCopyEntry");
  const btnClearSrc = $("btnClearSrc");
  const btnClear = $("btnClear");
  const btnAddToJson = $("btnAddToJson");
  const btnCopyJson = $("btnCopyJson");
  const btnFormatJson = $("btnFormatJson");

  // Persistenz (iPad-friendly)
  const LS_KEY_LASTTAG = "reelBuilder.lastTag";
  const LS_KEY_LASTTAG_MODE = "reelBuilder.lastTagMode"; // "preset" | "custom"
  const LS_KEY_LOCK = "reelBuilder.lockTag";             // "1" | "0"
  const LS_KEY_LAST_TARGET = "reelBuilder.lastTarget";   // selected jsonTarget
  const LS_KEY_DRAFT_PREFIX = "reelBuilder.draft:";      // per target drafts
  const LS_KEY_SRC_MANUAL = "reelBuilder.srcManual";     // "1" | "0"

  // ✅ Single Source of Truth (nach Load)
  const CURRENT = {
    target: "",
    arr: null,      // Array nach Load
    loaded: false,  // true nur nach erfolgreichem Load
  };

  function getSaved(key, fallback = "") {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }
  function setSaved(key, val) {
    try { localStorage.setItem(key, String(val)); } catch {}
  }

  function setStatusOk(msg) {
    if (!status) return;
    status.innerHTML = `<span class="rb-ok">✔ ${msg}</span>`;
  }
  function setStatusBad(msg) {
    if (!status) return;
    status.innerHTML = `<span class="rb-bad">✖ ${msg}</span>`;
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

  function validateSrc(src) {
    if (!src) return { ok: false, msg: "Bitte Bildpfad eintragen." };
    if (!src.startsWith("/assets/")) return { ok: false, msg: "Bildpfad muss mit /assets/ beginnen." };
    const lower = src.toLowerCase();
    const okExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].some((e) => lower.endsWith(e));
    if (!okExt) return { ok: false, msg: "Tipp: Endung sollte .jpg/.png/.webp sein." };
    return { ok: true, msg: "OK" };
  }

  function syncTagUI() {
    const useCustom = !!elTagCustomOn && elTagCustomOn.checked;
    if (elTagCustom) elTagCustom.disabled = !useCustom;
    if (!useCustom && elTagCustom) elTagCustom.value = "";
  }

  function currentTag() {
    const useCustom = !!elTagCustomOn && elTagCustomOn.checked;
    if (useCustom) return safeTrim(elTagCustom ? elTagCustom.value : "");
    return safeTrim(elTagPreset ? elTagPreset.value : "");
  }

  function saveLastTagFromUI() {
    const tag = currentTag();
    if (!tag) return;
    const mode = elTagCustomOn && elTagCustomOn.checked ? "custom" : "preset";
    setSaved(LS_KEY_LASTTAG, tag);
    setSaved(LS_KEY_LASTTAG_MODE, mode);
  }

  function applyLastTag() {
    const last = safeTrim(getSaved(LS_KEY_LASTTAG, ""));
    if (!last) return setStatusBad("Kein letztes Tag gespeichert.");

    const mode = getSaved(LS_KEY_LASTTAG_MODE, "preset");

    if (mode === "custom") {
      if (elTagCustomOn) elTagCustomOn.checked = true;
      syncTagUI();
      if (elTagCustom) elTagCustom.value = last;
    } else {
      if (elTagCustomOn) elTagCustomOn.checked = false;
      syncTagUI();

      if (elTagPreset) {
        const opt = Array.from(elTagPreset.options).find(o => o.value === last);
        if (opt) {
          elTagPreset.value = last;
        } else {
          if (elTagCustomOn) elTagCustomOn.checked = true;
          syncTagUI();
          if (elTagCustom) elTagCustom.value = last;
        }
      }
    }

    setStatusOk(`Letztes Tag übernommen: ${last}`);
  }

  function isLockTagOn() {
    return getSaved(LS_KEY_LOCK, "0") === "1";
  }

  function normalizeJoin(folder, file) {
    const f = safeTrim(folder);
    const n = safeTrim(file);
    if (!f || !n) return "";
    const left = f.endsWith("/") ? f : (f + "/");
    const right = n.startsWith("/") ? n.slice(1) : n;
    return left + right;
  }

  function isSrcManual() {
    return getSaved(LS_KEY_SRC_MANUAL, "0") === "1";
  }
  function setSrcManual(on) {
    setSaved(LS_KEY_SRC_MANUAL, on ? "1" : "0");
  }

  function updateSrcFromFolderFile() {
    if (!elSrcFolder || !elSrcFile || !elSrc) return;
    if (isSrcManual()) return;
    const built = normalizeJoin(elSrcFolder.value, elSrcFile.value);
    if (built) elSrc.value = built;
  }

  function renderPreview(src, alt) {
    if (!previewBox || !previewImg) return;
    if (src) {
      previewImg.src = src;
      previewImg.alt = alt || "";
      previewBox.style.display = "block";
    } else {
      previewBox.style.display = "none";
    }
  }

  function buildEntry({ silentStatus = false } = {}) {
    if (!elSrc || !elCap || !elAlt) return { obj: {}, snippet: "{}", valid: false };

    const src = safeTrim(elSrc.value);
    const cap = safeTrim(elCap.value);
    const alt = safeTrim(elAlt.value);
    const tag = currentTag();

    const v = validateSrc(src);
    if (!silentStatus) v.ok ? setStatusOk(v.msg) : setStatusBad(v.msg);

    renderPreview(src, alt);

    const obj = { src, alt, cap };
    if (tag) obj.tag = tag;

    if (outEntry) outEntry.textContent = JSON.stringify(obj, null, 2);
    saveLastTagFromUI();

    return { obj, snippet: JSON.stringify(obj), valid: v.ok };
  }

  function renderJsonToUI(arr) {
    const next = JSON.stringify(arr || [], null, 2);
    if (jsonIn) jsonIn.value = next;
    if (outJson) outJson.textContent = next;
    return next;
  }

  async function loadJsonFromSource() {
    if (!elJsonTarget || !jsonIn) return;

    const url = elJsonTarget.value;
    if (!url) return setStatusBad("Bitte Ziel-JSON wählen.");

    try {
      setSaved(LS_KEY_LAST_TARGET, url);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);

      const text = await res.text();
      const arr = parseJsonArray(text);

      // ✅ State setzen
      CURRENT.target = url;
      CURRENT.arr = arr;
      CURRENT.loaded = true;

      renderJsonToUI(arr);
      setStatusOk(`Quelle geladen: ${arr.length} Einträge (${url}).`);
    } catch (e) {
      CURRENT.loaded = false;
      CURRENT.arr = null;
      CURRENT.target = "";
      setStatusBad(`Konnte Quelle nicht laden/lesen: ${e.message}`);
    }
  }

  function rememberDraft() {
    if (!elJsonTarget || !jsonIn) return;
    const url = elJsonTarget.value || "unknown";
    const key = LS_KEY_DRAFT_PREFIX + url;
    setSaved(key, jsonIn.value || "");
    setStatusOk("Zwischenstand gemerkt (lokal auf diesem Gerät).");
  }

  function restoreDraftIfAny() {
    if (!elJsonTarget || !jsonIn) return;

    const last = getSaved(LS_KEY_LAST_TARGET, "");
    if (last) {
      const opt = Array.from(elJsonTarget.options || []).find(o => o.value === last);
      if (opt) elJsonTarget.value = last;

      const key = LS_KEY_DRAFT_PREFIX + last;
      const draft = getSaved(key, "");
      if (safeTrim(draft) && !safeTrim(jsonIn.value)) {
        jsonIn.value = draft;
        if (outJson) outJson.textContent = draft;

        // Draft ist NICHT gleich Load
        CURRENT.loaded = false;
        CURRENT.arr = null;
        CURRENT.target = elJsonTarget.value || "";
        setStatusOk("Draft wiederhergestellt. Tipp: trotzdem einmal 'JSON aus Quelle laden' drücken.");
      }
    }
  }

  async function addEntryToCurrentJson() {
    if (!elJsonTarget || !jsonIn) return;

    const { obj, valid } = buildEntry({ silentStatus: true });

    if (!safeTrim(obj.src)) return setStatusBad("Bitte Bildpfad setzen.");
    if (!valid) return setStatusBad("Bildpfad ungültig. Muss /assets/... + Endung.");

    const targetNow = elJsonTarget.value;

    // ✅ Wenn Ziel gewechselt wurde: zwingend neu laden
    if (CURRENT.target && targetNow && CURRENT.target !== targetNow) {
      CURRENT.loaded = false;
      CURRENT.arr = null;
      CURRENT.target = targetNow;
      return setStatusBad("Ziel-JSON wurde geändert. Erst 'JSON aus Quelle laden' klicken.");
    }

    // ✅ Wenn noch nie geladen: versuche aus Textarea zu parsen – aber warne sichtbar
    if (!CURRENT.loaded || !Array.isArray(CURRENT.arr)) {
      try {
        const parsed = parseJsonArray(jsonIn.value);
        CURRENT.arr = parsed;
        CURRENT.loaded = true;
        CURRENT.target = targetNow;
      } catch (e) {
        return setStatusBad("Erst 'JSON aus Quelle laden' klicken (oder gültiges Array im Feld haben). " + e.message);
      }
    }

    const before = CURRENT.arr.length;
    CURRENT.arr.push(obj);

    const next = renderJsonToUI(CURRENT.arr);

    const okCopy = await copyText(next);
    if (okCopy) {
      setStatusOk(`Hinzugefügt (${targetNow}): vorher ${before}, jetzt ${before + 1}. ✅ JSON ist im Clipboard.`);
    } else {
      setStatusOk(`Hinzugefügt (${targetNow}): vorher ${before}, jetzt ${before + 1}. (Clipboard blockiert → 'Komplette JSON kopieren')`);
    }

    // Speed reset (ohne Status zu überschreiben!)
    if (elSrcFile) elSrcFile.value = "";
    if (elSrc) elSrc.value = "";
    setSrcManual(false);
    renderPreview("", "");

    if (!isLockTagOn()) {
      if (elTagPreset) elTagPreset.value = "";
      if (elTagCustomOn) elTagCustomOn.checked = false;
      if (elTagCustom) elTagCustom.value = "";
      syncTagUI();
    }

    if (elSrcFile) elSrcFile.focus();
    else if (elSrc) elSrc.focus();

    // outEntry leeren ist optional – ich lasse es als “letzter Eintrag”
  }

  // --- Wire events
  if (btnEntry) btnEntry.addEventListener("click", () => buildEntry());
  if (btnCopyEntry) btnCopyEntry.addEventListener("click", async () => {
    const { snippet } = buildEntry();
    const ok = await copyText(snippet);
    ok ? setStatusOk("Eintrag kopiert.") : setStatusBad("Clipboard blockiert.");
  });

  if (btnClearSrc) btnClearSrc.addEventListener("click", () => {
    if (elSrcFile) elSrcFile.value = "";
    if (elSrc) elSrc.value = "";
    setSrcManual(false);
    renderPreview("", "");
    setStatusOk("Bildpfad geleert.");
  });

  if (btnClear) btnClear.addEventListener("click", () => {
    if (elSrcFile) elSrcFile.value = "";
    if (elSrc) elSrc.value = "";
    setSrcManual(false);

    if (elCap) elCap.value = "";
    if (elAlt) elAlt.value = "";

    if (elTagPreset) elTagPreset.value = "";
    if (elTagCustomOn) elTagCustomOn.checked = false;
    if (elTagCustom) elTagCustom.value = "";
    syncTagUI();

    if (outEntry) outEntry.textContent = "";
    if (outJson) outJson.textContent = "";
    if (jsonIn) jsonIn.value = "";

    renderPreview("", "");

    CURRENT.loaded = false;
    CURRENT.arr = null;
    CURRENT.target = elJsonTarget ? (elJsonTarget.value || "") : "";

    if (status) status.textContent = "";
  });

  if (btnAddToJson) btnAddToJson.addEventListener("click", () => addEntryToCurrentJson());

  if (btnCopyJson) btnCopyJson.addEventListener("click", async () => {
    const text = (jsonIn && jsonIn.value) || "";
    if (!safeTrim(text)) return setStatusBad("Kein JSON vorhanden.");
    const ok = await copyText(text);
    ok ? setStatusOk("Komplette JSON kopiert.") : setStatusBad("Clipboard blockiert.");
  });

  if (btnFormatJson) btnFormatJson.addEventListener("click", () => {
    try {
      const arr = parseJsonArray(jsonIn.value);
      const next = JSON.stringify(arr, null, 2);
      jsonIn.value = next;
      if (outJson) outJson.textContent = next;
      setStatusOk("JSON formatiert.");
    } catch (e) {
      if (outJson) outJson.textContent = "";
      setStatusBad(e.message);
    }
  });

  if (btnLoadJson) btnLoadJson.addEventListener("click", () => loadJsonFromSource());
  if (btnRememberJson) btnRememberJson.addEventListener("click", () => rememberDraft());

  if (elJsonTarget) elJsonTarget.addEventListener("change", () => {
    // Ziel geändert -> State invalid
    CURRENT.loaded = false;
    CURRENT.arr = null;
    CURRENT.target = elJsonTarget.value || "";
    setSaved(LS_KEY_LAST_TARGET, CURRENT.target);
    setStatusOk("Ziel geändert. Jetzt 'JSON aus Quelle laden' klicken.");
  });

  // Folder/file -> src auto build
  if (elSrcFolder) elSrcFolder.addEventListener("change", () => { updateSrcFromFolderFile(); buildEntry({ silentStatus: true }); });
  if (elSrcFile) elSrcFile.addEventListener("input", () => { updateSrcFromFolderFile(); buildEntry({ silentStatus: true }); });

  if (elSrc) {
    elSrc.addEventListener("input", () => {
      const built = (elSrcFolder && elSrcFile) ? normalizeJoin(elSrcFolder.value, elSrcFile.value) : "";
      const cur = safeTrim(elSrc.value);
      setSrcManual(!!cur && !!built && cur !== built);
      buildEntry({ silentStatus: true });
    });
  }

  // Tags
  if (btnUseLastTag) btnUseLastTag.addEventListener("click", () => { applyLastTag(); buildEntry({ silentStatus: true }); });

  if (elLockTag) {
    elLockTag.checked = getSaved(LS_KEY_LOCK, "0") === "1";
    elLockTag.addEventListener("change", () => setSaved(LS_KEY_LOCK, elLockTag.checked ? "1" : "0"));
  }

  if (elTagPreset) elTagPreset.addEventListener("change", () => buildEntry({ silentStatus: true }));
  if (elTagCustomOn) elTagCustomOn.addEventListener("change", () => { syncTagUI(); buildEntry({ silentStatus: true }); });
  if (elTagCustom) elTagCustom.addEventListener("input", () => buildEntry({ silentStatus: true }));

  if (elCap) elCap.addEventListener("input", () => buildEntry({ silentStatus: true }));
  if (elAlt) elAlt.addEventListener("input", () => buildEntry({ silentStatus: true }));

  // Init
  syncTagUI();
  if (outEntry) outEntry.textContent = "";
  if (outJson) outJson.textContent = "";
  restoreDraftIfAny();
  updateSrcFromFolderFile();
  buildEntry({ silentStatus: true });
})();
