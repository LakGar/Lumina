"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Journals & entries",
    description:
      "Organize your thoughts in multiple journals. Write entries, track streaks, and build a habit that sticks.",
  },
  {
    icon: Sparkles,
    title: "AI-powered reflection",
    description:
      "Get summaries, mood, and tags for each entry. Use “Go deeper” to unlock more meaningful reflection.",
  },
  {
    icon: TrendingUp,
    title: "Level up",
    description:
      "Build your Lumina level with streaks, consistency, and quality. See your progress and stay motivated.",
  },
  {
    icon: MessageCircle,
    title: "Chat with context",
    description:
      "Talk to Lumina about a journal. Get reflections and suggestions grounded in your own entries.",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export default function FeaturesContent() {
  return (
    <>
      <section
        className="px-4 pt-32 pb-16 md:px-6 md:pt-40 md:pb-20 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: "#2c2419" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Features
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg"
            style={{ color: "#6b5d4f" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Everything you need to reflect, plan, and stay on track.
          </motion.p>
        </div>
      </section>

      <section
        className="px-4 py-16 md:px-6 md:py-24 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="flex gap-6 rounded-2xl p-6 md:p-8"
                style={{
                  border: "1px solid #e5ddd4",
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "rgba(122, 158, 126, 0.2)",
                    color: "#2c2419",
                  }}
                >
                  <f.icon className="size-7" />
                </div>
                <div>
                  <h2
                    className="text-xl font-semibold md:text-2xl"
                    style={{ color: "#2c2419" }}
                  >
                    {f.title}
                  </h2>
                  <p
                    className="mt-2 leading-relaxed"
                    style={{ color: "#6b5d4f" }}
                  >
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/"
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#7a9e7e" }}
            >
              Get the app
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
