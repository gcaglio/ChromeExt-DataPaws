(() => {
  const injectScript = (file) => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(file);
    script.type = "module";
    (document.head || document.documentElement).appendChild(script);
  };

  injectScript("inject.js");

  window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data.type) return;

    if (event.data.type === "monitoringData") {
      chrome.runtime.sendMessage({
        type: "monitoringData",
        data: event.data.payload
      });
    }
  });
  
  window.addEventListener("message", (event) => {
    if (event.data.type === "getDeviceId") {
      chrome.runtime.sendMessage({ type: "getDeviceId" }, (response) => {
        window.postMessage({ type: "deviceIdResponse", deviceId: response?.deviceId || "unknown-device" }, "*");
      });
    }
  });

  window.addEventListener("message", (event) => {
    if (event.data.type === "getDdHostname") {
      chrome.runtime.sendMessage({ type: "getDdHostname" }, (response) => {
        window.postMessage({ type: "DdHostnameResponse", dd_hostname: response?.config_dd_hostname || "content-unknown-dd-hostname" }, "*");
      });
    }
  });

  window.addEventListener("message", (event) => {
    if (event.data.type === "getDdCustomTags") {
      chrome.runtime.sendMessage({ type: "getDdCustomTags" }, (response) => {
        window.postMessage({ type: "DdCustomTagsResponse", dd_custom_tags: response?.config_dd_custom_tags || "" }, "*");
      });
    }
  });
})();
