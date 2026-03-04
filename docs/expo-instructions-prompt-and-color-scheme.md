# Expo app: Journal entry prompt & color scheme

Use these instructions in your **Expo app** Cursor workspace to add prompt support for journal entries and color-scheme preferences. The Lumina web API already supports both.

---

## 1. Journal entry prompt

### What the API does

- **Create entry**  
  `POST /api/journals/{journalId}/entries`  
  Body: `{ "content": "...", "source": "TEXT" | "VOICE" | ... }`  
  Optional: `"prompt": "e.g. What went well today?"`  
  If you send `prompt`, it is stored and returned with the entry.

- **Get entry / list entries**  
  Response includes `prompt: string | null` on each entry when present.

### What to do in the Expo app

1. **Types**  
   - Add `prompt?: string | null` to your journal-entry type (or equivalent) so it matches the API.

2. **Creating an entry**  
   - In the “new journal entry” screen (or sheet), add an **optional** field: “Prompt” (or “Optional prompt”).  
   - When the user submits:
     - Send `content` (and `source` if you use it) as you already do.  
     - If the user filled the prompt field, include it in the request body:  
       `{ "content": "...", "source": "TEXT", "prompt": "user's prompt text" }`  
     - Do not send `prompt` or send `null`/omit it when the field is empty.

3. **Viewing an entry**  
   - When you load a single entry or a list of entries, the API response includes `prompt`.  
   - If `entry.prompt` is non-empty, show it in the entry screen (e.g. a small block above the main content, or a “Prompt” label + text).  
   - You can style it differently (e.g. muted or highlighted) so it’s clear it’s the prompt, not the body.

4. **API client**  
   - Ensure your create-entry function accepts an optional `prompt` and includes it in the POST body when provided.  
   - Ensure your entry model/type and any list/detail parsing include `prompt` from the response.

No backend changes are required in the Expo app; the Lumina web API already supports prompt on create and on GET.

---

## 2. Color scheme (ApiColorScheme — 10 values)

The API uses the type **ApiColorScheme** with exactly these 10 values:

`DEFAULT`, `WARM`, `COOL`, `OCEAN`, `FOREST`, `ROSE`, `SLATE`, `SUNSET`, `LAVENDER`, `MINT`.

### What the API does

- **Get preferences**  
  `GET /api/users/me/preferences`  
  Returns (among other fields) `colorScheme: string` — one of the 10 values above.

- **Update preferences**  
  `PATCH /api/users/me/preferences`  
  Body: `{ "colorScheme": "WARM" }` (or any of the 10 values).  
  Only send `colorScheme` when the user changes it; you can send other preference fields in the same PATCH if needed.

### What to do in the Expo app

1. **Types**  
   - Define `ApiColorScheme` (or equivalent) as:  
     `"DEFAULT" | "WARM" | "COOL" | "OCEAN" | "FOREST" | "ROSE" | "SLATE" | "SUNSET" | "LAVENDER" | "MINT"`.  
   - Use this type for the preferences `colorScheme` and for your picker options.

2. **Fetch and store color scheme**  
   - When loading user preferences, read `colorScheme` from the response and store it in your app state (e.g. context, Zustand, or AsyncStorage if you need persistence across restarts).

3. **Preferences / Settings screen**  
   - Add a **Color scheme** control (e.g. list of options, segmented control, or dropdown) with all 10 options. Use the exact values above for the API; you can show friendlier labels (e.g. “Default”, “Warm”, “Ocean”, “Forest”, “Rose”, “Slate”, “Sunset”, “Lavender”, “Mint”).  
   - When the user picks a color scheme:
     - Call `PATCH /api/users/me/preferences` with `{ "colorScheme": "<selected value>" }`.  
     - Update your local state so the UI uses the new scheme immediately.

4. **Apply the color scheme in the app**  
   - Use the stored `colorScheme` in your theme provider or style logic to choose which palette to use (e.g. primary, background, accents).  
   - Define 10 corresponding color sets (one per ApiColorScheme value) and switch between them based on `colorScheme`.
