import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { followUpChipVariants } from "@/animations/variants";

interface SuggestionChipProps {
  text: string;
  onClick: (text: string) => void;
}

export function SuggestionChip({ text, onClick }: SuggestionChipProps) {
  return (
    <motion.button
      variants={followUpChipVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => onClick(text)}
      className="group inline-flex items-center gap-2 rounded-xl border border(--border-soft) bg(--surface-3) px-3.5 py-2 text-[13px] leading-snug text(--text-secondary) transition-colors hover:border-[rgba(139,156,247,0.25)] hover:bg(--accent-subtle) hover:text(--text-primary) active:scale-[0.98]"
    >
      <Sparkles
        size={12}
        className="shrink-0 text(--text-muted) transition-colors group-hover:text(--accent)"
      />
      <span className="text-left">{text}</span>
    </motion.button>
  );
}
