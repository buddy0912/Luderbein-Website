(function () {
  const TOKEN_KEY = "rights_admin_token";
  const API_PATH = "/api/veroeffentlichungsfreigabe";
  const form = document.getElementById("internal-prepare-form");
  if (!form) return;

  const tokenInput = document.getElementById("internal-token");
  const connectButton = document.getElementById("internal-connect");
  const disconnectButton = document.getElementById("internal-disconnect");
  const refreshButton = document.getElementById("internal-refresh");
  const status = document.getElementById("internal-status");
  const previewBanner = document.getElementById("internal-preview-mode");
  const channelValidation = document.getElementById("internal-channel-validation");
  const preparedResult = document.getElementById("internal-prepared-result");
  const preparedReference = document.getElementById("prepared-reference");
  const preparedRequestText = document.getElementById("prepared-request-text");
  const preparedDownload = document.getElementById("prepared-download");
  const preparedCopy = document.getElementById("prepared-copy");
  const list = document.getElementById("internal-record-list");
  const empty = document.getElementById("internal-empty");
  const filterInput = document.getElementById("internal-filter");
  const detail = document.getElementById("internal-detail");
  const detailStatus = document.getElementById("detail-status");
  const detailProject = document.getElementById("detail-project");
  const detailPrincipal = document.getElementById("detail-principal");
  const detailReference = document.getElementById("detail-reference");
  const detailOrderReference = document.getElementById("detail-order-reference");
  const detailContact = document.getElementById("detail-contact");
  const detailChannels = document.getElementById("detail-channels");
  const detailPersons = document.getElementById("detail-persons");
  const detailAirtable = document.getElementById("detail-airtable");
  const preparedPdfButton = document.getElementById("detail-prepared-pdf");
  const finalPdfButton = document.getElementById("detail-final-pdf");
  const evidenceButton = document.getElementById("detail-evidence");
  const confirmForm = document.getElementById("internal-confirm-form");
  const confirmationDate = document.getElementById("confirmation-date");
  const confirmationText = document.getElementById("confirmation-text");
  const confirmationContext = document.getElementById("confirmation-context");
  const confirmationEvidence = document.getElementById("confirmation-evidence");
  const confirmedCopy = document.getElementById("confirmed-copy");
  const confirmedMeta = document.getElementById("confirmed-meta");
  const confirmedText = document.getElementById("confirmed-text");

  const isLocalPreview =
    window.location.protocol === "file:" ||
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("visual") === "1";

  let entries = [];
  let selectedEntry = null;
  let preparedDownloadUrl = "";
  let submitInProgress = false;

  const demoEntry = {
    id: "preview",
    referenceCode: "VF-VORSCHAU-INTERN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmedAt: "",
    status: "prepared",
    projectTitle: "Drei Nachtwächter-Schwibbögen",
    principalName: "Beispielkommune",
    contactName: "Stadtsprecherin",
    contactRole: "",
    email: "",
    reference: "Beispielauftrag",
    note: "",
    selection: {
      website: true,
      socialMedia: true,
      digitalPortfolio: true,
      printedMaterials: false,
      projectStory: true,
      eventPhotos: true
    },
    selectedChannels: ["Werkfotos auf der Luderbein-Website", "Social Media", "Digitales Portfolio"],
    selectedAdditions: ["Entstehung, Entwicklung und Herstellung", "Fotos einer Übergabe oder Veranstaltung"],
    attribution: "named",
    attributionLabel: "Nennung des Kunden oder Auftraggebers",
    personStatus: "original-authorized",
    personStatusLabel: "Personen dürfen im Original gezeigt werden",
    declarationVersion: "VF-VORSCHAU",
    requestText:
      "Projekt: Drei Nachtwächter-Schwibbögen\nKunde: Beispielkommune\nReferenzcode: VF-VORSCHAU-INTERN\n\nDarf Luderbein das oben beschriebene Projekt im angegebenen Umfang veröffentlichen?\nEine eindeutige Antwort wie „Ja“ genügt.",
    confirmationText: "",
    confirmationContext: "",
    confirmationAssessed: false,
    evidenceName: "",
    hasEvidence: false,
    confirmationChannel: "",
    airtableSyncStatus: "not_started"
  };

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(value) {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders(includeJson) {
    const headers = {
      Accept: "application/json"
    };
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    if (includeJson) headers["Content-Type"] = "application/json";
    return headers;
  }

  function setStatus(message, type) {
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (type) status.classList.add(type);
  }

  function valueOf(name) {
    return String(form.elements[name]?.value || "").trim();
  }

  function checked(name) {
    return form.elements[name]?.checked === true;
  }

  function selectedValue(name) {
    return form.querySelector('[name="' + name + '"]:checked')?.value || "";
  }

  function hasSelectedChannel() {
    return ["website", "socialMedia", "digitalPortfolio", "printedMaterials"].some(checked);
  }

  function buildPreparePayload() {
    return {
      formType: "general",
      projectTitle: valueOf("projectTitle"),
      principalName: valueOf("principalName"),
      contactName: valueOf("contactName"),
      contactRole: valueOf("contactRole"),
      email: valueOf("email"),
      reference: valueOf("reference"),
      note: valueOf("note"),
      website: checked("website"),
      socialMedia: checked("socialMedia"),
      digitalPortfolio: checked("digitalPortfolio"),
      printedMaterials: checked("printedMaterials"),
      attribution: selectedValue("attribution"),
      projectStory: checked("projectStory"),
      eventPhotos: checked("eventPhotos"),
      personStatus: selectedValue("personStatus")
    };
  }

  function clearPreparedDownload() {
    if (preparedDownloadUrl) {
      URL.revokeObjectURL(preparedDownloadUrl);
      preparedDownloadUrl = "";
    }
    preparedDownload.removeAttribute("href");
    preparedDownload.removeAttribute("download");
  }

  function base64ToBlob(base64, mediaType) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mediaType || "application/pdf" });
  }

  function prepareDownloadLink(download) {
    clearPreparedDownload();
    if (!download?.contentBase64) return;
    preparedDownloadUrl = URL.createObjectURL(
      base64ToBlob(download.contentBase64, download.mediaType)
    );
    preparedDownload.href = preparedDownloadUrl;
    preparedDownload.download = download.filename || "vorbereitete-freigabe.pdf";
  }

  function statusLabel(entry) {
    return entry.status === "confirmed" ? "Bestätigt" : "Bestätigung ausstehend";
  }

  function formatDate(value) {
    return value
      ? new Date(value).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })
      : "nicht angegeben";
  }

  function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
  }

  function renderList() {
    const query = String(filterInput.value || "").trim().toLowerCase();
    const filtered = entries.filter(function (entry) {
      return (
        !query ||
        [entry.projectTitle, entry.principalName, entry.referenceCode, entry.reference]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    });

    list.replaceChildren();
    empty.hidden = filtered.length > 0;
    empty.textContent = filtered.length ? "" : "Keine passenden Vorgänge gefunden.";

    filtered.forEach(function (entry) {
      const row = document.createElement("tr");
      const statusCell = document.createElement("td");
      const pill = document.createElement("span");
      pill.className =
        "internal-row-status" + (entry.status === "confirmed" ? " is-confirmed" : "");
      pill.textContent = statusLabel(entry);
      statusCell.appendChild(pill);

      row.appendChild(statusCell);
      row.appendChild(createCell(entry.projectTitle));
      row.appendChild(createCell(entry.principalName));
      row.appendChild(createCell(entry.referenceCode));

      const actionCell = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn ghost";
      button.textContent = "Öffnen";
      button.dataset.reference = entry.referenceCode;
      actionCell.appendChild(button);
      row.appendChild(actionCell);
      list.appendChild(row);
    });
  }

  function setDefaultConfirmationDate() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    confirmationDate.value = date.toISOString().slice(0, 16);
  }

  function renderDetail(entry) {
    selectedEntry = entry;
    detail.hidden = false;
    detailStatus.textContent = statusLabel(entry);
    detailProject.textContent = entry.projectTitle;
    detailPrincipal.textContent = entry.principalName;
    detailReference.textContent = entry.referenceCode;
    detailOrderReference.textContent = entry.reference || "nicht angegeben";
    detailContact.textContent = [entry.contactName, entry.contactRole].filter(Boolean).join(" · ");
    detailChannels.textContent = entry.selectedChannels?.join(", ") || "nicht angegeben";
    detailPersons.textContent = entry.personStatusLabel || "nicht angegeben";
    detailAirtable.textContent =
      entry.status === "prepared"
        ? "noch kein Schreibvorgang"
        : entry.airtableSyncStatus === "synced"
          ? "synchronisiert"
          : entry.airtableSyncStatus || "nicht konfiguriert";

    preparedPdfButton.dataset.reference = entry.referenceCode;
    finalPdfButton.dataset.reference = entry.referenceCode;
    evidenceButton.dataset.reference = entry.referenceCode;
    finalPdfButton.hidden = entry.status !== "confirmed";
    evidenceButton.hidden = !entry.hasEvidence;
    confirmForm.hidden = entry.status === "confirmed";
    confirmedCopy.hidden = entry.status !== "confirmed";

    if (entry.status === "confirmed") {
      confirmedMeta.textContent =
        (entry.confirmationChannel === "whatsapp" ? "WhatsApp" : "E-Mail") +
        " · " +
        formatDate(entry.confirmedAt);
      confirmedText.textContent = entry.confirmationText || "nicht angegeben";
    } else {
      confirmForm.reset();
      confirmationContext.value = entry.requestText || "";
      setDefaultConfirmationDate();
    }
  }

  async function apiJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(function () {
      return null;
    });
    if (response.status === 401) {
      throw new Error("Nicht autorisiert. Bitte das gültige Admin-Token eingeben.");
    }
    if (!response.ok) {
      throw new Error(data?.error || "Die Anfrage konnte nicht verarbeitet werden.");
    }
    return data;
  }

  async function loadEntries() {
    if (isLocalPreview) {
      entries = [demoEntry];
      renderList();
      renderDetail(demoEntry);
      setStatus("Lokale Vorschau geladen. Es wurden keine Daten abgerufen.", "is-success");
      return;
    }

    if (!getToken()) {
      entries = [];
      renderList();
      detail.hidden = true;
      setStatus("Bitte zuerst das Admin-Token eingeben.", "is-error");
      return;
    }

    setStatus("Vorgänge werden geladen …");
    try {
      const data = await apiJson(API_PATH + "?mode=list", {
        headers: authHeaders(false)
      });
      entries = Array.isArray(data.entries) ? data.entries : [];
      renderList();
      setStatus(entries.length + " Vorgänge geladen.", "is-success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Liste konnte nicht geladen werden.", "is-error");
    }
  }

  async function loadDetail(referenceCode) {
    if (isLocalPreview) {
      renderDetail(demoEntry);
      return;
    }

    setStatus("Vorgang wird geladen …");
    try {
      const data = await apiJson(
        API_PATH + "?mode=detail&reference=" + encodeURIComponent(referenceCode),
        { headers: authHeaders(false) }
      );
      renderDetail(data.entry);
      setStatus("Vorgang geladen.", "is-success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Vorgang konnte nicht geladen werden.", "is-error");
    }
  }

  async function downloadProtected(referenceCode, mode, stage) {
    if (isLocalPreview) {
      setStatus("PDF-Download wird im funktionalen Test geprüft.", "is-success");
      return;
    }

    const query =
      "?mode=" +
      mode +
      "&reference=" +
      encodeURIComponent(referenceCode) +
      (stage ? "&stage=" + encodeURIComponent(stage) : "");
    setStatus("Datei wird erzeugt …");

    try {
      const response = await fetch(API_PATH + query, {
        headers: authHeaders(false)
      });
      if (response.status === 401) throw new Error("Nicht autorisiert.");
      if (!response.ok) {
        const data = await response.json().catch(function () {
          return null;
        });
        throw new Error(data?.error || "Datei konnte nicht geladen werden.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition = response.headers.get("content-disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || "freigabe.pdf";
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("Datei bereitgestellt.", "is-success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Datei konnte nicht geladen werden.", "is-error");
    }
  }

  function readEvidence(file) {
    if (!file) return Promise.resolve(null);
    if (file.size > 750 * 1024) {
      return Promise.reject(new Error("Der Zusatznachweis darf höchstens 750 KB groß sein."));
    }

    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = function () {
        reject(new Error("Der Zusatznachweis konnte nicht gelesen werden."));
      };
      reader.onload = function () {
        const result = String(reader.result || "");
        const marker = ";base64,";
        const markerIndex = result.indexOf(marker);
        if (markerIndex === -1) {
          reject(new Error("Der Zusatznachweis ist ungültig."));
          return;
        }
        resolve({
          filename: file.name,
          mediaType: file.type,
          contentBase64: result.slice(markerIndex + marker.length)
        });
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submitInProgress) return;

    const channelsValid = hasSelectedChannel();
    channelValidation.classList.toggle("is-visible", !channelsValid);
    if (!channelsValid) {
      setStatus("Bitte mindestens einen Veröffentlichungskanal auswählen.", "is-error");
      return;
    }
    if (!form.reportValidity()) {
      setStatus("Bitte alle Pflichtangaben und Entscheidungen ausfüllen.", "is-error");
      return;
    }

    submitInProgress = true;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    setStatus("Vorbereitete Freigabe wird erzeugt …");

    try {
      let data;
      if (isLocalPreview) {
        data = {
          ...demoEntry,
          requestText: demoEntry.requestText,
          download: null
        };
      } else {
        data = await apiJson(API_PATH + "?mode=prepare", {
          method: "POST",
          headers: authHeaders(true),
          body: JSON.stringify(buildPreparePayload())
        });
      }

      preparedReference.textContent = data.referenceCode;
      preparedRequestText.value = data.requestText || "";
      prepareDownloadLink(data.download);
      preparedDownload.hidden = !data.download;
      preparedResult.hidden = false;
      preparedResult.scrollIntoView({ behavior: "smooth", block: "start" });
      setStatus("Vorbereitete Freigabe ist bereit.", "is-success");
      await loadEntries();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Vorbereitung fehlgeschlagen.", "is-error");
    } finally {
      submitInProgress = false;
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });

  confirmForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!selectedEntry || submitInProgress) return;
    if (!confirmForm.reportValidity()) {
      setStatus("Bitte die Bestätigung vollständig dokumentieren.", "is-error");
      return;
    }

    submitInProgress = true;
    const submitButton = confirmForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    setStatus("Bestätigung wird abgeschlossen …");

    try {
      if (isLocalPreview) {
        throw new Error("Der Abschluss wird nur im funktionalen Test ausgeführt.");
      }

      const evidence = await readEvidence(confirmationEvidence.files?.[0] || null);
      const channel =
        confirmForm.querySelector('[name="confirmationChannel"]:checked')?.value || "";
      const data = await apiJson(API_PATH + "?mode=confirm", {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          referenceCode: selectedEntry.referenceCode,
          confirmationChannel: channel,
          confirmedAt: new Date(confirmationDate.value).toISOString(),
          confirmationText: confirmationText.value.trim(),
          confirmationContext: confirmationContext.value.trim(),
          confirmationAssessed:
            confirmForm.elements.confirmationAssessed?.checked === true,
          evidence
        })
      });

      setStatus(
        data.airtableSyncStatus === "synced"
          ? "Bestätigung abgeschlossen und einmalig nach Airtable übertragen."
          : "Bestätigung abgeschlossen. Airtable konnte noch nicht synchronisiert werden.",
        data.airtableSyncStatus === "synced" ? "is-success" : "is-error"
      );
      await loadEntries();
      await loadDetail(selectedEntry.referenceCode);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Bestätigung fehlgeschlagen.", "is-error");
    } finally {
      submitInProgress = false;
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });

  connectButton.addEventListener("click", function () {
    const token = String(tokenInput.value || "").trim();
    if (!token && !isLocalPreview) {
      setStatus("Bitte das Admin-Token eingeben.", "is-error");
      return;
    }
    if (token) setToken(token);
    loadEntries();
  });

  disconnectButton.addEventListener("click", function () {
    setToken("");
    tokenInput.value = "";
    entries = [];
    renderList();
    detail.hidden = true;
    setStatus("Token gelöscht.", "is-success");
  });

  refreshButton.addEventListener("click", loadEntries);
  filterInput.addEventListener("input", renderList);
  list.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-reference]");
    if (button) loadDetail(button.dataset.reference || "");
  });

  preparedCopy.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(preparedRequestText.value);
      setStatus("Kundenanfrage kopiert.", "is-success");
    } catch {
      preparedRequestText.select();
      setStatus("Text markiert. Bitte manuell kopieren.", "is-success");
    }
  });

  preparedPdfButton.addEventListener("click", function () {
    if (selectedEntry) downloadProtected(selectedEntry.referenceCode, "pdf", "prepared");
  });
  finalPdfButton.addEventListener("click", function () {
    if (selectedEntry) downloadProtected(selectedEntry.referenceCode, "pdf", "confirmed");
  });
  evidenceButton.addEventListener("click", function () {
    if (selectedEntry) downloadProtected(selectedEntry.referenceCode, "evidence", "");
  });

  if (isLocalPreview) {
    previewBanner.classList.add("is-visible");
    tokenInput.value = "Lokaler Prüfmodus";
    tokenInput.disabled = true;
    loadEntries();
  } else {
    const savedToken = getToken();
    if (savedToken) {
      tokenInput.value = savedToken;
      loadEntries();
    } else {
      renderList();
      setStatus("Bitte das Admin-Token eingeben.");
    }
  }

  setDefaultConfirmationDate();
})();
