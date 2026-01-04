(function () {
  function $(id) { return document.getElementById(id); }
  function safeTrim(v) { return String(v || "").trim(); }

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

  const elJsonTarget = $("jsonTarget");
  const btnLoadJson = $("btnLoadJson");
  const btnRememberJson = $("btnRememberJson");

  const outEntry = $("outEntry");
  const outJson = $("outJson");
  const status = $("status");

  const previewBox = $("previewBox");
  const previewImg = $("previewImg");

  // Persistenz
  const LS_KEY_TAG = "reelBuilder.lastTag";
  const LS_KEY_TAG_MODE = "reelBuilder.lastTagMode"; // "preset" | "custom"
  const LS_KEY_LOCK = "reelBuilder.lockTag";         // "1" | "0"
  const LS_KEY_JSON_PREFIX = "reelBuilder.jsonBuffer:"; // + jsonTarget
  const LS_KEY_LAST_TARGET = "reelBuilder.lastJsonTarget";
  const LS_KEY_LAST_FOLDER = "reelBuilder.lastSrcFolder";

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
    setSaved(LS_KEY_TAG_MODE, mode);
  }

  function applyLastTag() {
    const last = safeTrim(getSaved(LS_KEY_TAG, ""));
    if (!last) {
      status.innerHTML = `<span class="rb-bad">✖ Kein letztes Tag gespeichert.</span>`;
      return;
    }

    const mode = getSaved(LS_KEY_TAG_MODE, "preset");

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

  function buildSrcFromDropdown() {
    const folder = safeTrim(elSrcFolder.value);
    const file = safeTrim(elSrcFile.value);
    if (!folder || !file) return "";
    // prevent double slashes
    const f = folder.endsWith("/") ? folder : (folder + "/");
    return f + file.replace(/^\/+/, "");
  }

  function keepDropdownInSyncWithSrc() {
    // Wenn user manuell in "src" tippt, lassen wir Dropdown stehen.
    // Aber wenn Dropdown/File geändert wird, überschreiben wir src.
  }

  function buildEntry({ quiet = false } = {}) {
    const src = safeTrim(elSrc.value);
    const cap = safeTrim(elCap.value);
    const alt = safeTrim(elAlt.value);
    const tag = currentTag();

    const v = validateSrc(src);
    if (!quiet) {
      status.innerHTML = v.ok
        ? `<span class="rb-ok">✔ ${v.msg}</span>`
        : `<span class="rb-bad">✖ ${v.msg}</span>`;
    }

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

  function jsonBufferKey() {
    return LS_KEY_JSON_PREFIX + safeTrim(elJsonTarget.value || "");
  }

  function rememberJsonNow() {
    const inBox = $("jsonIn");
    const val = safeTrim(inBox.value);
    if (!val) {
      status.innerHTML = `<span class="rb-bad">✖ Nichts zu merken (JSON-Feld ist leer).</span>`;
      return;
    }
    setSaved(jsonBufferKey(), val);
    status.innerHTML = `<span class="rb-ok">✔ Zwischenstand gemerkt (für dieses Ziel-JSON).</span>`;
  }

  function restoreRememberedJson() {
    const inBox = $("jsonIn");
    const saved = safeTrim(getSaved(jsonBufferKey(), ""));
    if (saved) {
      inBox.value = saved;
      try {
        const arr = parseJsonArray(saved);
        outJson.textContent = JSON.stringify(arr, null, 2);
      } catch {
        // ignore
      }
      status.innerHTML = `<span class="rb-ok">✔ Gemerkter Zwischenstand geladen.</span>`;
    }
  }

  async function loadJsonFromSource() {
    const target = safeTrim(elJsonTarget.value);
    if (!target) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte Ziel-JSON wählen.</span>`;
      return;
    }

    status.innerHTML = `<span class="rb-ok">… lade ${target}</span>`;

    try {
      // Cache-bust (Cloudflare/Browser)
      const url = target + (target.includes("?") ? "&" : "?") + "v=" + Date.now();
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const arr = parseJsonArray(text); // validiert Array
      $("jsonIn").value = JSON.stringify(arr, null, 2);
      outJson.textContent = JSON.stringify(arr, null, 2);

      // merken
      setSaved(jsonBufferKey(), JSON.stringify(arr, null, 2));

      status.innerHTML = `<span class="rb-ok">✔ JSON geladen: ${arr.length} Einträge.</span>`;
    } catch (e) {
      status.innerHTML = `<span class="rb-bad">✖ Konnte Quelle nicht laden/parse'n: ${e.message}</span>`;
    }
  }

  // --- Events ---

  // Dropdown → src auto bauen
  function syncSrcFromParts() {
    const built = buildSrcFromDropdown();
    if (built) {
      elSrc.value = built;
      buildEntry({ quiet: true });
    }
    setSaved(LS_KEY_LAST_FOLDER, elSrcFolder.value);
  }

  elSrcFolder.addEventListener("change", syncSrcFromParts);
  elSrcFile.addEventListener("input", syncSrcFromParts);

  // Wenn user manuell in src tippt: wir lassen ihn.
  elSrc.addEventListener("input", () => buildEntry({ quiet: true }));

  // Live preview
  elCap.addEventListener("input", () => buildEntry({ quiet: true }));
  elAlt.addEventListener("input", () => buildEntry({ quiet: true }));

  elTagPreset.addEventListener("change", () => buildEntry({ quiet: true }));
  elTagCustomOn.addEventListener("change", () => { syncTagUI(); buildEntry({ quiet: true }); });
  elTagCustom.addEventListener("input", () => buildEntry({ quiet: true }));

  // Buttons Entry
  $("btnEntry").addEventListener("click", () => buildEntry());

  $("btnCopyEntry").addEventListener("click", async () => {
    const { snippet } = buildEntry();
    const ok = await copyText(snippet);
    status.innerHTML = ok
      ? `<span class="rb-ok">✔ Eintrag kopiert.</span>`
      : `<span class="rb-bad">✖ Konnte nicht kopieren (Clipboard blockiert).</span>`;
  });

  $("btnClearSrc").addEventListener("click", () => {
    elSrcFile.value = "";
    elSrc.value = "";
    elSrcFile.focus();
    buildEntry({ quiet: true });
    status.innerHTML = `<span class="rb-ok">✔ Bildpfad geleert.</span>`;
  });

  $("btnClear").addEventListener("click", () => {
    elSrcFile.value = "";
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
    // JSON bleibt bewusst, damit du nix verlierst
  });

  // JSON target handling
  elJsonTarget.addEventListener("change", () => {
    setSaved(LS_KEY_LAST_TARGET, elJsonTarget.value);
    // optional: remembered buffer laden
    restoreRememberedJson();
  });

  btnLoadJson.addEventListener("click", () => loadJsonFromSource());
  btnRememberJson.addEventListener("click", () => rememberJsonNow());

  // Add to JSON
  $("btnAddToJson").addEventListener("click", () => {
    const { obj } = buildEntry();
    const inBox = $("jsonIn");

    if (!safeTrim(obj.src)) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte zuerst einen gültigen Bildpfad eintragen.</span>`;
      return;
    }

    let arr;
    try {
      arr = parseJsonArray(inBox.value);
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
      return;
    }

    const before = arr.length;
    arr.push(obj);
    const after = arr.length;

    const pretty = JSON.stringify(arr, null, 2);
    outJson.textContent = pretty;
    inBox.value = pretty;

    // merken
    setSaved(jsonBufferKey(), pretty);

    status.innerHTML = `<span class="rb-ok">✔ Hinzugefügt: vorher ${before}, jetzt ${after}.</span>`;

    // Speed: nur Bildpfad leeren
    elSrcFile.value = "";
    elSrc.value = "";
    elSrcFile.focus();

    // Wenn Tag NICHT gesperrt: Tag zurücksetzen
    if (!isLockTagOn()) {
      elTagPreset.value = "";
      elTagCustomOn.checked = false;
      elTagCustom.value = "";
      syncTagUI();
    }

    buildEntry({ quiet: true });
  });

  $("btnCopyJson").addEventListener("click", async () => {
    const text = outJson.textContent || "";
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
    const inBox = $("jsonIn");
    try {
      const arr = parseJsonArray(inBox.value);
      const pretty = JSON.stringify(arr, null, 2);
      outJson.textContent = pretty;
      inBox.value = pretty;

      setSaved(jsonBufferKey(), pretty);

      status.innerHTML = `<span class="rb-ok">✔ JSON formatiert.</span>`;
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
    }
  });

  // Tag tools
  btnUseLastTag.addEventListener("click", () => {
    applyLastTag();
    buildEntry({ quiet: true });
  });

  // Lock persists
  elLockTag.checked = getSaved(LS_KEY_LOCK, "0") === "1";
  elLockTag.addEventListener("change", () => {
    setSaved(LS_KEY_LOCK, elLockTag.checked ? "1" : "0");
  });

  // Init
  syncTagUI();
  outEntry.textContent = "";
  outJson.textContent = "";

  // Restore last folder/target
  const lastFolder = getSaved(LS_KEY_LAST_FOLDER, "");
  if (lastFolder && Array.from(elSrcFolder.options).some(o => o.value === lastFolder)) {
    elSrcFolder.value = lastFolder;
  }

  const lastTarget = getSaved(LS_KEY_LAST_TARGET, "");
  if (lastTarget && Array.from(elJsonTarget.options).some(o => o.value === lastTarget)) {
    elJsonTarget.value = lastTarget;
  }

  // Restore remembered json buffer (if exists)
  restoreRememberedJson();
})();
