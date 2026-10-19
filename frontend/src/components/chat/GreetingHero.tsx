import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface GreetingHeroProps {
  sourceType?: "video" | "pdf";
}

export function GreetingHero({ sourceType = "video" }: GreetingHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="lumora-greeting relative mx-auto flex w-full max-w-full flex-col items-center justify-center overflow-x-hidden px-4 pt-4 pb-1 text-center md:max-w-4xl"
    >
      <motion.h1
        variants={itemVariants}
        className="w-full max-w-full px-1 text-center text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl md:max-w-4xl md:text-5xl"
      >
        Lumora AI
      </motion.h1>

      <motion.p variants={itemVariants} className="mt-3 text-sm text-[#b8c1eb] sm:text-base">
        Learn from {sourceType === "video" ? "videos" : "documents"} — just add a source below.
      </motion.p>

    </motion.section>
  );
}

export function SourceSuggestionChips({ sourceType = "video" }: GreetingHeroProps) {
  const quickActions =
    sourceType === "video"
      ? ["Summarize video", "Key takeaways", "Explain concepts", "Create flashcards"]
      : ["Summarize document", "Key concepts", "Extract key points", "Study notes"];

  const handleQuickActionClick = async (action: string) => {
    try {
      await navigator.clipboard.writeText(action);
      toast.success(`Copied "${action}" to clipboard! Paste it once a source is loaded.`);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="ruixen-actions" aria-label="Suggested learning actions">
      {quickActions.map((action) => (
        <button key={action} onClick={() => handleQuickActionClick(action)}>
          <Sparkles size={15} />
          {action}
        </button>
      ))}
    </div>
  );
}
