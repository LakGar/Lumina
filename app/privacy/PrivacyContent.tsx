"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Introduction",
    body: "Lumina (“we,” “our,” or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our reflection and journaling application and related services (the “Service”). By using the Service, you agree to the practices described in this policy.",
  },
  {
    title: "Information we collect",
    body: "We collect information you provide directly (e.g., account details, email, journal entries, preferences, and any content you create in the app) and information we obtain automatically (e.g., device type, IP address, usage data such as how you use the app and which features you use). We may also receive information from third-party authentication providers if you sign in through them.",
  },
  {
    title: "How we use your information",
    body: "We use your data to provide and improve the Service (e.g., store and sync your entries, power AI features like summaries and “Go deeper”), personalize your experience, send you service-related communications, and comply with legal obligations. We do not sell your personal data to third parties. We may use aggregated or de-identified data for analytics and product improvement.",
  },
  {
    title: "AI and your content",
    body: "When you use AI-assisted features, we may process your journal content to generate summaries, prompts, or insights. This processing is done in accordance with our systems and security practices. We do not use your content to train third-party AI models for purposes unrelated to providing the Service to you.",
  },
  {
    title: "Data sharing and disclosure",
    body: "We may share your information with service providers who assist us in operating the Service (e.g., hosting, analytics, authentication), subject to confidentiality obligations. We may also disclose information if required by law, to protect our rights or safety, or in connection with a merger or sale of assets. We do not share your journal content with advertisers or other third parties for their marketing.",
  },
  {
    title: "Data security",
    body: "We use industry-standard measures to protect your data in transit and at rest, including encryption and access controls. You are responsible for keeping your account credentials secure. While we strive to protect your information, no method of transmission or storage is 100% secure.",
  },
  {
    title: "Data retention",
    body: "We retain your data for as long as your account is active or as needed to provide the Service and fulfill the purposes described in this policy. You may request deletion of your account and associated data; we will delete or anonymize it in accordance with our retention practices and legal obligations.",
  },
  {
    title: "Your rights",
    body: "Depending on your location, you may have rights to access, correct, delete, or port your personal data, or to object to or restrict certain processing. You can often manage your data through the app (e.g., Settings) or by contacting us at hello@lumina.app. You may also have the right to lodge a complaint with a supervisory authority.",
  },
  {
    title: "Children",
    body: "The Service is not intended for users under 13 (or the applicable age in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us so we can delete it.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of material changes via the Service, email, or other reasonable means. The “Last updated” date at the top indicates when the policy was last revised. Continued use after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "Contact",
    body: "Privacy questions or requests? Contact us at hello@lumina.app.",
  },
];

export default function PrivacyContent() {
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
            Privacy Policy
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
            <Link href="/terms" className="underline underline-offset-2 hover:opacity-80" style={{ color: "#7a9e7e" }}>
              Terms of Service
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
