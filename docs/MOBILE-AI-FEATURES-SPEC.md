# Lumina Mobile App: AI Features Implementation Spec

This document describes how to implement **Entry AI** (mood, tags, summary, quality score), **Go deeper**, **Journal-context chat**, and **Weekly tips** in the Lumina mobile app. All endpoints are on the same backend; the mobile app only needs to call the APIs with the user’s auth (e.g. Clerk session / Bearer token).

---

## Table of contents

1. [Auth & base URL](#1-auth--base-url)
2. [Entry AI (mood, tags, summary, quality score)](#2-entry-ai-mood-tags-summary-quality-score)
3. [Go deeper (during writing)](#3-go-deeper-during-writing)
4. [Journal-context chat](#4-journal-context-chat)
5. [Weekly tips](#5-weekly-tips)
6. [TypeScript / type definitions](#6-typescript--type-definitions)
7. [UX and flows](#7-ux-and-flows)
8. [Error handling](#8-error-handling)
9. [Lumina level and entry creation](#9-lumina-level-and-entry-creation)

---

## 1. Auth & base URL

- **Base URL**: Use the same API base as the rest of the app (e.g. `https://your-backend.com` or `EXPO_PUBLIC_API_URL`).
- **Auth**: Every request must include the user’s session. Backend uses Clerk; send the same auth you use for other API calls (e.g. `Authorization: Bearer <token>` or cookies with `credentials: "include"`).
- **Content-Type**: Send `Content-Type: application/json` for all POST/PATCH bodies.

---

## 2. Entry AI (mood, tags, summary, quality score)

Backend generates **summary**, **mood**, **tags**, and **quality score** for an entry and persists them. The mobile app can trigger this after the user saves an entry, or offer a “Generate AI” / “Refresh AI” action.

### Endpoint

**POST** ` /api/entries/{entryId}/regenerate-ai`

- **Path param**: `entryId` (number, stringified in URL).
- **Body**: none.
- **Response 200**: Full entry with updated `summary`, `mood`, `tags`; summary may include `qualityScore`.

### Response shape (200)

```json
{
  "data": {
    "id": 123,
    "journalId": 1,
    "content": "...",
    "source": "TEXT",
    "createdAt": "2025-02-03T...",
    "updatedAt": "2025-02-03T...",
    "summary": {
      "id": 45,
      "text": "1–2 sentence summary from AI",
      "model": "openrouter",
      "qualityScore": 72,
      "createdAt": "2025-02-03T..."
    },
    "mood": {
      "id": 67,
      "label": "calm",
      "score": 0.72,
      "createdAt": "2025-02-03T..."
    },
    "tags": [
      { "id": 1, "tag": "work", "source": "AI" },
      { "id": 2, "tag": "gratitude", "source": "AI" }
    ]
  }
}
```

- `summary`: can be `null` if not yet generated. When present, `summary.text` is the AI summary; `summary.qualityScore` is 0–100 (optional).
- `mood`: can be `null`. When present, `mood.label` is the mood word/phrase; `mood.score` is optional (0–1).
- `tags`: array of `{ id, tag, source }`; `source` is typically `"AI"` for AI-generated tags.

### Errors

- **400**: Invalid `entryId`.
- **401**: Unauthenticated.
- **404**: Entry not found or not owned by user.
- **502**: AI/backend error (e.g. “Failed to regenerate AI”, “AI did not return valid summary/mood/tags”). Show a retry option.

### Mobile implementation notes

- After creating or opening an entry, you can call this once to populate mood/tags/summary/score.
- Show loading state; on success, update local state or refetch the entry and show summary, mood pill, tags, and optionally quality score (e.g. “Reflection score: 72/100”).
- If the user edits the entry and wants fresh AI, call again (idempotent).

---

## 3. Go deeper (during writing)

“Go deeper” returns **2–4 short questions** to help the user reflect more or add detail. Use this **while the user is writing** (e.g. a “Go deeper” button in the entry composer).

### Endpoint

**POST** ` /api/entries/{entryId}/go-deeper`

- **Path param**: `entryId` (number, stringified in URL).
- **Body** (optional):  
  `{ "currentContent": "string" }`
  - If the user is still editing, send the **current draft** so questions are based on the latest text. If omitted, backend uses the saved entry content.
- **Response 200**: List of questions.

### Response shape (200)

```json
{
  "data": {
    "questions": [
      "What would you tell a friend in the same situation?",
      "What one thing could you do tomorrow that would help?",
      "How did you feel right after that happened?"
    ]
  }
}
```

- `questions`: array of 2–6 strings. Can be empty if AI returns nothing useful.

### Errors

- **400**: Invalid `entryId`.
- **401**: Unauthenticated.
- **404**: Entry not found or not owned by user.
- **502**: AI/backend error. Show retry.

### Mobile implementation notes

- **When to call**: After the user has typed some content (e.g. at least a few sentences). Button label: “Go deeper”, “Reflect more”, or “Get prompts”.
- **Flow**: User taps “Go deeper” → send POST with `currentContent` = current text (or omit if same as saved) → show a list or bottom sheet of questions. User can tap a question to insert it or use it as a prompt to keep writing.
- For a **new entry** not yet saved: backend requires an existing `entryId`. So either create the entry first (draft) then call go-deeper with `currentContent`, or disable “Go deeper” until the entry is saved and call without body.

---

## 4. Journal-context chat

The user picks **one journal**; chat has access to that journal’s **recent entries** as context. The assistant can discuss entries, suggest goal/topic updates, and give weekly-style tips in the reply.

### Endpoint

**POST** ` /api/journals/{journalId}/chat`

- **Path param**: `journalId` (number, stringified in URL). Must be a journal owned by the user.
- **Body**:  
  `{ "message": "string", "sessionId": number | undefined }`
  - `message`: required; the user’s message.
  - `sessionId`: optional. Omit for a new conversation; send for continuing an existing one (returned in the previous response).
- **Response 200**: Assistant reply and session id for follow-up messages.

### Request body example

```json
{
  "message": "What patterns do you see in my entries this week?",
  "sessionId": 5
}
```

(Omit `sessionId` for the first message in a conversation.)

### Response shape (200)

```json
{
  "data": {
    "reply": "Based on your recent entries, I notice you've been...",
    "sessionId": 5
  }
}
```

- `reply`: string; the assistant’s reply. May include suggestions like “Would you like me to update your goal to …?” (the app can then call PATCH preferences if the user confirms).
- `sessionId`: number; use this in the next POST body to continue the same thread.

### Errors

- **400**: Invalid `journalId`, missing `message`, or invalid JSON.
- **401**: Unauthenticated.
- **404**: Journal not found or not owned by user.
- **502**: AI/backend error. Show retry.

### Mobile implementation notes

- **Screen**: e.g. “Chat” or “Reflect” tab/screen. First step: **journal picker** (list user’s journals). After selecting a journal, show chat UI.
- **State**: Store `sessionId` in component state (or in-memory for that journal). When user sends a message, POST with `message` and current `sessionId` (or omit for first message). On 200, save `data.sessionId` and append `data.reply` as the assistant message.
- **History**: Backend persists messages per session. The app does not need to send history; the backend includes it. So you only need to send the latest user message and keep `sessionId`.
- **Goal/topic updates**: If the reply suggests updating goal or topics, show a confirmation (e.g. “Update goal to ‘…’?”) and on confirm call **PATCH** ` /api/users/me/preferences` with `{ "goal": "..." }` or `{ "topics": "..." }` as you already do elsewhere.

---

## 5. Weekly tips

Weekly tips are **one-off insights** (title, short description, detailed text) generated from the user’s stats and recent activity (e.g. missed journaling, quality down, streak). They can be generated on demand or when the user opens a “Tips” / “Insights” section.

### 5.1 List recent tips

**GET** ` /api/users/me/weekly-tips?limit=10`

- **Query**: `limit` (optional, default 10, max 50).
- **Response 200**: Array of tips, newest first.

```json
{
  "data": [
    {
      "id": 1,
      "title": "Small steps back to journaling",
      "shortDescription": "You've missed a few days. Here’s how to ease back in without pressure.",
      "detailedText": "**Be kind to yourself.**\n\nMissing a few days doesn’t mean you’ve failed...\n\n- Start with one sentence.\n- Pick a fixed time...",
      "tipType": "missed_journal",
      "readAt": null,
      "createdAt": "2025-02-03T12:00:00.000Z"
    }
  ]
}
```

- `tipType`: one of `"missed_journal"` | `"quality_down"` | `"streak"` | `"consistency"` | `"general"`. Use for filtering or icons.
- `readAt`: ISO date string or `null`; `null` = unread.

### 5.2 Generate one tip

**POST** ` /api/users/me/weekly-tips/generate`

- **Body**: none.
- **Response 201**: The newly created tip (same shape as one item in the list above, plus you can treat it as the “latest” tip).

```json
{
  "data": {
    "id": 2,
    "title": "Your reflection quality is dipping",
    "shortDescription": "Recent entries are shorter. Try one of these prompts to go deeper.",
    "detailedText": "**Why depth matters.**\n\nWhen we write a bit more...\n\n1. **Morning prompt**: What’s one thing you want to remember from today?\n2. **Evening prompt**: What would you do differently?",
    "tipType": "quality_down",
    "readAt": null,
    "createdAt": "2025-02-03T14:00:00.000Z"
  }
}
```

### 5.3 Mark tip as read

**PATCH** ` /api/users/me/weekly-tips/{tipId}/read`

- **Path param**: `tipId` (number, stringified in URL).
- **Body**: none.
- **Response 204**: No content.

### Errors (weekly tips)

- **401**: Unauthenticated.
- **404**: Tip not found (for PATCH) or not owned by user.
- **502**: AI error on generate (e.g. “Failed to generate weekly tip”, “AI did not return a valid weekly tip”). Show retry.

### Mobile implementation notes

- **Where to show**: Dedicated “Weekly tip” or “Insight” card on home/dashboard, or a “Tips” / “Insights” screen.
- **List screen**: GET weekly-tips on load. Show cards with `title` and `shortDescription`; tap opens detail with `detailedText` (render as markdown). After opening, call PATCH `.../weekly-tips/{id}/read` to mark read; update `readAt` in local state so you can show a “new” badge on unread tips.
- **Generate**: “Get my weekly tip” or “Generate insight” button → POST generate → show the returned tip in a modal or detail screen. Optionally add it to the list and mark as unread until the user opens it.
- **detailedText**: Backend returns markdown (e.g. `**bold**`, lists). Use a markdown-capable component (e.g. React Native Markdown, or a simple renderer) for the detail view.
- **tipType**: Use for an icon or color (e.g. streak = flame, missed_journal = calendar, quality_down = pen).

---

## 6. TypeScript / type definitions

Use these types on the mobile app for request/response typing and state.

```ts
// ----- Entry (after regenerate-ai) -----
interface EntrySummary {
  id: number;
  text: string;
  model: string | null;
  qualityScore?: number | null;
  createdAt: string;
}

interface EntryMood {
  id: number;
  label: string;
  score: number | null;
  createdAt: string;
}

interface EntryTag {
  id: number;
  tag: string;
  source: "AI" | "USER";
}

interface EntryWithAi {
  id: number;
  journalId: number;
  content: string;
  source: "TEXT" | "VOICE" | "MIXED";
  createdAt: string;
  updatedAt: string;
  summary: EntrySummary | null;
  mood: EntryMood | null;
  tags: EntryTag[];
}

// ----- Go deeper -----
interface GoDeeperResponse {
  data: { questions: string[] };
}

// ----- Chat -----
interface ChatSendRequest {
  message: string;
  sessionId?: number;
}

interface ChatSendResponse {
  data: { reply: string; sessionId: number };
}

// ----- Weekly tip -----
type WeeklyTipType =
  | "missed_journal"
  | "quality_down"
  | "streak"
  | "consistency"
  | "general";

interface WeeklyTip {
  id: number;
  title: string;
  shortDescription: string;
  detailedText: string;
  tipType: WeeklyTipType | null;
  readAt: string | null;
  createdAt: string;
}

interface WeeklyTipListResponse {
  data: WeeklyTip[];
}

interface WeeklyTipGenerateResponse {
  data: WeeklyTip;
}
```

---

## 7. UX and flows

### Entry screen (existing entry or after create)

1. Load entry by id (existing API).
2. Optionally show “Generate AI” / “Refresh AI” → **POST** ` /api/entries/{id}/regenerate-ai` → update UI with summary, mood, tags, quality score.
3. If the user is **editing**, show “Go deeper” button → **POST** ` /api/entries/{id}/go-deeper` with optional `currentContent` → show questions in a list/sheet; user can tap to use as prompt.

### New entry (composer)

- “Go deeper” only works for a saved entry. Options:
  - Disable “Go deeper” until the first save, then allow it with `currentContent` for subsequent edits.
  - Or auto-save draft and call go-deeper with the draft content (backend still needs an `entryId`, so you must create the entry first).

### Chat flow

1. User opens Chat / Reflect.
2. Show journal picker (reuse journals list API). User selects a journal.
3. Open chat UI for that journal. `sessionId` = undefined.
4. User sends message → **POST** ` /api/journals/{journalId}/chat` with `{ message }`. Display `data.reply` and store `data.sessionId`.
5. Next messages: same POST with `{ message, sessionId }`.
6. If the bot suggests a goal/topic update, show “Update goal?” (or similar) and on confirm call PATCH preferences.

### Weekly tip flow

1. **Dashboard / Home**: Show one “Weekly tip” card. On load: **GET** ` /api/users/me/weekly-tips?limit=1` and show the first (or latest) tip’s `title` + `shortDescription`. If empty, show “Get your weekly tip” CTA.
2. “Get weekly tip” → **POST** ` /api/users/me/weekly-tips/generate` → show the returned tip (e.g. in a modal or detail screen). Optionally **PATCH** read when user dismisses.
3. “See all tips” → list from GET weekly-tips; tap → detail with `detailedText` (markdown) → **PATCH** ` /api/users/me/weekly-tips/{id}/read`.

---

## 8. Error handling

- **401**: Redirect to sign-in or refresh token.
- **404**: Show “Not found” (entry/journal/tip) and navigate back or refresh.
- **502**: Show a short message (e.g. “AI is temporarily unavailable”) and a “Retry” button. Do not expose raw error strings to the user.
- **Network errors**: Same as rest of app (e.g. “Check your connection” and retry).
- Always show a loading state for POST requests (regenerate-ai, go-deeper, chat, generate tip); disable buttons while loading to avoid double-send.

---

## Quick reference: endpoints

| Method | Path                                  | Body                          | Use                                                         |
| ------ | ------------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| POST   | `/api/entries/{id}/regenerate-ai`     | —                             | Get/refresh AI summary, mood, tags, quality score for entry |
| POST   | `/api/entries/{id}/go-deeper`         | `{ currentContent?: string }` | Get 2–4 reflection questions for entry/draft                |
| POST   | `/api/journals/{id}/chat`             | `{ message, sessionId? }`     | Send chat message; get reply and sessionId                  |
| GET    | `/api/users/me/weekly-tips?limit=10`  | —                             | List recent weekly tips                                     |
| POST   | `/api/users/me/weekly-tips/generate`  | —                             | Generate one weekly tip                                     |
| PATCH  | `/api/users/me/weekly-tips/{id}/read` | —                             | Mark tip as read                                            |

All require authentication. Base URL and auth method are the same as the rest of the Lumina mobile app.

---

## 9. Lumina level and entry creation

**GET /api/users/me/stats** returns `luminaScore`, `luminaLevel`, and the inputs that drive them. Use this to show level and progress (e.g. “Level 2”, “72% to Level 3”).

### What increases Lumina score (positive)

- **Entry creation** – more entries and more days with entries.
- **Streaks** – consecutive days with at least one entry (`currentStreak` in stats).
- **Consistency** – % of last 30 days with an entry (`consistency` in stats).
- **High quality score** – call **Regenerate AI** on entries so they get a quality score; the average (`entryQualityScore`) adds a bonus.
- **Prompt completion** – using **Go deeper** is counted automatically; `promptsCompleted` in stats is the last 30 days.

### What decreases Lumina score (negative)

- **Missing scheduled journal days** – when the user has **daily reminder** enabled in notification settings, days in the last 30 with no entry count as “missed” and apply a penalty. Encourage turning on the reminder and journaling on those days.

In the UI you can show: level (1–5), score, streak, consistency, and a short line like “Journal more days and use Go deeper to level up.” For the full formula and tiers, see the backend doc **docs/LUMINA-LEVEL.md**.
