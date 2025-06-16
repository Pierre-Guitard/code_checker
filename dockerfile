FROM node:latest

WORKDIR /code_checker

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 10000

RUN npm start