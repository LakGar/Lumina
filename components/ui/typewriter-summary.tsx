"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterSummaryProps {
  text: string;
  speed?: number;
  delay?: number;
  shouldAnimate?: boolean;
}

export function TypewriterSummary({
  text,
  speed = 30,
  delay = 0.5,
  shouldAnimate = false,
}: TypewriterSummaryProps) {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? "" : text);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;

    if (shouldAnimate) {
      setIsTyping(true);
      setDisplayedText("");

      const timer = setTimeout(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
          if (currentIndex <= text.length) {
            setDisplayedText(text.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, speed);

        return () => clearInterval(interval);
      }, delay * 1000);

      return () => clearTimeout(timer);
    } else {
      setDisplayedText(text);
      setIsTyping(false);
    }
  }, [text, speed, delay, shouldAnimate]);

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <p className="text-sm font-medium text-blue-900 mb-1">AI Summary:</p>
      <motion.p
        className="text-sm text-blue-800"
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldAnimate ? 0.3 : 0 }}
      >
        {displayedText}
        {isTyping && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block w-1 h-4 bg-blue-800 ml-1"
          />
        )}
      </motion.p>
    </div>
  );
}
