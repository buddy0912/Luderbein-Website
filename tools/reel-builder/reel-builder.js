(function () {
  function $(id) { return document.getElementById(id); }
  function safeTrim(v) { return String(v || "").trim(); }

  const elSrc = $("src");
  const elCap = $("cap");
  const elAlt = $("alt");

  const elTagPreset = $("tagPreset");
  const elTagCustomOn = $("tagCustomOn");
  const elTagCustom = $("tagCustom");

  const outEntry = $("outEntry");
  const outJson = $("outJson");
  const status = $("status");

  const previewBox = $("previewBox");
  const previewImg = $("previewImg");

  function validateSrc(src) {
    if (!src) return { ok: false, msg: "Bitte Bildpfad eintragen." };
    if (!src.startsWith("/assets/")) return { ok: false, msg: "Bildpfad muss mit /assets/ beginnen." };
    const lower = src.toLowerCase();
    const okExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].some((e) => lower.endsWith(e));
    if (!okExt) return { ok: false, msg: "Tipp: Endung sollte .jpg/.png/.webp sein." };
    return { ok: true, msg: "OK" };
  }

  function currentTag() {
    const useCustom = !!elTagCustomOn.checked;
    if (useCustom) return safeTrim(elTagCustom.value);
    return safeTrim(elTagPreset.value);
  }

  function syncTagUI() {
    const useCustom = !!elTagCustomOn.checked;
    elTagCustom.disabled = !useCustom;
    if (!useCustom) elTagCustom.value = "";
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

  // Buttons
  $("btnEntry").addEventListener("click", () => buildEntry());

  $("btnCopyEntry").addEventListener("click", async () => {
    const { snippet } = buildEntry();
    const ok = await copyText(snippet);
    status.innerHTML = ok
      ? `<span class="rb-ok">✔ Eintrag kopiert.</span>`
      : `<span class="rb-bad">✖ Konnte nicht kopieren (Clipboard blockiert).</span>`;
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
    $("jsonIn").value = "";
    status.textContent = "";
    previewBox.style.display = "none";
  });

  $("btnAddToJson").addEventListener("click", () => {
    const { obj } = buildEntry();
    const inBox = $("jsonIn");

    let arr;
    try {
      arr = parseJsonArray(inBox.value);
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
      return;
    }

    if (!safeTrim(obj.src)) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte zuerst einen gültigen Bildpfad eintragen.</span>`;
      return;
    }

    arr.push(obj);
    outJson.textContent = JSON.stringify(arr, null, 2);
    status.innerHTML = `<span class="rb-ok">✔ Zur JSON hinzugefügt (unten kopieren).</span>`;
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
      outJson.textContent = JSON.stringify(arr, null, 2);
      status.innerHTML = `<span class="rb-ok">✔ JSON formatiert.</span>`;
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
    }
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
})();
