#!/bin/bash

echo "🐳 Building and running middleware with Docker Compose..."

# Build and run using docker-compose
docker-compose up -d --build

echo "✅ Middleware service is running on port 10000"
echo "📊 Check status: docker-compose ps"
echo "📝 View logs: docker-compose logs -f middleware"
echo "🛑 Stop service: docker-compose down"
echo "🔄 Restart service: docker-compose restart middleware"
