// File: server.js nel tuo repository Render (Backend)

// ... (altre righe di codice - tutto resta invariato fino a qui)

app.post('/api/chat', async (req, res) => {
    const userPrompt = req.body.prompt; 
    const siteUrl = "https://www.leviseregno.edu.it/"; // URL FISSATO QUI

    if (!userPrompt) {
        return res.status(400).json({ error: 'Manca il prompt utente' });
    }

    try {
        // Istruzione a Gemini di BASARE la risposta sul contenuto del sito
        const fullPrompt = `Rispondi a questa domanda: "${userPrompt}", cercando di usare le informazioni che puoi trovare in questo sito: ${siteUrl}. Se non trovi informazioni specifiche, rispondi in modo neutrale.`;

        // Chiama l'API di Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt, // Usiamo il prompt modificato
        });
        
        res.json({ text: response.text });
    } catch (error) {
// ... (il resto del codice non cambia)
