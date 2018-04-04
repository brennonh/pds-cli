FROM node:latest
RUN mkdir /usr/src/cli
WORKDIR /usr/src/cli
COPY package*.json ./
RUN npm install
COPY . .
