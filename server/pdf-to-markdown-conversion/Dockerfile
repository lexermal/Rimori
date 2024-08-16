# Use the official Node.js image as the base image
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if needed)
RUN npm run build

# Use a smaller base image for the final image
FROM node:22-alpine

# install pdftohtml package
RUN apk add --no-cache poppler-utils

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app .

# Install only production dependencies
RUN npm install --only=production

# Expose the port the app runs on
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]