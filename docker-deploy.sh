#!/bin/bash

echo "🐳 Building and running middleware with Docker..."

# Build the Docker image
docker build -t middleware .

# Stop and remove existing container if it exists
docker stop middleware 2>/dev/null || true
docker rm middleware 2>/dev/null || true

# Run the container
docker run -d \
  --name middleware \
  -p 3333:3333 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  middleware

echo "✅ Middleware service is running on port 3333"
echo "📊 Check status: docker ps"
echo "📝 View logs: docker logs middleware"
echo "🛑 Stop service: docker stop middleware"
