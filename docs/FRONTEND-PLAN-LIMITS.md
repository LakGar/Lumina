# Frontend: Plan limits (Free vs Lumina) — implementation guide

The backend now enforces the advertised plan limits. Use this as a point-of-attack to implement the same on the frontend: show/hide features by plan and handle 403s with an upgrade CTA.

---

## 1. Know the user’s plan

**API:** `GET /api/users/me/subscription`  
**Client:** `apiClient.billing.subscription()`

**Response shape:**
- `data.status`: `"active" | "trialing" | "past_due" | "canceled" | null`
- `data.planId`: `"pro"` when paid, `undefined` when free

**Derive “is Pro”:**
- Pro: `status` is `active`, `trialing`, or `past_due` **and** `planId === "pro"` (or truthy).
- Free: `status` is `null` or `canceled`, or `planId` is missing/falsy.

**Where to load it:**
- Once after login (e.g. in a layout or provider that wraps the app).
- Optionally refetch after returning from Stripe Checkout or Billing Portal.

**Where to store it:**
- React context (e.g. `SubscriptionContext`) or global state (Zustand, etc.).
- Expose: `isPro: boolean` and optionally `status`, `planId` for “Manage subscription” vs “Upgrade”.

---

## 2. Backend behavior (for reference)

| Feature | Free | Lumina (Pro) | Backend response when over limit / not Pro |
|--------|------|--------------|--------------------------------------------|
| Journals | Up to 3 | Unlimited | `POST /api/journals` → **403** with `{ error: "...", code: "PLAN_LIMIT" }` |
| Entries | Unlimited | Unlimited | — |
| AI summary | Basic (summary only) | Full (summary + mood + tags + quality) | No 403; backend only persists summary for free in `regenerate-ai`. |
| Go deeper | No | Yes | `POST /api/entries/:id/go-deeper` → **403** |
| Chat with context | No | Yes | `POST /api/journals/:id/chat` → **403** |
| Weekly tips | No | Yes | `GET /api/users/me/weekly-tips` and `POST .../weekly-tips/generate` → **403** |
| AI mood (set/update) | No | Yes | `PUT /api/entries/:id/mood` → **403** |
| Streak tracking | Yes | Yes | — |
| Lumina level & progress | No (optional to show) | Yes | Stats endpoint is allowed for all; frontend can show “level” only for Pro. |

---

## 3. Point-of-attack checklist

### 3.1 Subscription state

- [ ] Add a way to load subscription (e.g. `apiClient.billing.subscription()`) after auth.
- [ ] Store result in context or global state.
- [ ] Derive `isPro` and expose it (e.g. `useSubscription().isPro`).
- [ ] Invalidate/refetch after Stripe Checkout or Portal return (e.g. on `/settings/billing` or a success redirect).

### 3.2 Journal limit (3 for Free)

- [ ] **Create journal**  
  - Before calling `apiClient.journals.create(title)` (or equivalent), if `!isPro` and `journals.length >= 3`, don’t call the API; show an in-app message: “Free plan is limited to 3 journals. Upgrade to Lumina for unlimited journals.” with a link to `/pricing` or billing checkout.
  - If you still call create (e.g. race or stale state), **handle 403**: show the same message and optionally open upgrade/checkout.
- [ ] **Journal list / “New journal”**  
  - For free users at 3 journals, disable or hide “New journal” / “Create journal”, or show it with the upgrade message on click.
- [ ] **Error handling**  
  - On any 403 from `POST /api/journals`, check response body for `code === "PLAN_LIMIT"` (if your client exposes it) or treat 403 as plan limit and show upgrade CTA.

### 3.3 Pro-only features (hide or soft-gate)

- [ ] **Go deeper**  
  - Entry detail or editor: if `!isPro`, hide “Go deeper” or show it disabled with “Upgrade to Lumina to unlock” (or a lock icon + tooltip).  
  - If the user still hits the endpoint (e.g. from an old UI), handle 403 and show upgrade CTA.
