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

# Env files will be passed as environment variables on Render, otherwise should uncomment the line below
# COPY .env ./

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
