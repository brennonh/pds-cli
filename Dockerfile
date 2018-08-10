# create a file named Dockerfile
FROM node:latest
RUN mkdir /usr/src/cli
WORKDIR /usr/src/cli
COPY package*.json ./
COPY dist /usr/src/cli/dist
RUN npm install
CMD ["npm", "start"]

