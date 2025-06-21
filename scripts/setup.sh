#!/bin/bash

echo "🚀 Setting up Lumina Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your actual credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see the application"
echo "4. Visit http://localhost:3000/api/health to check API health"
echo ""
echo "Services running:"
echo "- Next.js: http://localhost:3000"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo "- Redis Commander: http://localhost:8081" 