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

        // Import dinamico della libreria moderna per Gemini
        const genaiModule = await import('@google/genai');
        GoogleGenAI = genaiModule.GoogleGenAI;

        if (!GoogleGenAI) {
            throw new Error("Impossibile trovare GoogleGenAI nel modulo importato.");
        }

        // Utilizza la chiave d'ambiente GEMINI_API_KEY
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error("Variabile d'ambiente GEMINI_API_KEY non trovata. Controlla il file .env su Render.");
        }
        
        gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        // Inizializza la sessione di chat con GROUNDING WEB e ISTRUZIONE DI VERIFICA MASSIMA + SINTESI
        chat = gemini.chats.create({ 
             model: "gemini-2.5-flash", 
             config: {
                // ISTRUZIONE AGGIORNATA PER LA MASSIMA CORRETTEZZA
                systemInstruction: "Sei il Revisore Analitico Ufficiale dell'ITSCG Primo Levi. La tua **unica priorità è la correttezza assoluta** del dato. Rispondi esclusivamente in italiano e **solo con informazioni che puoi verificare sul sito ufficiale https://www.leviseregno.edu.it/**. È severamente vietato utilizzare qualsiasi altra fonte. L'analisi deve includere tutti i contenuti indicizzati (pagine, PDF, descrizioni). Ogni risposta deve essere il risultato di un rigoroso processo di analisi interna in tre fasi (Analisi, Verifica Incrociata e Comparazione) per assicurare l'esattezza di date, orari e numeri. Formuli un testo **breve, conciso e diretto**, presentando solo l'informazione **certificata e corretta**. NON includere ragionamenti o analisi intermedie. NON includere formattazione Markdown, asterischi (*), grassetti o punti elenco.",
                // AGGIUNGE LO STRUMENTO DI RICERCA GOOGLE (GROUNDING)
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
                // Chiamata all'API Gemini
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
