(async () => {
    
    const getDdHostname = () => {
        return new Promise((resolve) => {
            window.postMessage({ type: "getDdHostname" }, "*");

            window.addEventListener("message", function handler(event) {
                if (event.data.type === "DdHostnameResponse") {
                    window.removeEventListener("message", handler);
                    resolve(event.data.dd_hostname || "unknown-dd-hostname.host.local");
                }
            });
        });
    };

    const getDdCustomTags = () => {
        return new Promise((resolve) => {
            window.postMessage({ type: "getDdCustomTags" }, "*");

            window.addEventListener("message", function handler(event) {
                if (event.data.type === "DdCustomTagsResponse") {
                    window.removeEventListener("message", handler);
                    resolve(event.data.dd_custom_tags || "");
                }
            });
        });
    };

    const parseCustomTags = (customTagsString) => {
        if (!customTagsString || customTagsString.trim() === "") {
            return [];
        }

        return customTagsString
            .split(';')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.includes('='))
            .map(tag => {
                const [key, ...valueParts] = tag.split('=');
                const value = valueParts.join('=');
                return `${key.trim()}:${value.trim()}`;
            });
    };

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
        const dd_hostname = await getDdHostname();
        const customTagsString = await getDdCustomTags();
        const customTags = parseCustomTags(customTagsString);
        
        const epochTime = Math.floor(Date.now() / 1000);
        const tags = [
            "env:prod",
            `site_fqdn:${window.location.hostname}`,
            `resolution:${window.screen.width}x${window.screen.height}`,
            `browser:${navigator.userAgent}`,
            `chrome_deviceid:${deviceId}`,
            `err_message:${errorData.message}`,
            `err_source:${errorData.source || "unknown"}`,
            `err_src_line:${errorData.line}`,
            `err_src_column:${errorData.column}`,
            `err_type:${errorData.type || "ERR_UNKNOWN_TYPE"}`,
            ...customTags
        ];

        const payload = {
            series: [
                {
                    metric: "datapaws.chrome.consoleError",
                    points: [[epochTime, 1]],
                    type: "count",
                    host: dd_hostname,
                    tags
                }
            ]
        };

        window.postMessage({ type: "monitoringData", payload }, "*");
    };

    const monitorConsoleAndErrors = () => {
        const originalConsoleError = console.error;

        window.addEventListener("error", (event) => {
            sendErrorMetric({
                type: "error (window)",
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        window.addEventListener("unhandledrejection", (event) => {
            sendErrorMetric({
                type: "unhandledrejection (window)",
                message: event.reason ? event.reason.toString() : "Unknown promise rejection"
            });
        });

        console.error = (...args) => {
            sendErrorMetric({
                type: "error (console)",
                message: args.map(arg => arg.toString()).join(" ")
            });
            originalConsoleError(...args);
        };
    };

    // Store Core Web Vitals using PerformanceObserver
    let fcpValue = 0;
    let lcpValue = 0;
    let clsValue = 0;

    // Observe First Contentful Paint (FCP)
    try {
        const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
                fcpValue = entries[0].startTime;
            }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
        console.warn('FCP observer not supported:', e);
    }

    // Observe Largest Contentful Paint (LCP)
    try {
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcpValue = lastEntry.renderTime || lastEntry.loadTime || 0;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
        console.warn('LCP observer not supported:', e);
    }

    // Observe Cumulative Layout Shift (CLS)
    try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            }
            clsValue = clsScore;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
        console.warn('CLS observer not supported:', e);
    }

    const collectMetrics = async () => {
        const entries = performance.getEntriesByType("navigation")[0] || {};
        const now = Date.now();
        const epochTime = Math.floor(now / 1000);
        const deviceId = await getDeviceId();
        const dd_hostname = await getDdHostname();
        const customTagsString = await getDdCustomTags();
        const customTags = parseCustomTags(customTagsString);

        const performanceData = {
            loadTime: Math.max(0, entries.loadEventEnd - entries.startTime),
            domContentLoadedTime: Math.max(0, entries.domContentLoadedEventEnd - entries.startTime),
            renderTime: Math.max(0, entries.domComplete - entries.responseEnd),
            totalBlockingTime: Math.max(0, entries.domComplete - entries.domContentLoadedEventEnd),
            ttfb: Math.max(0, entries.responseStart - entries.requestStart),
            firstContentfulPaint: fcpValue,
            largestContentfulPaint: lcpValue,
            cumulativeLayoutShift: clsValue,
            epochTime,
            site_fqdn: window.location.hostname,
            navigationType: entries.type || "unknown",
            connectionType: navigator.connection?.effectiveType || "unknown"
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
            "chrome_deviceid:" + deviceId,
            "navigation_type:" + performanceData.navigationType,
            "connection_type:" + performanceData.connectionType,
            ...customTags
        ];

        const payload = {
            series: [
                {
                    metric: "datapaws.chrome.pageLoadTime",
                    points: [[epochTime, performanceData.loadTime]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.domContentLoadTime",
                    points: [[epochTime, performanceData.domContentLoadedTime]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.renderTime",
                    points: [[epochTime, performanceData.renderTime]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.totalBlockingTime",
                    points: [[epochTime, performanceData.totalBlockingTime]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.ttfb",
                    points: [[epochTime, performanceData.ttfb]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.firstContentfulPaint",
                    points: [[epochTime, performanceData.firstContentfulPaint]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.largestContentfulPaint",
                    points: [[epochTime, performanceData.largestContentfulPaint]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                },
                {
                    metric: "datapaws.chrome.cumulativeLayoutShift",
                    points: [[epochTime, performanceData.cumulativeLayoutShift]],
                    type: "gauge",
                    host: dd_hostname,
                    tags
                }
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
    
    monitorConsoleAndErrors();
})();
