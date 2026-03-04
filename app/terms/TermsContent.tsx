"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Acceptance of terms",
    body: "By accessing or using Lumina (“Service”), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these terms.",
  },
  {
    title: "Description of the service",
    body: "Lumina is a personal reflection and journaling application that may include AI-assisted features such as summaries, prompts, and insights. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.",
  },
  {
    title: "Use of the service",
    body: "You must use the Service in compliance with applicable laws and only for personal, non-commercial reflection and journaling. You may not misuse the Service, attempt to gain unauthorized access to our systems or other accounts, use it to harm others, distribute malware, or violate any third-party rights. We may suspend or terminate your access if we believe you have violated these terms.",
  },
  {
    title: "Account and data",
    body: "You are responsible for keeping your account credentials secure and for all activity under your account. You retain ownership of your journal content. We process and store your data as described in our Privacy Policy. By using the Service, you grant us a limited license to process your content to provide the Service (e.g., storing entries, powering AI features).",
  },
  {
    title: "Subscriptions and payments",
    body: "If you subscribe to a paid plan, you agree to pay the fees described at the time of purchase. Subscriptions may auto-renew unless cancelled. Refunds are subject to our refund policy as stated at purchase or on the pricing page. We may change pricing with reasonable notice; continued use after a change constitutes acceptance.",
  },
  {
    title: "Intellectual property",
    body: "Lumina and its branding, design, and technology are owned by us or our licensors. You may not copy, modify, or create derivative works of the Service except as necessary to use it. Your content remains yours; we do not claim ownership of your journal entries.",
  },
  {
    title: "Disclaimers",
    body: "The Service is provided “as is” and “as available.” We disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the Service will be uninterrupted or error-free. AI-generated content is for reflection support only and is not professional advice.",
  },
  {
    title: "Limitation of liability",
    body: "To the maximum extent permitted by law, Lumina and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of data or profits, arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms from time to time. We will notify you of material changes via the Service, email, or other reasonable means. Continued use of the Service after changes constitutes acceptance of the updated terms. If you do not agree, you must stop using the Service.",
  },
  {
    title: "Contact",
    body: "Questions about these terms? Contact us at hello@lumina.app.",
  },
];

export default function TermsContent() {
  return (
    <>
      <section
        className="px-4 pt-32 pb-12 md:px-6 md:pt-40 md:pb-16 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.h1
            className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl"
            style={{ color: "#2c2419" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p
            className="mt-2 text-sm"
            style={{ color: "#6b5d4f" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Last updated: March 2026
          </motion.p>
          <motion.p
            className="mt-4 text-sm"
            style={{ color: "#6b5d4f" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Please also read our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80" style={{ color: "#7a9e7e" }}>
              Privacy Policy
            </Link>
            .
          </motion.p>
        </div>
      </section>

      <section
        className="px-4 py-12 md:px-6 md:py-20 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-3xl">
          {SECTIONS.map((s, i) => (
            <motion.div
              key={s.title}
              className="mb-10"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <h2
                className="text-lg font-semibold md:text-xl"
                style={{ color: "#2c2419" }}
              >
                {s.title}
              </h2>
              <p
                className="mt-2 leading-relaxed"
                style={{ color: "#6b5d4f" }}
              >
                {s.body}
              </p>
            </motion.div>
          ))}
          <motion.p
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/"
              className="text-sm font-medium underline underline-offset-2 hover:opacity-80"
              style={{ color: "#7a9e7e" }}
            >
              Back to home
            </Link>
          </motion.p>
        </div>
      </section>
    </>
  );
}
