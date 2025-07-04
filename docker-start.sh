#!/bin/bash

echo "🚀 Starting Lumina with ETL Worker..."

# Build and start all services
docker-compose up -d

echo "✅ Services started!"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🔍 Check ETL Worker logs:"
echo "docker-compose logs -f etl-worker"
echo ""
echo "🔍 Check main app logs:"
echo "docker-compose logs -f app"
echo ""
echo "🌐 Access your app at: http://localhost:3001"
echo "📊 Redis Commander at: http://localhost:8081" 