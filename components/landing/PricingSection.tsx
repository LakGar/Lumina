"use client";

import { motion } from "framer-motion";
import { useLandingModals } from "./LandingModalsContext";

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

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const card = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function PricingSection() {
  const modals = useLandingModals();

  return (
    <section
      id="pricing"
      className="scroll-mt-24 py-[100px] md:py-[120px] lg:py-[140px]"
      style={{ backgroundColor: "#f7f4ef" }}
    >
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
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
            Pricing
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base md:text-lg"
            style={{ color: "#6B6B6B" }}
          >
            Simple pricing. Start free, upgrade when you’re ready.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-8 md:mt-20 md:grid-cols-2 md:gap-10 lg:mt-24"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={card}
              className="rounded-2xl border p-8 md:p-10"
              style={{
                borderColor: plan.highlight
                  ? "#FDBA74"
                  : "rgba(30, 30, 30, 0.08)",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(30, 30, 30, 0.04)",
              }}
            >
              <h3
                className="font-heading text-xl font-medium md:text-2xl"
                style={{ color: "#1E1E1E" }}
              >
                {plan.name}
              </h3>
              <p className="mt-2 text-[15px]" style={{ color: "#6B6B6B" }}>
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-1">
                <span
                  className="font-heading text-3xl font-medium md:text-4xl"
                  style={{ color: "#1E1E1E" }}
                >
                  {plan.price}
                </span>
                <span style={{ color: "#6B6B6B" }}>{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-[15px]"
                    style={{ color: "#1E1E1E" }}
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: "#6B6B6B" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => modals?.openWaitlistModal("pricing")}
                className="mt-8 inline-block w-full rounded-full py-3 text-center text-sm font-medium transition hover:opacity-92"
                style={{
                  backgroundColor: plan.highlight ? "#F97316" : "#1E1E1E",
                  color: "#FDFCF9",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
