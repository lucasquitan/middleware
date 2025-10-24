FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy .env file (if it exists)
COPY .env* ./

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
