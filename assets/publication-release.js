(function () {
  "use strict";

  function parseJsonSafe(response) {
    return response.json().catch(function () {
      return null;
    });
  }

  function base64ToBlob(base64, mediaType) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mediaType || "application/pdf" });
  }

  function setStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("is-error", "is-success");
    if (type) element.classList.add(type);
  }

  function initPrintButtons() {
    document.querySelectorAll("[data-release-print]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.print();
      });
    });
  }

  function initReleaseForm() {
    const form = document.querySelector("[data-publication-release-form]");
    if (!form) return;

    const status = form.querySelector("[data-release-status]");
    const downloadBox = form.querySelector("[data-release-download]");
    const downloadLink = form.querySelector("[data-release-download-link]");
    const namedInput = form.querySelector('[name="nameClient"]');
    const anonymousInput = form.querySelector('[name="anonymous"]');
    const channelInputs = ["website", "socialMedia", "digitalPortfolio", "printMaterials"]
      .map(function (name) {
        return form.elements[name];
      })
      .filter(Boolean);
    let downloadUrl = "";

    function clearDownload() {
      if (downloadBox) downloadBox.classList.remove("is-visible");
      if (downloadLink) {
        downloadLink.removeAttribute("href");
        downloadLink.removeAttribute("download");
      }
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        downloadUrl = "";
      }
    }

    function validateNamingChoice() {
      if (!namedInput || !anonymousInput) return true;

      namedInput.setCustomValidity("");
      anonymousInput.setCustomValidity("");

      if (namedInput.checked && anonymousInput.checked) {
        anonymousInput.setCustomValidity("Bitte entweder Nennung oder anonymisierte Veröffentlichung wählen.");
        return false;
      }

      if (!namedInput.checked && !anonymousInput.checked) {
        anonymousInput.setCustomValidity("Bitte Nennung oder anonymisierte Veröffentlichung wählen.");
        return false;
      }

      return true;
    }

    [namedInput, anonymousInput].forEach(function (input) {
      if (input) input.addEventListener("change", validateNamingChoice);
    });

    function validateChannels() {
      if (!channelInputs.length) return true;
      const hasChannel = channelInputs.some(function (input) {
        return input.checked;
      });
      channelInputs[0].setCustomValidity(
        hasChannel ? "" : "Bitte mindestens einen Veröffentlichungskanal auswählen."
      );
      return hasChannel;
    }

    channelInputs.forEach(function (input) {
      input.addEventListener("change", validateChannels);
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearDownload();
      validateNamingChoice();
      validateChannels();

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        setStatus(
          status,
          "Bitte fülle alle Pflichtfelder aus, wähle mindestens einen Veröffentlichungskanal und triff genau eine Auswahl zur Namensnennung.",
          "is-error"
        );
        return;
      }

      const value = function (name) {
        return form.elements[name] ? form.elements[name].value : "";
      };
      const checked = function (name) {
        return !!(form.elements[name] && form.elements[name].checked);
      };

      const payload = {
        action: "grant",
        projectKey: form.dataset.projectKey || "general",
        projectTitle: value("projectTitle"),
        clientName: value("clientName"),
        name: value("name"),
        organization: value("organization"),
        role: value("role"),
        email: value("email"),
        note: value("note"),
        selections: {
          website: checked("website"),
          socialMedia: checked("socialMedia"),
          digitalPortfolio: checked("digitalPortfolio"),
          printMaterials: checked("printMaterials"),
          nameClient: checked("nameClient"),
          anonymous: checked("anonymous"),
          projectStory: checked("projectStory"),
          eventPhotos: checked("eventPhotos")
        },
        rightsAuthority: checked("rightsAuthority"),
        personsConsent: checked("personsConsent"),
        releaseConfirmed: checked("releaseConfirmed"),
        privacyConsent: checked("privacyConsent")
      };

      setStatus(status, "Freigabe wird dokumentiert …");

      try {
        const response = await fetch("/api/veroeffentlichungsfreigabe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });
        const data = await parseJsonSafe(response);

        if (!response.ok) {
          throw new Error(
            data && typeof data.error === "string"
              ? data.error
              : "Die Freigabe konnte derzeit nicht gespeichert werden."
          );
        }

        form.reset();
        clearDownload();

        if (data && data.download && data.download.contentBase64 && downloadLink && downloadBox) {
          const blob = base64ToBlob(data.download.contentBase64, data.download.mediaType);
          downloadUrl = URL.createObjectURL(blob);
          downloadLink.href = downloadUrl;
          downloadLink.download = data.download.filename || "veroeffentlichungsfreigabe.pdf";
          downloadBox.classList.add("is-visible");
          downloadLink.click();
        }

        const reference = data && data.referenceCode ? data.referenceCode : "ohne Referenz";
        setStatus(
          status,
          `Freigabe unter ${reference} dokumentiert. Die PDF-Bestätigung wurde bereitgestellt.`,
          "is-success"
        );
      } catch (error) {
        setStatus(
          status,
          error instanceof Error
            ? error.message
            : "Die Freigabe konnte derzeit nicht gespeichert werden.",
          "is-error"
        );
      }
    });
  }

  function initWithdrawalForm() {
    const form = document.querySelector("[data-publication-withdrawal-form]");
    if (!form) return;
    const status = form.querySelector("[data-withdrawal-status]");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        setStatus(status, "Bitte Referenz-ID und E-Mail-Adresse angeben.", "is-error");
        return;
      }

      setStatus(status, "Widerruf wird erfasst …");

      try {
        const response = await fetch("/api/veroeffentlichungsfreigabe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            action: "withdraw",
            referenceCode: form.elements.referenceCode.value,
            email: form.elements.email.value
          })
        });
        const data = await parseJsonSafe(response);

        if (!response.ok) {
          throw new Error(
            data && typeof data.error === "string"
              ? data.error
              : "Der Widerruf konnte derzeit nicht erfasst werden."
          );
        }

        form.reset();
        setStatus(
          status,
          "Der Widerruf wurde entgegengenommen. Bei übereinstimmender Referenz und E-Mail-Adresse wird die Freigabe mit Wirkung für die Zukunft als widerrufen markiert.",
          "is-success"
        );
      } catch (error) {
        setStatus(
          status,
          error instanceof Error
            ? error.message
            : "Der Widerruf konnte derzeit nicht erfasst werden.",
          "is-error"
        );
      }
    });
  }

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      initPrintButtons();
      initReleaseForm();
      initWithdrawalForm();
    },
    { once: true }
  );
})();
