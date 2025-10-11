// File: server.js
// Server Proxy per l'API di Gemini

// Carica la variabile d'ambiente GEMINI_API_KEY da Render
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// Inizializzazione AI. L'API Key deve essere impostata su Render.
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const app = express();
const port = process.env.PORT || 3000; 

// CONFIGURAZIONE CORS: L'unico dominio ammessso è la tua pagina GitHub Pages
// DEVI SOSTITUIRE QUESTO CON IL TUO VERO URL DI GITHUB PAGES!
const ALLOWED_ORIGIN = 'https://giuseppeborzumati-cmyk.github.io'; 
const SITE_URL = "https://www.leviseregno.edu.it/"; // Il sito di riferimento

app.use(cors({
  origin: ALLOWED_ORIGIN 
}));

app.use(express.json()); 

// Endpoint POST per la chat
app.post('/api/chat', async (req, res) => {
    const userPrompt = req.body.prompt; 

    if (!userPrompt) {
        return res.status(400).json({ error: 'Manca il prompt utente' });
    }

    try {
        // Istruzione a Gemini di BASARE la risposta sul contenuto del sito
        const fullPrompt = `Sei un assistente per l'orientamento del ITSCG Primo Levi di Seregno. Rispondi in modo conciso e professionale alla domanda: "${userPrompt}". Le tue risposte devono essere basate sulle informazioni che trovi nel sito: ${SITE_URL}. Se non trovi informazioni specifiche o pertinenti, rispondi con cortesia che non puoi aiutare con quella richiesta specifica, ma non inventare informazioni.`;

        // Chiama l'API di Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        
        res.json({ text: response.text });
    } catch (error) {
        console.error("Errore API Gemini:", error);
        res.status(500).json({ error: 'Errore durante la comunicazione con Gemini API' });
    }
});

app.listen(port, () => {
    console.log(`Server proxy avviato sulla porta ${port}`);
});
