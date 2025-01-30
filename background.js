function generateDeviceId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Controlla se esiste già un deviceId, altrimenti lo genera e lo salva
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("deviceId", (data) => {
        if (!data.deviceId) {
            const newId = generateDeviceId();
            chrome.storage.local.set({ deviceId: newId }, () => {
                console.log("Generated new deviceId:", newId);
            });
        } else {
            console.log("Existing deviceId:", data.deviceId);
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getDeviceId") {
        chrome.storage.local.get("deviceId", (data) => {
            sendResponse({ deviceId: data.deviceId || "unknown-device" });
        });
        return true; // Importante per consentire la risposta asincrona
    }
});


chrome.runtime.onInstalled.addListener(() => {
    console.log("Datapaws Monitoring Extension installed.");
});

// Listener to receive data from content script and send to endpoint

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


    if (message.type === "monitoringData") {
        dd_url = "https://api.datadoghq.com/api/v1/series";
        dd_api = "XXXXXXXXX<changeme>XXXXXXXXX";

        fetch(dd_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "DD-API-KEY": dd_api
            },
           body: JSON.stringify(message.data)
        })
      .then(response => response.json())
      .then(data => console.log("Data successfully sent:", data))
      .catch(error => console.error("Error sending data:", error));
  }
});

