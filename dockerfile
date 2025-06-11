FROM node:latest

WORKDIR /code_checker

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN npm start