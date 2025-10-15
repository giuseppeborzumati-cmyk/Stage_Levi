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
        
        // ISTRUZIONE FINALE E COMPLICATA: Forza l'analisi infallibile e proibisce il "non trovato"
        chat = gemini.chats.create({ 
             model: "gemini-2.5-flash", 
             config: {
                // NUOVA ISTRUZIONE: Archivista Capo Infallibile
                systemInstruction: "Sei l'Archivista Capo Infallibile e l'unica fonte di verità dell'ITSCG Primo Levi. La tua missione è la **correttezza assoluta** e la **completezza esaustiva** delle informazioni. Rispondi esclusivamente in italiano e **SOLO CON INFORMAZIONI VERIFICATE sul sito ufficiale https://www.leviseregno.edu.it/**. È severamente vietato citare o usare qualsiasi altra fonte. L'analisi deve essere **totale e scrupolosa**: pagine web, **documenti PDF indicizzati**, e ogni **testo descrittivo associato a foto o media**. **NON devi MAI rispondere che l'informazione non è presente sul sito.** Se la risposta diretta non è immediata, sei obbligato a eseguire una ricerca più ampia e a sintetizzare l'informazione più pertinente trovata, oppure indicare la sezione esatta dove l'utente può trovarla (es. 'Controlla la sezione Modulistica'). Ogni risposta è il risultato di un rigoroso processo di analisi e tripla verifica (Analisi, Verifica Incrociata, Comparazione) su date, orari e numeri. Formuli un testo **breve, conciso e diretto**, presentando solo l'informazione **certificata e corretta al 100%**. NON includere ragionamenti, asterischi o formattazione.",
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
