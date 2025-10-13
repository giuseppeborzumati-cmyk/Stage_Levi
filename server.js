// File: server.js
// Server Proxy per l'API di Gemini

require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const app = express();
const port = process.env.PORT || 3000; 

// 🚨🚨 CONFIGURAZIONE CORS OBBLIGATORIA 🚨🚨
// SOSTITUISCI CON L'URL ESATTO DELLA TUA PAGINA GITHUB PAGES!
const ALLOWED_ORIGIN = 'https://giuseppeborzumati-cmyk.github.io/Stage_Levi/'; 
const SITE_URL = "https://www.leviseregno.edu.it/"; // Il sito di riferimento per l'AI

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
        const fullPrompt = `Sei un assistente per l'orientamento del ITSCG Primo Levi di Seregno. Rispondi in modo conciso e professionale alla domanda: "${userPrompt}". Le tue risposte devono essere basate sulle informazioni che trovi nel sito: ${SITE_URL}. Se non trovi informazioni specifiche o pertinenti, rispondi con cortesia che non puoi aiutare con quella richiesta specifica, ma non inventare informazioni.`;

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
