#!/bin/bash

echo "🐳 Building and running middleware with Docker..."

# Build the Docker image
docker build -t middleware .

# Stop and remove existing container if it exists
docker stop middleware 2>/dev/null || true
docker rm middleware 2>/dev/null || true

# Run the container with .env file
docker run -d \
  --name middleware \
  -p 10000:10000 \
  -e PORT=10000 \
  -e NODE_ENV=test \
  -e TOKEN=TOKEN-VALUE-HERE \
  --restart unless-stopped \
  middleware

echo "✅ Middleware service is running on port 10000"
echo "📊 Check status: docker ps"
echo "📝 View logs: docker logs middleware"
echo "🛑 Stop service: docker stop middleware"
