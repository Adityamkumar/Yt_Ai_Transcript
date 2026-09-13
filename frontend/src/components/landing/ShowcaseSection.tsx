import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AIAgentPipeline } from '@/components/ui/ai-agent-pipeline';

export function ShowcaseSection() {
  return (
    <section
      id="showcase"
      className="relative w-full overflow-hidden border-y border-[var(--border-medium)] bg-[#07080c]"
    >
      <div             className="relative flex min-h-[360px] flex-col items-center justify-center border-b border-[var(--border-medium)] px-6 py-16 text-center sm:min-h-[390px] sm:px-10 lg:min-h-[420px]">
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-6 inline-flex items-center gap-2 border border-[rgba(157,165,255,0.18)] bg-[rgba(255,255,255,0.04)] px-3.5 py-1.5"
        >
          <Sparkles size={12} className="text-[var(--accent)]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">How Lumora works</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="max-w-4xl text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-4xl"
        >
          From source material to a{' '}
          <span className="font-serif font-normal italic text-[var(--accent)]">grounded conversation</span>.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base"
        >
          Lumora extracts your YouTube transcripts and PDFs, organizes them into meaningful context, and uses retrieval to keep every answer tied to the source.
        </motion.p>

        {[25, 50, 75].map((position) => (
          <span
            key={position}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[5px] z-20 -translate-x-1/2 text-[11px] leading-none text-[var(--text-muted)]"
            style={{ left: `${position}%` }}
          >
            +
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[390px] w-full items-center justify-center py-12 sm:min-h-[430px] sm:px-2 lg:min-h-[470px] lg:px-4"
      >
        <div className="w-full max-w-4xl">
          <AIAgentPipeline />
        </div>
      </motion.div>
    </section>
  );
}
