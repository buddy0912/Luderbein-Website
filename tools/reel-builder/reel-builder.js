(function () {
  function $(id) { return document.getElementById(id); }

  const elSrc = $("src");
  const elCap = $("cap");
  const elAlt = $("alt");

  const outEntry = $("outEntry");
  const outJson = $("outJson");
  const status = $("status");

  const previewBox = $("previewBox");
  const previewImg = $("previewImg");

  function safeTrim(v) { return String(v || "").trim(); }

  function validateSrc(src) {
    if (!src) return { ok: false, msg: "Bitte Bildpfad eintragen." };
    if (!src.startsWith("/assets/")) return { ok: false, msg: "Bildpfad muss mit /assets/ beginnen." };
    // simple extension check
    const lower = src.toLowerCase();
    const okExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].some((e) => lower.endsWith(e));
    if (!okExt) return { ok: false, msg: "Tipp: Endung sollte .jpg/.png/.webp sein." };
    return { ok: true, msg: "OK" };
  }

  function buildEntry() {
    const src = safeTrim(elSrc.value);
    const cap = safeTrim(elCap.value);
    const alt = safeTrim(elAlt.value);

    const v = validateSrc(src);
    if (!v.ok) {
      status.innerHTML = `<span class="rb-bad">✖ ${v.msg}</span>`;
    } else {
      status.innerHTML = `<span class="rb-ok">✔ ${v.msg}</span>`;
    }

    // preview (best effort)
    if (src) {
      previewImg.src = src;
      previewImg.alt = alt || "";
      previewBox.style.display = "block";
    } else {
      previewBox.style.display = "none";
    }

    const obj = {
      src: src,
      alt: alt,
      cap: cap
    };

    // compact snippet (copy-friendly)
    const snippet = JSON.stringify(obj);
    // pretty (readable)
    const pretty = JSON.stringify(obj, null, 2);

    outEntry.textContent = pretty;

    return { obj, snippet, pretty, valid: v.ok };
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
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

  function formatJson(text) {
    const arr = parseJsonArray(text);
    return JSON.stringify(arr, null, 2);
  }

  // Buttons
  $("btnEntry").addEventListener("click", () => {
    buildEntry();
  });

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

    // basic guard: ignore empty src
    if (!safeTrim(obj.src)) {
      status.innerHTML = `<span class="rb-bad">✖ Bitte zuerst einen gültigen Bildpfad eintragen.</span>`;
      return;
    }

    arr.push(obj);
    const pretty = JSON.stringify(arr, null, 2);
    outJson.textContent = pretty;
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
      const pretty = formatJson(inBox.value);
      outJson.textContent = pretty;
      status.innerHTML = `<span class="rb-ok">✔ JSON formatiert.</span>`;
    } catch (e) {
      outJson.textContent = "";
      status.innerHTML = `<span class="rb-bad">✖ ${e.message}</span>`;
    }
  });

  // Convenience: live preview + enter auto-build
  elSrc.addEventListener("input", () => buildEntry());
  elCap.addEventListener("input", () => buildEntry());
  elAlt.addEventListener("input", () => buildEntry());

  // Initial empty state
  outEntry.textContent = "";
  outJson.textContent = "";
})();
