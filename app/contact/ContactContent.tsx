"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactContent() {
  return (
    <>
      <section
        className="px-4 pt-32 pb-16 md:px-6 md:pt-40 md:pb-20 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: "#2c2419" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact
          </motion.h1>
          <motion.p
            className="mt-4 text-lg"
            style={{ color: "#6b5d4f" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Say hello. We’d love to hear from you.
          </motion.p>
        </div>
      </section>

      <motion.section
        className="px-4 py-16 md:px-6 md:py-24 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-xl rounded-2xl p-8 md:p-10" style={{ border: "1px solid #e5ddd4", backgroundColor: "rgba(255,255,255,0.6)" }}>
          <p className="text-center text-sm" style={{ color: "#6b5d4f" }}>
            For support, feedback, or partnerships, reach out at{" "}
            <a
              href="mailto:hello@lumina.app"
              className="font-medium underline underline-offset-2 hover:opacity-80"
              style={{ color: "#7a9e7e" }}
            >
              hello@lumina.app
            </a>
            .
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: "#2c2419", color: "#f7f4ef" }}
            >
              Lumina on X
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#0A66C2" }}
            >
              LinkedIn
            </Link>
          </div>
          <p className="mt-8 text-center text-sm" style={{ color: "#6b5d4f" }}>
            <Link href="/" className="underline underline-offset-2 hover:opacity-80" style={{ color: "#7a9e7e" }}>
              Back to home
            </Link>
          </p>
        </div>
      </motion.section>
    </>
  );
}
