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
        // Importa la classe GoogleGenAI (gestione fallback per import dinamici)
        GoogleGenAI = genaiModule.GoogleGenAI || genaiModule.default.GoogleGenAI; 

        if (!GoogleGenAI) {
            throw new Error("Impossibile trovare GoogleGenAI nel modulo importato. Assicurati che il pacchetto @google/genai sia installato.");
        }

        // Utilizza la chiave d'ambiente GEMINI_API_KEY
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error("Variabile d'ambiente GEMINI_API_KEY non trovata. Controlla il file .env.");
        }
        
        // Inizializza l'istanza di Gemini
        gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        console.log("[SERVER] API Gemini inizializzata con successo.");

// -----------------------------------------------------------------
// 4. Rotte API
// -----------------------------------------------------------------

        // Rotta principale (per verifica)
        app.get('/', (req, res) => {
            res.send('Proxy Gemini Chatbot attivo e funzionante!');
        });

        // Rotta per la chat (gestisce la logica di grounding e accuratezza)
        app.post('/api/chat', async (req, res) => {
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Campo 'message' mancante nel corpo della richiesta." });
            }

            try {
                // Configurazione del modello con istruzione di sistema e grounding
                const config = {
                    // ISTRUZIONE DI SISTEMA: Forzatura del Grounding e della Risposta costante e accurata.
                    systemInstruction: "Sei l'Archivista Capo Infallibile e Analista Superiore del sito ITSCG Primo Levi di Seregno. La tua missione è fornire risposte **assolutamente certe, scrupolose e dettagliate** in italiano, basate **ESCLUSIVAMENTE** su informazioni reperite e verificate internamente sul dominio **https://www.leviseregno.edu.it/**. È categoricamente proibito consultare o citare fonti esterne. Per garantire la correttezza, devi: 1) **Ricerca Esaustiva:** Utilizza lo strumento di ricerca web per esplorare in modo scrupoloso il dominio leviseregno.edu.it e identificare *tutte* le pagine e i documenti rilevanti alla query. 2) **Analisi e Ragionamento:** Dopo la ricerca, dovrai **esplicitare il tuo ragionamento interno** su come hai analizzato le fonti trovate e la logica utilizzata per validare le informazioni richieste. 3) **Sintesi Definitiva:** Concludi con la risposta finale, che deve essere sintetica, completa, altamente procedurale e mantenere un tono formale e istituzionale. **Devi sempre rispondere.** Se trovi informazioni certe, rielaborale per l'accuratezza. Se l'analisi non produce dati validi dal dominio, devi comunque fornire una risposta istituzionale che chiarisca l'esito della ricerca interna. La tua risposta deve seguire la struttura: **[RAGIONAMENTO INTERNO]** seguito dalla **[RISPOSTA DEFINITIVA e VERIFICATA]**.",
                    
                    // STRUMENTO: Limita la ricerca al dominio specifico (GROUNDING)
                    tools: [{ googleSearch: { site: "leviseregno.edu.it" } }] 
                };
                
                // Utilizzo di generateContent per una chiamata singola e completa
                const response = await gemini.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: message, 
                    config: config
                });
                
                // Estrai il testo della risposta. 
                const responseText = response.text || "Si è verificato un errore sconosciuto nella generazione della risposta, nonostante il processo di ricerca interno sia stato completato.";
                
                // Invia la risposta JSON al client
                res.json({ 
                    response: responseText
                });

            } catch (error) {
                console.error("Errore durante la comunicazione con l'API Gemini:", error);
                res.status(500).json({ error: "Errore interno del server durante la comunicazione con l'API." });
            }
        });
        
        // Avvia l'ascolto del server
        app.listen(PORT, () => {
            console.log(`[SERVER] Proxy server in ascolto sulla porta ${PORT}`);
            console.log(`[SERVER] Grounding Web (limitato a leviseregno.edu.it) attivo e ottimizzato per risposte esatte.`);
        });


    } catch (error) {
        console.error("Errore fatale durante l'inizializzazione del server:", error.message);
        process.exit(1); 
    }
}

// Avvia l'intero processo
initializeAndStartServer();
