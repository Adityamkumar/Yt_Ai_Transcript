import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const messages = [
  'Source received: YouTube video or PDF document.',
  'Extracting transcript and clean document text.',
  'Chunking content into search-ready passages.',
  'Semantic retrieval found grounded source context.',
  'Lumora is composing an answer with citations.',
  'Workspace ready for your next question.',
];

interface PipelineDotProps {
  path: string;
  duration: number;
  delay: number;
  reducedMotion: boolean;
}

function PipelineDot({ path, duration, delay, reducedMotion }: PipelineDotProps) {
  if (reducedMotion) return null;

  return (
    <circle r="2.8" fill="#86b8ff" opacity="0.95">
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
  );
}

function Pulse({ cx, cy, delay = 0 }: { cx: number; cy: number; delay?: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r="3"
      fill="#a3b4ff"
      animate={{ opacity: [0.25, 1, 0.25] }}
      transition={{ duration: 1.25, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function AIAgentPipeline() {
  const [messageIndex, setMessageIndex] = useState(0);
  const reduceMotion = useReducedMotion() === true;
  const paths = {
    source: 'M130,102 L188,102',
    chunks: 'M310,102 L370,102',
    answer: 'M500,102 C516,102 526,56 544,56',
    citations: 'M500,102 L544,102',
    notes: 'M500,102 C516,102 526,148 544,148',
  };

  useEffect(() => {
    if (reduceMotion) return;
    const interval = window.setInterval(() => setMessageIndex((current) => (current + 1) % messages.length), 2700);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-[rgba(157,165,255,0.2)] bg-[linear-gradient(145deg,rgba(20,25,40,0.9),rgba(7,9,15,0.96)_44%,rgba(9,12,20,0.94))] shadow-[0_34px_100px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.025)_inset] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-[18%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(157,165,255,0.65),transparent)]" />
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <motion.span
            className="inline-block h-2 w-2 rounded-full bg-emerald-400"
            animate={reduceMotion ? undefined : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">RAG pipeline live</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)]">Grounded mode</span>
      </div>

      <div className="relative overflow-hidden px-2 py-5 sm:px-5 sm:py-7">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(157,165,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(157,165,255,0.045)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(113,135,255,0.18),transparent_70%)] blur-2xl" />
        <svg viewBox="0 0 680 204" className="relative block w-full min-w-[620px]" role="img" aria-label="Lumora retrieval augmented generation pipeline">
          <defs>
            <marker id="pipeline-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M2 1.5L7.5 5L2 8.5" fill="none" stroke="rgba(157,165,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {Object.values(paths).map((path) => (
            <path key={path} d={path} fill="none" stroke="rgba(157,165,255,0.2)" strokeWidth="1.5" strokeDasharray="3 5" markerEnd="url(#pipeline-arrow)" />
          ))}

          <PipelineDot path={paths.source} duration={1.1} delay={0} reducedMotion={reduceMotion} />
          <PipelineDot path={paths.source} duration={1.1} delay={0.55} reducedMotion={reduceMotion} />
          <PipelineDot path={paths.chunks} duration={0.9} delay={0.2} reducedMotion={reduceMotion} />
          <PipelineDot path={paths.chunks} duration={0.9} delay={0.65} reducedMotion={reduceMotion} />
          <PipelineDot path={paths.answer} duration={1.3} delay={0.1} reducedMotion={reduceMotion} />
          <PipelineDot path={paths.citations} duration={1.1} delay={0.45} reducedMotion={reduceMotion} />
          <PipelineDot path={paths.notes} duration={1.4} delay={0.8} reducedMotion={reduceMotion} />

          <rect x="18" y="76" width="112" height="52" rx="10" fill="#141722" stroke="rgba(255,255,255,0.1)" />
          <text x="74" y="96" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.42)" fontFamily="monospace" letterSpacing="1">SOURCE</text>
          <text x="74" y="115" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">Video or PDF</text>

          <rect x="188" y="76" width="122" height="52" rx="10" fill="#141722" stroke="rgba(255,255,255,0.1)" />
          <text x="249" y="96" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.42)" fontFamily="monospace" letterSpacing="1">CONTEXT</text>
          <text x="249" y="115" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">Transcript chunks</text>

          <rect x="370" y="62" width="130" height="80" rx="12" fill="#0d1228" stroke="rgba(157,165,255,0.9)" strokeWidth="1.2" />
          <rect x="385" y="62.5" width="100" height="1" rx="0.5" fill="rgba(180,192,255,0.85)" />
          <text x="435" y="90" textAnchor="middle" fontSize="9" fill="rgba(157,165,255,0.8)" fontFamily="monospace" letterSpacing="1">LUMORA</text>
          <text x="435" y="111" textAnchor="middle" fontSize="14" fill="#fff" fontFamily="system-ui" fontWeight="600">Retrieving context</text>
          <Pulse cx={423} cy={126} />
          <Pulse cx={435} cy={126} delay={0.4} />
          <Pulse cx={447} cy={126} delay={0.8} />

          <rect x="544" y="38" width="118" height="36" rx="8" fill="#12151d" stroke="rgba(255,255,255,0.08)" />
          <text x="592" y="61" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.75)" fontFamily="system-ui">Grounded answer</text>
          <circle cx="648" cy="49" r="3" fill="#4ade80" />

          <rect x="544" y="84" width="118" height="36" rx="8" fill="#12151d" stroke="rgba(255,255,255,0.08)" />
          <text x="592" y="107" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.75)" fontFamily="system-ui">Source citations</text>
          <circle cx="648" cy="95" r="3" fill="#86b8ff" />

          <rect x="544" y="130" width="118" height="36" rx="8" fill="#12151d" stroke="rgba(255,255,255,0.08)" />
          <text x="592" y="153" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.75)" fontFamily="system-ui">Workspace notes</text>
          <circle cx="648" cy="141" r="3" fill="#fbbf24" />
        </svg>
      </div>

      <div className="border-t border-white/[0.07] px-4 py-3 sm:px-5">
        <div className="flex min-h-5 items-center gap-2 overflow-hidden font-mono text-[11px] text-[var(--text-secondary)]">
          <span className="text-[var(--accent)]">&gt;</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
            >
              {messages[messageIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/[0.07] bg-white/[0.015] px-4 py-3 sm:px-5">
        <div><p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Sources</p><p className="mt-1 font-mono text-sm text-[var(--text-primary)]">Video + PDF</p></div>
        <div><p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Retrieval</p><p className="mt-1 font-mono text-sm text-[var(--text-primary)]">Semantic</p></div>
        <div><p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Answers</p><p className="mt-1 font-mono text-sm text-[var(--text-primary)]">Cited</p></div>
      </div>
    </div>
  );
}
