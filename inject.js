(async () => {
	
	
    const getDeviceId = () => {
        return new Promise((resolve) => {
            window.postMessage({ type: "getDeviceId" }, "*");

            window.addEventListener("message", function handler(event) {
                if (event.data.type === "deviceIdResponse") {
                    window.removeEventListener("message", handler);
                    resolve(event.data.deviceId || "unknown-device");
                }
            });
        });
    };

    const sendErrorMetric = async (errorData) => {
		
        const deviceId = await getDeviceId();
        const epochTime = Math.floor(Date.now() / 1000);
        const tags = [
            "env:prod",
            `site_fqdn:${window.location.hostname}`,
            `resolution:${window.screen.width}x${window.screen.height}`,
            `browser:${navigator.userAgent}`,
            `chrome_deviceid:${deviceId}`,
            `err_message:${errorData.message}`,
            `err_source:${errorData.source || "unknown"}`,
			`err_src_line:${errorData.line  }`,
			`err_src_column:${errorData.column }`,
			`err_type:${errorData.type || "ERR_UNKNOWN_TYPE"}`
        ];

        const payload = {
            series: [
                {
                    metric: "datapaws.chrome.consoleError",
                    points: [[epochTime, 1]],
                    type: "count",
                    host: "datapaws.unique.host.local",
                    tags
                }
            ]
        };

        //console.log("Sending error metric:", payload);  // Debug log
        window.postMessage({ type: "monitoringData", payload }, "*");
    };

    const monitorConsoleAndErrors = () => {
        const originalConsoleError = console.error;

        // Monitor window errors
        window.addEventListener("error", (event) => {
           // console.log("Window error detected:", event.message);  // Debug log
            sendErrorMetric({
                type: "error (window)",
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        // Monitor unhandled promise rejections
        window.addEventListener("unhandledrejection", (event) => {
            //console.log("Unhandled promise rejection:", event.reason);  // Debug log
            sendErrorMetric({
                type: "unhandledrejection (window)",
                message: event.reason ? event.reason.toString() : "Unknown promise rejection"
            });
        });

        // Monitor console.error
        console.error = (...args) => {
            //console.log("Console error detected:", args);  // Debug log
            sendErrorMetric({
                type: "error (console)",
                message: args.map(arg => arg.toString()).join(" ")
            });
            originalConsoleError(...args);
        };
    };

    monitorConsoleAndErrors(); // Attiva il listener per errori di console e window
   
	
    const collectMetrics = async () => {
        const entries = performance.getEntriesByType("navigation")[0] || {};
        const now = Date.now();
        const epochTime = Math.floor(now / 1000); // Current time in epoch format
        const deviceId = await getDeviceId();
		
		
        const performanceData = {
            loadTime: Math.max(0, entries.loadEventEnd - entries.startTime),
            domContentLoadedTime: Math.max(0, entries.domContentLoadedEventEnd - entries.startTime),
            renderTime: Math.max(0, entries.domComplete - entries.responseEnd),
            totalBlockingTime: Math.max(0, entries.domComplete - entries.domContentLoadedEventEnd),
            epochTime,
            site_fqdn: window.location.hostname, // FQDN of the current page
            memory: window.performance.memory || null // Memory data if supported by browser
        };

        const consoleMessages = [];
        const originalConsoleLog = console.log;

        console.log = (...args) => {
            consoleMessages.push({
                type: "log",
                message: args,
                timestamp: now,
            });
            originalConsoleLog(...args);
        };

        window.addEventListener("error", (e) => {
            consoleMessages.push({
                type: "error",
                message: e.message,
                source: e.filename,
                line: e.lineno,
                column: e.colno,
                timestamp: now,
            });
        });



		const tags = [
			"env:prod",
			"site_fqdn:" + performanceData.site_fqdn,
			"resolution:" + `${window.screen.width}x${window.screen.height}`,
			"browser:" + navigator.userAgent,
			"chrome_deviceid:" + deviceId
		];

        const payload = {
            series: [
                {
                    metric: "datapaws.chrome.pageLoadTime",
                    points: [[epochTime, performanceData.loadTime]],
                    type: "gauge",
                    host: "datapaws.unique.host.local",
                    tags
                },
                {
                    metric: "datapaws.chrome.domContentLoadTime",
                    points: [[epochTime, performanceData.domContentLoadedTime]],
                    type: "gauge",
                    host: "datapaws.unique.host.local",
                    tags
                },
                {
                    metric: "datapaws.chrome.renderTime",
                    points: [[epochTime, performanceData.renderTime]],
                    type: "gauge",
                    host: "datapaws.unique.host.local",
                    tags
                },
                {
                    metric: "datapaws.chrome.totalBlockingTime",
                    points: [[epochTime, performanceData.totalBlockingTime]],
                    type: "gauge",
                    host: "datapaws.unique.host.local",
                    tags
                },
                {
                    metric: "datapaws.chrome.usedJSHeapSize",
                    points: [[epochTime, window.performance.memory?.usedJSHeapSize || 0]],
                    type: "gauge",
                    host: "datapaws.unique.host.local",
                    tags
                },
                {
                    metric: "datapaws.chrome.totalJSHeapSize",
                    points: [[epochTime, window.performance.memory?.totalJSHeapSize || 0]],
                    type: "gauge",
                    host: "datapaws.unique.host.local",
                    tags
                }
/*				,
                ...consoleMessages.map(msg => ({
                    metric: "datapaws.chrome.consoleErrors",
                    points: [[epochTime, 1]],
                    type: "count",
                    host: "datapaws.unique.host.local",
                    tags: [...tags, `console_type:${msg.type}`, `message:${msg.message}`]
                })) */
            ]
        };




        window.postMessage({ type: "monitoringData", payload }, "*");
	 
		
	 
    };

    if (document.readyState === "complete") {
        await collectMetrics();
		//await monitorConsoleAndErrors();
    } else {
        window.addEventListener("load", async () => {
            await collectMetrics();
		//	await monitorConsoleAndErrors();
        });
    }
})();


