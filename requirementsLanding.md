# Lumina Landing Page Requirements

## 🧠 Overview

Create an immersive, world-class landing page for **Lumina** — an AI-powered journaling platform that turns your thoughts into memory, insights, and structure. Build this landing experience as if it were designed by a professional web team: designers, motion experts, UI/UX researchers, SEO specialists, and frontend engineers.

The page should:

- Reflect Lumina’s identity: sleek, intelligent, and empowering.
- Be **mobile-first**, **dark-mode native**, and **SEO-optimized**.
- Use **real UI elements** and **product previews** (actual app features).
- Include **smooth animations and transitions** with Framer Motion.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (dark mode default)
- **UI Library:** [shadcn/ui](https://ui.shadcn.com)
- **Animation:** Framer Motion
- **SEO:** `next/head`
- **Responsive:** Fully responsive with mobile-first breakpoints

---

## 🎨 Design System

- **Color Palette:**
  - Background: `#000000` (black)
  - Primary Accent: `#d6b76e` (gold from logo)
  - Text: `#ffffff` or `#f0f0f0`
  - Links/Accent: `#f9e8c9` or soft gradients
- **Font:** System UI or Inter (modern, minimal, readable)
- **Logo:** Use provided golden burst icon — center it in Hero/CTA background or footer

---

## 🧩 Page Components

Build the page using the following components:

```tsx
<Nav />
<Hero />
<HowItWorks />
<WhyItMatters />
<Testimonials />
<Pricing />
<FinalCTA />
<Footer />
Each section must smoothly scroll into view and have id anchors for navigation.

💡 Section Breakdown
--------------------

### 1.

*   Fixed top navigation

*   Transparent until scroll, then dark background with shadow

*   Logo left-aligned, navigation right

*   Links scroll to sections: "How It Works", "Why It Matters", "Pricing", "Testimonials"

*   CTA button: “Try Lumina” (scroll to Hero or open auth)


### 2.

*   Tagline: **"Your Mind. Organized by AI."**

*   Subtext: _"Speak or write, and let AI do the rest."_

*   CTA Button: “Start Journaling Free”

*   Background: black with animated gold glow, subtle particles or radial gradient

*   Embed: muted video or animation of the actual app (looping preview)

*   Animation: Text fades + slides in from bottom, CTA pulses


### 3.

*   Three steps layout:

    1.  Speak or type your thoughts

    2.  Lumina transcribes, summarizes, and tags

    3.  You get insights and memories

*   Layout: horizontal cards or vertical stack on mobile

*   Icons or real UI screenshots

*   Animate each step on scroll (fade + slide)


### 4.

*   Emotional hook: _“Journaling is hard. Remembering is harder.”_

*   Supporting text: _“Lumina makes memory effortless.”_

*   Use: Card layout or visual grid showing pain points + Lumina’s solution

*   Subtle animations or chart-like transitions showing improvement


### 5.

*   Rotating or sliding carousel of real or placeholder feedback

*   Include:

    *   Name (optional avatar)

    *   Short quote

    *   Role (e.g., “Startup Founder”, “College Student”)

*   Animated fade or slide with controls or auto-play


### 6.

*   Three-tier card layout:

    *   **Free**: 100 voice entries, no AI memory

    *   **Pro**: Unlimited entries, AI memory, mood analysis

    *   **Premium**: Full export, insights, priority support

*   Use shadcn/ui pricing card styles

*   Include tooltips or highlights for value

*   Animate card hover + CTA button pulse


### 7.

*   Reiterate value: **“Start building your second brain.”**

*   CTA Button: “Try Lumina Now”

*   Optional: subtle animated logo in background

*   Use soft spotlight or radial gradient behind button


### 8.

*   Include:

    *   Logo (small)

    *   Navigation links (scroll to sections)

    *   Privacy Policy, Terms

    *   Email or contact

    *   Social icons (placeholder)

*   Match dark theme, use smaller font

*   Sticky at bottom if screen is tall enough


🔍 SEO & Accessibility
----------------------

*   Use to define:

    *   title: “Lumina – AI Journaling Made Effortless”

    *   description: “Record your thoughts, organize your memory, and get insights – powered by AI.”

    *   og:image: custom image with logo and tagline

*   All buttons and links should be keyboard accessible

*   Use semantic HTML tags (

    ,

    ,

    , etc.)


📱 Responsiveness
-----------------

*   Every component must be:

    *   Mobile-friendly (min-width: 320px)

    *   Optimized for tablet and desktop

    *   Font sizes and paddings should scale with screen size


✨ Animation Guidelines
----------------------

*   Use framer-motion to:

    *   Fade/slide sections on scroll

    *   Animate buttons (hover, click)

    *   Stagger text/images in cards

*   No jarring transitions — aim for smooth, elegant flow
```
