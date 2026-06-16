import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { followUpChipVariants } from '@/animations/variants';

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
      className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-3.5 py-2 text-[13px] leading-snug text-[var(--text-secondary)] transition-colors hover:border-[rgba(139,156,247,0.25)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)] active:scale-[0.98]"
    >
      <Sparkles
        size={12}
        className="shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]"
      />
      <span className="text-left">{text}</span>
    </motion.button>
  );
}
