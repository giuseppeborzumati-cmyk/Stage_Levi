# 1. Fase Base: Utilizza l'immagine Node.js LTS (20) su base Alpine.
FROM node:20-alpine

# 2. Directory di Lavoro
WORKDIR /usr/src/app

# 3. Copia File di Dipendenza
# Copia package.json e package-lock.json per sfruttare la cache di Docker.
# Render fallirà qui se package-lock.json non è su GitHub!
COPY package.json package-lock.json ./ 

# 4. Installazione Dipendenze
# Installa le dipendenze di produzione
RUN npm install --omit=dev

# 5. Copia Codice Sorgente
COPY . .

# 6. Porta
EXPOSE 3000

# 7. Comando d'Avvio
CMD ["node", "server.js"]