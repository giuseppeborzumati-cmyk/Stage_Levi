// File: app.js nel tuo repository GitHub Pages

// URL COMPLETO E FINALE DEL PROXY SU RENDER
const PROXY_URL = 'https://stage-levi.onrender.com/api/chat'; 

document.getElementById('inviaMessaggio').addEventListener('click', async () => {
    const inputField = document.getElementById('campoInput');
    const responseDiv = document.getElementById('rispostaChat');
    const userMessage = inputField.value.trim();

    if (userMessage === "") return;

    responseDiv.innerText = "Gemini sta scrivendo...";
    inputField.value = ''; // Pulisci l'input per il prossimo messaggio

    try {
        // Invia la richiesta al server proxy
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Il prompt è inviato come corpo JSON
            body: JSON.stringify({ prompt: userMessage }),
        });

        const data = await response.json();
        
        if (response.ok) {
            // Mostra la risposta del chatbot
            responseDiv.innerText = data.text; 
        } else {
            // Gestione errori dal server (es. la chiave API è sbagliata)
            responseDiv.innerText = 'Errore dal server proxy: ' + (data.error || response.statusText);
        }

    } catch (error) {
        // Gestione errori di rete (es. il server è offline)
        responseDiv.innerText = 'Errore di connessione al server proxy. Controlla la console per i dettagli.';
        console.error('Fetch error:', error);
    }
});
