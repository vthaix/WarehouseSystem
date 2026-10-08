FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=development HOST=0.0.0.0 PORT=3000
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
COPY --chown=node:node database ./database
COPY --chown=node:node scripts ./scripts
RUN mkdir -p /var/lib/warehouse-app-secrets /var/lib/warehouse-mysql-secrets && chown node:node /var/lib/warehouse-app-secrets /var/lib/warehouse-mysql-secrets
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]

FROM runtime AS test
USER root
RUN npm ci --ignore-scripts && npm cache clean --force
COPY --chown=node:node tests ./tests
USER node
ENV STORAGE_DRIVER=memory
CMD ["node", "--test"]
