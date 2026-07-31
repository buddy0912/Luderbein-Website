(function () {
  const form = document.querySelector("[data-release-form]");
  if (!form) return;

  const status = document.getElementById("release-status");
  const proof = document.getElementById("release-proof");
  const proofReference = document.getElementById("release-proof-reference");
  const proofDate = document.getElementById("release-proof-date");
  const downloadBox = document.getElementById("release-download");
  const downloadLink = document.getElementById("release-download-link");
  const channelValidation = document.getElementById("release-channel-validation");
  const previewBanner = document.getElementById("release-preview-mode");
  const submitButton = form.querySelector('[type="submit"]');
  const isLocalPreview =
    window.location.protocol === "file:" ||
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("visual") === "1";

  const summary = {
    reference: document.getElementById("release-summary-reference"),
    project: document.getElementById("release-summary-project"),
    contact: document.getElementById("release-summary-contact"),
    channels: document.getElementById("release-summary-channels"),
    attribution: document.getElementById("release-summary-attribution"),
    additions: document.getElementById("release-summary-additions"),
    persons: document.getElementById("release-summary-persons")
  };

  let downloadUrl = "";
  let submissionInProgress = false;

  if (isLocalPreview && previewBanner) {
    previewBanner.classList.add("is-visible");
  }

  function valueOf(name) {
    return String(form.elements[name]?.value || "").trim();
  }

  function checked(name) {
    return form.elements[name]?.checked === true;
  }

  function selectedValue(name) {
    const selected = form.querySelector(`[name="${name}"]:checked`);
    return selected ? selected.value : "";
  }

  function selectedLabel(name) {
    const selected = form.querySelector(`[name="${name}"]:checked`);
    return selected?.closest("label")?.querySelector("strong")?.textContent?.trim() || "";
  }

  function setText(element, value, fallback) {
    if (!element) return;
    element.textContent = value || fallback;
    element.classList.toggle("release-summary__empty", !value);
  }

  function setList(element, values, fallback) {
    if (!element) return;
    element.replaceChildren();

    if (!values.length) {
      const item = document.createElement("li");
      item.textContent = fallback;
      item.className = "release-summary__empty";
      element.appendChild(item);
      return;
    }

    values.forEach(function (value) {
      const item = document.createElement("li");
      item.textContent = value;
      element.appendChild(item);
    });
  }

  function updateSummary() {
    const reference = valueOf("reference");
    const projectTitle = valueOf("projectTitle") || form.dataset.projectTitle || "";
    const principalName = valueOf("principalName") || form.dataset.principalName || "";
    const contactName = valueOf("contactName");
    const contactRole = valueOf("contactRole");
    const channelLabels = [
      ["website", "Werkfotos auf der Luderbein-Website"],
      ["socialMedia", "Social Media"],
      ["digitalPortfolio", "Digitales Portfolio"],
      ["printedMaterials", "Gedruckte Referenz- und Werbemittel"]
    ]
      .filter(function (entry) {
        return checked(entry[0]);
      })
      .map(function (entry) {
        return entry[1];
      });
    const additions = [
      ["projectStory", "Entstehung, Entwicklung und Herstellung"],
      ["eventPhotos", "Fotos der Übergabe oder Veranstaltung"]
    ]
      .filter(function (entry) {
        return checked(entry[0]);
      })
      .map(function (entry) {
        return entry[1];
      });

    setText(summary.reference, reference, "Noch nicht eingetragen");
    setText(
      summary.project,
      [projectTitle, principalName].filter(Boolean).join(" · "),
      "Projekt noch nicht eingetragen"
    );
    setText(
      summary.contact,
      [contactName, contactRole].filter(Boolean).join(" · "),
      "Name noch nicht eingetragen"
    );
    setList(summary.channels, channelLabels, "Noch kein Veröffentlichungskanal gewählt");
    setText(summary.attribution, selectedLabel("attribution"), "Noch keine Darstellungsform gewählt");
    setList(summary.additions, additions, "Keine zusätzlichen Inhalte gewählt");
    setText(summary.persons, selectedLabel("personStatus"), "Status zu erkennbaren Personen noch offen");
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
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = "";
    }
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
    if (!download || !download.contentBase64 || !downloadLink || !downloadBox) return false;
    clearDownload();
    downloadUrl = URL.createObjectURL(base64ToBlob(download.contentBase64, download.mediaType));
    downloadLink.href = downloadUrl;
    downloadLink.download = download.filename || "veroeffentlichungsfreigabe.pdf";
    downloadBox.hidden = false;
    return true;
  }

  function hasSelectedChannel() {
    return ["website", "socialMedia", "digitalPortfolio", "printedMaterials"].some(checked);
  }

  function buildPayload() {
    return {
      formType: form.dataset.formType || "general",
      projectKey: form.dataset.projectKey || "",
      projectTitle: valueOf("projectTitle") || form.dataset.projectTitle || "",
      principalName: valueOf("principalName") || form.dataset.principalName || "",
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
      rightsAuthority: checked("rightsAuthority"),
      personStatus: selectedValue("personStatus"),
      voluntaryConfirmation: checked("voluntaryConfirmation"),
      accuracyConfirmation: checked("accuracyConfirmation"),
      privacyAcknowledgement: checked("privacyAcknowledgement"),
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
    if (proof) proof.classList.remove("is-visible");

    const channelsValid = hasSelectedChannel();
    if (channelValidation) channelValidation.classList.toggle("is-visible", !channelsValid);

    if (!channelsValid) {
      setStatus("Bitte wähle mindestens einen Veröffentlichungskanal aus.", "is-error");
      form.querySelector('[name="website"]')?.focus();
      return;
    }

    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      setStatus("Bitte fülle alle Pflichtfelder aus und triff alle erforderlichen Entscheidungen.", "is-error");
      return;
    }

    submissionInProgress = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    const payload = buildPayload();
    setStatus(
      isLocalPreview
        ? "Lokale Bestätigung wird simuliert …"
        : "Freigabe wird nachvollziehbar gespeichert …"
    );

    if (isLocalPreview) {
      const now = new Date().toISOString();
      window.setTimeout(function () {
        setStatus("Lokale Prüfung erfolgreich. Es wurden keine Daten gespeichert.", "is-success");
        showProof("VF-VORSCHAU", now, true);
        submissionInProgress = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }, 250);
      return;
    }

    try {
      const response = await fetch("/api/veroeffentlichungsfreigabe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(function () {
        return null;
      });

      if (!response.ok) {
        throw new Error(
          data && typeof data.error === "string"
            ? data.error
            : "Die Freigabe konnte derzeit nicht gespeichert werden."
        );
      }

      prepareDownload(data?.download);
      if (submitButton) submitButton.removeAttribute("aria-busy");
      setStatus("Freigabe gespeichert. Der Bestätigungsnachweis steht bereit.", "is-success");
      showProof(data.referenceCode || "ohne Referenz", data.createdAt || new Date().toISOString(), false);
    } catch (error) {
      submissionInProgress = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
      setStatus(
        error instanceof Error
          ? error.message
          : "Die Freigabe konnte derzeit nicht gespeichert werden.",
        "is-error"
      );
    }
  });

  document.getElementById("release-print-button")?.addEventListener("click", function () {
    window.print();
  });

  updateSummary();
})();
