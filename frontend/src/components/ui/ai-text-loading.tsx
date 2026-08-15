"use client";

/**
 * @description: AI Text Loading - Premium animated text cycling component
 * @based-on: kokonutui by @kokonutui (MIT License)
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AITextLoadingProps {
  texts?: string[];
  className?: string;
  interval?: number;
}

export default function AITextLoading({
  texts = [
    "Lumora is Thinking...",
    "Processing...",
    "Analyzing...",
    "Computing...",
    "Almost...",
  ],
  className,
  interval = 1500,
}: AITextLoadingProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, texts.length]);

  return (
    <div className="flex items-center justify-start py-2">
      <motion.div
        animate={{ opacity: 1 }}
        className="relative w-full px-0 py-1"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            animate={{
              opacity: 1,
              y: 0,
              backgroundPosition: ["200% center", "-200% center"],
            }}
            className={cn(
              "flex min-w-max whitespace-nowrap bg-[length:200%_100%] bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-600 bg-clip-text font-medium text-sm text-transparent tracking-wide",
              className
            )}
            exit={{ opacity: 0, y: -16 }}
            initial={{ opacity: 0, y: 16 }}
            key={currentTextIndex}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              backgroundPosition: {
                duration: 2.5,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
              },
            }}
          >
            {texts[currentTextIndex]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
