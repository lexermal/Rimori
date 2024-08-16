# Stage 1: Build the application
FROM node:22 AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
  libpango1.0-dev \
  libcairo2-dev \
  pkg-config

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Create the final image
FROM node:22

# Install system dependencies for runtime
RUN apt-get update && apt-get install -y \
  libpango1.0-dev \
  libcairo2-dev \
  pkg-config

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --only=production --ignore-scripts

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]