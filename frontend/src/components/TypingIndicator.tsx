import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={{
              opacity: [0.35, 1, 0.35],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: index * 0.14,
              ease: 'easeInOut',
            }}
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
          />
        ))}
      </div>
      <span className="text-sm text-[var(--text-muted)]">Thinking</span>
    </div>
  );
}
