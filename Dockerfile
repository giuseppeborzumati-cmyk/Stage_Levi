# 1. Fase Base: Utilizza un'immagine Node.js leggera e stabile
FROM node:20-alpine

# 2. Directory di Lavoro
WORKDIR /usr/src/app

# 3. Copia File di Dipendenza
# *** MODIFICATO PER COPIARE SOLO package.json ***
COPY package.json ./ 

# 4. Installazione Dipendenze
# 'npm install' proverà a generare un package-lock.json se non lo trova.
RUN npm install --omit=dev 

# 5. Copia Codice Sorgente
COPY . .

# 6. Variabili d'Ambiente e Porta
EXPOSE 3000

# 7. Comando d'Avvio
CMD ["node", "server.js"]
