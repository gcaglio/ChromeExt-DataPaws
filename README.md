# Overview
Datapaws Monitoring Extension is a Chrome extension that collects console messages, page load times, and render timings, sending them to Datadog for monitoring and analysis.

Every metric is sent as custom-metric.

You could easily use this extension on a wide number of browsers with a Datadog free account (remember you've only 1 day of data retention).

This extension is based on the official link to MDN documentation of the different steps: https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing

![MDN Performance API - Navigation timing](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/timestamp-diagram.png?raw=true)

## Tested on
- Chrome on Windows 10
- Chrome on Windows 11
- Chromebook

## Features
- Tracks page load metrics using `PerformanceNavigationTiming`
- Captures JavaScript console errors and logs
- Tracks Core Web Vitals (FCP, LCP, CLS) using modern PerformanceObserver API
- Measures Time to First Byte (TTFB)
- Detects navigation type and connection type
- **NEW: Custom tags support** - Add your own tags to all metrics for better organization
- Sends data to Datadog for real-time tracking
- Uses standard, non-deprecated browser APIs for better compatibility

## Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files

## Configuration

### User Configuration
You need to configure the extension to send the metrics to the correct Datadog URI, with your API-KEY. 
Go to the "options" page of the extension and fill the fields with proper values matching your Datadog account.

![Datapaws extension options configuration](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/datapaws_options.png?raw=true)

### Custom Tags
The extension now supports custom tags that can be added to all metrics. This is useful for:
- Department/team identification
- Environment classification
- Cost center tracking
- Regional grouping
- Any custom categorization you need

**Format:** `tag_name=tag_value;tag_name1=tag_value1;tag_name2=tag_value2`

**Example:**
```
department=IT;environment=production;cost_center=123456;region=EU;team=WebDev
```

The extension will:
- Split tags by semicolon (`;`)
- Trim whitespace from each tag
- Convert format from `tag_name=tag_value` to Datadog format `tag_name:tag_value`
- Add these tags to all metrics sent to Datadog

### Centralized Management with Active Directory
For enterprise deployments, you can use Chrome's managed policies via Active Directory Group Policy:

1. Create/edit a Chrome policy file (e.g., `chrome_policies.json`)
2. Add the Datapaws extension configuration:

```json
{
  "3rdparty": {
    "extensions": {
      "YOUR_EXTENSION_ID": {
        "dd_url": "https://api.datadoghq.eu",
        "dd_api": "your-api-key-here",
        "dd_hostname": "company.monitoring.host",
        "dd_custom_tags": "department=IT;environment=production;company=MyCompany"
      }
    }
  }
}
```

If you want to test the managed store extension configuration in the Windows Registry you can check in the ```managed``` folder.

You'll found a sample Powershell script that you can customize to set all the variables in the registry and test GPO/packaged installation.


3. Deploy via GPO to all managed Chrome browsers
4. Users won't be able to modify centrally-managed settings

**Note:** Local settings (chrome.storage.sync) will override managed policies if set by users. For full central control, consider making the options page read-only for managed installations.

## Collected Metrics
The extension collects and sends the following metrics:

### Performance Metrics
* `datapaws.chrome.pageLoadTime`: Total page load time
* `datapaws.chrome.domContentLoadTime`: Time taken to load the DOM
* `datapaws.chrome.renderTime`: Time taken to render the page
* `datapaws.chrome.totalBlockingTime`: Total blocking time
* `datapaws.chrome.ttfb`: Time to First Byte (TTFB) - network latency metric
* `datapaws.chrome.firstContentfulPaint`: First Contentful Paint (FCP) - Core Web Vital
* `datapaws.chrome.largestContentfulPaint`: Largest Contentful Paint (LCP) - Core Web Vital
* `datapaws.chrome.cumulativeLayoutShift`: Cumulative Layout Shift (CLS) - Core Web Vital

### Error Metrics
* `datapaws.chrome.consoleError`: Console, window and "unhandled promise rejections" errors

### Deprecated Metrics (Removed)
The following metrics have been **removed** from this version as they used deprecated Chrome-only APIs:
* ~~`datapaws.chrome.usedJSHeapSize`~~ (deprecated `performance.memory` API)
* ~~`datapaws.chrome.totalJSHeapSize`~~ (deprecated `performance.memory` API)

**Note:** All Core Web Vitals are now collected using the modern `PerformanceObserver` API for better accuracy and browser compatibility.

## Default Tags
All metrics include the following tags:

* `env:prod`: Environment (default: prod)
* `site_fqdn`: Hostname of the site
* `resolution`: Screen resolution
* `browser`: Browser user-agent
* `hostname`: Device name (configurable)
* `chrome_deviceid`: A random, one-time generated deviceId that persists in the local browser storage for per-browser-instance grouping
* `navigation_type`: Type of navigation (navigate, reload, back_forward)
* `connection_type`: Connection type (4g, 3g, wifi, etc)

## Error Message Tags
Error metrics include additional tags:

* `err_message`: The error message string
* `err_source`: The source of the error (e.g., the FQDN of the JS that threw the error)
* `err_src_line`: Line number where error occurred
* `err_src_column`: Column number where error occurred
* `err_type`: The error type or a generic "ERR_UNKNOWN_TYPE"

## Usage
1. Install the extension as described above
2. Configure your Datadog credentials in the options page
3. (Optional) Add custom tags for better organization
4. Browse normally; the extension collects data in the background
5. Monitor performance metrics in Datadog

## Files Structure
- `background.js` - Handles data transmission to Datadog and manages configuration
- `inject.js` - Collects performance metrics and Core Web Vitals using modern PerformanceObserver API
- `content.js` - Injects `inject.js` into pages and handles message passing
- `manifest.json` - Chrome extension configuration
- `managed_schema.json` - Schema for enterprise managed policies
- `options.html` / `options.js` - Configuration UI
- `doc/timestamp-diagram.*` - Documentation diagrams
- `doc/dd_dashboards/*` - JSON export of effective and working Datadog dashboards

## Troubleshooting
- **First IT resolution**: Completely close Chrome browser and open it again. Sometimes the extension needs to be reinitialized to reload your custom parameters
- **CORS issues**: Ensure your enterprise network allows connections to `api.datadoghq.com` or your configured Datadog endpoint
- **Extension not loading**: Check `chrome://extensions/` for errors
- **No data in Datadog**: Verify your Datadog URL and API-key in the options page, then close and re-open Chrome to ensure proper parameter reloading
- **Custom tags not appearing**: Check the format (semicolon-separated, no spaces around `=`), save the configuration, and restart Chrome
- **Core Web Vitals not showing**: Some metrics (especially CLS and LCP) may take time to stabilize. Ensure you're testing on real user interactions, not just page loads.

## Datadog Dashboard
You could easily test this extension with a Free Datadog account to measure the index(es) size, storage needed, metric numerosity and so on, prior to switching to a paid account to avoid unexpected costs.

If it's ok for you to live with 1-day only metric retention, you can continue to use the free account without issues, reducing costs.

In the `doc/dd_dashboards` folder you can find Datadog dashboard examples. Here are some sample graphs:

![Datapaws dashboard sample graphs](https://github.com/gcaglio/ChromeExt-DataPaws/blob/main/doc/datapaws_dashboard_graphs.png?raw=true)

## Custom Tags Use Cases

### Department Tracking
```
department=IT;cost_center=CC-12345;manager=john.doe
```

### Multi-Environment Monitoring
```
environment=production;datacenter=EU-WEST-1;cluster=web-prod-01
```

### Regional Operations
```
region=EMEA;country=IT;office=Milan
```

### Team-Based Analysis
```
team=Frontend;squad=Checkout;product=eCommerce
```

## Technical Notes

### Modern API Usage
This extension uses modern, standard web APIs:
- **PerformanceObserver API** for Core Web Vitals (FCP, LCP, CLS)
- **PerformanceNavigationTiming API** for navigation metrics
- **Navigator.connection API** for connection type detection

### Browser Compatibility
All APIs used are standard and widely supported across Chromium-based browsers. The extension gracefully handles cases where specific observers are not available.

## License
This project is licensed under the MIT License.
