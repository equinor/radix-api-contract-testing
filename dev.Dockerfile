FROM node:11-alpine

WORKDIR /app
COPY package*.json ./
COPY trust-github.sh ./

RUN apk add --no-cache git openssh
RUN npm install

RUN mkdir -p /root/.ssh
RUN sh ./trust-github.sh

VOLUME [ "/app/node_modules" ]
VOLUME [ "/app/workspace" ]

USER 65534
