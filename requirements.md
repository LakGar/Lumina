# Lumina Product Requirements

## Overview

Lumina is an AI-powered journaling application that allows users to record thoughts via text or voice. The app uses AI to analyze entries, tag moods, summarize content, and allow rich search and personal insights. This document outlines the requirements for building the backend of Lumina first, followed by the frontend.

---

## Tech Stack

- **Backend Framework**: Next.js (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker
- **File Storage**: Amazon S3 (for MP3 voice recordings)
- **Auth**: NextAuth with Google signup
- **AI**: OpenAI API integration (summaries, tags, mood detection, transcription via Whisper)
- **Vector DB**: Pinecone
- **Job Queue**: BullMQ with Redis

---

## Backend Requirements

### 1. **User Management**

- Google OAuth via NextAuth
- User profile table with:

  - `id (uuid)`
  - `full_name`
  - `email`
  - `avatar_url`
  - `membership_tier` (free, pro, premium)
  - `created_at`, `updated_at`

### 2. **Journal Entries**

- Create, read, update, delete (CRUD)
- Fields:

  - `id (uuid)`
  - `user_id (uuid)` → references profile
  - `content (text)`
  - `voice_url (text, optional)` → S3 URL
  - `mood (text)`
  - `tags (text[])`
  - `summary (text)`
  - `chunks (text[])` → used for semantic embedding
  - `created_at`, `updated_at`

### 3. **Voice Uploading**

- Endpoint to generate S3 signed URL for uploading `.mp3` file
- Store MP3 file in S3 and link URL to journal entry
- Auto-transcribe audio using Whisper API

### 4. **ETL Pipeline (Triggered from Frontend)**

- Triggered after journal is saved (text or voice)
- Steps:

  - Transcribe voice if provided
  - Generate AI summary, tags, mood, and insights
  - Chunk text and store embeddings in Pinecone (per user namespace)
  - Respect user settings (e.g., if mood analysis is off)
  - Store all results in the journal entry
  - Enqueue job using BullMQ

### 5. **Search**

- Text search for free users
- Smart semantic search via Pinecone for Pro+ users
- Filter by tag, mood, and time

### 6. **Settings/Profile Management**

- AI settings:

  - Toggle mood detection
  - Toggle AI summary/tag generation

- Stored per user and used in ETL workflows

### 7. **Subscription/Billing (Stripe)**

- Membership tiers:

  - **Free**: 5 voice entries/month, basic AI summaries, text-only search
  - **Pro (\$9/month)**: Unlimited voice entries, smart search/tags, advanced insights, export to PDF
  - **Premium (\$19/month)**: Pro features + custom AI prompts + priority support

- Store Stripe customer ID, plan, and billing metadata
- Feature gating by tier

### 8. **AI Chat Feature**

- Chat interface for users to talk to their journal
- Retrieve relevant past entries via Pinecone (chunk-level)
- Context from chat history + embeddings
- Stream chunked responses in real time using BullMQ jobs

### 9. **Data Export**

- Export journal data in JSON, PDF, and Markdown formats
- Available to Pro and Premium users

---

## Schema Entities (Updated Draft)

### `profiles`

- `id`: uuid (PK, FK to auth.users)
- `full_name`: text
- `email`: text
- `avatar_url`: text
- `membership_tier`: text
- `created_at`: timestamptz
- `updated_at`: timestamptz

### `journal_entries`

- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `content`: text
- `voice_url`: text (nullable)
- `mood`: text
- `tags`: text\[]
- `summary`: text
- `chunks`: text\[]
- `created_at`: timestamptz
- `updated_at`: timestamptz

### `settings`

- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `ai_memory_enabled`: boolean
- `mood_analysis_enabled`: boolean
- `summary_generation_enabled`: boolean
- `created_at`, `updated_at`: timestamptz

### `subscriptions`

- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `stripe_customer_id`: text
- `plan`: text
- `status`: text
- `created_at`, `updated_at`: timestamptz

---

## Next Steps / Outstanding Items

- Define Pinecone schema/namespaces structure
- Design full Redis job lifecycle for ETL & chat
- Finalize frontend-triggered ETL function and webhook behavior
- Define AI prompt templates per membership tier
- Establish monthly limits enforcement (voice entries for free users)
- Stripe webhook integration for plan syncing

---

Let me know when you're ready to move forward with Docker setup, schema files, and backend implementation plan.
