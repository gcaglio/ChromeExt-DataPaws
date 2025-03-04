# Overview
Datapaws Monitoring Extension is a Chrome extension that collects console messages, page load times, and render timings, sending them to Datadog for monitoring and analysis.

Every metric is sent as custom-metric.

You could easily use this extention on a wide number of browsers with a Datadog free account (remember you've only 1day of data retention).

This extension is based on the official link to MDN documentation of the different steps : https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing

![MDN Performance API - Navigation timing](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/timestamp-diagram.png?raw=true)


## Tested on
Chrome on Windows 10

Chrome on Windows 11

Chromebook


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
You need to configure the extention to send the metrics to the correct Datadog URI, with your API-KEY. 
Go to the "options" page of the extention and fill the fields with proper value matching your Datadog account.
![Datapaws extension options configuration](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/datapaws_options.png?raw=true)

## Collected Metrics
The extension collects and sends the following metrics:
* `datapaws.chrome.pageLoadTime`: Total page load time.
* `datapaws.chrome.domContentLoadTime`: Time taken to load the DOM.
* `datapaws.chrome.renderTime`: Time taken to render the page.
* `datapaws.chrome.totalBlockingTime`: Total blocking time.
* `datapaws.chrome.usedJSHeapSize`: Used JavaScript heap memory.
* `datapaws.chrome.totalJSHeapSize`: Total JavaScript heap memory.
* `datapaws.chrome.consoleError`: console, window and "unhandled promise rejections" errors.

## All metrics include additional tags such as:
* `site_fqdn`: Hostname of the site
* `resolution`: Screen resolution.
* `browser`: Browser user-agent.
* `hostname`: Device name.
* `chrome_deviceid` : a random, one time generated deviceId that persist in the local browser storage, to allow a "per browser instance" grouping, to allow event correlation and problem determination.

## Error messages include additional tags such as
* `err_message` : the error message string
* `err_source` : the source of the error (eg: the fqdn of the js that thrown the error,
*	`err_type` : the error type or a generic "ERR_UNKNOWN_TYPE"

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
- `doc/dd_dashboards/*` - json export of effective and working Datadog dashboards

## Troubleshooting
- First IT resolution: completely close Chrome browser and open it again. Sometimes the extension need to be reinitialized to reload your custom parameters.
- **CORS issues**: Ensure your enterprise network allows connections to `api.datadoghq.com`.
- **Extension not loading**: Check `chrome://extensions/` for errors.
- **No data in Datadog**: Verify your Datadog URL and API-key in the options page of the extension, then close and re-open chromme to ensure proper parameter reloading.


## Datadog dashboard
You could easily test this extension with a Free Datadog account, to measure the index(es) size, storage needed, metric numerosity and so on, prior to switch to a payed account, to avoid unexpected costs.

If it's ok for you to live with a 1-day only metric retention, you can continue to use the free account without issues, reducing costs.

In the `doc/dd_dashboards` folder you can find a Datadog dashboard example. Here some graphs:

![Datapaws dashboard sample graphs](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/datapaws_dashboard_graphs.png?raw=true)





## License
This project is licensed under the MIT License.

