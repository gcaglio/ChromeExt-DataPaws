document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('configForm');
    const status = document.getElementById('status');
    
    // Carica le impostazioni: prima managed, poi eventuali override dell'utente
    Promise.all([
        new Promise(resolve => chrome.storage.managed.get(['dd_url', 'dd_api', 'dd_hostname', 'dd_custom_tags'], resolve)),
        new Promise(resolve => chrome.storage.sync.get(['dd_url', 'dd_api', 'dd_hostname', 'dd_custom_tags'], resolve))
    ]).then(([managedData, syncData]) => {
        console.log("Managed data:", managedData);
        console.log("Sync data:", syncData);
        
        // I valori sync (utente) hanno priorità sui managed (admin)
        // Se l'utente non ha impostato nulla, usa i valori managed
        const finalConfig = {
            dd_url: syncData.dd_url || managedData.dd_url || 'https://api.datadoghq.com',
            dd_api: syncData.dd_api || managedData.dd_api || '',
            dd_hostname: syncData.dd_hostname || managedData.dd_hostname || 'datapaws.unique.host.local',
            dd_custom_tags: syncData.dd_custom_tags || managedData.dd_custom_tags || ''
        };
        
        // Popola i campi
        document.getElementById('dd_url').value = finalConfig.dd_url;
        document.getElementById('dd_api').value = finalConfig.dd_api;
        document.getElementById('dd_hostname').value = finalConfig.dd_hostname;
        document.getElementById('dd_custom_tags').value = finalConfig.dd_custom_tags;
        
        // Mostra se i valori vengono da policy amministrative
        if (Object.keys(managedData).length > 0) {
            const info = document.createElement('div');
            info.style.padding = '10px';
            info.style.backgroundColor = '#e3f2fd';
            info.style.border = '1px solid #2196F3';
            info.style.borderRadius = '4px';
            info.style.marginBottom = '15px';
            info.innerHTML = '<strong>ℹ️ Info:</strong> Alcune impostazioni sono configurate dall\'amministratore tramite policy.';
            form.insertBefore(info, form.firstChild);
        }
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