- [ ] **Chat with context**  
  - Journal page/sidebar: if `!isPro`, hide “Chat” or show it disabled with “Upgrade for chat with your journal coach.”  
  - On 403 from chat API, show same message and link to upgrade.
- [ ] **Weekly tips**  
  - Dashboard or tips section: if `!isPro`, hide the “Weekly tips” block entirely, or show a single card: “Upgrade to Lumina for personalized weekly tips.”  
  - Don’t call `GET /api/users/me/weekly-tips` or `POST .../weekly-tips/generate` for free users (avoids unnecessary 403s).
- [ ] **AI mood (set/update)**  
  - Entry detail: if `!isPro`, hide or disable the “Set mood” / “AI mood” control and show “Upgrade for AI mood” if needed.  
  - On 403 from `PUT /api/entries/:id/mood`, show upgrade CTA.
- [ ] **Lumina level & progress**  
  - Dashboard/stats: you can allow `GET /api/users/me/stats` for everyone. For free users, hide the “Level” or “Lumina level” section, or show it with “Upgrade to see your level and progress.”

### 3.4 Regenerate AI (Basic vs Full)

- [ ] **Entry detail**  
  - Free: you can still show “Regenerate summary” (or “Basic AI summary”); the backend will only persist the summary.  
  - Pro: show “Regenerate AI” (or “Summary + mood + tags”); backend persists full data.  
  - No 403; only the persisted fields differ. No mandatory UI change except optional copy (“Basic” vs “Full”).

### 3.5 Upgrade CTA and 403 handling

- [ ] **Central 403 handler**  
  - In your API client or fetch wrapper, on `res.status === 403`, you can read `res.json()` and check for `code === "PLAN_LIMIT"`. If present (or if 403 comes from a known gated endpoint), show a toast or modal: “This feature is part of Lumina. Upgrade to unlock.” with a link to billing checkout or `/pricing`.
- [ ] **Checkout flow**  
  - Use `apiClient.billing.checkout()` to get the Stripe Checkout URL and redirect. After return, refetch subscription so `isPro` updates.
- [ ] **Settings / Billing**  
  - “Manage subscription” for Pro (link to Stripe Portal via `apiClient.billing.portal()`). “Upgrade to Lumina” for Free (link to checkout or `/pricing`).

---

## 4. API client tweak (optional)

Backend 403 for plan limits returns:

```json
{ "error": "Human-readable message", "code": "PLAN_LIMIT" }
```

The `api()` in `lib/api/client.ts` now attaches the response body to the thrown error as `err.body` (with `error` and `code`). So you can do:

```ts
catch (err: any) {
  if (err.status === 403 && err.body?.code === "PLAN_LIMIT") {
    // Show upgrade modal or toast
  }
}
```

---

## 5. Files to touch (suggested)

- **Subscription state:** New context/store (e.g. `contexts/subscription.tsx` or `store/subscription.ts`) and provider in layout.
- **Journals:** Journal list page, “New journal” button/modal, and any `journals.create` call site.
- **Entry detail:** Go deeper button, mood control, regenerate AI button (optional copy).
- **Journal page:** Chat entry point (sidebar or tab).
- **Dashboard / Tips:** Weekly tips section or page; conditionally fetch and render only when `isPro`.
- **Dashboard / Stats:** Level/progress block; show only when `isPro`.
- **Settings / Billing:** Already has “Upgrade” vs “Manage”; ensure it uses `apiClient.billing.subscription()` and shows correct CTA.
- **Global error handling:** Fetch wrapper or API client to handle 403 and optionally `code === "PLAN_LIMIT"` with upgrade modal or toast.

---

## 6. Summary

1. Load and store subscription; derive `isPro`.
2. Before creating a journal, if free and already at 3 journals, show upgrade message and optionally don’t call the API.
3. For Go deeper, Chat, Weekly tips, and AI mood: hide or disable for free users; on 403, show upgrade CTA.
4. Optionally differentiate “Basic” vs “Full” AI on entry detail; no 403 for regenerate.
5. Handle 403 from gated endpoints (and optionally `code === "PLAN_LIMIT"`) with a single upgrade flow.
