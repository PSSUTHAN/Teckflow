# ==========================================
# Stage 1: Build the React + Vite Frontend
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy configuration and source files
COPY index.html vite.config.js jsconfig.json ./
COPY src/ ./src/

# Build static production assets to /app/dist
RUN npm run build

# ==========================================
# Stage 2: Production Server Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production \
    PORT=3000

# Copy package descriptors and install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy static frontend build from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend files and server runner
COPY server.js ./
COPY backend/ ./backend/

# Create persistent storage directory for local database fallback
RUN mkdir -p .data && chown -R node:node /app

# Switch to unprivileged non-root user for security
USER node

# Expose server port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application server
CMD ["node", "server.js"]

