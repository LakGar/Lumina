# Before production checklist

Use this list when switching from local/ngrok to production. **Do not deploy** until these are set correctly.

---

## 1. Stripe redirect base (checkout & portal)

**Behavior now (dev):** Success/cancel/return URLs use the **request origin** (localhost or ngrok), so redirects go back to where the user started.

**Before production:**

- Set **`APP_URL`** to your **single** production URL, e.g.  
  `APP_URL=https://app.lumina.com`  
  (No comma-separated list here; only the first value is used for redirects.)

**Where it’s used:**

| File                                | Usage                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `app/api/_lib/app-url.ts`           | `getAppBaseUrl(req)` – in production uses `APP_URL`                                        |
| `app/api/billing/checkout/route.ts` | `success_url`, `cancel_url` → `${baseUrl}/dashboard?checkout=success` / `?checkout=cancel` |
| `app/api/billing/portal/route.ts`   | `return_url` → `${baseUrl}/dashboard`                                                      |

---

## 2. CORS origins

**Before production:**

- Set **`ALLOWED_ORIGINS`** to your production (and optional mobile) origins, comma-separated, e.g.  
  `ALLOWED_ORIGINS=https://app.lumina.com,https://www.lumina.com`  
  In production, unset = no CORS; set explicitly for API access from web/mobile.

**Where it’s used:**

| File                   | Usage                                     |
| ---------------------- | ----------------------------------------- |
| `app/api/_lib/cors.ts` | `getAllowedOrigin()`, `withCorsHeaders()` |

---

## 3. Clerk

**Before production:**

- Use **production** Clerk keys:  
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Set **`NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`** and **`NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`** to production paths if needed (e.g. `/dashboard`, `/onboard`).
- If you use Clerk webhooks: set **`CLERK_WEBHOOK_SIGNING_SECRET`** (or **`CLERK_WEBHOOK_SECRET`**) to the production endpoint’s signing secret.

**Where it’s used:**

| File                        | Usage                                                   |
| --------------------------- | ------------------------------------------------------- |
| `app/api/_lib/auth.ts`      | `auth()` from `@clerk/nextjs` (uses `CLERK_SECRET_KEY`) |
| App layout / sign-in pages  | Publishable key and redirect URLs                       |
| `app/api/webhooks/route.ts` | Clerk webhook verification                              |

---

## 4. Stripe

**Before production:**

- Use **live** keys: **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`STRIPE_PRICE_ID_PRO`** (and **`STRIPE_PUBLISHABLE_KEY`** on the frontend if used).
- In Stripe Dashboard, create a **production** webhook endpoint:  
  `https://app.lumina.com/api/webhooks/stripe`  
  Subscribe: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.  
  Set **`STRIPE_WEBHOOK_SECRET`** to that endpoint’s signing secret.

**Where it’s used:**

| File                                | Usage                   |
| ----------------------------------- | ----------------------- |
| `app/api/_lib/stripe.ts`            | `STRIPE_SECRET_KEY`     |
| `app/api/billing/checkout/route.ts` | `STRIPE_PRICE_ID_PRO`   |
| `app/api/billing/portal/route.ts`   | Portal session          |
| `app/api/webhooks/stripe/route.ts`  | `STRIPE_WEBHOOK_SECRET` |

---

## 5. Database

**Before production:**

- Set **`DATABASE_URL`** to your **production** PostgreSQL URL (Prisma).

**Where it’s used:**

| File                        | Usage                       |
| --------------------------- | --------------------------- |
| `prisma/schema.prisma`      | `url = env("DATABASE_URL")` |
| All API routes using Prisma | Via generated client        |

---

## 6. Optional env

- **`LOG_LEVEL`** – e.g. `info` or `warn` in production.
- **`LOG_FORMAT`** – omit or set to `json` in production (avoid `pretty` in prod).

---

## Quick reference: env to change for production

| Variable          | Dev (current)                                   | Production                                               |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------- |
| `APP_URL`         | (unset or localhost/ngrok; request origin used) | `https://app.lumina.com`                                 |
| `ALLOWED_ORIGINS` | localhost, ngrok                                | `https://app.lumina.com` (and any other allowed origins) |
| `CLERK_*`         | Test keys                                       | Live keys + production redirect URLs                     |
| `STRIPE_*`        | Test keys + test webhook secret                 | Live keys + live webhook URL + live webhook secret       |
| `DATABASE_URL`    | Dev DB                                          | Production DB                                            |
| `NODE_ENV`        | `development`                                   | `production` (set by host/build)                         |

---

## Code / config that depends on “production” behavior

- **Stripe redirects:** Only when `NODE_ENV === "production"` does `getAppBaseUrl()` use `APP_URL`; otherwise it uses the request origin. So for production redirects to `https://app.lumina.com`, you must set `APP_URL` and run with `NODE_ENV=production`.
- No hardcoded localhost or ngrok URLs remain in the app; they come from request origin (dev) or `APP_URL` (prod).
