# Use the official Node.js 20 image.
FROM node:20-alpine

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application source code.
# This will be overwritten by the volume mount in docker-compose,
# but it's good practice to have it here for standalone builds.
COPY . .

# Expose the port the app runs on.
EXPOSE 3000

# The command to run the development server.
# This will be overridden by the command in docker-compose.yml.
CMD ["npm", "run", "dev"]
