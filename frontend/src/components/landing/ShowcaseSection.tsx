import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { AIAgentPipeline } from '@/components/ui/ai-agent-pipeline';

export function ShowcaseSection() {
  return (
    <section id="showcase" className="section-shell relative overflow-hidden border-t border-[var(--border-soft)] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_14%_32%,rgba(77,162,255,0.075),transparent_48%),radial-gradient(ellipse_at_88%_68%,rgba(157,165,255,0.065),transparent_46%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(157,165,255,0.18)] bg-[rgba(255,255,255,0.04)] px-3.5 py-1.5 backdrop-blur-md"
          >
            <Sparkles size={12} className="text-[var(--accent)]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">How EchoMind works</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl"
          >
            From source material to a{' '}
            <span className="font-serif font-normal italic text-[var(--accent)]">grounded conversation</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base"
          >
            EchoMind extracts your YouTube transcripts and PDFs, organizes them into meaningful context, and uses retrieval to keep every answer tied to the source.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <Bot size={14} className="text-[var(--accent)]" />
            <span>AI agent orchestration with retrieval-augmented context</span>
          </div>
          <div className="overflow-x-auto rounded-[1.5rem]">
            <AIAgentPipeline />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
