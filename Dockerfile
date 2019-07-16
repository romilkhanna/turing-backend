FROM node:12 as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY .env .
COPY ./dist ./src
COPY package.json .
RUN yarn install && yarn cache clean

FROM node:12-alpine

ENV NODE_ENV=production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app /usr/src/app

EXPOSE 5000

ENTRYPOINT [ "node", "src/index.js" ]