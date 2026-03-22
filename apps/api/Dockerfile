FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/schemas/package.json packages/schemas/
COPY packages/contract/package.json packages/contract/
COPY packages/i18n/package.json packages/i18n/
RUN pnpm install --frozen-lockfile

COPY packages/schemas/ packages/schemas/
COPY packages/contract/ packages/contract/
COPY packages/i18n/ packages/i18n/
COPY apps/api/ apps/api/

RUN pnpm --filter @repo/schemas build
RUN pnpm --filter @repo/contract build
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy all node_modules from builder (includes drizzle-kit for migrations)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/schemas/node_modules ./packages/schemas/node_modules
COPY --from=builder /app/packages/contract/node_modules ./packages/contract/node_modules

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/apps/api/drizzle.config.ts ./apps/api/drizzle.config.ts
COPY --from=builder /app/apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

# Workspace packages (runtime imports)
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=builder /app/packages/schemas/package.json ./packages/schemas/package.json
COPY --from=builder /app/packages/contract/dist ./packages/contract/dist
COPY --from=builder /app/packages/contract/package.json ./packages/contract/package.json
COPY --from=builder /app/packages/i18n ./packages/i18n

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN chmod +x ./apps/api/docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
WORKDIR /app/apps/api
ENTRYPOINT ["./docker-entrypoint.sh"]
