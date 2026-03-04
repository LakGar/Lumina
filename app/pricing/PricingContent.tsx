"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with reflection.",
    features: [
      "Up to 3 journals",
      "Unlimited entries",
      "Basic AI summary",
      "Streak tracking",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Lumina",
    price: "$6",
    period: "/month",
    description: "Full reflection toolkit.",
    features: [
      "Unlimited journals",
      "AI mood & Go deeper",
      "Chat with context",
      "Weekly tips",
      "Lumina level & progress",
    ],
    cta: "Start free trial",
    highlight: true,
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function PricingContent() {
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
            Pricing
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-xl text-lg"
            style={{ color: "#6b5d4f" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Simple pricing. Start free, upgrade when you’re ready.
          </motion.p>
        </div>
      </section>

      <section
        className="px-4 py-16 md:px-6 md:py-24 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                className="rounded-2xl p-8"
                style={{
                  border: plan.highlight
                    ? "2px solid #7a9e7e"
                    : "1px solid #e5ddd4",
                  backgroundColor: plan.highlight
                    ? "rgba(122, 158, 126, 0.08)"
                    : "rgba(255,255,255,0.7)",
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: i * 0.12,
                      duration: 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    },
                  },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "#2c2419" }}
                >
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "#6b5d4f" }}>
                  {plan.description}
                </p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span
                    className="text-3xl font-semibold"
                    style={{ color: "#2c2419" }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ color: "#6b5d4f" }}>{plan.period}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#2c2419" }}
                    >
                      <Check
                        className="size-4 shrink-0"
                        style={{ color: "#7a9e7e" }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/"
                  className="mt-8 inline-block w-full rounded-full py-3 text-center text-sm font-medium transition hover:opacity-90"
                  style={{
                    backgroundColor: plan.highlight ? "#7a9e7e" : "#2c2419",
                    color: "#fff",
                  }}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
