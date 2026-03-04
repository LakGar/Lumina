"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BLOG_POSTS } from "./blog-data";

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

export default function BlogContent() {
  return (
    <>
      {/* Hero – same structure as landing Hero.tsx */}
      <div
        className="flex h-screen flex-col items-center justify-center md:p-4 lg:p-6"
        style={{ backgroundColor: "#f7f4ef" }}
      >
        <div className="relative h-full w-full overflow-hidden md:rounded-xl">
          <Image
            src="/blog-hero.png"
            alt=""
            fill
            className="absolute inset-0 z-0 object-cover"
            priority
          />
          <div className="absolute inset-0 h-full w-full bg-linear-to-b from-transparent via-transparent to-[#f7f4ef] md:hidden" />

          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-start justify-center px-5 pt-24 md:items-center md:px-8 md:pt-20"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={item}
              className="font-heading w-full text-left text-4xl font-medium leading-tight tracking-[0.02em] text-white sm:max-w-lg md:max-w-2xl md:text-center md:text-6xl [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]"
            >
              Blog
            </motion.h1>
            <motion.p
              variants={item}
              className="font-body mt-4 w-full max-w-xl text-left text-[1.1rem] leading-relaxed text-white md:mt-5 md:text-center md:text-base [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_6px_rgba(0,0,0,0.5),0_0_20px_rgba(0,0,0,0.3)]"
            >
              Reflection tips, product updates, and stories from the Lumina
              team.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Posts list – cards linking to individual post pages */}
      <section
        className="py-16 md:py-24 lg:py-28"
        style={{ backgroundColor: "#FDFCF9" }}
      >
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <div className="space-y-16 md:space-y-20">
            {BLOG_POSTS.map((post) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl md:aspect-2/1">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 896px"
                    />
                  </div>
                  <header className="mt-6 md:mt-8">
                    <time
                      className="font-body text-sm"
                      style={{ color: "#6B6B6B" }}
                      dateTime={new Date(post.date).toISOString().slice(0, 10)}
                    >
                      {post.date}
                    </time>
                    <h2 className="font-heading mt-2 text-2xl font-medium tracking-tight text-[#1E1E1E] transition group-hover:opacity-80 md:text-3xl lg:text-4xl">
                      {post.title}
                    </h2>
                    <p
                      className="font-body mt-3 text-base leading-relaxed"
                      style={{ color: "#6B6B6B" }}
                    >
                      {post.excerpt}
                    </p>
                  </header>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl px-6 text-center sm:px-8 lg:px-10">
          <Link
            href="/"
            className="font-body inline-block rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
            style={{ backgroundColor: "#1E1E1E", color: "#FDFCF9" }}
          >
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
