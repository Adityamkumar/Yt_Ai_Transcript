import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { followUpStagger } from '@/animations/variants';
import { SuggestionChip } from './SuggestionChip';

interface FollowUpQuestionsProps {
  questions: string[];
  isLoading: boolean;
  onSelectQuestion: (question: string) => void;
}

export function FollowUpQuestions({
  questions,
  isLoading,
  onSelectQuestion,
}: FollowUpQuestionsProps) {
  if (!isLoading && (!questions || questions.length === 0)) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-2.5">
      {/* Subtle guide label */}
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
        <Sparkles size={11} className="text-[var(--accent)] animate-pulse" />
        <span>Explore further</span>
      </div>

      <motion.div
        variants={followUpStagger}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-wrap gap-2"
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            
            [1, 2].map((i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-[38px] w-48 animate-pulse rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)]/60 opacity-60"
              />
            ))
          ) : (
            questions.map((question, index) => (
              <SuggestionChip
                key={`${index}-${question}`}
                text={question}
                onClick={onSelectQuestion}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
