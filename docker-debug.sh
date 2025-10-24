#!/bin/bash

echo "🔍 Docker Debug Information"
echo "=========================="

echo "📋 Checking Docker status..."
docker ps -a | grep middleware

echo ""
echo "📋 Checking container logs..."
docker logs middleware --tail 20

echo ""
echo "📋 Checking if port 10000 is accessible..."
netstat -tulpn | grep 10000 || echo "Port 10000 not found in netstat"

echo ""
echo "📋 Testing Docker connection (port 10000)..."
curl -v http://localhost:10000 || echo "Docker connection failed"

echo ""
echo "📋 Testing local connection (port 3331)..."
curl -v http://localhost:3331 || echo "Local connection failed"

echo ""
echo "📋 Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "Contents:"
    cat .env
else
    echo "❌ .env file not found"
fi

echo ""
echo "📋 Docker container details..."
docker inspect middleware 2>/dev/null || echo "Container not found"
