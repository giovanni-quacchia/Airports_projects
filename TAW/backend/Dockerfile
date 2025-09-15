FROM node:22-bookworm-slim

EXPOSE 3000
WORKDIR /app

# Install dependencies
COPY package*.json /app
RUN npm install --include=dev

# Install nodemon
# RUN npm install -g nodemon

COPY . /app

CMD ["npx", "nodemon", "app.ts"]