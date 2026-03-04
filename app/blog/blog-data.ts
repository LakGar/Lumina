export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  imageAlt: string;
  paragraphs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-reflection-matters",
    title: "Why reflection matters",
    excerpt:
      "Taking a few minutes to look back isn’t indulgence—it’s how we make sense of what we’re living.",
    date: "February 10, 2026",
    image: "/feature-reflection.png",
    imageAlt: "Person journaling with AI reflection",
    paragraphs: [
      "Most of us move through the day on autopilot. We react, we respond, we scroll. When we finally pause, it’s easy to feel like the hours slipped by without leaving a trace. Reflection is the act of turning that pause into something you can hold onto.",
      "It doesn’t require a special place or a long block of time. A few sentences at the end of the day—what went well, what felt hard, what you’d do differently—can sharpen your sense of what matters. Over time, those small entries add up to a map of how you think, what you care about, and where you’re heading.",
      "Lumina is built around that idea: a quiet space for your loudest thoughts, with structure when you want it and flexibility when you don’t. Start with one question, or none. The habit of reflecting is what changes things.",
    ],
  },
  {
    slug: "building-a-journaling-habit",
    title: "Building a journaling habit that sticks",
    excerpt:
      "Consistency beats intensity. Here’s how to make reflection part of your day without making it a chore.",
    date: "February 6, 2026",
    image: "/feature-journaling.png",
    imageAlt: "Journal and entries",
    paragraphs: [
      "The biggest mistake people make with journaling is aiming for too much too soon. A full page every morning sounds noble until you skip a day, then a week, then forget the notebook exists. The goal isn’t to write a lot—it’s to show up.",
      "Start with a single sentence. “Today I felt…” or “One thing I noticed…” is enough. Set a time that’s already part of your routine—after coffee, before bed, on the train—and attach your new habit to it. Same time, same trigger, less friction.",
      "In Lumina, you can create separate journals for different parts of your life: work, gratitude, daily check-in. That way you’re not staring at one blank page; you’re choosing a small, clear space. Streaks and levels are there to reward consistency, not to guilt you. A two-minute entry counts as much as a long one.",
    ],
  },
  {
    slug: "going-deeper-with-ai",
    title: "Going deeper with AI",
    excerpt:
      "How we use AI to help you reflect—without replacing your voice.",
    date: "February 2, 2026",
    image: "/feature-level.png",
    imageAlt: "Lumina level and progress",
    paragraphs: [
      "AI in Lumina isn’t there to write for you. It’s there to help you hear yourself. After you write an entry, you get a short summary, a sense of your mood, and optional “Go deeper” questions—prompts that push you one step further without steering your answer.",
      "Those questions are designed to feel like a thoughtful friend: “What would need to change for that to feel less heavy?” or “When did you last feel this way?” They’re open-ended. Your words stay yours; the AI just holds up a mirror.",
      "You can also chat with Lumina about a specific journal. The model has context from your entries, so you can ask for patterns, reflections, or ideas grounded in what you’ve already written. It’s reflection with a second pair of eyes—still private, still yours.",
    ],
  },
  {
    slug: "a-quiet-space",
    title: "A quiet space for your loudest thoughts",
    excerpt:
      "What we’re building and why we started Lumina.",
    date: "January 28, 2026",
    image: "/cta.png",
    imageAlt: "Serene landscape",
    paragraphs: [
      "Life is noisy. Notifications, deadlines, other people’s opinions. In the middle of it, our own thoughts often get drowned out. We started Lumina because we wanted a place where those thoughts could land—without performance, without judgment, without clutter.",
      "Lumina is a journaling app, but it’s also a commitment to reflection as a practice. You write. You get summaries and mood and “Go deeper” questions when you want them. You build a Lumina level and streaks not to gamify the experience, but to honor the habit. Progress here is measured in consistency and clarity, not points.",
      "We’re building for people who want to think clearly, remember what matters, and feel a bit more grounded. If that’s you, we’d love to have you. Say hello when you’re ready.",
    ],
  },
];
