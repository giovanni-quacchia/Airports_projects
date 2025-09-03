FROM node:22-bookworm-slim

EXPOSE 3000

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

# compile ts
RUN npm run compile 

CMD ["node", "app.js"]

# docker run -d -p 27017:27017 --name mymongo mongo:6
# docker build -t backend .
# docker run -it -p 9000:3000 backend