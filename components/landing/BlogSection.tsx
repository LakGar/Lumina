"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BlogSection() {
  return (
    <section
      id="blog"
      className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28 lg:px-8"
      style={{ backgroundColor: "#f7f4ef" }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          className="font-heading text-4xl font-medium tracking-tight md:text-5xl"
          style={{ color: "#2c2419" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Blog
        </motion.h2>
        <motion.p
          className="font-body mt-4 text-lg"
          style={{ color: "#6b5d4f" }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Reflections, tips, and updates from the Lumina team.
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            href="/blog"
            className="font-body inline-block rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
            style={{ backgroundColor: "#2c2419", color: "#f7f4ef" }}
          >
            Read the blog
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
