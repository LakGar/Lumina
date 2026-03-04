"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <motion.section
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      style={{ backgroundColor: "#f7f4ef" }}
    >
      <div className="relative min-h-screen w-full md:aspect-2.6/1 ">
        <Image
          src="/cta.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
        />

        <div
          className="absolute inset-x-0 top-0 z-1 h-32 md:h-40"
          style={{
            background:
              "linear-gradient(to bottom, #f7f4ef 0%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 z-1 h-40 md:h-48"
          style={{
            background: "linear-gradient(to top, #f7f4ef 0%, transparent 100%)",
          }}
          aria-hidden
        />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 py-16">
          <h2 className="font-heading max-w-2xl text-center text-2xl font-medium tracking-tight text-white md:text-3xl lg:text-4xl [text-shadow:0_1px_3px_rgba(0,0,0,0.4),0_2px_12px_rgba(0,0,0,0.3)]">
            Say hello if you&apos;ve made it this far
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:opacity-90"
              style={{ backgroundColor: "#2c2419" }}
            >
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Lumina on X
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:opacity-90"
              style={{ backgroundColor: "#0A66C2" }}
            >
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Lumina on LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CTA;
