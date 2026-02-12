# Lumina AI keys (OpenRouter)

Lumina uses **two** OpenRouter API keys so entry AI and chat can be configured (and rate-limited) separately.

## Environment variables

Add these to your `.env` (see `.env.example`):

| Variable                     | Use                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `OPENROUTER_ENTRIES_API_KEY` | Entry AI: mood, tags, summary, quality score; and **Go deeper** questions during writing.    |
| `OPENROUTER_CHAT_API_KEY`    | Journal-context chat and **weekly tips** (goals, insights, missed journal / quality advice). |

## Where each key is used

- **Entries key**
  - `POST /api/entries/[id]/regenerate-ai` – summary, mood, tags, `qualityScore`.
  - `POST /api/entries/[id]/go-deeper` – insightful questions to improve or deepen the entry.

- **Chat key**
  - `POST /api/journals/[id]/chat` – chat with journal + recent entries as context; can suggest goal/topic updates and weekly tips.
  - `POST /api/users/me/weekly-tips/generate` – one weekly tip (title, short description, detailed text) based on usage (e.g. missed journaling, quality down).

## Security

Do **not** commit real API keys. Use `.env` (and keep `.env` in `.gitignore`). If a key was ever pasted in chat or logs, rotate it in the OpenRouter dashboard.
