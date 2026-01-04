document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('configForm');
    const status = document.getElementById('status');

    // Carica le impostazioni salvate 
    chrome.storage.sync.get(['dd_url', 'dd_api', 'dd_hostname', 'dd_custom_tags'], (data) => {
        if (data.dd_url) {
            document.getElementById('dd_url').value = data.dd_url;
        }
        if (data.dd_api) {
            document.getElementById('dd_api').value = data.dd_api;
        }
        document.getElementById('dd_hostname').value = data.dd_hostname || 'datapaws.unique.host.local';
        document.getElementById('dd_custom_tags').value = data.dd_custom_tags || '';
    });

    // Salva le impostazioni quando il form viene inviato
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const dd_url = document.getElementById('dd_url').value;
        const dd_api = document.getElementById('dd_api').value;
        const dd_hostname = document.getElementById('dd_hostname').value;
        const dd_custom_tags = document.getElementById('dd_custom_tags').value;
        
        chrome.storage.sync.set({ dd_url, dd_api, dd_hostname, dd_custom_tags }, () => {
            status.textContent = 'Config saved successfully.';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        });
    });
});
