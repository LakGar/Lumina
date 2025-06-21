# Lumina Backend

An AI-powered journaling application backend built with Next.js, PostgreSQL, Redis, and various AI services.

## 🚀 Features

- **User Authentication**: Google OAuth via NextAuth
- **Journal Entries**: CRUD operations with text and voice support
- **AI Processing**: OpenAI integration for summaries, mood analysis, and tagging
- **Voice Transcription**: Whisper API for audio-to-text conversion
- **Vector Search**: Pinecone for semantic search capabilities
- **File Storage**: AWS S3 for voice recording storage
- **Job Queues**: BullMQ with Redis for async processing
- **Subscription Management**: Stripe integration for billing
- **Data Export**: JSON, PDF, and Markdown export options

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ
- **Authentication**: NextAuth.js with Google OAuth
- **AI Services**: OpenAI API (GPT-4, Whisper)
- **Vector Database**: Pinecone
- **File Storage**: AWS S3
- **Payment**: Stripe
- **Testing**: Jest
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)
- Google OAuth credentials
- OpenAI API key
- Pinecone API key
- AWS S3 credentials
- Stripe account

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd lumina-backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Database
DATABASE_URL="postgresql://lumina_user:lumina_password@localhost:5432/lumina"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="us-west1-gcp"
PINECONE_INDEX_NAME="lumina-embeddings"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="lumina-voice-recordings"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

### 3. Start Services

Start PostgreSQL and Redis using Docker:

```bash
docker-compose up -d
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

### Health Check

- `GET /api/health` - Check service health

### Authentication

- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Profile Management

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Journal Entries

- `GET /api/entries` - List journal entries
- `POST /api/entries` - Create journal entry
- `GET /api/entries/[id]` - Get specific entry
- `PUT /api/entries/[id]` - Update entry
- `DELETE /api/entries/[id]` - Delete entry

### Voice Upload

- `POST /api/upload/signed-url` - Get S3 signed URL for upload

### Search

- `GET /api/search` - Search journal entries

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Subscriptions

- `GET /api/subscriptions` - Get subscription info
- `POST /api/subscriptions` - Create subscription

### Export

- `GET /api/export` - Export journal data

### AI Chat

- `POST /api/chat` - AI chat interface

## 🏗 Project Structure

```
lumina-backend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── lib/                   # Library files
│   ├── prisma.ts          # Database client
│   ├── redis.ts           # Redis client
│   ├── pinecone.ts        # Pinecone client
│   ├── openai.ts          # OpenAI client
│   ├── s3.ts              # AWS S3 client
│   ├── stripe.ts          # Stripe client
│   └── queue.ts           # BullMQ queues
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── middleware/            # Custom middleware
├── prisma/                # Database schema
├── __tests__/             # Test files
├── docs/                  # Documentation
└── docker-compose.yml     # Docker services
```

## 🔧 Development

### Database Management

```bash
# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:push --force-reset

# Seed database
npm run db:seed
```

### Queue Management

Monitor Redis queues using Redis Commander (available at `http://localhost:8081` when running with Docker).

### Environment Variables

All environment variables are documented in `env.example`. Make sure to set up all required services before running the application.

## 🚀 Deployment

### Docker Deployment

```bash
# Build the application
docker build -t lumina-backend .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup for Production

Ensure all production environment variables are properly configured:

- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Configure production database URLs
- Set up production S3 buckets
- Configure production Stripe keys
- Set up production Pinecone indexes

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
