import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-1.5 px-0.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0.3, scale: 0.95, y: 0 }}
            animate={{
              opacity: [0.3, 0.9, 0.3],
              scale: [0.95, 1.08, 0.95],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.15,
              ease: 'easeInOut',
            }}
            className="h-[5px] w-[5px] rounded-full bg-[var(--accent)]"
          />
        ))}
      </div>
      <motion.span
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="text-[12px] font-medium tracking-tight text-[var(--text-muted)]"
      >
        EchoMind is thinking...
      </motion.span>
    </div>
  );
}
