# Lumina Level: How It Works

Lumina level (1–5) is driven by **Lumina score**. The score goes up with positive habits and down when you miss scheduled journaling or slip consistency. This doc describes the formula and how entry creation and other features affect it.

---

## Level tiers

| Lumina score | Level |
| ------------ | ----- |
| 0–99         | 1     |
| 100–299      | 2     |
| 300–599      | 3     |
| 600–999      | 4     |
| 1000+        | 5     |

The app can show progress within the current level (e.g. “72% to Level 3”) by comparing the current score to the next threshold.

---

## What **increases** Lumina score (positive factors)

1. **Entry creation**  
   Every journal entry adds points. Creating entries regularly is the main driver.

2. **Streaks**  
   Consecutive days (including today) with at least one entry get a streak bonus. Longer streaks add more points.

3. **Consistency**  
   Percentage of days in the last 30 days that have at least one entry (0–100%). Higher consistency adds a bonus.

4. **High quality score**  
   When AI generates a summary for an entry, it also assigns a **quality score** (0–100) based on depth and reflection. The **average** of these scores across your entries contributes to Lumina score. Use “Generate AI” / “Regenerate AI” on entries so they have a quality score.

5. **Prompt completion**  
   Using “Go deeper” (and other reflection prompts when we add them) is counted as a prompt completion. Each completion in the last 30 days adds a bonus (capped so it doesn’t dominate).

---

## What **decreases** Lumina score (negative factors)

1. **Missing scheduled journal days**  
   If you have **daily reminder** turned on in notification settings, we treat “scheduled” as “every day.” For the last 30 days we count how many days had **no** entry. Each of those “missed” days applies a penalty. So turning on the daily reminder and then journaling on those days avoids the penalty and reinforces the habit.

2. **Low consistency**  
   Fewer days with entries in the last 30 days both reduce the consistency bonus and (when the reminder is on) increase “missed scheduled” days, so the score can drop more.

Other negative aspects (e.g. long gaps, declining quality) are reflected indirectly: fewer entries and lower consistency reduce the score; lower average quality score reduces the quality bonus.

---

## Formula (backend)

Rough shape (exact weights are in the code):

- **Entry points**: `totalEntries × 2`
- **Streak bonus**: `currentStreak × 8`
- **Consistency bonus**: up to 30 points from consistency %
- **Quality bonus**: up to 40 points from average entry quality score (0–100)
- **Prompt bonus**: `promptsCompletedLast30 × 5` (capped)
- **Missed penalty**: `missedScheduledDays × 3` (only when daily reminder is on)

Final score = max(0, sum of positives − missed penalty).

---

## How entry creation ties in

- **Creating entries** adds entry points and can start or extend a **streak**.
- **Journaling on more days** improves **consistency** and (with daily reminder on) reduces **missed scheduled** penalty.
- **Using “Regenerate AI”** on entries gives them a **quality score**, which raises your average and the quality bonus.
- **Using “Go deeper”** counts as a **prompt completion** and adds the prompt bonus.

So: creating entries, keeping a streak, journaling consistently, getting AI quality scores on entries, and using Go deeper all help your Lumina level. Missing days when you have a daily reminder set hurts it.

---

## API

- **GET /api/users/me/stats** returns `luminaScore`, `luminaLevel`, `currentStreak`, `consistency`, `entryQualityScore`, `promptsCompleted`, and the rest of the stats used in the formula. Use this to show level and progress in the main app or mobile app.
