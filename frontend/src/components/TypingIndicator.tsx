import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-1.5 px-0.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0.35, scale: 0.95, y: 0 }}
            animate={{
              opacity: [0.35, 1, 0.35],
              scale: [0.95, 1.1, 0.95],
              y: [0, -3.5, 0],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: index * 0.16,
              ease: 'easeInOut',
            }}
            className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] shadow-[0_0_8px_rgba(124,92,255,0.4)]"
          />
        ))}
      </div>
      <motion.span 
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[13px] font-medium tracking-tight text-[#94A3B8]"
      >
        EchoMind is thinking...
      </motion.span>
    </div>
  );
}
