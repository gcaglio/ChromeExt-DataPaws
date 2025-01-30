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
                },
                ...consoleMessages.map(msg => ({
                    metric: "datapaws.chrome.consoleErrors",
                    points: [[epochTime, 1]],
                    type: "count",
                    host: "datapaws.unique.host.local",
                    tags: [...tags, `console_type:${msg.type}`, `message:${msg.message}`]
                }))
            ]
        };

        window.postMessage({ type: "monitoringData", payload }, "*");
	 
	 
    };

    if (document.readyState === "complete") {
        await collectMetrics();
    } else {
        window.addEventListener("load", async () => {
            await collectMetrics();
        });
    }
})();


/*
(async () => {
    const collectMetrics = async () => {
        

        const timing = window.performance.timing;
        const now = Date.now();
        const epochTime = Math.floor(now / 1000); // Current time in epoch format



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

        window.addEventListener("load", () => {

            const performanceData = {
                loadTime: timing.loadEventEnd - timing.loadEventStart,
                domContentLoadedTime: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                renderTime: timing.domComplete - timing.responseEnd,   //domLoading is deprecated
                totalBlockingTime: (timing.domComplete - timing.domContentLoadedEventEnd),
                e2eTime: (timing.loadEventEnd - timing.navigationStart),
                epochTime,
                site_fqdn: window.location.hostname, // FQDN of the current page
                memory: window.performance.memory || null // Memory data if supported by browser
            };

            const tags = [
                "env:prod",
                "site_fqdn:" + performanceData.site_fqdn,
                "resolution:" + `${window.screen.width}x${window.screen.height}`,
                "browser:" + navigator.userAgent,
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
                    },
                    {
                        metric: "datapaws.chrome.e2eTime",
                        points: [[epochTime, performanceData.e2eTime ]],
                        type: "gauge",
                        host: "datapaws.unique.host.local",
                        tags
                    },
                    ...consoleMessages.map(msg => ({
                        metric: "datapaws.chrome.consoleErrors",
                        points: [[epochTime, 1]],
                        type: "count",
                        host: "datapaws.unique.host.local",
                        tags: [...tags, `console_type:${msg.type}`, `message:${msg.message}`]
                    })) 
                ]
            };

            window.postMessage({ type: "monitoringData", payload }, "*");
        });
    };


     await collectMetrics();

})();
*/

