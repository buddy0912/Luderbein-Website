(function () {
  function $(id) { return document.getElementById(id); }
  function safeTrim(v) { return String(v || "").trim(); }

  const elSrcFolder = $("srcFolder");
  const elSrcFile = $("srcFile");
  const elSrc = $("src");
  const elCap = $("cap");
  const elAlt = $("alt");

  const elCat = $("cat");

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

  const jsonIn = $("jsonIn");
  const elJsonTarget = $("jsonTarget");

  const btnLoadJson = $("btnLoadJson");
  const btnRememberJson = $("btnRememberJson");

  const LS_KEY_LAST_TAG = "reelBuilder.lastTag";
  const LS_KEY_LAST_TAG_MODE = "reelBuilder.lastTagMode";
  const LS_KEY_LOCK_TAG = "reelBuilder.lockTag";
  const LS_KEY_LAST_CAT = "reelBuilder.lastCat";
  const LS_KEY_JSON_PREFIX = "reelBuilder.jsonCache:";

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

  function currentCat() {
    const v = safeTrim(elCat?.value || "").toLowerCase();
    return v;
  }

  function saveLastTagFromUI() {
    const tag = currentTag();
    if (!tag) return;
    const mode = elTagCustomOn.checked ? "custom" : "preset";
    setSaved(LS_KEY_LAST_TAG, tag);
    setSaved(LS_KEY_LAST_TAG_MODE, mode);
  }

  function saveLastCatFromUI() {
    const cat = currentCat();
    if (!cat) return;
    setSaved(LS_KEY_LAST_CAT, cat);
  }

  function applyLastTag() {
    const last = safeTrim(getSaved(LS_KEY_LAST_TAG, ""));
    if (!last) {
      status.innerHTML = `<span class="rb-bad">✖ Kein letztes Tag gespeichert.</span>`;
      return;
    }

    const mode = getSaved(LS_KEY_LAST_TAG_MODE, "preset");

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
    return getSaved(LS_KEY_LOCK_TAG, "0") === "1";
  }

  function buildSrcFromParts() {
    const folder = safeTrim(elSrcFolder?.value || "/assets/reel/");
    const file = safeTrim(elSrcFile?.value || "");
    if (!file) return folder;
    const f = folder.endsWith("/") ? folder : (folder + "/");
    const cleanFile = file.startsWith("/") ? file.slice(1) : file;
    return f + cleanFile;
  }

  function syncSrc() {
    const built = buildSrcFromParts();
    if (elSrc) elSrc.value = built;
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

  function buildEntry() {
    syncSrc();

    const src = safeTrim(elSrc.value);
    const cap = safeTrim(elCap.value);
    const alt = safeTrim(elAlt.value);
    const tag = currentTag();
    const cat = currentCat();

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
    if (cat) obj.cat = cat;

    outEntry.textContent = JSON.stringify(obj, null, 2);

    saveLastTagFromUI();
    saveLastCatFromUI();

    return { obj, snippet: JSON.stringify(obj), valid: v.ok };
  }

  async function loadJsonFromTarget() {
    const target = safeTrim(elJsonTarget?.value || "");
    if (!target) {
      status.innerHTML = `<span class="rb-bad">✖ Kein Ziel gewählt.</span>`;
      return;
    }

    try {
      const r = await fetch(target, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);

      const text = await r.text();
      const arr = parseJsonArray(text);
      const pretty = JSON.stringify(arr, null, 2);

      jsonIn.value = pretty;
      outJson.textContent = pretty;

      setSaved(LS_KEY_JSON_PREFIX + target, pretty);

      status.innerHTML = `<span class="rb-ok">✔ JSON geladen: ${target} (Einträge: ${arr.length})</span>`;
    } catch (e) {
      const cached = getSaved(LS_KEY_JSON_PREFIX + target, "");
      if (cached) {
        jsonIn.value = cached;
        outJson.textContent = cached;
        status.innerHTML = `<span class="rb-ok">✔ JSON aus Cache geladen (Fetch fehlgeschlagen): ${target}</span>`;
      } else {
        status.innerHTML = `<span class="rb-bad">✖ Konnte JSON nicht laden: ${target}</span>`;
      }
    }
  }

  function rememberJson() {
    const target = safeTrim(elJsonTarget?.value || "");
    if (!target) {
      status.innerHTML = `<span class="rb-bad">✖ Kein Ziel gewählt.</span>`;
      return;
    }
    const txt = safeTrim(jsonIn.value);
    if (!txt) {
      status.innerHTML = `<span class="rb-bad">✖ Nichts zu merken (Feld ist leer).</span>`;
      return;
    }
    setSaved(LS_KEY_JSON_PREFIX + target, txt);
    status.innerHTML = `<span class="rb-ok">✔ Zwischenstand gemerkt für ${target}</span>`;
  }

  $("btnEntry")?.addEventListener("click", () => buildEntry());

  $("btnCopyEntry")?.addEventListener("click", async () => {
    const { snippet } = buildEntry();
    const ok = await copyText(snippet);
    status.innerHTML = ok
      ? `<span class="rb-ok">✔ Eintrag kopiert.</span>`
      : `<span class="rb-bad">✖ Konnte nicht kopieren (Clipboard blockiert).</span>`;
  });

  $("btnClearSrc")?.addEventListener("click", () => {
    if (elSrcFile) elSrcFile.value = "";
    syncSrc();
    elSrcFile?.focus();
    buildEntry();
    status.innerHTML = `<span class="rb-ok">✔ Bildpfad geleert.</span>`;
  });

  $("btnClear")?.addEventListener("click", () => {
    if (elSrcFile) elSrcFile.value = "";
    syncSrc();

    elCap.value = "";
    elAlt.value = "";

    // ✅ Wunsch: beim "Leeren" cat resetten
    if (elCat) elCat.value = "";

    elTagPreset.value = "";
    elTagCustomOn.checked = false;
    elTagCustom.value = "";
    syncTagUI();

    outEntry.textContent = "";
    outJson.textContent = "";
    jsonIn.value = "";
    status.textContent = "";
    previewBox.style.display = "none";
  });

  $("btnAddToJson")?.addEventListener("click", () => {
    const { obj, valid } = buildEntry();

    let arr;
    try {
      arr = parseJsonArray(jsonIn.value);
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
      return;
    }

    if (!safeTrim(obj.src)) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte zuerst einen gültigen Bildpfad eintragen.</span>`;
      return;
    }

    if (!valid) {
      status.innerHTML = `<span class="rb-bad">✖ Bildpfad ist nicht gültig. (Muss /assets/... + Endung)</span>`;
      return;
    }

    const before = arr.length;
    arr.push(obj);
    const next = JSON.stringify(arr, null, 2);

    jsonIn.value = next;
    outJson.textContent = next;

    status.innerHTML = `<span class="rb-ok">✔ Zur JSON hinzugefügt (vorher ${before}, jetzt ${before + 1}).</span>`;

    if (elSrcFile) {
      elSrcFile.value = "";
      elSrcFile.focus();
    }
    syncSrc();

    if (!isLockTagOn()) {
      elTagPreset.value = "";
      elTagCustomOn.checked = false;
      elTagCustom.value = "";
      syncTagUI();
    }

    // cat bleibt nach Add bewusst stehen (Serienfreundlich)
    buildEntry();
  });

  $("btnCopyJson")?.addEventListener("click", async () => {
    const text = safeTrim(outJson.textContent || "") || safeTrim(jsonIn.value || "");
    if (!text) {
      status.innerHTML = `<span class="rb-bad">✖ Kein JSON Output vorhanden.</span>`;
      return;
    }
    const ok = await copyText(text);
    status.innerHTML = ok
      ? `<span class="rb-ok">✔ JSON kopiert.</span>`
      : `<span class="rb-bad">✖ Konnte nicht kopieren (Clipboard blockiert).</span>`;
  });

  $("btnFormatJson")?.addEventListener("click", () => {
    try {
      const arr = parseJsonArray(jsonIn.value);
      const next = JSON.stringify(arr, null, 2);
      jsonIn.value = next;
      outJson.textContent = next;
      status.innerHTML = `<span class="rb-ok">✔ JSON formatiert.</span>`;
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
    }
  });

  btnUseLastTag?.addEventListener("click", () => {
    applyLastTag();
    buildEntry();
  });

  if (elLockTag) {
    elLockTag.checked = getSaved(LS_KEY_LOCK_TAG, "0") === "1";
    elLockTag.addEventListener("change", () => {
      setSaved(LS_KEY_LOCK_TAG, elLockTag.checked ? "1" : "0");
    });
  }

  btnLoadJson?.addEventListener("click", loadJsonFromTarget);
  btnRememberJson?.addEventListener("click", rememberJson);

  elSrcFolder?.addEventListener("change", () => { syncSrc(); buildEntry(); });
  elSrcFile?.addEventListener("input", () => { syncSrc(); buildEntry(); });

  elCap?.addEventListener("input", () => buildEntry());
  elAlt?.addEventListener("input", () => buildEntry());
  elCat?.addEventListener("change", () => buildEntry());

  elTagPreset?.addEventListener("change", () => buildEntry());
  elTagCustomOn?.addEventListener("change", () => { syncTagUI(); buildEntry(); });
  elTagCustom?.addEventListener("input", () => buildEntry());

  syncTagUI();
  syncSrc();

  const lastCat = safeTrim(getSaved(LS_KEY_LAST_CAT, ""));
  if (elCat && lastCat) {
    const opt = Array.from(elCat.options).find(o => o.value === lastCat);
    if (opt) elCat.value = lastCat;
  }

  outEntry.textContent = "";
  outJson.textContent = "";
})();
