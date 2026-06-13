# Use Node 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy everything from the root monorepo
COPY . .

# Install dependencies (this will install workspaces: backend, frontend, shared-types)
RUN npm ci

# Generate Prisma client inside backend
RUN cd backend && npx prisma generate

# Build the NestJS application
RUN cd backend && npm run build

# Expose port (Railway dynamically sets PORT env var)
EXPOSE 3001

# Command to run the application (start from within backend directory)
WORKDIR /app/backend
CMD ["npm", "run", "start:prod"]
