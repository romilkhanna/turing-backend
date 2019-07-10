FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json .
COPY ./node_modules .
COPY ./src ./src
RUN npm run build

EXPOSE 5000

CMD [ "npm", "run", "start" ]