FROM node:22-bookworm-slim

EXPOSE 3000
WORKDIR /app

# Install dependencies
COPY package*.json /app
RUN npm install --include=dev

COPY . /app

CMD ["npx", "nodemon", "--legacy-watch", "app.ts"]