FROM node:16-buster

COPY . /src

WORKDIR /src

RUN yarn && rm -rf packages/frontend

RUN sh scripts/loadKeys.sh

FROM node:16-buster

COPY --from=0 /src /src
WORKDIR /src/packages/relay

CMD ["npm", "start"]
