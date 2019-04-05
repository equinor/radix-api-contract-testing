FROM node:11-alpine

WORKDIR /app
COPY . .

RUN apk add --no-cache git openssh

ENV NODE_ENV=production
RUN npm ci

RUN mkdir -p /root/.ssh
RUN sh ./trust-github.sh

CMD npm start
