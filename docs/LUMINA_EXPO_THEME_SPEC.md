# Lumina Web → Expo App Theme Spec

Use this spec to align your Expo app’s theme with the Lumina landing (premium nostalgic / golden-hour). Replace or merge with your existing theme tokens so the app matches the web.

---

## 1. Typography

- **Headings (titles, section titles, card titles):** Use **Playfair Display** (serif).  
  - On native, use: `PlayfairDisplay_400Regular`, `PlayfairDisplay_500Medium`, `PlayfairDisplay_600SemiBold` (from `@expo-google-fonts/playfair-display` or equivalent).  
  - Weight: **medium (500)** for most headings; avoid heavy weights.
- **Body (paragraphs, labels, inputs, buttons):** Use **Inter** (sans).  
  - On native: `Inter_400Regular`, `Inter_500Medium` (from `@expo-google-fonts/inter` or equivalent).
- **Monospace / code:** Use **Geist Mono** or system monospace.

**Type scale (approximate px):**

| Token   | Size (px) | Usage |
|--------|-----------|--------|
| xs      | 12        | Captions, overlines, “Step 01” |
| sm      | 14        | Buttons, small labels, footer |
| base    | 16        | Body, inputs |
| lg      | 18        | Subheads, lead paragraphs |
| xl      | 20        | Card titles, step titles |
| 2xl     | 24        | Section subtitles |
| 3xl     | 30        | Section titles (mobile) |
| 4xl     | 36        | Section titles (tablet) |
| 5xl     | 48        | Section titles (desktop), pricing |
| 6xl     | 60        | Hero headline (desktop) |

**Letter-spacing:**

- Headlines: **0.02em** (slightly open).
- Body: **0** (normal).
- Uppercase labels: **0.05em–0.1em** (e.g. “EXPLORE”, “STEP 01”).

**Line height:**

- Headings: **tight** (~1.2–1.25).
- Body: **relaxed** (~1.5–1.6).

---

## 2. Color Palette (hex)

Map these to your Expo `Colors.light` / `Colors.dark` (and any semantic names you use).

### Primary (brand / CTAs)

- **Primary:** `#F97316` — main CTA (e.g. “Join waitlist”, highlighted pricing).
- **Primary foreground (on primary):** `#FDFCF9` or `#FFFFFF`.
- **Soft accent:** `#FDBA74` — secondary accent (e.g. pricing card highlight border).

### Backgrounds

- **Page / screen background:** `#FDFCF9` — main app background (warm white).
- **Alt section background:** `#F5F3EF` — footer, alternate sections (slightly cooler cream).
- **Cream / warm sections:** `#f7f4ef` — hero, feature, contact, CTA areas on web (use where you want “warm” blocks).
- **Card / surface:** `#FFFFFF`.
- **Glass / overlay surface:** `rgba(255, 255, 255, 0.6)` with border (see borders below).

### Text

- **Text primary (headings, body):** `#1E1E1E`.
- **Text secondary (captions, hints, footer):** `#6B6B6B`.
- **Muted / placeholder:** same as secondary or `#6B6B6B`.

### Borders & dividers

- **Border default:** `#e5ddd4` (warm gray).
- **Border subtle:** `rgba(30, 30, 30, 0.08)` — dividers, footer top border.
- **Input border:** `#e5ddd4`.

### UI elements

- **Destructive / error:** `#dc2626`.
- **Focus ring (e.g. inputs):** `#F97316` at 50% opacity (`#F9731680` or equivalent).
- **Bullet / dot (list):** `#6B6B6B` (small circle).
- **LinkedIn (if you show social):** `#0A66C2`.
- **Dark button (secondary CTA):** `#1E1E1E` with foreground `#FDFCF9`.

### Legacy / optional (web still uses in some sections)

- **Dark brown (buttons, links):** `#2c2419`.
- **Muted brown:** `#6b5d4f`.
- **Green accent (links):** `#7a9e7e`.

You can keep these in the theme for parity with older web sections or drop them in favor of primary/secondary above.

---

## 3. Suggested Expo `Colors` mapping

