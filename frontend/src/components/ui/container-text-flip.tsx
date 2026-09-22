"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation. */
  words?: string[];
  /** Time in milliseconds between word transitions. */
  interval?: number;
  /** Additional classes for the animated container. */
  className?: string;
  /** Additional classes for the word text. */
  textClassName?: string;
  /** Duration of the word transition in milliseconds. */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ["conversations", "summaries", "insights", "notes"],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const textRef = useRef<HTMLSpanElement>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState<number>();
  const currentWord = words[currentWordIndex] ?? words[0] ?? "";

  useEffect(() => {
    if (!words.length) return;

    const intervalId = window.setInterval(() => {
      setCurrentWordIndex((previousIndex) => (previousIndex + 1) % words.length);
    }, interval);

    return () => window.clearInterval(intervalId);
  }, [interval, words]);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    const updateWidth = () => setWidth(textElement.scrollWidth + 30);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(textElement);
    return () => resizeObserver.disconnect();
  }, [currentWord]);

  if (!currentWord) return null;

  return (
    <motion.span
      layout
      layoutId={`lumora-word-container-${id}`}
      animate={{ width: width ?? "auto" }}
      transition={{ duration: animationDuration / 2000, ease: "easeInOut" }}
      className={cn(
        "relative my-3 block max-w-full overflow-visible border border-[rgba(157,165,255,0.72)] bg-[rgba(157,165,255,0.08)] px-2 py-3 text-center sm:my-4 sm:inline-block sm:py-3.5",
        className,
      )}
      aria-live="polite"
    >
      <span aria-hidden="true" className="absolute -left-[4px] -top-[4px] h-2 w-2 bg-[var(--accent)]" />
      <span aria-hidden="true" className="absolute -right-[4px] -top-[4px] h-2 w-2 bg-[var(--accent)]" />
      <span aria-hidden="true" className="absolute -bottom-[4px] -left-[4px] h-2 w-2 bg-[var(--accent)]" />
      <span aria-hidden="true" className="absolute -bottom-[4px] -right-[4px] h-2 w-2 bg-[var(--accent)]" />

      <motion.span
        key={currentWord}
        ref={textRef}
        layout
        layoutId={`lumora-word-${currentWord}-${id}`}
        className={cn("inline-block whitespace-nowrap", textClassName)}
      >
        {currentWord.split("").map((letter, index) => (
          <motion.span
            key={`${currentWord}-${index}`}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: index * 0.02, duration: animationDuration / 1000 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
    </motion.span>
  );
}
