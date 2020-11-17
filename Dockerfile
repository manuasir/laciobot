FROM node:15.0.0-alpine3.10

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn

COPY index.js .
COPY src ./src

CMD [ "node", "index.js" ]
