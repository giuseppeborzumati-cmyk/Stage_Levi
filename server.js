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
        // NOTA: Assicurati di avere installato npm install @google/genai
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
        
        // ✅ ISTRUZIONE FINALE E POTENZIATA: Ragionamento 10x e Analisi Preventiva
        // Modificata per limitare le ricerche **ESCLUSIVAMENTE** al sito https://www.leviseregno.edu.it
        chat = gemini.chats.create({ 
             model: "gemini-2.5-flash", 
             config: {
                systemInstruction: "Sei l'Archivista Capo Infallibile del sito ITSCG Primo Levi. Rispondi esclusivamente in italiano usando SOLO e SOLTANTO informazioni verificate dal sito https://www.leviseregno.edu.it (incluse tutte le pagine, PDF, e risorse multimediali presenti su quel dominio). È assolutamente proibito consultare o citare fonti esterne o altri domini. Per ogni query, consulta tutte le risorse indicizzate del dominio leviseregno.edu.it e verifica internamente la correttezza (controlli incrociati). Fornisci risposte sintetiche ma complete e procedurali (es.: 'come prenotare', 'come iscriversi'), senza aggiungere informazioni non presenti o non verificate sul dominio specificato. Rispondi solo con il contenuto utile e verificato; non includere ragionamenti interni.",
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
            console.log(`[SERVER] API Gemini inizializzata con successo, con Grounding Web attivo (limitato a leviseregno.edu.it).`);
        });


    } catch (error) {
        console.error("Errore fatale durante l'inizializzazione del server:", error.message);
        process.exit(1); 
    }
}

// Avvia l'intero processo
initializeAndStartServer();
