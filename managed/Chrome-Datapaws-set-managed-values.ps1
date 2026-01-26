# ===== OVERVIEW =====
# This script will set the configuration in the registry.
# This script does not install the extension forcily.
# Use this script to feed configuration data and tags to the client.



# CUSTOMIZE WITH CURRENT EXTENSION ID FROM WEB STORE.
# you can find the extension ID in the URL when you select Datapaws extension from the Web Store!
$chromeExtensionId = "hihojofmgncccdhbhglbchhigdgbhdhp"

# Parametri da passare all'estensione
$managedConfig = @{}

#https://api.datadoghq.com
#https://api.datadoghq.eu
$managedConfig.Add("dd_url", "https://api.datadoghq.com")

# your API key
$managedConfig.Add("dd_api", "xxxxxxxxxx")

# hostname sent to datadog for all the metrics
$managedConfig.Add("dd_hostname", "datapaws.unique.host.local")

# tag list, separated by ;
$managedConfig.Add("dd_custom_tags", "site=CHANGEME;building=CHANGEME;regione=CHANGEME")

# ===== CHROME =====
Write-Host "Configuring Chrome..." 

# Debug
Write-Host "Type of managedConfig: $($managedConfig.GetType().Name)" 
Write-Host "Keys: $($managedConfig.Count)" 

# Configure parameters in Managed Storage
$chromeManagedPath = "HKLM:\SOFTWARE\Policies\Google\Chrome\3rdparty\extensions\$chromeExtensionId\policy"

if (!(Test-Path $chromeManagedPath)) {
    New-Item -Path $chromeManagedPath -Force | Out-Null
}

# Write reg key for each params
foreach ($key in $managedConfig.Keys) {
    Write-Host "  Scrivo: $key = $($managedConfig[$key])" -ForegroundColor Gray
    New-ItemProperty -Path $chromeManagedPath -Name $key -Value $managedConfig[$key] -PropertyType String -Force | Out-Null
}

Write-Host "Chrome configured!"

Write-Host "Written values:"
Get-ItemProperty -Path $chromeManagedPath | Format-List dd_*
