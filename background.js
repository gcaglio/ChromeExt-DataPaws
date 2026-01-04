// background.js
let dd_hostname = "datapaws.unique.host.local";
let dd_custom_tags = "";

// Recupera le variabili da chrome.storage.sync e le salva globalmente
chrome.storage.sync.get(['dd_hostname', 'dd_custom_tags'], function(result) {
    dd_hostname = result.dd_hostname || "datapaws.unique.host.local";
    dd_custom_tags = result.dd_custom_tags || "";
});

// ---- dd_hostname ----
function getDdHostname() {
    return dd_hostname;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getDdHostname") {
        sendResponse({ config_dd_hostname: getDdHostname() || "background-unknown-device" });
        return true;
    }
});

// ---- dd_custom_tags ----
function getDdCustomTags() {
    return dd_custom_tags;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getDdCustomTags") {
        sendResponse({ config_dd_custom_tags: getDdCustomTags() || "" });
        return true;
    }
});

// ---- device id ----
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
        return true;
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Datapaws Monitoring Extension installed.");
});

// Listener to receive data from content script and send to endpoint
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {  
    if (message.type === "monitoringData") {  
        chrome.storage.sync.get(['dd_url', 'dd_api'], (data) => {  
            const baseUrl = data.dd_url || "https://api.datadoghq.eu";  
            const endpointSuffix = "/api/v1/series";  
            const dd_url = baseUrl.endsWith(endpointSuffix) ? baseUrl : baseUrl + endpointSuffix;  
            const dd_api = data.dd_api || "xyz";  

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
        });  
    }  
});
