FROM node:latest

WORKDIR /code_checker

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node",  "server.js"]