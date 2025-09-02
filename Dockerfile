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

# Set default port
ENV PORT=10000

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
