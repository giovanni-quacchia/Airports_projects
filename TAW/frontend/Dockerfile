FROM node:22-bookworm-slim

EXPOSE 4200
WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . /app

# Avvio Angular tramite nodemon
# nodemon osserverà i file e rilancerà `ng serve` se necessario
# --host 0.0.0.0 rende accessibile dall'esterno
CMD ["npx", "nodemon", "--watch", "src", "--ext", "ts,html,css,scss", "--exec", "npx ng serve --host 0.0.0.0"]