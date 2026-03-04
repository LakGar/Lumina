"use client";

import Image from "next/image";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/feature-journaling.png",
    alt: "Journaling",
    title: "Journals & entries",
    description:
      "Organize your thoughts in multiple journals. Write entries, track streaks, and build a habit that sticks.",
  },
  {
    src: "/feature-reflection.png",
    alt: "Reflection",
    title: "AI-powered reflection",
    description:
      "Get summaries, mood, and tags for each entry. Use “Go deeper” to unlock more meaningful reflection.",
  },
  {
    src: "/feature-level.png",
    alt: "Lumina level",
    title: "Level up",
    description:
      "Build your Lumina level with streaks, consistency, and quality. See your progress and stay motivated.",
  },
  {
    src: "/feature-chat.png",
    alt: "Chat",
    title: "Chat with context",
    description:
      "Talk to Lumina about a journal. Get reflections and suggestions grounded in your own entries.",
  },
];

const SLIDE_WIDTH_VW = 80;
const GAP_VW = 2;
const PEEK_VW = (100 - SLIDE_WIDTH_VW) / 2;

/** Triple the slides for infinite scroll (middle set is "home") */
const INFINITE_SLIDES = [...SLIDES, ...SLIDES, ...SLIDES];
const LEN = SLIDES.length;
const TOTAL = INFINITE_SLIDES.length;

const Feature = () => {
  const [index, setIndex] = useState(LEN);
  const skipAnimationRef = useRef(false);

  const translateX = -(index * (SLIDE_WIDTH_VW + GAP_VW) - PEEK_VW);

  const go = useCallback(
    (nextIndex: number) => {
      if (nextIndex === index) return;
      skipAnimationRef.current = false;
      setIndex(nextIndex);
    },
    [index],
  );

  const prev = useCallback(() => {
    if (index <= 0) {
      skipAnimationRef.current = true;
      setIndex(TOTAL - 1);
    } else {
      go(index - 1);
    }
  }, [index, go]);

  const next = useCallback(() => {
    if (index >= TOTAL - 1) {
      skipAnimationRef.current = true;
      setIndex(0);
    } else {
      go(index + 1);
    }
  }, [index, go]);

  const goToSlide = useCallback(
    (slideIndex: number) => {
      const currentSet = Math.floor(index / LEN);
      const targetIndex = currentSet * LEN + slideIndex;
      go(targetIndex);
    },
    [index, go],
  );

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [index]);

  useEffect(() => {
    if (index === 0) {
      const t = requestAnimationFrame(() => {
        skipAnimationRef.current = true;
        setIndex(LEN);
      });
      return () => cancelAnimationFrame(t);
    }
    if (index === TOTAL - 1) {
      const t = requestAnimationFrame(() => {
        skipAnimationRef.current = true;
        setIndex(LEN - 1);
      });
      return () => cancelAnimationFrame(t);
    }
    skipAnimationRef.current = false;
  }, [index]);

  const displayDotIndex = index % LEN;

  return (
    <motion.section
      id="features"
      className="scroll-mt-24 flex min-h-screen flex-col items-center justify-center py-16 md:py-24"
      style={{ backgroundColor: "#f7f4ef" }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h2
          className="font-heading text-2xl font-medium md:text-4xl lg:text-5xl"
          style={{ color: "#2c2419" }}
        >
          Do more with Lumina
        </h2>
        <p
          className="font-body mt-2 max-w-md text-sm md:text-base lg:text-lg"
          style={{ color: "#6b5d4f" }}
        >
          Lumina is more than just a journaling app. It&apos;s a tool to help
          you reflect, grow, and find clarity.
        </p>
      </div>

      <div className="relative mt-12 w-full px-0 md:mt-16">
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-[2vw]"
            style={{
              width: `${TOTAL * SLIDE_WIDTH_VW + (TOTAL - 1) * GAP_VW}vw`,
            }}
            animate={{ x: `${translateX}vw` }}
            transition={{
              duration: skipAnimationRef.current ? 0 : 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {INFINITE_SLIDES.map((slide, i) => (
              <div
                key={`${slide.src}-${i}`}
                className="flex shrink-0"
                style={{ width: `${SLIDE_WIDTH_VW}vw` }}
              >
                <div className="group relative w-full overflow-hidden rounded-2xl bg-muted">
                  <div className="relative aspect-4/3 w-full md:aspect-5/4 max-h-[80vh]">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02] max-h-[80vh]"
                      sizes="80vw"
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
                    <div className="w-max max-w-[55%] rounded-xl border border-white/20 bg-white/15 px-3 py-2.5 shadow-lg backdrop-blur-xl md:max-w-[75%] md:rounded-2xl md:px-4 md:py-3">
                      <h3 className="font-heading text-sm font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] md:text-base">
                        {slide.title}
                      </h3>
                      <p className="font-body mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] md:mt-1 md:text-sm md:line-clamp-3">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/40 p-2.5 shadow-md backdrop-blur-sm transition hover:bg-white/60 md:left-4"
        >
          <ChevronLeft className="size-5 text-foreground md:size-6" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full  bg-white/40 p-2.5 shadow-md backdrop-blur-sm transition hover:bg-white/60 md:right-4"
        >
          <ChevronRight className="size-5 text-foreground md:size-6" />
        </button>

        <div className="mt-6 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all md:h-2.5",
                i === displayDotIndex
                  ? "w-6 bg-primary/40 md:w-8"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50 md:w-2.5",
              )}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Feature;
