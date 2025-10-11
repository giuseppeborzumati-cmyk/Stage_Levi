// File: server.js
// Server Proxy per l'API di Gemini

// Carica la variabile d'ambiente GEMINI_API_KEY da Render
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// 1. Inizializza l'API di Gemini con la chiave segreta
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const app = express();
const port = process.env.PORT || 3000; 

// 2. CONFIGURAZIONE CORS: L'UNICO DOMINIO AMMESSO A CHIAMARE IL PROXY
// Uso l'indirizzo esatto del tuo sito GitHub Pages
const ALLOWED_ORIGIN = 'https://giuseppeborzumati-cmyk.github.io'; 

app.use(cors({
  origin: ALLOWED_ORIGIN 
}));

app.use(express.json()); 

// 3. Endpoint POST per la chat
app.post('/api/chat', async (req, res) => {
    // Il frontend invia il 'prompt' nel corpo della richiesta
    const userPrompt = req.body.prompt; 

    if (!userPrompt) {
        return res.status(400).json({ error: 'Manca il prompt utente' });
    }

    try {
        // Chiama l'API di Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
        });
        
        // Invia la risposta all'utente
        res.json({ text: response.text });
    } catch (error) {
        console.error("Errore API Gemini:", error);
        res.status(500).json({ error: 'Errore durante la comunicazione con Gemini API' });
    }
});

app.listen(port, () => {
    console.log(`Server proxy avviato sulla porta ${port}`);
});
