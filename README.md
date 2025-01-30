# Overview
Datapaws Monitoring Extension is a Chrome extension that collects console messages, page load times, and render timings, sending them to Datadog for monitoring and analysis.

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

## License
This project is licensed under the MIT License.

