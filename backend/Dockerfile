# Use Node 22 (required by @prisma/streams-local)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy root package files first for caching
COPY package.json package-lock.json ./

# Copy ALL workspace package.json files (npm ci needs them all)
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/shared-types/package.json packages/shared-types/

# Install dependencies (workspace-aware)
RUN npm ci

# Copy only backend and shared-types source (skip frontend source)
COPY backend/ backend/
COPY packages/ packages/

# Generate Prisma client
RUN cd backend && npx prisma generate

# Build the NestJS application
RUN cd backend && npm run build

# Expose port (Railway sets PORT env var)
EXPOSE 8080

# Run directly with node (avoids npm workspace resolution issues)
WORKDIR /app/backend
CMD ["node", "dist/main.js"]
