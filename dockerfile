# 1. Fase Base: Utilizza un'immagine Node.js leggera e stabile
FROM node:20-alpine

# 2. Directory di Lavoro
WORKDIR /usr/src/app

# 3. Copia File di Dipendenza
# Assicurati di aver eseguito 'npm install' in locale e committato package-lock.json!
COPY package.json package-lock.json ./ 

# 4. Installazione Dipendenze
RUN npm install --omit=dev

# 5. Copia Codice Sorgente
COPY . .

# 6. Porta
EXPOSE 3000

# 7. Comando d'Avvio
CMD ["node", "server.js"]
