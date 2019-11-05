FROM node:10-alpine

COPY ./ /app

WORKDIR /app

RUN npm install

ENV PATH $PATH:/app/node_modules/.bin

ENTRYPOINT [ "node", "server/index.js" ]