```ts
// Light theme — align with Lumina landing
const lightColors = {
  background: "#FDFCF9",
  foreground: "#1E1E1E",
  card: "#FFFFFF",
  cardForeground: "#1E1E1E",
  popover: "#FFFFFF",
  popoverForeground: "#1E1E1E",
  primary: "#F97316",
  primaryForeground: "#FDFCF9",
  secondary: "#1E1E1E",
  secondaryForeground: "#FDFCF9",
  muted: "#F5F3EF",
  mutedForeground: "#6B6B6B",
  accent: "#FDBA74",
  accentForeground: "#1E1E1E",
  destructive: "#dc2626",
  destructiveForeground: "#FFFFFF",
  border: "#e5ddd4",
  input: "#e5ddd4",
  ring: "#F97316",
  chart1: "#F97316",
  chart2: "#FDBA74",
  chart3: "#6B6B6B",
  chart4: "#7a9e7e",
  chart5: "#2c2419",
  sidebar: "#F5F3EF",
  sidebarForeground: "#1E1E1E",
  sidebarPrimary: "#F97316",
  sidebarPrimaryForeground: "#FDFCF9",
  sidebarAccent: "#FDBA74",
  sidebarAccentForeground: "#1E1E1E",
  sidebarBorder: "#e5ddd4",
  sidebarRing: "#F97316",
  text: "#1E1E1E",
  textSecondary: "#6B6B6B",
  tint: "#F97316",
  icon: "#6B6B6B",
  tabIconDefault: "#6B6B6B",
  tabIconSelected: "#F97316",
  // Optional
  surfaceAlt: "#F5F3EF",
  surfaceWarm: "#f7f4ef",
};
```

Dark theme: derive from the same hue (orange primary) with dark backgrounds (e.g. `#1E1E1E`, `#2d2a26`) and light text (`#FDFCF9`), and adjust borders/muted to match.

---

## 4. Spacing (8px base)

Use a **4px or 8px** base unit and scale from it.

- **1 unit:** 4px  
- **2:** 8px  
- **3:** 12px  
- **4:** 16px  
- **5:** 20px  
- **6:** 24px  
- **8:** 32px  
- **10:** 40px  
- **12:** 48px  
- **16:** 64px  

**Section padding (vertical):** at least **100px** (e.g. `py: 100`); on larger breakpoints use **120px**, **140px**.

**Horizontal padding:** 24px (sm), 32px (md), 40px (lg) — map to your breakpoints.

---

## 5. Border radius

- **sm:** 4  
- **md:** 6  
- **lg:** 8  
- **xl:** 12  
- **2xl:** 16  
- **full:** 9999 (pill buttons, avatars)

Use **rounded-2xl (16)** for cards and modals; **rounded-full** for primary/secondary buttons.

---

## 6. Shadows

Keep shadows **light** (no heavy glow). Warm tint to match palette.

- **Shadow color:** `#1E1E1E` or `rgba(30, 30, 30, 0.06)`.
- **Card / button:**  
  - `offset: { width: 0, height: 1 }`  
  - `opacity: 0.04–0.06`  
  - `radius: 2–3`  
- **Modal / elevated:**  
  - `offset: { width: 0, height: 2–4 }`  
  - `opacity: ~0.08`  
  - `radius: 4–6`  

On Android use equivalent `elevation` (1–4 for cards, 4–6 for modals).

---

## 7. Fonts object for Expo

```ts
export const Fonts = {
  heading: "PlayfairDisplay_500Medium",      // or your Playfair medium
  headingBold: "PlayfairDisplay_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  mono: "GeistMono_400Regular",              // or system monospace
};
```

If you load fonts with `expo-font` + Google Fonts, use the actual registered family names (e.g. `"Playfair Display"`, `"Inter"`) in your TextStyle `fontFamily`.

---

## 8. Text shadows (for text on images)

When placing white/light text on photos or gradients (e.g. hero):

- **Light:** `0 1px 2px rgba(0,0,0,0.3)`, `0 2px 8px rgba(0,0,0,0.3)`.
- **Stronger:** `0 1px 3px rgba(0,0,0,0.5)`, `0 2px 6px rgba(0,0,0,0.5)`.

Use your platform’s text shadow props with the same offsets and blur.

---

## 9. Summary checklist for Cursor

- [ ] **Colors:** Primary `#F97316`, background `#FDFCF9`, alt `#F5F3EF`, text `#1E1E1E` / `#6B6B6B`, border `#e5ddd4`.
- [ ] **Fonts:** Playfair Display for headings (medium weight), Inter for body.
- [ ] **Spacing:** 8px-based scale; section vertical padding ≥ 100.
- [ ] **Radius:** Cards/modals 16; buttons pill (full).
- [ ] **Shadows:** Light, warm-tinted; elevation 1–4 for cards, 4–6 for modals.
- [ ] **No heavy gradients or glow** — calm, minimal, reflective feel.

Apply this spec in your Expo theme file (e.g. `Colors`, `Fonts`, `radius`, `Shadows`) and reference it in your Cursor rules so the app matches the Lumina landing style.
