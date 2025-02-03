# Overview
Datapaws Monitoring Extension is a Chrome extension that collects console messages, page load times, and render timings, sending them to Datadog for monitoring and analysis.

Every metric is sent as custom-metric.

You could easily use this extention on a wide number of browsers with a Datadog free account (remember you've only 1day of data retention).

This extension is based on the official link to MDN documentation of the different steps : https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing

![MDN Performance API - Navigation timing](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/timestamp-diagram.png?raw=true)



## Features
- Tracks page load metrics using `PerformanceNavigationTiming`.
- Captures JavaScript console errors and logs.
- Monitors memory usage (Chrome only).
- Sends data to Datadog for real-time tracking.

## Installation
1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (toggle in the top-right corner).
4. Click "Load unpacked" and select the folder containing the extension files.

## Configuration
Ensure you have a Datadog API key. The extension sends metrics to:
```
https://api.datadoghq.com/api/v1/series
```
Modify `background.js` to insert your API key:
```js
const dd_api = "YOUR_DATADOG_API_KEY";
```

## Collected Metrics
The extension collects and sends the following metrics:
* `datapaws.chrome.pageLoadTime`: Total page load time.
* `datapaws.chrome.domContentLoadTime`: Time taken to load the DOM.
* `datapaws.chrome.renderTime`: Time taken to render the page.
* `datapaws.chrome.totalBlockingTime`: Total blocking time.
* `datapaws.chrome.usedJSHeapSize`: Used JavaScript heap memory.
* `datapaws.chrome.totalJSHeapSize`: Total JavaScript heap memory.
* `datapaws.chrome.consoleErrors`: Number of console errors.

## All metrics include additional tags such as:
* `site_fqdn`: Hostname of the site
* `resolution`: Screen resolution.
* `browser`: Browser user-agent.
* `hostname`: Device name.
* `chrome_deviceid` : a random, one time generated deviceId that persist in the local browser storage, to allow a "per browser instance" grouping, to allow event correlation and problem determination.


## Usage
1. Install the extension as described above.
2. Browse normally; the extension collects data in the background.
3. Monitor performance metrics in Datadog.

## Files Structure
- `background.js` - Handles data transmission to Datadog.
- `inject.js` - Collects performance metrics.
- `content.js` - Injects `inject.js` into pages.
- `manifest.json` - Chrome extension configuration.
- `doc/timestamp-diagram.*` - Documentation diagrams.

## Troubleshooting
- **CORS issues**: Ensure your enterprise network allows connections to `api.datadoghq.com`.
- **Extension not loading**: Check `chrome://extensions/` for errors.
- **No data in Datadog**: Verify your API key in `background.js`.


## Datadog dashboard
You could easily test this extension with a Free Datadog account, to measure the index(es) size, storage needed, metric numerosity and so on, prior to switch to a payed account, to avoid unexpected costs.

If it's ok for you to live with a 1-day only metric retention, you can continue to use the free account without issues, reducing costs.

In the `doc/dd_dashboards` folder you can find a Datadog dashboard example. Here some graphs:

![Datapaws dashboard sample graphs](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/datapaws_dashboard_graphs.png?raw=true)





## License
This project is licensed under the MIT License.

