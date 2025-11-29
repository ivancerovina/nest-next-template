FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/front-end/package.json ./apps/front-end/
COPY packages/communication/package.json ./packages/communication/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/front-end/node_modules ./apps/front-end/node_modules
COPY --from=deps /app/packages/communication/node_modules ./packages/communication/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/front-end ./apps/front-end
COPY packages/communication ./packages/communication
COPY packages/ui ./packages/ui

WORKDIR /app/apps/front-end
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/front-end/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/front-end/.next/static ./apps/front-end/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/front-end/public ./apps/front-end/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/front-end/server.js"]
