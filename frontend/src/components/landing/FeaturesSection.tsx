import { motion } from 'framer-motion';
import {
  FileText, BrainCircuit, MessageSquareText,
  Sparkles, CheckCircle2, ChevronRight, FileSearch,
  Youtube, Database, HelpCircle, ArrowUpRight
} from 'lucide-react';

const steps = [
  {
    number: '01',
    phase: 'Ingestion & Vector Parsing',
    title: 'Deconstruct speech and documents into searchable units',
    description:
      'Paste a YouTube URL or drop a PDF document. The system instantly downloads the resource, parses the underlying text blocks, and segments it into clear semantic chunk nodes. No duplicated arrays, no database weight.',
    highlight: 'Unified index creation',
    badge: 'Step 1: Read',
    color: '#8b9cf7',
    accentBg: 'rgba(139,156,247,0.06)',
    accentBorder: 'rgba(139,156,247,0.15)',
  },
  {
    number: '02',
    phase: 'Synthesis & Context Mapping',
    title: 'Transform raw data blocks into immediate reading paths',
    description:
      'Say goodbye to scrub-bars and document hunting. The AI maps the internal structure of the material, generating key chapters, timestamped summaries, and structural action notes. In seconds, a hours-long video becomes a 2-minute scan.',
    highlight: 'Insight condensation',
    badge: 'Step 2: Map',
    color: '#4da2ff',
    accentBg: 'rgba(77,162,255,0.06)',
    accentBorder: 'rgba(77,162,255,0.15)',
  },
  {
    number: '03',
    phase: 'Dialogue & Grounded Chat',
    title: 'Probe the material with direct citations',
    description:
      'Query the workspace. The conversational assistant answers questions using direct citations. Clicking on a reference jumps directly to the exact YouTube timestamp or the PDF page number. Accurate, hallucination-free, and verifiable.',
    highlight: 'Grounded conversation',
    badge: 'Step 3: Ask',
    color: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.06)',
    accentBorder: 'rgba(167,139,250,0.15)',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-28 sm:py-36 overflow-hidden"
      style={{ background: 'var(--canvas)' }}
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,156,247,0.04) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-24 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-medium)] bg-[var(--surface-3)] mb-6"
          >
            <Sparkles size={11} className="text-[var(--accent)]" />
            <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">
              The Workflow pipeline
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.2] mb-6"
          >
            A calm structure for your files{' '}
            <span className="font-serif italic font-normal text-[var(--accent)] leading-[1.2]">
              and conversations
            </span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed"
          >
            EchoMind streamlines material ingestion, analysis, and grounding. Here is how it shapes raw content into a private research environment.
          </motion.p>
        </div>

        {/* Narrative steps list (mobile-first stacked, desktop alternating rows) */}
        <div className="space-y-24 sm:space-y-36">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.number}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                {/* Text Block - Stacks first on mobile, alternates order on large screens */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`lg:col-span-6 ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  } space-y-5`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono font-bold tracking-widest text-[var(--text-muted)]"
                      style={{ color: step.color }}
                    >
                      PHASE {step.number}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase font-mono"
                      style={{
                        background: step.accentBg,
                        color: step.color,
                        borderColor: step.accentBorder,
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-[var(--text-primary)]">
                    <CheckCircle2 size={13} style={{ color: step.color }} />
                    <span className="font-mono tracking-wide text-[11px] text-[var(--text-muted)]">
                      CORE OUTPUT: <span className="text-[var(--text-primary)] font-sans font-semibold">{step.highlight}</span>
                    </span>
                  </div>
                </motion.div>

                {/* Visual Card Mockup - Stacks second on mobile, alternates order on large screens */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`lg:col-span-6 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div
                    className="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-1)] p-5 shadow-lg overflow-hidden backdrop-blur-sm"
                    style={{
                      borderColor: step.accentBorder,
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}, transparent)`,
                      }}
                    />

                    {/* Step 1 Visualizer: Ingestion */}
                    {index === 0 && (
                      <div className="space-y-4 font-mono text-[10.5px]">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                          <span className="text-[var(--text-muted)]">SYSTEM_LOADER</span>
                          <span className="text-emerald-400 text-[9px] flex items-center gap-1.5 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ONLINE
                          </span>
                        </div>
                        {/* YouTube URL ingest visual */}
                        <div className="bg-black/30 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <Youtube size={12} className="text-red-400" />
                            <span className="text-[var(--text-secondary)] truncate">youtube.com/watch?v=RAG_Intro</span>
                          </div>
                          <span className="text-[9px] text-[var(--text-muted)]">Indexed</span>
                        </div>
                        {/* PDF ingest visual */}
                        <div className="bg-black/30 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <FileSearch size={12} className="text-emerald-400" />
                            <span className="text-[var(--text-secondary)] truncate">vector_decoupling_specs.pdf</span>
                          </div>
                          <span className="text-[9px] text-emerald-400 font-bold">Vectorized</span>
                        </div>
                        {/* Processing terminal window logs */}
                        <div className="bg-black/50 border border-white/5 rounded-lg p-3 text-[9.5px] leading-relaxed text-[var(--text-muted)] space-y-1">
                          <p className="text-white/70">[$] npx rag-ingest-pipeline --source=decoupling_specs.pdf</p>
                          <p className="text-[var(--accent)]">[1] Read document stream: 12 pages found</p>
                          <p className="text-[var(--accent)]">[2] Text segmenting completed: 34 chunks mapped</p>
                          <p className="text-emerald-400">[3] Vector storage update: 34 nodes generated</p>
                        </div>
                      </div>
                    )}

                    {/* Step 2 Visualizer: Synthesis */}
                    {index === 1 && (
                      <div className="space-y-3 font-sans text-xs">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 font-mono text-[9px] text-[var(--text-muted)]">
                          <span>SYNTHESIS_OUTLINE</span>
                          <span>2 MIN READ</span>
                        </div>
                        {/* Structured Outline Chapters */}
                        <div className="space-y-2.5">
                          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                              <span className="flex items-center gap-1.5">
                                <ChevronRight size={10} className="text-[var(--accent)]" />
                                1. Context Decoupling Theory
                              </span>
                              <span className="font-mono text-[9px] text-[var(--text-muted)]">00:00 - 04:12</span>
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] pl-3.5 leading-relaxed">
                              Explains the reasoning behind pulling transcript content away from metadata nodes to reduce load times.
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                              <span className="flex items-center gap-1.5">
                                <ChevronRight size={10} className="text-[var(--accent)]" />
                                2. Benchmark Retrieval Latencies
                              </span>
                              <span className="font-mono text-[9px] text-[var(--text-muted)]">04:12 - 10:24</span>
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] pl-3.5 leading-relaxed">
                              Details Table 3 measurements where RAG latency drops from 320ms to 78ms using vector sharding.
                            </p>
                          </div>
                        </div>

                        {/* Smart Action Points preview */}
                        <div className="p-2.5 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)]/15">
                          <span className="text-[9px] font-mono text-[var(--accent)] font-bold block mb-1">KEY TAKEAWAY</span>
                          <p className="text-[10px] text-[var(--text-primary)] leading-normal">
                            Decoupled chunk storage ensures document index payloads stay low, preventing API latency spikes in RAG.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3 Visualizer: Dialogue */}
                    {index === 2 && (
                      <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 font-mono text-[9px] text-[var(--text-muted)]">
                          <span>DIALOGUE_GROUNDED</span>
                          <span>CITATION VERIFIED</span>
                        </div>
                        {/* Conversation simulation bubbles */}
                        <div className="space-y-3">
                          <div className="flex justify-end">
                            <div className="bg-[var(--accent)] text-white text-[10.5px] px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%] font-medium">
                              Show me the measured performance specs.
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <BrainCircuit size={10} className="text-white" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="bg-black/30 border border-white/5 text-[10.5px] text-[var(--text-secondary)] px-3 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed">
                                The benchmarks show retrieval speeds decreasing from 320ms to 78ms using decoupled collections. This was validated during Table 3 trials.
                              </div>
                              {/* Citation Badge */}
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 w-max group cursor-pointer">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-0.5">
                                  Source: decoupled_specs.pdf [Page 8]
                                  <ArrowUpRight size={8} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
