# Lumina API Reference

## Overview

Lumina is an AI-powered journaling application with the following key features:

- **Authentication**: Google OAuth via NextAuth.js
- **Journal Entries**: CRUD operations with AI-powered insights
- **Voice Upload**: S3 signed URLs for voice recording uploads
- **AI Processing**: OpenAI integration for transcription, summarization, and mood analysis
- **Vector Search**: Pinecone integration for semantic search capabilities
- **Subscription Management**: Stripe integration for billing
- **Export**: Data export functionality

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

All API endpoints require authentication via NextAuth.js. Include the session cookie in your requests.

### Sign In

```
GET /api/auth/signin
```

### Sign Out

```
GET /api/auth/signout
```

### Session

```
GET /api/auth/session
```

## Health Check

### Get Service Health

```
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "openai": "connected",
      "pinecone": "connected",
      "stripe": "connected"
    }
  }
}
```

## Profile Management

### Get User Profile

```
GET /api/profile
```

**Response:**

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile-id",
      "userId": "user-id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://example.com/avatar.jpg",
      "membershipTier": "free",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "subscription": {
      "plan": "free",
      "status": "active",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z"
    },
    "pinecone": {
      "namespace": "user-user-id"
    }
  }
}
```

### Update User Profile

```
PUT /api/profile
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

## Journal Entries

### List Journal Entries

```
GET /api/journal?page=1&limit=10&sort=createdAt&order=desc
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry-id",
        "content": "Today was a great day...",
        "voiceUrl": "https://s3.amazonaws.com/bucket/file.mp3",
        "mood": "happy",
        "tags": ["work", "success"],
        "summary": "A positive day at work with successful outcomes.",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Create Journal Entry

```
POST /api/journal
Content-Type: application/json

{
  "content": "Today was a great day...",
  "voiceUrl": "https://s3.amazonaws.com/bucket/file.mp3"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "entry-id",
      "content": "Today was a great day...",
      "voiceUrl": "https://s3.amazonaws.com/bucket/file.mp3",
      "mood": "happy",
      "tags": ["work", "success"],
      "summary": "A positive day at work with successful outcomes.",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Journal Entry

```
GET /api/journal/{id}
```

### Update Journal Entry

```
PUT /api/journal/{id}
Content-Type: application/json

{
  "content": "Updated content..."
}
```

### Delete Journal Entry

```
DELETE /api/journal/{id}
```

## Voice Upload

### Get Signed URL

```
POST /api/voice/upload-url
Content-Type: application/json

{
  "fileName": "recording.mp3",
  "contentType": "audio/mpeg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/bucket/presigned-url",
    "fileUrl": "https://s3.amazonaws.com/bucket/file.mp3",
    "fields": {
      "key": "uploads/user-id/recording.mp3",
      "bucket": "lumina-voice-recordings"
    }
  }
}
```

## Search

### Search Journal Entries

```
GET /api/search?q=work&tags[]=success&mood=happy&page=1&limit=10
```

**Query Parameters:**

- `q` (required): Search query
- `tags[]` (optional): Filter by tags
- `mood` (optional): Filter by mood
- `startDate` (optional): Filter by start date (ISO string)
- `endDate` (optional): Filter by end date (ISO string)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "entry-id",
        "content": "Today was a great day at work...",
        "summary": "Positive work experience",
        "tags": ["work", "success"],
        "mood": "happy",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "matchSource": "vector",
        "matchScore": 0.95
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "searchMethod": "semantic",
    "query": "work"
  }
}
```

## Settings

### Get User Settings

```
GET /api/settings
```

**Response:**

```json
{
  "success": true,
  "data": {
    "aiMemoryEnabled": true,
    "moodAnalysisEnabled": true,
    "summaryGenerationEnabled": true
  }
}
```

### Update User Settings

```
PUT /api/settings
Content-Type: application/json

{
  "aiMemoryEnabled": true,
  "moodAnalysisEnabled": false,
  "summaryGenerationEnabled": true
}
```

## Billing

### Get Subscription Plan

```
GET /api/billing/plan
```

**Response:**

```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

### Get Billing Portal URL

```
GET /api/billing/portal
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/xxx"
  }
}
```

## AI Chat

### Chat with Journal

```
POST /api/chat
Content-Type: application/json

{
  "prompt": "What have I been feeling about work lately?",
  "sessionId": "session-123"
}
```

**Response:** Server-Sent Events stream

```
data: {"content": "Based on your journal entries", "done": false}

data: {"content": ", you seem to be feeling positive about work.", "done": false}

data: {"content": "", "done": true}
```

## Export

### Export Journal Data

```
GET /api/export?format=json&startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:**

- `format` (optional): Export format (json, pdf, markdown, default: json)
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)

**Response:**

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/bucket/export.json",
    "expiresAt": "2024-01-01T01:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Journal endpoints**: 100 requests per minute
- **Search endpoints**: 50 requests per minute
- **Chat endpoints**: 20 requests per minute

## Pinecone Integration

### Namespace Management

Lumina uses Pinecone for semantic search with user-specific namespaces:

- **Namespace Format**: `user-{userId}`
- **Initialization**: Automatically created during user signup
- **Vector Storage**: Journal entry chunks stored with user metadata
- **Search**: Semantic search filtered by user namespace

### Vector Metadata Structure

```json
{
  "userId": "user-id",
  "entryId": "entry-id",
  "chunkIndex": 0,
  "text": "chunk content",
  "type": "journal_chunk",
  "namespace": "user-user-id"
}
```

## Environment Variables

Required environment variables for Pinecone setup:

```bash
# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="us-west1-gcp"
PINECONE_INDEX_NAME="lumina-embeddings"
```

## Testing

Run the test suite to verify Pinecone integration:

```bash
npm test
```

The test suite includes Pinecone namespace management tests in `__tests__/pinecone.test.ts`.
