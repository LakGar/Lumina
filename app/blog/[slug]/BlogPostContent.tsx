"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 * i },
  }),
};

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

interface BlogPostContentProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  imageAlt: string;
  paragraphs: string[];
}

export default function BlogPostContent({
  slug: _slug,
  title,
  excerpt,
  date,
  image,
  imageAlt,
  paragraphs,
}: BlogPostContentProps) {
  return (
    <>
      {/* Hero – same structure as Hero.tsx, with post image as background */}
      <div
        className="flex h-screen flex-col items-center justify-center md:p-4 lg:p-6"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="relative h-full w-full overflow-hidden md:rounded-xl">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="absolute inset-0 z-0 object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          <div className="absolute inset-0 h-full w-full bg-linear-to-b from-transparent via-transparent to-[#f7f4ef] md:hidden" />

          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-start justify-end px-5 pb-24 pt-24 md:items-center md:justify-center md:px-8 md:pb-20 md:pt-20"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.time
              variants={item}
              className="font-body text-sm text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
              dateTime={new Date(date).toISOString().slice(0, 10)}
            >
              {date}
            </motion.time>
            <motion.h1
              variants={item}
              className="font-heading mt-2 w-full text-left text-4xl font-medium leading-tight tracking-[0.02em] text-white sm:max-w-lg md:max-w-2xl md:text-center md:text-6xl [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]"
            >
              {title}
            </motion.h1>
            <motion.p
              variants={item}
              className="font-body mt-4 w-full max-w-xl text-left text-[1.1rem] leading-relaxed text-white md:mt-5 md:text-center md:text-base [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_6px_rgba(0,0,0,0.5),0_0_20px_rgba(0,0,0,0.3)]"
            >
              {excerpt}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <section
        className="px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-28"
        style={{ backgroundColor: "#FDFCF9" }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            className="font-body space-y-6 text-[15px] leading-relaxed md:text-base"
            style={{ color: "#1E1E1E" }}
          >
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/blog"
              className="text-sm font-medium underline underline-offset-2 hover:opacity-80"
              style={{ color: "#7a9e7e" }}
            >
              ← All posts
            </Link>
            <Link
              href="/"
              className="text-sm font-medium underline underline-offset-2 hover:opacity-80"
              style={{ color: "#7a9e7e" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
