# Multi-stage Docker build for PlanMind AI
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package definitions
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/scheduler/package*.json ./packages/scheduler/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Install all dependencies across monorepo workspaces
RUN npm install

# Copy full source tree
COPY . .

# Build all packages, API server, and web client
RUN npm run build

# Production runtime container
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package manifests and installed node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/web/dist ./apps/web/dist

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
