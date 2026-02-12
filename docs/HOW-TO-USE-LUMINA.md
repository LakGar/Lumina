# How to Use Lumina (Main App Guide)

This guide walks through the main Lumina web app: journals, entries, AI features, Lumina level, chat, weekly tips, and settings.

---

## 1. Getting started

- **Sign in** with your account (Clerk).
- After sign-up you’ll see **onboarding**: set your journaling goal, topics, and preferences (e.g. AI summaries, mood detection).
- **Dashboard** is your home: quick create, recent activity, and (when we add it) Lumina level and weekly tip card.

---

## 2. Journals and entries

### Journals

- **Journals** are containers for entries (e.g. “Daily reflection”, “Work”, “Gratitude”).
- Create a journal from the sidebar or journals page; give it a title.
- Open a journal to see its **entries** (newest first).

### Creating an entry

1. Use **“New entry”** (or equivalent) and pick a journal.
2. Write your entry (text). You can add **mood** and **tags** manually or let AI fill them (see below).
3. **Save** the entry.

Creating entries regularly increases your **Lumina score** and **streak** and improves **consistency**, which all help your **Lumina level**. See [LUMINA-LEVEL.md](./LUMINA-LEVEL.md).

---

## 3. Entry AI (summary, mood, tags, quality score)

- After saving an entry you can run **“Generate AI”** / **“Regenerate AI”** for that entry.
- The backend then generates:
  - **Summary**: short 1–2 sentence summary.
  - **Mood**: one word or short phrase (e.g. “calm”, “grateful”).
  - **Tags**: a few tags (e.g. “work”, “health”, “gratitude”).
  - **Quality score**: 0–100 for depth and reflection (stored with the summary).
- The **average** of these quality scores across your entries **positively affects your Lumina score**. So using “Regenerate AI” on entries helps your level.
- You can still edit mood and tags manually; AI is an optional assist.

---

## 4. Go deeper (during writing)

- **“Go deeper”** suggests 2–4 short questions to help you reflect more or add detail.
- Use it **while writing** (or after saving): open the entry, tap “Go deeper,” and optionally send your **current draft** so questions match what you’re writing.
- Each time you use “Go deeper” it counts as a **prompt completion**, which **increases your Lumina score** (see [LUMINA-LEVEL.md](./LUMINA-LEVEL.md)).
- Use the suggested questions as prompts: answer them in the entry or use them to keep writing.

---

## 5. Lumina level

- **Lumina level** (1–5) is shown on the dashboard (or in a dedicated “Level” / “Progress” area).
- It is based on **Lumina score**, which is driven by:
  - **Positive**: creating entries, streaks, consistency, high average entry quality score, and prompt completions (e.g. Go deeper).
  - **Negative**: missing scheduled journal days when **daily reminder** is on.
- Turn on **Settings → Notifications → Daily reminder** if you want “scheduled” days to be counted; then journaling on those days avoids the penalty and supports your level.
- For the full formula and tiers, see [LUMINA-LEVEL.md](./LUMINA-LEVEL.md). The app gets all data from **GET /api/users/me/stats** (e.g. `luminaScore`, `luminaLevel`, `currentStreak`, `consistency`, `entryQualityScore`, `promptsCompleted`).

---

## 6. Chat (journal-context)

- **Chat** lets you talk to Lumina about a **specific journal**; the assistant has access to that journal’s recent entries.
- Flow:
  1. Open Chat and **choose a journal**.
  2. Send messages; the assistant can discuss your entries, suggest reflections, and suggest goal or topic updates.
  3. If it suggests updating your goal or topics, you can confirm and the app will update **Settings → Preferences** (goal/topics).
- Chat can also give **weekly-style tips** in the reply (e.g. if you’re missing journaling or quality is slipping). For a dedicated weekly tip card, use the Weekly tips section below.

---

## 7. Weekly tips

- **Weekly tips** are short insights: title, short description, and detailed text (often markdown), based on your usage (e.g. missed journaling, quality down, streak, consistency).
- **Get a tip**: use “Get my weekly tip” or “Generate insight” (calls **POST /api/users/me/weekly-tips/generate**). The new tip appears in the list and can be shown in a card or detail view.
- **List**: **GET /api/users/me/weekly-tips** shows recent tips (newest first). Open one to read the **detailed text** (render markdown).
- **Mark read**: when you’ve read a tip, call **PATCH /api/users/me/weekly-tips/{id}/read** so the app can show “new” only for unread tips.
- Use the **tip type** (e.g. `missed_journal`, `quality_down`, `streak`) for icons or labels.

---

## 8. Settings

- **Preferences**: theme, journaling goal, topics, reason, AI toggles (summaries, auto-tagging, mood detection), AI tone.
- **Notifications**: daily reminder on/off and time; timezone; frequency. Enabling the daily reminder ties into “scheduled” days for Lumina level (see [LUMINA-LEVEL.md](./LUMINA-LEVEL.md)).
- **Billing**: upgrade to Pro, manage subscription, refresh status.
- **Privacy**: delete journal data, delete AI data, or delete all data (see BACKEND-ROUTES-NEEDED).

---

## 9. Quick reference: features that affect Lumina level

| Action                        | Effect on Lumina level                        |
| ----------------------------- | --------------------------------------------- |
| Create an entry               | + (entry points, possible streak/consistency) |
| Regenerate AI on entry        | + (quality score → average → bonus)           |
| Use “Go deeper”               | + (prompt completion bonus)                   |
| Journal on more days (30-day) | + (consistency bonus)                         |
| Keep a streak                 | + (streak bonus)                              |
| Turn on daily reminder        | Defines “scheduled” days                      |
| Miss days (with reminder on)  | − (missed scheduled penalty)                  |

For full details and the exact formula, see [LUMINA-LEVEL.md](./LUMINA-LEVEL.md).
