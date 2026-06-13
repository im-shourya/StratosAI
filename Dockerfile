FROM node:22-alpine

WORKDIR /app

# 1. Copy package files to install dependencies
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/ packages/

# 2. Install all dependencies (Monorepo aware)
RUN npm ci

# 3. Copy source files
COPY backend/ backend/

# 4. Generate database client and build backend
RUN cd backend && npx prisma generate
RUN cd backend && npm run build

# 5. Runtime Configuration
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "dist/main.js"]
