# Stage 1: base
FROM node:22-alpine AS base
WORKDIR /app

# Stage 2: build
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline
COPY . .
RUN npm run build

# Stage 3: runtime image
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

CMD ["node", "server.js"]
