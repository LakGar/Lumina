"use client";

import { motion } from "framer-motion";
import { useLandingModals } from "./LandingModalsContext";

export default function ContactSection() {
  const modals = useLandingModals();

  return (
    <>
      <section
        id="contact"
        className="scroll-mt-24 px-4 pt-20 pb-12 md:px-6 md:pt-24 md:pb-16 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            className="font-heading text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: "#2c2419" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Contact
          </motion.h2>
          <motion.p
            className="font-body mt-4 text-lg"
            style={{ color: "#6b5d4f" }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Say hello. We’d love to hear from you.
          </motion.p>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={() => modals?.openContactModal()}
              className="font-body rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: "#2c2419", color: "#f7f4ef" }}
            >
              Get in touch
            </button>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="px-4 py-12 md:px-6 md:py-20 lg:px-8"
        style={{ backgroundColor: "#f7f4ef" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-xl rounded-2xl p-8 md:p-10" style={{ border: "1px solid #e5ddd4", backgroundColor: "rgba(255,255,255,0.6)" }}>
          <p className="font-body text-center text-sm" style={{ color: "#6b5d4f" }}>
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
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: "#2c2419", color: "#f7f4ef" }}
            >
              Lumina on X
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#0A66C2" }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </motion.section>
    </>
  );
}
