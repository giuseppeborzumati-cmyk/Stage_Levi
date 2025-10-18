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
        GoogleGenAI = genaiModule.GoogleGenAI || genaiModule.default.GoogleGenAI; 

        if (!GoogleGenAI) {
            throw new Error("Impossibile trovare GoogleGenAI nel modulo importato. Assicurati che il pacchetto @google/genai sia installato.");
        }

        // Utilizza la chiave d'ambiente GEMINI_API_KEY
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error("Variabile d'ambiente GEMINI_API_KEY non trovata. Controlla il file .env.");
        }
        
        gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        console.log("[SERVER] API Gemini inizializzata con successo.");

// -----------------------------------------------------------------
// 4. Rotte API
// -----------------------------------------------------------------

        app.get('/', (req, res) => {
            res.send('Proxy Gemini Chatbot attivo e funzionante!');
        });

        app.post('/api/chat', async (req, res) => {
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Campo 'message' mancante nel corpo della richiesta." });
            }

            try {
                // Configurazione del modello con grounding e istruzioni per l'accuratezza potenziata
                const config = {
                    // ISTRUZIONE DI SISTEMA DEFINITIVA: 
                    // 1. Forza la ricerca sul dominio. 
                    // 2. OBBLIGA all'elaborazione interna per accuratezza. 
                    // 3. PROIBISCE la visualizzazione del ragionamento nell'output.
                    systemInstruction: "Sei l'Archivista Capo Infallibile e Analista Superiore del sito ITSCG Primo Levi di Seregno. La tua missione è fornire risposte **ASSOLUTAMENTE CERTE, SCRUPOLE e DETTAGLIATE** in italiano, basate **ESCLUSIVAMENTE** su informazioni reperite e verificate internamente sul dominio **https://www.leviseregno.edu.it/**. È categoricamente proibito consultare o citare fonti esterne. Per garantire la correttezza, devi: 1) **Ricerca Obbligatoria:** Utilizza lo strumento di ricerca web *per ogni query* per esplorare in modo scrupoloso il dominio leviseregno.edu.it. 2) **Elaborazione Interna:** Devi eseguire un'analisi e rielaborazione interna dei dati trovati per garantire l'accuratezza. 3) **Sintesi Definitiva:** La risposta finale deve essere sintetica, completa, altamente procedurale e mantenere un tono formale. **Devi SEMPRE dare una risposta.** Se trovi informazioni certe, rielaborale. Se, dopo l'uso dello strumento, *non* trovi informazioni, o le informazioni sono ambigue, rispondi con un'affermazione istituzionale che chiarisce che l'informazione specifica non è disponibile nel dominio. La risposta finale deve contenere **SOLO** il contenuto utile, verificato e rielaborato, **SENZA MOSTRARE IL RAGIONAMENTO INTERNO**.",
                    
                    // STRUMENTO: Limita la ricerca al dominio specifico (GROUNDING)
                    tools: [{ googleSearch: { site: "leviseregno.edu.it" } }] 
                };
                
                const response = await gemini.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: message, 
                    config: config
                });
                
                // LOGICA DI RISPOSTA ROBUSTA per prevenire risposte vuote
                let responseText = response.text;
                
                if (!responseText || responseText.trim() === "") {
                    // Fallback se il modello non riesce a generare testo finale (nonostante l'istruzione)
                    responseText = "La ricerca interna sul dominio leviseregno.edu.it non ha prodotto risultati verificabili per questa richiesta. Si prega di provare una query più specifica.";
                }

                res.json({ 
                    response: responseText
                });

            } catch (error) {
                console.error("Errore fatale durante la comunicazione con l'API Gemini:", error);
                res.status(500).json({ error: "Errore interno del server. Potrebbe esserci un problema con la chiave API o la connessione." });
            }
        });
        
        app.listen(PORT, () => {
            console.log(`[SERVER] Proxy server in ascolto sulla porta ${PORT}`);
            console.log(`[SERVER] Logica di Grounding potenziata per la massima accuratezza e output pulito.`);
        });


    } catch (error) {
        console.error("Errore fatale durante l'inizializzazione del server:", error.message);
        process.exit(1); 
    }
}

// Avvia l'intero processo
initializeAndStartServer();
