# Backend Routes To Create

Routes the Lumina mobile app expects but that may not exist yet on the backend. Implement these so privacy, billing, and insights work end-to-end.

**Implementation status (this repo):** Privacy (DELETE journals, ai-data, POST delete-all-data), billing (checkout, portal, webhooks/stripe), GET /api/users/me/stats, GET /api/users/me/subscription, GET /api/users/me/entries (with optional `from`/`to` YYYY-MM-DD, limit up to 300), and reminders (GET/POST /api/users/me/reminders, PATCH/DELETE /api/users/me/reminders/[id]) are implemented. The 500 on journal entries is fixed once the `EntrySummary.qualityScore` migration is applied (see “Database: Fix 500” below).

---

## Privacy / data deletion

### 1. Delete all journal data

**Method:** `DELETE`  
**Path:** `/api/users/me/journals`

**Purpose:** Permanently delete all journals and all entries for the current user. Used by **Privacy settings → Delete journal data**.

**Request**

- **Headers:** `Authorization: Bearer <token>` (or session).
- **Body:** none.

**Response**

- **Success:** `204 No Content` or `200 OK` with empty/minimal body.
- **Errors:** `401` (unauthenticated), `403` (forbidden), `500` (server error).

**Backend behavior**

- Resolve user from auth.
- Delete all journal entries for that user, then all journals for that user (or in one transactional delete).
- Do not delete the user account or preferences; only journal + entry data.

---

## 2. Delete AI / personalization data

**Method:** `DELETE`  
**Path:** `/api/users/me/ai-data`

**Purpose:** Delete stored AI-related data for the current user (e.g. prompts, personalization cache). Used by **Privacy settings → Delete AI data**.

**Request**

- **Headers:** `Authorization: Bearer <token>`.
- **Body:** none.

**Response**

- **Success:** `204 No Content` or `200 OK`.
- **Errors:** `401`, `403`, `500`.

**Backend behavior**

- Resolve user from auth.
- Remove any stored prompts, AI suggestions cache, or other AI/personalization data keyed to this user.
- If you have no such storage yet, implement the route and no-op (return 204) so the app does not get 404.

---

## 3. Delete all user data

**Method:** `POST`  
**Path:** `/api/users/me/delete-all-data`

**Purpose:** Permanently delete all data for the current user (journals, entries, preferences, notification settings, AI data, etc.). The app signs the user out after a successful call. Used by **Privacy settings → Delete all data**.

**Request**

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`.
- **Body:** `{}` (empty object acceptable).

**Response**

- **Success:** `204 No Content` or `200 OK`.
- **Errors:** `401`, `403`, `500`.

**Backend behavior**

- Resolve user from auth.
- In a transaction (if possible):
  - Delete all entries and journals for the user.
  - Delete user preferences, notification settings, onboarding state.
  - Delete AI/personalization data for the user.
- Do **not** delete the user’s auth identity (e.g. Clerk user); only app-owned data. The app will call Clerk’s sign-out separately.

---

## Stripe / billing

### 4. Create checkout session

**Method:** `POST`  
**Path:** `/api/billing/checkout`

**Purpose:** Create a Stripe Checkout Session for subscription (or one-time) purchase. The app opens the returned URL in a browser so the user can pay and subscribe. Used by **Upgrade / Subscription** screen (“Upgrade” button).

**Request**

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`.
- **Body:** optional, e.g. `{ "priceId": "string" }` if you have multiple plans; otherwise omit and use your default subscription price.

**Response:** `200 OK` or `201 Created`

```json
{
  "data": {
    "url": "https://checkout.stripe.com/...",
    "sessionId": "optional-stripe-session-id"
  }
}
```

**Backend behavior**

- Resolve user from auth; ensure Stripe customer exists for user (create if not).
- Create a Stripe Checkout Session for the subscription (or plan) you want to offer.
- Return the session `url` so the app can open it in `WebBrowser.openBrowserAsync(url)`.
- On success, Stripe will call your webhook; use it to update subscription status for the user.

---

### 5. Create customer portal session

**Method:** `POST`  
**Path:** `/api/billing/portal`

**Purpose:** Create a Stripe Customer Portal session so the user can manage subscription, payment methods, and invoices. Used by **Upgrade** screen (“Manage subscription” / “Manage billing”).

