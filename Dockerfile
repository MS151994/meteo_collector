FROM node:24.13.0-slim AS builder

WORKDIR /opt/meteo_collector/
COPY . .

RUN npm ci --ignore-scripts

RUN npm run build

FROM node:24.13.0-slim AS production

LABEL maintener="mstepien"

WORKDIR /opt/meteo_collector/
COPY --chown=node:node --from=builder /opt/meteo_collector/node_modules/ ./node_modules/
COPY --chown=node:node --from=builder /opt/meteo_collector/build/ ./build/
COPY --chown=node:node --from=builder /opt/meteo_collector/package.json ./

EXPOSE 8080
ENV NODE_ENV=production
ENV NODE_OPTIONS="--no-warnings"

USER node

CMD ["node", "--title=meteo-collector-api", "./build/index.js"]