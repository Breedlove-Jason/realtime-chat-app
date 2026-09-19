FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/
RUN npm ci --prefix backend && npm ci --prefix frontend
COPY . .
RUN npm run build --prefix frontend && npm prune --omit=dev --prefix backend
FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/backend ./backend
COPY --from=build --chown=node:node /app/frontend/dist ./frontend/dist
USER node
EXPOSE 5006
CMD ["node", "backend/src/index.js"]
