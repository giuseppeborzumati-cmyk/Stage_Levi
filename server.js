// =================================================================
// 1. Configurazione Iniziale e Import di CommonJS
// =================================================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Variabili globali per l'istanza di Gemini 
let GoogleGenAI;
let gemini;
let chat; 

// =================================================================
// 2. Middleware e Configurazione CORS
// =================================================================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// =================================================================
// 3. Funzione per l'Import Dinamico e l'Avvio del Server
// =================================================================

async function initializeAndStartServer() {
    try {
        console.log("[SERVER] Inizializzazione...");

        // FIX ESM/CJS: Import dinamico della libreria moderna
        const genaiModule = await import('@google/genai');
        GoogleGenAI = genaiModule.GoogleGenAI;

        if (!GoogleGenAI) {
            throw new Error("Impossibile trovare GoogleGenAI nel modulo importato.");
        }

        // Inizializza l'istanza di Gemini
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error("Variabile d'ambiente GEMINI_API_KEY non trovata. Controlla il file .env su Render.");
        }
        
        gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        // Inizializza la sessione di chat con GROUNDING WEB
        chat = gemini.chats.create({ 
             model: "gemini-2.5-flash",
             config: {
                systemInstruction: "Sei un assistente per l'ITSCG Primo Levi. Se le tue conoscenze interne sono insufficienti, puoi effettuare una ricerca web per rispondere. Rispondi in modo conciso e amichevole, fornendo informazioni utili legate alla scuola. Il sito web ufficiale è: https://www.leviseregno.edu.it/",
                // ✅ AGGIUNGE LO STRUMENTO DI RICERCA GOOGLE (GROUNDING)
                tools: [{ googleSearch: {} }] 
             }
        });


        // =================================================================
        // 4. Rotte API
        // =================================================================

        // Rotta principale (per verifica)
        app.get('/', (req, res) => {
            res.send('Proxy Gemini Chatbot attivo e funzionante!');
        });

        // Rotta per la chat
        app.post('/api/chat', async (req, res) => {
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Campo 'message' mancante nel corpo della richiesta." });
            }

            try {
                // Invia il messaggio alla sessione di chat
                const result = await chat.sendMessage({ message: message });
                
                // Estrai e invia la risposta
                res.json({ 
                    response: result.text
                });

            } catch (error) {
                console.error("Errore durante la comunicazione con l'API Gemini:", error);
                res.status(500).json({ error: "Errore interno del server durante la comunicazione con l'API." });
            }
        });
        
        // Avvia l'ascolto del server DOPO l'inizializzazione di Gemini
        app.listen(PORT, () => {
            console.log(`[SERVER] Proxy server in ascolto sulla porta ${PORT}`);
            console.log(`[SERVER] API Gemini inizializzata con successo, con Grounding Web attivo.`);
        });


    } catch (error) {
        console.error("Errore fatale durante l'inizializzazione del server:", error.message);
        process.exit(1); 
    }
}

// Avvia l'intero processo
initializeAndStartServer();