**Request**

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`.
- **Body:** optional, e.g. `{ "returnUrl": "string" }` for redirect after portal.

**Response:** `200 OK`

```json
{
  "data": {
    "url": "https://billing.stripe.com/..."
  }
}
```

**Backend behavior**

- Resolve user from auth; get their Stripe customer ID.
- Create a Stripe Billing Portal session for that customer.
- Return the portal `url` so the app can open it in the browser.

---

### 6. Stripe webhook

**Method:** `POST`  
**Path:** `/api/webhooks/stripe`

**Purpose:** Receive Stripe events (e.g. `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`). Not called by the app; Stripe sends requests to this URL.

**Request**

- **Headers:** `Stripe-Signature` (for verification). Body must be raw (for signature verification).
- **Body:** Stripe event JSON.

**Response:** `200 OK` (acknowledge receipt). Return 4xx on signature verification failure.

**Backend behavior**

- Verify request using Stripe webhook signing secret.
- On `checkout.session.completed`: link subscription to user, set subscription status.
- On `customer.subscription.*`: update user’s subscription status (active, canceled, past_due, etc.).
- Optionally expose subscription status via e.g. `GET /api/users/me/subscription` so the app can show “Manage subscription” vs “Upgrade”.

---

## User stats / insights (for dashboard and Lumina level)

### 7. Get user stats (Lumina level, dashboard metrics)

**Method:** `GET`  
**Path:** `/api/users/me/stats`

**Purpose:** Return aggregated stats for the current user so the app can show dashboard metrics, Lumina level, last journal, entries this week, mood score, streak, consistency, etc., from a single source of truth. The app can compute these client-side from entries today; this route is for backend authority and future features (e.g. server-side Lumina level).

**Request**

- **Headers:** `Authorization: Bearer <token>`.

**Response:** `200 OK`

```json
{
  "data": {
    "luminaScore": 0,
    "luminaLevel": 1,
    "lastJournal": { "title": "string", "journalId": "string", "daysAgo": 0 },
    "entriesThisWeek": 0,
    "moodScore": null,
    "entryQualityScore": null,
    "currentStreak": 0,
    "reflections": 0,
    "gratitudeEntries": 0,
    "wordsPerEntry": null,
    "consistency": 0,
    "promptsCompleted": 0
  }
}
```

**Field descriptions (for backend)**

| Field                 | Type           | Description                                                                                                                                                              |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **luminaScore**       | number         | Gamification score (e.g. 0–1000+). Increase with journaling activity; used to advance Lumina level. Can be derived from entries, streak, consistency, prompts completed. |
| **luminaLevel**       | number         | User’s current “Lumina level” tier (e.g. 1–5). Backend can define thresholds (e.g. 0–99 → 1, 100–499 → 2). Used in UI for progress and premium/unlock messaging.         |
| **lastJournal**       | object \| null | Last journal the user wrote in: `title`, `journalId`, `daysAgo` (number of days since last entry). Null if no entries.                                                   |
| **entriesThisWeek**   | number         | Count of entries created in the current week (calendar week).                                                                                                            |
| **moodScore**         | number \| null | Aggregate mood “score” (e.g. 0–10 or 1–5) from entries that have a mood, or null if none. Backend can average numeric mood values or map labels to numbers.              |
| **entryQualityScore** | number \| null | Optional quality/engagement score (e.g. 0–100) if you compute it (e.g. from word count, consistency). Null if not computed.                                              |
| **currentStreak**     | number         | Consecutive days (including today) with at least one journal entry. 0 if none today and no streak.                                                                       |
| **reflections**       | number         | Total count of reflection-type entries (or entries in a “reflections” journal). Can be same as total entries if not distinguished.                                       |
| **gratitudeEntries**  | number         | Count of entries that have a mood or are tagged as gratitude (or in a gratitude journal).                                                                                |
| **wordsPerEntry**     | number \| null | Average word count per entry. Null if no entries.                                                                                                                        |
| **consistency**       | number         | Percentage of days in the last 30 days that have at least one entry (0–100).                                                                                             |
| **promptsCompleted**  | number         | Count of “prompt completed” actions in the current month (or all-time if you prefer).                                                                                    |

**Lumina level (backend description)**

- **Lumina level** is a tier (e.g. 1–5) driven by **luminaScore**.
- **luminaScore** increases with: entries written, streak length, consistency, prompts completed, mood logged, etc. Exact formula is up to the backend (e.g. 1 point per entry, 5 per day in streak, 10 per prompt).
- Example thresholds: Level 1 = 0–99, Level 2 = 100–299, Level 3 = 300–599, Level 4 = 600–999, Level 5 = 1000+.
- The app shows “Lumina level” and progress (e.g. 0% at score 0 with “Start journaling to earn points”). Backend can return both `luminaScore` and `luminaLevel`; app can derive progress within current level if you expose score and level thresholds.

**Backend behavior**

- Resolve user from auth; load their journals and entries (or use pre-aggregated stats if you store them).
- Compute each field from entries/journals (and any prompt-completion or mood tables).
- Return the above shape. Omit or null optional fields if not implemented yet.

---

## Optional

- **GET /api/users/me/subscription** – Return `{ status: "active" | "canceled" | "past_due" | null, planId?: string }` so the app can show “Manage subscription” vs “Upgrade” and gate premium features.
- **Account management URL:** The app uses `EXPO_PUBLIC_CLERK_ACCOUNT_URL` for profile/email/password; no backend route required.

---

## Summary

| Method | Path                            | Purpose                                                                                                                                                |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DELETE | `/api/users/me/journals`        | Delete all journal data                                                                                                                                |
| DELETE | `/api/users/me/ai-data`         | Delete AI data                                                                                                                                         |
| POST   | `/api/users/me/delete-all-data` | Delete all user data                                                                                                                                   |
| POST   | `/api/billing/checkout`         | Create Stripe Checkout Session (upgrade)                                                                                                               |
| POST   | `/api/billing/portal`           | Create Stripe Customer Portal session (manage billing)                                                                                                 |
| POST   | `/api/webhooks/stripe`          | Stripe webhook (subscription events)                                                                                                                   |
| GET    | `/api/users/me/stats`           | User stats: Lumina level, last journal, entries this week, mood score, streak, reflections, gratitude, words per entry, consistency, prompts completed |

All except the webhook require authentication (e.g. Clerk JWT). The webhook must verify Stripe signature.
