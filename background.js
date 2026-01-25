// background.js
let dd_hostname = "datapaws.unique.host.local";
let dd_custom_tags = "";
let dd_url = "https://api.datadoghq.eu";
let dd_api = "";

// Funzione helper per leggere da managed + sync
async function getConfig(keys) {
    const managed = await new Promise(resolve => 
        chrome.storage.managed.get(keys, data => resolve(data || {}))
    );
    const sync = await new Promise(resolve => 
        chrome.storage.sync.get(keys, data => resolve(data || {}))
    );
    
    // Merge: sync ha priorità su managed
    const result = {};
    for (const key of keys) {
        result[key] = sync[key] || managed[key];
    }
    return result;
}

// Carica la configurazione all'avvio
async function loadConfig() {
    const config = await getConfig(['dd_hostname', 'dd_custom_tags', 'dd_url', 'dd_api']);
    dd_hostname = config.dd_hostname || "datapaws.unique.host.local";
    dd_custom_tags = config.dd_custom_tags || "";
    dd_url = config.dd_url || "https://api.datadoghq.eu";
    dd_api = config.dd_api || "";
    
    console.log("Config loaded:", { dd_hostname, dd_custom_tags, dd_url, dd_api: dd_api ? "***" : "(empty)" });
}

// Carica all'avvio
loadConfig();

// Ricarica quando cambiano le impostazioni
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' || areaName === 'managed') {
        loadConfig();
    }
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
    
    // Ricarica la configurazione anche all'installazione/aggiornamento
    loadConfig();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getDeviceId") {
        chrome.storage.local.get("deviceId", (data) => {
            sendResponse({ deviceId: data.deviceId || "unknown-device" });
        });
        return true;
    }
});

// Listener to receive data from content script and send to endpoint
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {  
    if (message.type === "monitoringData") {  
        // Usa le variabili globali già caricate
        const baseUrl = dd_url || "https://api.datadoghq.eu";  
        const endpointSuffix = "/api/v1/series";  
        const finalUrl = baseUrl.endsWith(endpointSuffix) ? baseUrl : baseUrl + endpointSuffix;  
        const apiKey = dd_api || "xyz";  

        console.log("Sending to Datadog:", { url: finalUrl, hasApiKey: !!apiKey });

        fetch(finalUrl, {  
            method: "POST",  
            headers: {  
                "Content-Type": "application/json",  
                "DD-API-KEY": apiKey  
            },  
            body: JSON.stringify(message.data)  
        })  
        .then(response => response.json())  
        .then(data => console.log("Data successfully sent:", data))  
        .catch(error => console.error("Error sending data:", error));  
    }  
});
