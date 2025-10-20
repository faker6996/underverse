# ---------- Build Stage ----------
FROM node:22 AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install build dependencies for native modules (sharp)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libvips-dev \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Configure npm for better reliability
ENV npm_config_fetch_retries=5 \
    npm_config_fetch_retry_maxtimeout=600000 \
    npm_config_fetch_retry_mintimeout=20000

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Next.js build-time variables
ARG NEXT_PUBLIC_CHAT_SERVER_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_IMAGE_UNOPTIMIZED

# Set environment variables for build
ENV NEXT_PUBLIC_CHAT_SERVER_URL=$NEXT_PUBLIC_CHAT_SERVER_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_IMAGE_UNOPTIMIZED=$NEXT_IMAGE_UNOPTIMIZED

# Build Next.js application
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# ---------- Production Stage ----------
FROM node:22-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Create required directories
RUN mkdir -p /app/public/uploads /app/public/images/products

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy realtime Socket.IO server
COPY --from=builder /app/realtime ./realtime

# Copy scripts for utilities
COPY --from=builder /app/scripts ./scripts

# Copy lib for shared utilities
COPY --from=builder /app/lib ./lib

# Copy TypeScript config and types
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/global.d.ts ./global.d.ts

# Expose application port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]



