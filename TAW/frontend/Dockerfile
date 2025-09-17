FROM node:22-bookworm-slim

EXPOSE 4200
WORKDIR /app

COPY . /app
RUN npm install --include=dev

CMD ["npx", "nodemon"]