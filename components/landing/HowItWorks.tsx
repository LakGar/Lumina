"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Create your journals",
    description:
      "Start with one or many—daily reflection, work, gratitude. Each journal keeps your entries organized.",
  },
  {
    title: "Write and go deeper",
    description:
      "Add entries anytime. Use AI to get summaries, mood, and “Go deeper” questions for richer reflection.",
  },
  {
    title: "Track your progress",
    description:
      "Build your Lumina level with streaks and consistency. Chat with context and get weekly tips.",
  },
];


export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 py-[100px] md:py-[120px] lg:py-[140px]"
      style={{ backgroundColor: "#F5F3EF" }}
    >
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={{ duration: 0.4 }}
        >
          <h2
            className="font-heading text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
            style={{ color: "#1E1E1E" }}
          >
            How it works
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base leading-relaxed md:text-lg"
            style={{ color: "#6B6B6B" }}
          >
            Three simple ways to make reflection a habit and find clarity.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-3 md:gap-12 lg:mt-28 lg:gap-16">
          {STEPS.map((step, i) => (
            <article
              key={step.title}
              className="flex flex-col"
            >
              <span
                className="text-sm font-medium"
                style={{ color: "#F97316" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="mt-3 font-heading text-xl font-medium md:text-2xl"
                style={{ color: "#1E1E1E" }}
              >
                {step.title}
              </h3>
              <p
                className="mt-3 text-[15px] leading-relaxed md:text-base"
                style={{ color: "#6B6B6B" }}
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
