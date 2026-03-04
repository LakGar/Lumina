"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Component } from "../ui/backed-by-yc";
import { useLandingModals } from "./LandingModalsContext";

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

const Hero = () => {
  const modals = useLandingModals();

  return (
    <div
      className="flex h-screen flex-col items-center justify-center md:p-4 lg:p-6"
      style={{ backgroundColor: "#f7f4ef" }}
    >
      <div className="relative h-full w-full overflow-hidden md:rounded-xl">
        <Image
          src="/hero-bg.png"
          alt="Serene landscape"
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
            A Quiet Space for Your Loudest Thoughts
          </motion.h1>
          <motion.p
            variants={item}
            className="font-body mt-4 w-full max-w-xl text-left text-[1.1rem] leading-relaxed text-white md:mt-5 md:text-center md:text-base [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_6px_rgba(0,0,0,0.5),0_0_20px_rgba(0,0,0,0.3)]"
          >
            In the hustle and bustle of daily life, it&apos;s easy to let our
            thoughts get lost in the noise. Lumina is a space to reflect, grow,
            and find clarity.
          </motion.p>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Component onGetStartedClick={() => modals?.openWaitlistModal("hero")} />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
