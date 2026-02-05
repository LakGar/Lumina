# Frontend build – task tracker

Stack: Zod, Zustand, TanStack Query (cache), server-side rate limiting, shadcn UI.  
Reference: [app/dashboard/page.tsx](app/dashboard/page.tsx) – keep GitHub-style activity calendar and layout.

---

## Phase 1: Foundation

- [x] Add dependencies: `@tanstack/react-query`, `zustand`
- [x] API client + Zod response schemas (journals, entries, moods, preferences, notification, billing)
- [x] Server-side rate limiting on API routes (per user) – `GET /api/users/me/entries`
- [x] QueryClientProvider in root layout
- [x] Zustand store for UI state (new entry sheet open)

## Phase 2: Dashboard (real data)

- [x] New API: `GET /api/users/me/entries` – recent entries across all journals (for dashboard)
- [x] Dashboard: fetch journals + recent entries via TanStack Query
- [x] Section cards: real “Entries this week”, “Current streak”, “Journals” count, “Mood this week”
- [x] GitHub-style activity calendar: feed from real entry counts by day (keep existing component)
- [x] Recent entries table: real data, map API entry → table row (title, journal, date, mood, word count)
- [x] Remove static `data.json` and hardcoded contribution data

## Phase 3: Journals & entries

- [x] Journals list page: GET journals, create journal (Sheet + Zod)
- [x] Entry list per journal: GET entries for journal, “New entry” → create (Sheet)
- [x] Entry view/edit: `/entries/[id]` – load entry, PATCH content, delete
- [x] New entry: POST entry (content, source), invalidate queries

## Phase 4: Settings

- [x] Settings layout with nav: Preferences, Notification, Billing (SettingsNav)
- [x] Preferences page: GET/PATCH `/api/users/me/preferences` (theme, goal, topics, reason)
- [x] Notification page: GET/PATCH `/api/users/me/notification` (daily reminder, timezone)
- [x] Billing: “Upgrade” → POST checkout, redirect; “Manage” → POST portal

## Phase 5: Polish & nav

- [x] Sidebar: documents from journals API (real journal links); user from Clerk; Sign out via Clerk
- [x] “New entry” in table header opens global New Entry sheet (journal pick + content); Zustand store
- [x] DataTable: Edit → `/entries/[id]`; Delete with callback; empty state when no entries
- [x] Dashboard empty state: “No entries yet” + New entry button

---

## Done

- (Items move here when completed.)
