# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Install a simple HTTP server
RUN npm install -g serve

ENV PORT=9000

EXPOSE 9000

# Serve the built app
CMD ["serve", "-s", "build", "-l", "9000"]


