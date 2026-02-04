# Lumina – Features & API Tracker

Track what’s built so we don’t forget. Update this file when adding or changing features.

---

## Environment

- **APP_URL** – Canonical base URL (e.g. `https://app.lumina.com`). Used for Stripe checkout/portal redirects. Fallback: request origin in dev.
- **ALLOWED_ORIGINS** – Comma-separated CORS origins in production. Dev: allow any when unset.
- **STRIPE_SECRET_KEY**, **STRIPE_WEBHOOK_SECRET**, **STRIPE_PRICE_ID_PRO** – Billing.

---

## API Routes (all use `requireAuth` + ownership unless noted)

| Area           | Endpoints                                                                   | Notes                                            |
| -------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| Journals       | `GET/POST /api/journals`, `GET/PATCH/DELETE /api/journals/[id]`             | Owner: `authorId === user.id`                    |
| Entries        | `GET/POST /api/journals/[id]/entries`, `GET/PATCH/DELETE /api/entries/[id]` | Owner: entry’s journal belongs to user           |
| Moods          | `GET/POST /api/moods`, `GET/PATCH/DELETE /api/moods/[id]`                   | Owner: `authorId === user.id`                    |
| Preferences    | `GET/PATCH /api/users/me/preferences`                                       | Upsert by `authorId`                             |
| Notification   | `GET/PATCH /api/users/me/notification`                                      | Upsert by `authorId`                             |
| Entry tags     | `POST /api/entries/[id]/tags`, `DELETE /api/entries/[id]/tags/[tag]`        | USER tags only for add/remove                    |
| Regenerate AI  | `POST /api/entries/[id]/regenerate-ai`                                      | Stub (501) until AI integration                  |
| Billing        | `POST /api/billing/checkout`, `POST /api/billing/portal`                    | Lazy Stripe customer                             |
| Stripe webhook | `POST /api/webhooks/stripe`                                                 | **No auth**; verify with `STRIPE_WEBHOOK_SECRET` |

---

## Schema (for sanity-check: uniqueness + relations)

### Billing

- Exactly one row per user → **userId @unique**
- **User** has `billing Billing?`; Billing uses **onDelete: Cascade**
- **stripeCustomerId** and **stripeSubscriptionId** are **@unique** when present (avoids one customer attached to two users)
- Optional: plan, status, currentPeriodEnd; timestamps: createdAt, updatedAt

```prisma
model Billing {
  id                   Int      @id @default(autoincrement())
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId               Int      @unique
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  plan                 String?  // "free" | "pro"
  status               String?  // "active" | "trialing" | "past_due" | "canceled" etc.
  currentPeriodEnd     DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

### userPrefferences

- One row per user → **authorId @unique**; relation **onDelete: Cascade**
- Upsert-by-authorId is safe. Optional: aiSummariesEnabled, autoTaggingEnabled, moodDetectionEnabled, aiTone; timestamps.
- **Trap:** Typos (e.g. "prefferences") become permanent; consider renaming to UserPreferences if still early.

```prisma
model userPrefferences {
  id                   Int     @id @default(autoincrement())
  theme                Theme   @default(SYSTEM)
  goal                 String?
  topics               String?
  reason               String?
  aiSummariesEnabled   Boolean @default(true)
  autoTaggingEnabled   Boolean @default(true)
  moodDetectionEnabled Boolean @default(true)
  aiTone               String? // "supportive" | "neutral" | "coach"
  author               User    @relation(...)
  authorId             Int     @unique
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

### Notification

- One row per user → **authorId @unique**; **onDelete: Cascade**
- Reminder stored as **dailyReminderTime** (String "HH:mm") + **timezone** (no DateTime for daily time to avoid date/timezone drift).

```prisma
model Notification {
  id                    Int      @id @default(autoincrement())
  dailyReminderEnabled  Boolean  @default(false)
  dailyReminderTime     String?  // "20:30" (HH:mm)
  timezone              String?
  frequency             NotificationFrequency?
  author                User     @relation(...)
  authorId              Int      @unique
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## Stripe Webhook (handled now)

- `checkout.session.completed`
- `customer.subscription.created` / `customer.subscription.updated`
- `customer.subscription.deleted`

**Optional later (for status/reliability):**

- `invoice.payment_failed`
- `invoice.paid`

---

## Tests (current)

- **Journals**: 9 tests (401, 400, 201, 404, 200).
- **Moods**: 5 tests (401, 200, 400, 201, 404).

---

## Migration note

After pulling schema changes (Billing `userId`/`user`, Notification `dailyReminder*`/`timezone`, userPrefferences new fields + timestamps), run **`npx prisma migrate dev`** when the DB is reachable to apply the migration. If you already have data, the migration may need a custom step to rename Billing `authorId` → `userId` and Notification `enabled`/`time` → `dailyReminderEnabled`/`dailyReminderTime` (Prisma may generate these renames automatically).

---

## Next steps (recommended)

- [x] Add tests for: **entries** (list/ownership), **tags** (POST/DELETE + ownership), **preferences** (GET/PATCH), **notification** (GET/PATCH), **billing** (checkout/portal, APP_URL).
- [x] Add **one ownership regression test** per route: journals, moods, entries, tags (404 when resource not owned).
- [x] Add **webhook verification fail** test: bad `stripe-signature` → 400.
- [ ] Later: `invoice.payment_failed` / `invoice.paid` in Stripe webhook.

---

## Logging & CORS

- **Pino** JSON logs: `requestId`, `method`, `path`, `statusCode`, `durationMs`, `userId`, `platform`, `clientVersion`, `errorName`/`errorMessage`.
- **CORS**: All API responses go through `finishRequest` (or equivalent) which applies CORS; each route exports `OPTIONS` → `corsPreflight()` for Expo/mobile.
