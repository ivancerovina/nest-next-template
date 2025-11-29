FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/back-end/package.json ./apps/back-end/
COPY packages/communication/package.json ./packages/communication/

RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/back-end/node_modules ./apps/back-end/node_modules
COPY --from=deps /app/packages/communication/node_modules ./packages/communication/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/back-end ./apps/back-end
COPY packages/communication ./packages/communication

WORKDIR /app/apps/back-end
RUN pnpm build

FROM node:22-alpine AS migrator
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/back-end/node_modules ./apps/back-end/node_modules
COPY --from=deps /app/packages/communication/node_modules ./packages/communication/node_modules
COPY apps/back-end/package.json ./apps/back-end/
COPY apps/back-end/scripts ./apps/back-end/scripts
COPY apps/back-end/migrations ./apps/back-end/migrations
COPY apps/back-end/tsconfig.json ./apps/back-end/
COPY apps/back-end/libs ./apps/back-end/libs
COPY packages/communication ./packages/communication
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

WORKDIR /app/apps/back-end

CMD ["pnpm", "migrate", "latest"]

FROM node:22-alpine AS runner
WORKDIR /app/apps/back-end

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/back-end/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/back-end/package.json ./
COPY --from=deps --chown=nestjs:nodejs /app/node_modules /app/node_modules
COPY --from=deps --chown=nestjs:nodejs /app/apps/back-end/node_modules ./node_modules

USER nestjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/main"]
