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

  // JSON tools
  const elJsonSrc = $("jsonSrc");
  const btnLoadJson = $("btnLoadJson");
  const btnUseOutAsBase = $("btnUseOutAsBase");
  const elJsonIn = $("jsonIn");

  // Persistenz (iPad-friendly)
  const LS_KEY = "reelBuilder.lastTag";
  const LS_KEY_MODE = "reelBuilder.lastTagMode"; // "preset" | "custom"
  const LS_KEY_LOCK = "reelBuilder.lockTag";     // "1" | "0"
  const LS_KEY_JSONSRC = "reelBuilder.jsonSrc";  // last used json source

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
    setSaved(LS_KEY, tag);
    setSaved(LS_KEY_MODE, mode);
  }

  function applyLastTag() {
    const last = safeTrim(getSaved(LS_KEY, ""));
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
        // Fallback: wenn Preset nicht existiert, nutze Custom
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

  function setBaseJson(arr, note = "") {
    const formatted = JSON.stringify(arr, null, 2);
    elJsonIn.value = formatted;
    outJson.textContent = formatted;
    status.innerHTML = `<span class="rb-ok">✔ Basis geladen${note ? " – " + note : ""} (Einträge: ${arr.length}).</span>`;
  }

  async function loadJsonFromSource() {
    const src = safeTrim(elJsonSrc.value);
    if (!src) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte eine Quelle eintragen (z.B. /assets/reel-holz.json).</span>`;
      return;
    }
    if (!src.startsWith("/")) {
      status.innerHTML = `<span class="rb-bad">✖ Quelle muss mit / beginnen (z.B. /assets/reel-holz.json).</span>`;
      return;
    }

    try {
      const res = await fetch(src + (src.includes("?") ? "&" : "?") + "v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Quelle enthält kein JSON-Array.");
      setSaved(LS_KEY_JSONSRC, src);
      setBaseJson(data, `Quelle: ${src}`);
    } catch (e) {
      status.innerHTML = `<span class="rb-bad">✖ Konnte Quelle nicht laden: ${src} (${e.message})</span>`;
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
    outJson.textContent = "";
    elJsonIn.value = "";
    status.textContent = "";
    previewBox.style.display = "none";
    // Lock bleibt bewusst erhalten
  });

  // JSON load helpers
  if (btnLoadJson) btnLoadJson.addEventListener("click", () => loadJsonFromSource());

  if (btnUseOutAsBase) btnUseOutAsBase.addEventListener("click", () => {
    const t = safeTrim(outJson.textContent);
    if (!t) {
      status.innerHTML = `<span class="rb-bad">✖ Kein Output vorhanden, den man übernehmen kann.</span>`;
      return;
    }
    try {
      const arr = parseJsonArray(t);
      setBaseJson(arr, "Output als Basis übernommen");
    } catch (e) {
      status.innerHTML = `<span class="rb-bad">✖ Output ist kein gültiges Array: ${e.message}</span>`;
    }
  });

  $("btnAddToJson").addEventListener("click", () => {
    const { obj } = buildEntry();

    // WICHTIG: Basis nehmen aus jsonIn; falls leer, fallback auf outJson
    let baseText = safeTrim(elJsonIn.value);
    if (!baseText) baseText = safeTrim(outJson.textContent);

    let arr;
    try {
      arr = parseJsonArray(baseText);
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
      return;
    }

    if (!safeTrim(obj.src)) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte zuerst einen gültigen Bildpfad eintragen.</span>`;
      return;
    }

    const before = arr.length;
    arr.push(obj);
    setBaseJson(arr, `hinzugefügt: +1 (vorher ${before}, jetzt ${arr.length})`);

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

    buildEntry();
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
    try {
      const arr = parseJsonArray(elJsonIn.value);
      setBaseJson(arr, "formatiert");
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

  // Init
  syncTagUI();
  outEntry.textContent = "";
  outJson.textContent = "";

  // Default JSON source (last used) – damit du sofort loslegen kannst
  if (elJsonSrc) {
    elJsonSrc.value = getSaved(LS_KEY_JSONSRC, "/assets/reel-holz.json");
  }
})();
