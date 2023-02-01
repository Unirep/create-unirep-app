FROM node:16-buster

COPY . /src

WORKDIR /src

RUN yarn && rm -rf packages/frontend

RUN rm -rf /src/packages/relay/node_modules/@unirep
RUN rm -rf /src/packages/contracts/node_modules/@unirep
COPY packages/relay/node_modules/@unirep /src/packages/relay/node_modules/@unirep
COPY packages/contracts/node_modules/@unirep /src/packages/contracts/node_modules/@unirep

RUN rm -rf /src/packages/relay/node_modules/@unirep/circuits/zksnarkBuild
RUN rm -rf /src/packages/contracts/node_modules/@unirep/circuits/zksnarkBuild

FROM node:16-buster

COPY --from=0 /src /src
WORKDIR /src/packages/relay

CMD ["npm", "start"]
