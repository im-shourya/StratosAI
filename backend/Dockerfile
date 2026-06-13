# Use Node 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the NestJS application
RUN npm run build

# Expose port (Railway dynamically sets PORT env var)
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "start:prod"]
