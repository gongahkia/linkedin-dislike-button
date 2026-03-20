function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('state-on')[0].innerText = "The extension is on. You can turn it off from the Extensions section of Safari Settings.";
        document.getElementsByClassName('state-off')[0].innerText = "The extension is off. Turn it on from the Extensions section of Safari Settings to use it on linkedin.com.";
        document.getElementsByClassName('state-unknown')[0].innerText = "You can turn on the extension in the Extensions section of Safari Settings.";
        document.getElementsByClassName('open-preferences')[0].innerText = "Open Safari Settings";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function postMessage(message) {
    webkit.messageHandlers.controller.postMessage(message);
}

for (const button of document.querySelectorAll("[data-message]")) {
    button.addEventListener("click", () => {
        postMessage(button.dataset.message);
    });
}
