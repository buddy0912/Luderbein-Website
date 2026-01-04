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

  // If some optional elements are missing, we still want core to run.
  // (But in your current HTML they exist.)
  const hasJsonTarget = !!elJsonTarget && !!btnLoadJson && !!jsonIn;

  // Persistenz (iPad-friendly)
  const LS_KEY_LASTTAG = "reelBuilder.lastTag";
  const LS_KEY_LASTTAG_MODE = "reelBuilder.lastTagMode"; // "preset" | "custom"
  const LS_KEY_LOCK = "reelBuilder.lockTag";             // "1" | "0"

  const LS_KEY_LAST_TARGET = "reelBuilder.lastTarget";   // stores selected jsonTarget
  const LS_KEY_DRAFT_PREFIX = "reelBuilder.draft:";      // per target drafts
  const LS_KEY_SRC_MANUAL = "reelBuilder.srcManual";     // "1" | "0"

  let didLoadFromSource = false; // guard: true only after successful load

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

  function validateSrc(src) {
    if (!src) return { ok: false, msg: "Bitte Bildpfad eintragen." };
    if (!src.startsWith("/assets/")) return { ok: false, msg: "Bildpfad muss mit /assets/ beginnen." };
    const lower = src.toLowerCase();
    const okExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].some((e) => lower.endsWith(e));
    if (!okExt) return { ok: false, msg: "Tipp: Endung sollte .jpg/.png/.webp sein." };
    return { ok: true, msg: "OK" };
  }

  function syncTagUI() {
    const useCustom = !!elTagCustomOn && !!elTagCustomOn.checked;
    if (elTagCustom) elTagCustom.disabled = !useCustom;
    if (!useCustom && elTagCustom) elTagCustom.value = "";
  }

  function currentTag() {
    const useCustom = !!elTagCustomOn && !!elTagCustomOn.checked;
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

  // --- Clipboard
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

  // --- JSON parsing
  function parseJsonArray(text) {
    const t = safeTrim(text);
    if (!t) return [];
    const parsed = JSON.parse(t);
    if (!Array.isArray(parsed)) throw new Error("JSON muss ein Array sein ( [ ... ] ).");
    return parsed;
  }

  // --- src builder from dropdown + filename
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
    if (isSrcManual()) return; // user typed src manually
    const built = normalizeJoin(elSrcFolder.value, elSrcFile.value);
    if (built) elSrc.value = built;
  }

  // --- Build entry
  function buildEntry() {
    if (!elSrc || !elCap || !elAlt) return { obj: {}, snippet: "{}", valid: false };

    const src = safeTrim(elSrc.value);
    const cap = safeTrim(elCap.value);
    const alt = safeTrim(elAlt.value);
    const tag = currentTag();

    const v = validateSrc(src);
    v.ok ? setStatusOk(v.msg) : setStatusBad(v.msg);

    if (previewBox && previewImg) {
      if (src) {
        previewImg.src = src;
        previewImg.alt = alt || "";
        previewBox.style.display = "block";
      } else {
        previewBox.style.display = "none";
      }
    }

    const obj = { src, alt, cap };
    if (tag) obj.tag = tag;

    if (outEntry) outEntry.textContent = JSON.stringify(obj, null, 2);
    saveLastTagFromUI();

    return { obj, snippet: JSON.stringify(obj), valid: v.ok };
  }

  // --- Load JSON from selected target
  async function loadJsonFromSource() {
    if (!hasJsonTarget) return;

    const url = elJsonTarget.value;
    if (!url) return setStatusBad("Bitte Ziel-JSON wählen.");

    try {
      setSaved(LS_KEY_LAST_TARGET, url);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);

      const text = await res.text();

      // Validate JSON now (fail early)
      const arr = parseJsonArray(text);
      const pretty = JSON.stringify(arr, null, 2);

      jsonIn.value = pretty;
      if (outJson) outJson.textContent = pretty;

      didLoadFromSource = true;
      setStatusOk(`Quelle geladen: ${arr.length} Einträge.`);
    } catch (e) {
      didLoadFromSource = false;
      setStatusBad(`Konnte Quelle nicht laden/lesen: ${e.message}`);
    }
  }

  function rememberDraft() {
    if (!hasJsonTarget) return;
    const url = elJsonTarget.value || "unknown";
    const key = LS_KEY_DRAFT_PREFIX + url;
    setSaved(key, jsonIn.value || "");
    setStatusOk("Zwischenstand gemerkt (lokal auf diesem Gerät).");
  }

  function restoreDraftIfAny() {
    if (!hasJsonTarget) return;

    const last = getSaved(LS_KEY_LAST_TARGET, "");
    if (last) {
      // set dropdown to last target if exists
      const opt = Array.from(elJsonTarget.options || []).find(o => o.value === last);
      if (opt) elJsonTarget.value = last;

      const key = LS_KEY_DRAFT_PREFIX + last;
      const draft = getSaved(key, "");
      if (safeTrim(draft)) {
        // only restore if textarea empty (avoid overwriting)
        if (!safeTrim(jsonIn.value)) {
          jsonIn.value = draft;
          if (outJson) outJson.textContent = draft;
          // Note: draft restore does not count as "loaded from source"
          didLoadFromSource = false;
          setStatusOk("Zwischenstand wiederhergestellt (Draft). Tipp: trotzdem einmal 'Quelle laden' drücken.");
        }
      }
    }
  }

  // --- Events
  const btnEntry = $("btnEntry");
  const btnCopyEntry = $("btnCopyEntry");
  const btnClearSrc = $("btnClearSrc");
  const btnClear = $("btnClear");
  const btnAddToJson = $("btnAddToJson");
  const btnCopyJson = $("btnCopyJson");
  const btnFormatJson = $("btnFormatJson");

  if (btnEntry) btnEntry.addEventListener("click", () => buildEntry());

  if (btnCopyEntry) btnCopyEntry.addEventListener("click", async () => {
    const { snippet } = buildEntry();
    const ok = await copyText(snippet);
    ok ? setStatusOk("Eintrag kopiert.") : setStatusBad("Konnte nicht kopieren (Clipboard blockiert).");
  });

  if (btnClearSrc) btnClearSrc.addEventListener("click", () => {
    if (elSrc) elSrc.value = "";
    if (elSrcFile) elSrcFile.value = "";
    setSrcManual(false);
    if (elSrc) elSrc.focus();
    buildEntry();
    setStatusOk("Bildpfad geleert.");
  });

  if (btnClear) btnClear.addEventListener("click", () => {
    if (elSrc) elSrc.value = "";
    if (elSrcFile) elSrcFile.value = "";
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

    if (previewBox) previewBox.style.display = "none";
    didLoadFromSource = false;

    if (status) status.textContent = "";
  });

  // --- 핵: ADD + AUTO COPY FULL JSON
  if (btnAddToJson) btnAddToJson.addEventListener("click", async () => {
    const { obj, valid } = buildEntry();

    if (!jsonIn) return setStatusBad("jsonIn nicht gefunden.");

    // Guard: You WANT to never lose 01–17
    if (!didLoadFromSource && !safeTrim(jsonIn.value)) {
      return setStatusBad("Erst 'JSON aus Quelle laden' klicken (sonst fügst du in ein leeres Array ein).");
    }

    let arr;
    try {
      arr = parseJsonArray(jsonIn.value);
    } catch (e) {
      if (outJson) outJson.textContent = "";
      return setStatusBad(e.message);
    }

    if (!safeTrim(obj.src)) return setStatusBad("Bitte zuerst einen gültigen Bildpfad eintragen.");
    if (!valid) return setStatusBad("Bildpfad ist nicht gültig. (Muss /assets/... + Endung)");

    const before = arr.length;
    arr.push(obj);

    const next = JSON.stringify(arr, null, 2);

    // Single source of truth: textarea
    jsonIn.value = next;
    if (outJson) outJson.textContent = next;

    // AUTO COPY full JSON (this is what you asked for)
    const okCopy = await copyText(next);

    if (okCopy) {
      setStatusOk(`Hinzugefügt: vorher ${before}, jetzt ${before + 1}. ✅ Komplette JSON ist im Clipboard.`);
    } else {
      setStatusOk(`Hinzugefügt: vorher ${before}, jetzt ${before + 1}. (Clipboard blockiert – nutze 'Komplette JSON kopieren')`);
    }

    // Speed: clear only src filename, keep cap/alt if you want quick series
    if (elSrcFile) elSrcFile.value = "";
    if (elSrc) elSrc.value = "";
    setSrcManual(false);

    if (elSrcFile) elSrcFile.focus();
    else if (elSrc) elSrc.focus();

    // If tag not locked, reset tag UI
    if (!isLockTagOn()) {
      if (elTagPreset) elTagPreset.value = "";
      if (elTagCustomOn) elTagCustomOn.checked = false;
      if (elTagCustom) elTagCustom.value = "";
      syncTagUI();
    }

    buildEntry();
  });

  if (btnCopyJson) btnCopyJson.addEventListener("click", async () => {
    const text = (jsonIn && jsonIn.value) || (outJson && outJson.textContent) || "";
    if (!safeTrim(text)) return setStatusBad("Kein JSON vorhanden.");
    const ok = await copyText(text);
    ok ? setStatusOk("Komplette JSON kopiert.") : setStatusBad("Konnte nicht kopieren (Clipboard blockiert).");
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

  // --- Dropdowns wiring
  if (elSrcFolder) elSrcFolder.addEventListener("change", () => { updateSrcFromFolderFile(); buildEntry(); });
  if (elSrcFile) elSrcFile.addEventListener("input", () => { updateSrcFromFolderFile(); buildEntry(); });

  if (elSrc) {
    // If user types directly into src, mark manual = true
    elSrc.addEventListener("input", () => {
      // If src equals built value, keep auto mode; else manual
      const built = (elSrcFolder && elSrcFile) ? normalizeJoin(elSrcFolder.value, elSrcFile.value) : "";
      const cur = safeTrim(elSrc.value);
      setSrcManual(!!cur && built && cur !== built);
      buildEntry();
    });
  }

  // --- Load/Remember handlers
  if (btnLoadJson) btnLoadJson.addEventListener("click", () => loadJsonFromSource());
  if (btnRememberJson) btnRememberJson.addEventListener("click", () => rememberDraft());
  if (elJsonTarget) elJsonTarget.addEventListener("change", () => {
    didLoadFromSource = false; // switching target requires load again
    setSaved(LS_KEY_LAST_TARGET, elJsonTarget.value || "");
    setStatusOk("Ziel geändert. Jetzt 'JSON aus Quelle laden' klicken.");
  });

  // --- Tag tools
  if (btnUseLastTag) btnUseLastTag.addEventListener("click", () => {
    applyLastTag();
    buildEntry();
  });

  if (elLockTag) {
    elLockTag.checked = getSaved(LS_KEY_LOCK, "0") === "1";
    elLockTag.addEventListener("change", () => setSaved(LS_KEY_LOCK, elLockTag.checked ? "1" : "0"));
  }

  if (elTagPreset) elTagPreset.addEventListener("change", () => buildEntry());
  if (elTagCustomOn) elTagCustomOn.addEventListener("change", () => { syncTagUI(); buildEntry(); });
  if (elTagCustom) elTagCustom.addEventListener("input", () => buildEntry());

  if (elCap) elCap.addEventListener("input", () => buildEntry());
  if (elAlt) elAlt.addEventListener("input", () => buildEntry());

  // Init
  syncTagUI();
  if (outEntry) outEntry.textContent = "";
  if (outJson) outJson.textContent = "";

  // Restore last target + any draft
  if (hasJsonTarget) restoreDraftIfAny();

  // Build initial src if possible
  updateSrcFromFolderFile();
  buildEntry();
})();
