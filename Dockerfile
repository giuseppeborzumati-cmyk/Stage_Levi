# 1. Fase Base: Utilizza un'immagine Node.js leggera e stabile
# Si usa 'alpine' per ridurre al minimo la dimensione dell'immagine finale.
FROM node:20-alpine

# 2. Directory di Lavoro
# Imposta la directory all'interno del container dove risiederà l'applicazione
WORKDIR /usr/src/app

# 3. Copia File di Dipendenza
# Copia i file di configurazione delle dipendenze per sfruttare il caching di Docker.
# Se questi file non cambiano, lo strato 'RUN npm install' non verrà rieseguito.
COPY package.json package-lock.json ./

# 4. Installazione Dipendenze
# Installa tutte le dipendenze elencate in package.json
RUN npm install --omit=dev

# 5. Copia Codice Sorgente
# Copia il resto del codice dell'applicazione (incluso server.js) nella directory di lavoro
COPY . .

# 6. Variabili d'Ambiente e Porta
# Dichiara la porta su cui l'applicazione sarà in ascolto (Render ignora questo ma è utile per la documentazione)
EXPOSE 3000

# 7. Comando d'Avvio
# Definisce il comando che verrà eseguito all'avvio del container
# Il tuo server proxy è avviato da 'server.js'
CMD ["node", "server.js"]
