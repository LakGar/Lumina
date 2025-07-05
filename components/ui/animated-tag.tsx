"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTagProps {
  tag: string;
  index: number;
  delay?: number;
  shouldAnimate?: boolean;
}

export function AnimatedTag({
  tag,
  index,
  delay = 0.1,
  shouldAnimate = false,
}: AnimatedTagProps) {
  const [isVisible, setIsVisible] = useState(!shouldAnimate);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * delay * 1000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [index, delay, shouldAnimate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          initial={shouldAnimate ? { opacity: 0, scale: 0.8, y: 10 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{
            duration: shouldAnimate ? 0.4 : 0,
            ease: "easeOut",
            delay: shouldAnimate ? index * delay : 0,
          }}
          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded inline-block"
        >
          {tag}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
