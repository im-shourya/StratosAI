FROM node:22-alpine

# Install native build tools for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

ENV NODE_ENV=production

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
RUN cd backend && npx nest build

# 5. Runtime Configuration
EXPOSE 8080
WORKDIR /app/backend
CMD ["node", "dist/main.js"]

