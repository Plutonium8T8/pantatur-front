# Use the official Node.js image
FROM node:16 AS build

# Set the working directory
WORKDIR /pantatur-front

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's files
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight web server to serve the app
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start the web server
CMD ["nginx", "-g", "daemon off;"]
