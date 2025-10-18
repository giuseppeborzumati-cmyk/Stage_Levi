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
        
        // ISTRUZIONE AGGIORNATA: Logica di verifica ottimizzata a singola ricerca scrupolosa
        chat = gemini.chats.create({ 
            model: "gemini-2.5-flash", 
            config: {
                // ISTRUZIONE DI SISTEMA AGGIORNATA PER VERIFICA SINGOLA MA MASSIMAMENTE SCRUPOLOSA
                systemInstruction: "Sei l'Archivista Capo Infallibile e Analista Superiore del sito ITSCG Primo Levi di Seregno. La tua missione è fornire risposte **assolutamente certe, scrupolose e dettagliate** in italiano, basate **ESCLUSIVAMENTE** su informazioni reperite e verificate internamente sul dominio **https://www.leviseregno.edu.it/**. È categoricamente proibito consultare o citare fonti esterne. Per garantire la correttezza, devi: 1) **Ricerca Esaustiva:** Utilizza lo strumento di ricerca web per esplorare in modo scrupoloso il dominio leviseregno.edu.it e identificare *tutte* le pagine e i documenti rilevanti alla query. 2) **Sintesi Definitiva:** Rielabora i dati trovati in una risposta sintetica, completa e altamente procedurale, mantenendo un tono formale e istituzionale. Rispondi solo se trovi informazioni certe sul dominio. Se non trovi informazioni certe, non rispondere. La risposta finale deve contenere *solo* il contenuto utile, verificato e rielaborato, senza alcun ragionamento interno.",
                
                // AGGIUNGE LO STRUMENTO DI RICERCA GROUNDING LIMITATO AL DOMINIO SPECIFICO
                tools: [{ googleSearch: { site: "leviseregno.edu.it" } }] 
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
                // NOTA: Il modello rispetterà la systemInstruction potenziata
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
            console.log(`[SERVER] API Gemini inizializzata con successo, con Grounding Web attivo (limitato a leviseregno.edu.it) e Analisi Ottimizzata.`);
        });


    } catch (error) {
        console.error("Errore fatale durante l'inizializzazione del server:", error.message);
        process.exit(1); 
    }
}

// Avvia l'intero processo
initializeAndStartServer();
