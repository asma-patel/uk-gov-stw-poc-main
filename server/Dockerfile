FROM node:16-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . . 

RUN npm run build

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

RUN chmod +x ./container_start.sh

EXPOSE 4000

CMD /bin/sh './container_start.sh'