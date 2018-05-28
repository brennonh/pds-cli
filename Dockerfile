# create a file named Dockerfile
FROM node:latest
RUN mkdir /usr/src/cli
WORKDIR /usr/src/cli
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]

