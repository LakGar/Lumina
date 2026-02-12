# Fixing "Drift detected" without resetting the database

If `prisma migrate dev` reports **drift** (DB has Billing, Notification, userPrefferences, Theme, etc. that aren’t in migration history) and you **do not** want to run `prisma migrate reset` (which wipes all data), do this:

## Step 1: Mark the baseline migration as already applied

This tells Prisma that the "20260202100000_baseline_drift" migration is already reflected in your DB, so it won’t run it.

```bash
npx prisma migrate resolve --applied "20260202100000_baseline_drift"
```

## Step 2: Apply remaining migrations

This will apply only the migrations that come after the baseline (e.g. `qualityScore`, ChatSession, WeeklyTip, PromptCompletion).

```bash
npx prisma migrate dev
```

When prompted for a migration name, you can accept the default or leave it as is.

---

**If you’re fine losing all data** (e.g. empty or disposable dev DB), you can instead run:

```bash
npx prisma migrate reset
```

That will drop the database, recreate it, and apply all migrations from scratch.
