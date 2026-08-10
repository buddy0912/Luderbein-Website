(function () {
  const form = document.querySelector("[data-release-form]");
  if (!form) return;

  const status = document.getElementById("release-status");
  const proof = document.getElementById("release-proof");
  const proofReference = document.getElementById("release-proof-reference");
  const proofDate = document.getElementById("release-proof-date");
  const downloadBox = document.getElementById("release-download");
  const downloadLink = document.getElementById("release-download-link");
  const contentValidation = document.getElementById("release-content-validation");
  const channelValidation = document.getElementById("release-channel-validation");
  const previewBanner = document.getElementById("release-preview-mode");
  const submitButton = form.querySelector('[type="submit"]');
  const attributionNameWrap = document.getElementById("release-attribution-name-wrap");
  const attributionNameInput = document.getElementById("release-attribution-name");
  const visibleInfoDetailsWrap = document.getElementById("release-visible-info-details-wrap");
  const visibleInfoDetailsInput = document.getElementById("release-visible-info-details");

  const isLocalPreview =
    window.location.protocol === "file:" ||
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("visual") === "1";

  const summary = {
    project: document.getElementById("release-summary-project"),
    material: document.getElementById("release-summary-material"),
    content: document.getElementById("release-summary-content"),
    channels: document.getElementById("release-summary-channels"),
    attribution: document.getElementById("release-summary-attribution"),
    persons: document.getElementById("release-summary-persons")
  };

  const contentLabels = [
    ["finishedWork", "Fertiges Werkstück"],
    ["detailShots", "Detailaufnahmen"],
    ["creationProcess", "Entstehung und Herstellung"],
    ["handoverPresentation", "Übergabe oder Präsentation"],
    ["customerProvidedMedia", "Vom Kunden bereitgestellte Bilder / Videos"]
  ];
  const channelLabels = [
    ["websitePortfolio", "Website & Online-Portfolio"],
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["whatsappStatus", "WhatsApp-Status"],
    ["digitalReference", "Digitales Referenzportfolio / Präsentation"],
    ["printedReferences", "Gedruckte Referenz- & Werbemittel"]
  ];

  let downloadUrl = "";
  let submissionInProgress = false;

  if (isLocalPreview && previewBanner) previewBanner.classList.add("is-visible");

  function valueOf(name) {
    return String(form.elements[name]?.value || "").trim();
  }

  function checked(name) {
    return form.elements[name]?.checked === true;
  }

  function selectedValue(name) {
    return form.querySelector(`[name="${name}"]:checked`)?.value || "";
  }

  function selectedLabel(name) {
    return (
      form
        .querySelector(`[name="${name}"]:checked`)
        ?.closest("label")
        ?.querySelector("strong")
        ?.textContent?.trim() || ""
    );
  }

  function activeLabels(definitions) {
    return definitions.filter(([name]) => checked(name)).map(([, label]) => label);
  }

  function setText(element, value, fallback) {
    if (!element) return;
    element.textContent = value || fallback;
    element.classList.toggle("release-summary__empty", !value);
  }

  function setList(element, values, fallback) {
    if (!element) return;
    element.replaceChildren();
    const items = values.length ? values : [fallback];
    items.forEach(function (value, index) {
      const item = document.createElement("li");
      item.textContent = value;
      if (!values.length && index === 0) item.className = "release-summary__empty";
      element.appendChild(item);
    });
  }

  function updateConditionalFields() {
    const named = selectedValue("attribution") === "named";
    attributionNameWrap.hidden = !named;
    attributionNameInput.required = named;
    if (!named) attributionNameInput.setCustomValidity("");

    const specified = selectedValue("visibleInfoStatus") === "specified";
    visibleInfoDetailsWrap.hidden = !specified;
    visibleInfoDetailsInput.required = specified;
    if (!specified) visibleInfoDetailsInput.setCustomValidity("");
  }

  function updateSummary() {
    updateConditionalFields();

    const project = [valueOf("projectTitle"), valueOf("principalName"), valueOf("reference")]
      .filter(Boolean)
      .join(" · ");
    const content = activeLabels(contentLabels);
    const shownOther = valueOf("shownOtherText");
    if (shownOther) content.push("Sonstiges: " + shownOther);
    const channels = activeLabels(channelLabels);
    const destinationOther = valueOf("destinationOtherText");
    if (destinationOther) channels.push("Weitere Nutzung: " + destinationOther);

    let attribution = selectedLabel("attribution");
    if (selectedValue("attribution") === "named" && valueOf("attributionName")) {
      attribution += ": " + valueOf("attributionName");
    }
    const visibleInfo = selectedLabel("visibleInfoStatus");
    if (visibleInfo) attribution = [attribution, visibleInfo].filter(Boolean).join(" · ");

    let persons = selectedLabel("personStatus");
    if (checked("minorsAuthorized")) persons += " · Zustimmung für Minderjährige bestätigt";

    setText(summary.project, project, "Noch nicht eingetragen");
    setText(summary.material, valueOf("materialDescription"), "Noch nicht beschrieben");
    setList(summary.content, content, "Noch nichts gewählt");
    setList(summary.channels, channels, "Noch nichts gewählt");
    setText(summary.attribution, attribution, "Noch nicht festgelegt");
    setText(summary.persons, persons, "Noch nicht festgelegt");
  }

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (type) status.classList.add(type);
  }

  function clearDownload() {
    if (downloadBox) downloadBox.hidden = true;
    if (downloadLink) {
      downloadLink.removeAttribute("href");
      downloadLink.removeAttribute("download");
    }
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = "";
  }

  function base64ToBlob(base64, mediaType) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mediaType || "application/pdf" });
  }

  function prepareDownload(download) {
    if (!download?.contentBase64 || !downloadLink || !downloadBox) return false;
    clearDownload();
    downloadUrl = URL.createObjectURL(base64ToBlob(download.contentBase64, download.mediaType));
    downloadLink.href = downloadUrl;
    downloadLink.download = download.filename || "veroeffentlichungsfreigabe.pdf";
    downloadBox.hidden = false;
    return true;
  }

  function hasSelectedContent() {
    return contentLabels.some(([name]) => checked(name)) || !!valueOf("shownOtherText");
  }

  function hasSelectedChannel() {
    return channelLabels.some(([name]) => checked(name)) || !!valueOf("destinationOtherText");
  }

  function buildPayload() {
    return {
      formType: form.dataset.formType || "general",
      projectTitle: valueOf("projectTitle"),
      principalName: valueOf("principalName"),
      contactName: valueOf("contactName"),
      contactRole: valueOf("contactRole"),
      email: valueOf("email"),
      reference: valueOf("reference"),
      materialDescription: valueOf("materialDescription"),
      finishedWork: checked("finishedWork"),
      detailShots: checked("detailShots"),
      creationProcess: checked("creationProcess"),
      handoverPresentation: checked("handoverPresentation"),
      customerProvidedMedia: checked("customerProvidedMedia"),
      shownOtherText: valueOf("shownOtherText"),
      websitePortfolio: checked("websitePortfolio"),
      instagram: checked("instagram"),
      facebook: checked("facebook"),
      whatsappStatus: checked("whatsappStatus"),
      digitalReference: checked("digitalReference"),
      printedReferences: checked("printedReferences"),
      destinationOtherText: valueOf("destinationOtherText"),
      attribution: selectedValue("attribution"),
      attributionName: valueOf("attributionName"),
      projectDescriptionAllowed: checked("projectDescriptionAllowed"),
      designationExclusions: valueOf("designationExclusions"),
      visibleInfoStatus: selectedValue("visibleInfoStatus"),
      visibleInfoDetails: valueOf("visibleInfoDetails"),
      personStatus: selectedValue("personStatus"),
      minorsAuthorized: checked("minorsAuthorized"),
      personRestrictions: valueOf("personRestrictions"),
      note: valueOf("note"),
      finalConfirmation: checked("finalConfirmation"),
      websiteField: valueOf("websiteField")
    };
  }

  function showProof(referenceCode, createdAt, isPreview) {
    if (!proof) return;
    proof.classList.add("is-visible");
    if (proofReference) proofReference.textContent = referenceCode;
    if (proofDate) {
      proofDate.textContent = new Date(createdAt).toLocaleString("de-DE", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }
    proof.querySelector("[data-proof-mode]")?.replaceChildren(
      document.createTextNode(
        isPreview
          ? "Lokale Funktionsvorschau – es wurden keine Daten gespeichert."
          : "Die Freigabe liegt Luderbein digital vor. Du musst sie nicht zusätzlich zusenden."
      )
    );
    proof.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("input", updateSummary);
  form.addEventListener("change", updateSummary);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submissionInProgress) return;

    clearDownload();
    proof?.classList.remove("is-visible");
    const contentValid = hasSelectedContent();
    const channelsValid = hasSelectedChannel();
    contentValidation?.classList.toggle("is-visible", !contentValid);
    channelValidation?.classList.toggle("is-visible", !channelsValid);

    if (!contentValid || !channelsValid) {
      setStatus("Bitte triff in den Bereichen 3 und 4 jeweils mindestens eine Auswahl.", "is-error");
      (!contentValid
        ? form.querySelector('[name="finishedWork"]')
        : form.querySelector('[name="websitePortfolio"]'))?.focus();
      return;
    }

    updateConditionalFields();
    if (!form.reportValidity()) {
      setStatus("Bitte fülle die Pflichtfelder aus und triff alle erforderlichen Entscheidungen.", "is-error");
      return;
    }

    submissionInProgress = true;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    setStatus(isLocalPreview ? "Lokale Bestätigung wird simuliert …" : "Freigabe wird gespeichert …");

    if (isLocalPreview) {
      const now = new Date().toISOString();
      window.setTimeout(function () {
        setStatus("Lokale Prüfung erfolgreich. Es wurden keine Daten gespeichert.", "is-success");
        showProof("VF-VORSCHAU-1.0", now, true);
        submissionInProgress = false;
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }, 250);
      return;
    }

    try {
      const response = await fetch("/api/veroeffentlichungsfreigabe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildPayload())
      });
      const data = await response.json().catch(function () {
        return null;
      });
      if (!response.ok) {
        throw new Error(data?.error || "Die Freigabe konnte derzeit nicht gespeichert werden.");
      }

      prepareDownload(data.download);
      setStatus("Freigabe gespeichert. Der Bestätigungsnachweis steht bereit.", "is-success");
      showProof(data.referenceCode || "ohne Referenz", data.createdAt || new Date().toISOString(), false);
    } catch (error) {
      submissionInProgress = false;
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      setStatus(error instanceof Error ? error.message : "Die Freigabe konnte derzeit nicht gespeichert werden.", "is-error");
    }
  });

  document.getElementById("release-print-button")?.addEventListener("click", function () {
    window.print();
  });

  updateSummary();
})();
