(function () {
  function $(id) { return document.getElementById(id); }
  function safeTrim(v) { return String(v || "").trim(); }

  // --- Entry fields ---
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

  // --- JSON fields ---
  const elJsonTarget = $("jsonTarget");
  const btnLoadJson = $("btnLoadJson");
  const btnRememberJson = $("btnRememberJson");
  const jsonIn = $("jsonIn");

  // --- Outputs ---
  const outEntry = $("outEntry");
  const outJson = $("outJson");
  const status = $("status");

  const previewBox = $("previewBox");
  const previewImg = $("previewImg");

  // --- Persistenz ---
  const LS_KEY_LAST_TAG = "reelBuilder.lastTag";
  const LS_KEY_LAST_TAG_MODE = "reelBuilder.lastTagMode"; // "preset" | "custom"
  const LS_KEY_LOCK_TAG = "reelBuilder.lockTag";          // "1" | "0"
  const LS_KEY_JSON_PREFIX = "reelBuilder.json.";         // + targetPath
  const LS_KEY_LAST_TARGET = "reelBuilder.lastTarget";

  // Auto-Copy nach "Eintrag zur JSON hinzufügen"
  const AUTO_COPY_ON_ADD = true;

  function setStatusOk(msg) {
    if (status) status.innerHTML = `<span class="rb-ok">✔ ${msg}</span>`;
  }
  function setStatusBad(msg) {
    if (status) status.innerHTML = `<span class="rb-bad">✖ ${msg}</span>`;
  }

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
    if (!okExt) return { ok: false, msg: "Endung muss .jpg/.png/.webp/.gif sein." };
    return { ok: true, msg: "OK" };
  }

  function syncTagUI() {
    const useCustom = !!elTagCustomOn?.checked;
    if (!elTagCustom) return;
    elTagCustom.disabled = !useCustom;
    if (!useCustom) elTagCustom.value = "";
  }

  function currentTag() {
    const useCustom = !!elTagCustomOn?.checked;
    if (useCustom) return safeTrim(elTagCustom?.value);
    return safeTrim(elTagPreset?.value);
  }

  function saveLastTagFromUI() {
    const tag = currentTag();
    if (!tag) return;
    const mode = elTagCustomOn?.checked ? "custom" : "preset";
    setSaved(LS_KEY_LAST_TAG, tag);
    setSaved(LS_KEY_LAST_TAG_MODE, mode);
  }

  function applyLastTag() {
    const last = safeTrim(getSaved(LS_KEY_LAST_TAG, ""));
    if (!last) return setStatusBad("Kein letztes Tag gespeichert.");

    const mode = getSaved(LS_KEY_LAST_TAG_MODE, "preset");

    if (mode === "custom") {
      if (elTagCustomOn) elTagCustomOn.checked = true;
      syncTagUI();
      if (elTagCustom) elTagCustom.value = last;
    } else {
      if (elTagCustomOn) elTagCustomOn.checked = false;
      syncTagUI();

      const opt = elTagPreset
        ? Array.from(elTagPreset.options).find(o => o.value === last)
        : null;

      if (opt && elTagPreset) {
        elTagPreset.value = last;
      } else {
        if (elTagCustomOn) elTagCustomOn.checked = true;
        syncTagUI();
        if (elTagCustom) elTagCustom.value = last;
      }
    }

    setStatusOk(`Letztes Tag übernommen: ${last}`);
  }

  function isLockTagOn() {
    return getSaved(LS_KEY_LOCK_TAG, "0") === "1";
  }

  function parseJsonArray(text) {
    const t = safeTrim(text);
    if (!t) return [];
    const parsed = JSON.parse(t);
    if (!Array.isArray(parsed)) throw new Error("JSON muss ein Array sein ( [ ... ] ).");
    return parsed;
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

  // --- src builder (Folder + Filename -> src) ---
  let srcWasManuallyEdited = false;

  function buildSrcFromParts() {
    const folder = safeTrim(elSrcFolder?.value);
    const file = safeTrim(elSrcFile?.value);
    if (!folder || !file) return "";
    // folder endet im Dropdown bereits mit /
    return folder + file;
  }

  function syncSrcFromPartsIfNotManual() {
    if (!elSrc) return;
    if (srcWasManuallyEdited) return;
    const next = buildSrcFromParts();
    if (next) elSrc.value = next;
  }

  function buildEntry() {
    // Falls du Folder+File nutzt: src automatisch bauen
    syncSrcFromPartsIfNotManual();

    const src = safeTrim(elSrc?.value);
    const cap = safeTrim(elCap?.value);
    const alt = safeTrim(elAlt?.value);
    const tag = currentTag();

    const v = validateSrc(src);
    if (v.ok) setStatusOk(v.msg);
    else setStatusBad(v.msg);

    if (previewImg && previewBox) {
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

    return { obj, valid: v.ok };
  }

  // --- JSON load / remember ---
  function currentTarget() {
    return safeTrim(elJsonTarget?.value);
  }

  async function loadJsonFromSource() {
    const target = currentTarget();
    if (!target) return setStatusBad("Kein Ziel-JSON gewählt.");

    setSaved(LS_KEY_LAST_TARGET, target);

    try {
      // Cache-Buster + no-store, damit Safari/Pages wirklich neu lädt
      const url = `${target}?v=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} beim Laden von ${target}`);

      const txt = await res.text();
      const arr = parseJsonArray(txt);

      const pretty = JSON.stringify(arr, null, 2);
      if (jsonIn) jsonIn.value = pretty;
      if (outJson) outJson.textContent = pretty;

      // auto-merken
      setSaved(LS_KEY_JSON_PREFIX + target, pretty);

      setStatusOk(`Quelle geladen: ${arr.length} Einträge (${target})`);
    } catch (e) {
      setStatusBad(`Konnte Quelle nicht laden: ${e.message}`);
    }
  }

  function rememberJsonWork() {
    const target = currentTarget();
    if (!target) return setStatusBad("Kein Ziel-JSON gewählt.");
    const val = safeTrim(jsonIn?.value);
    if (!val) return setStatusBad("Nichts zum Merken (Feld ist leer).");
    setSaved(LS_KEY_JSON_PREFIX + target, val);
    setStatusOk(`Zwischenstand gemerkt (${target})`);
  }

  function tryRestoreRememberedForTarget() {
    const target = currentTarget();
    if (!target || !jsonIn) return;
    const saved = getSaved(LS_KEY_JSON_PREFIX + target, "");
    if (saved && !safeTrim(jsonIn.value)) {
      jsonIn.value = saved;
      if (outJson) outJson.textContent = saved;
      setStatusOk(`Zwischenstand geladen (lokal): ${target}`);
    }
  }

  // --- Buttons / Events ---
  $("btnEntry")?.addEventListener("click", () => buildEntry());

  $("btnCopyEntry")?.addEventListener("click", async () => {
    const { obj, valid } = buildEntry();
    if (!valid) return;
    const ok = await copyText(JSON.stringify(obj));
    ok ? setStatusOk("Eintrag kopiert.") : setStatusBad("Konnte nicht kopieren (Clipboard blockiert).");
  });

  $("btnClearSrc")?.addEventListener("click", () => {
    if (elSrc) elSrc.value = "";
    if (elSrcFile) elSrcFile.value = "";
    srcWasManuallyEdited = false;
    elSrc?.focus();
    buildEntry();
    setStatusOk("Bildpfad geleert.");
  });

  $("btnClear")?.addEventListener("click", () => {
    if (elSrc) elSrc.value = "";
    if (elSrcFile) elSrcFile.value = "";
    if (elCap) elCap.value = "";
    if (elAlt) elAlt.value = "";

    if (elTagPreset) elTagPreset.value = "";
    if (elTagCustomOn) elTagCustomOn.checked = false;
    if (elTagCustom) elTagCustom.value = "";
    syncTagUI();

    if (outEntry) outEntry.textContent = "";
    if (outJson) outJson.textContent = "";
    if (jsonIn) jsonIn.value = "";
    if (status) status.textContent = "";
    if (previewBox) previewBox.style.display = "none";

    srcWasManuallyEdited = false;
  });

  // ✅ ADD: merge + update textarea + auto-copy
  $("btnAddToJson")?.addEventListener("click", async () => {
    const { obj, valid } = buildEntry();
    if (!safeTrim(obj.src)) return setStatusBad("Bitte zuerst einen gültigen Bildpfad eintragen.");
    if (!valid) return setStatusBad("Bildpfad ist nicht gültig. (Muss /assets/... + Endung)");

    let arr;
    try {
      arr = parseJsonArray(jsonIn?.value);
    } catch (e) {
      if (outJson) outJson.textContent = "";
      return setStatusBad(e.message);
    }

    const before = arr.length;
    arr.push(obj);

    const next = JSON.stringify(arr, null, 2);
    if (jsonIn) jsonIn.value = next;
    if (outJson) outJson.textContent = next;

    // merken
    const target = currentTarget();
    if (target) setSaved(LS_KEY_JSON_PREFIX + target, next);

    // Auto-copy (dein Wunsch)
    if (AUTO_COPY_ON_ADD) {
      const ok = await copyText(next);
      ok
        ? setStatusOk(`Hinzugefügt: vorher ${before}, jetzt ${before + 1} — JSON in Zwischenablage.`)
        : setStatusOk(`Hinzugefügt: vorher ${before}, jetzt ${before + 1} — (Copy fehlgeschlagen).`);
    } else {
      setStatusOk(`Zur JSON hinzugefügt (vorher ${before}, jetzt ${before + 1}).`);
    }

    // Speed: nur Bildpfad leeren
    if (elSrc) elSrc.value = "";
    if (elSrcFile) elSrcFile.value = "";
    srcWasManuallyEdited = false;
    elSrc?.focus();

    // Wenn Tag NICHT gesperrt: Tag zurücksetzen
    if (!isLockTagOn()) {
      if (elTagPreset) elTagPreset.value = "";
      if (elTagCustomOn) elTagCustomOn.checked = false;
      if (elTagCustom) elTagCustom.value = "";
      syncTagUI();
    }

    buildEntry();
  });

  $("btnCopyJson")?.addEventListener("click", async () => {
    const text = safeTrim(outJson?.textContent) || safeTrim(jsonIn?.value);
    if (!text) return setStatusBad("Kein JSON Output vorhanden.");
    const ok = await copyText(text);
    ok ? setStatusOk("JSON kopiert.") : setStatusBad("Konnte nicht kopieren (Clipboard blockiert).");
  });

  $("btnFormatJson")?.addEventListener("click", () => {
    try {
      const arr = parseJsonArray(jsonIn?.value);
      const next = JSON.stringify(arr, null, 2);
      if (jsonIn) jsonIn.value = next;
      if (outJson) outJson.textContent = next;
      setStatusOk("JSON formatiert.");
    } catch (e) {
      if (outJson) outJson.textContent = "";
      setStatusBad(e.message);
    }
  });

  // Load / Remember buttons
  btnLoadJson?.addEventListener("click", () => loadJsonFromSource());
  btnRememberJson?.addEventListener("click", () => rememberJsonWork());

  // Tag tools
  btnUseLastTag?.addEventListener("click", () => {
    applyLastTag();
    buildEntry();
  });

  // Lock persists
  if (elLockTag) {
    elLockTag.checked = getSaved(LS_KEY_LOCK_TAG, "0") === "1";
    elLockTag.addEventListener("change", () => {
      setSaved(LS_KEY_LOCK_TAG, elLockTag.checked ? "1" : "0");
    });
  }

  // Live preview
  elSrcFolder?.addEventListener("change", () => { srcWasManuallyEdited = false; syncSrcFromPartsIfNotManual(); buildEntry(); });
  elSrcFile?.addEventListener("input", () => { srcWasManuallyEdited = false; syncSrcFromPartsIfNotManual(); buildEntry(); });

  elSrc?.addEventListener("input", () => {
    // Wenn User direkt in src tippt, behandeln wir es als "manuell"
    srcWasManuallyEdited = true;
    buildEntry();
  });

  elCap?.addEventListener("input", () => buildEntry());
  elAlt?.addEventListener("input", () => buildEntry());

  elTagPreset?.addEventListener("change", () => buildEntry());
  elTagCustomOn?.addEventListener("change", () => { syncTagUI(); buildEntry(); });
  elTagCustom?.addEventListener("input", () => buildEntry());

  // Wenn Ziel-JSON geändert wird: optional lokalen Zwischenstand reinholen
  elJsonTarget?.addEventListener("change", () => {
    const t = currentTarget();
    if (t) setSaved(LS_KEY_LAST_TARGET, t);
    // nicht automatisch fetchen (damit du Kontrolle hast), aber lokalen Stand ziehen:
    if (jsonIn) jsonIn.value = "";
    if (outJson) outJson.textContent = "";
    tryRestoreRememberedForTarget();
  });

  // Init
  syncTagUI();
  if (outEntry) outEntry.textContent = "";
  if (outJson) outJson.textContent = "";

  // Restore last target (wenn Dropdown existiert)
  const lastTarget = getSaved(LS_KEY_LAST_TARGET, "");
  if (lastTarget && elJsonTarget) {
    const opt = Array.from(elJsonTarget.options).find(o => o.value === lastTarget);
    if (opt) elJsonTarget.value = lastTarget;
  }
  tryRestoreRememberedForTarget();

  // initial src build (falls file schon drin steht)
  syncSrcFromPartsIfNotManual();
  buildEntry();
})();
