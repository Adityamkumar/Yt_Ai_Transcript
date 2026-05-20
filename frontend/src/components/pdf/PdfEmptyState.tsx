import { BookOpen, Brain, Sparkles, HelpCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface PdfEmptyStateProps {
  onActionClick: (text: string) => void;
  onGenerateNotes: () => void;
  onGenerateSummary: () => void;
  showIntro?: boolean;
}

export function PdfEmptyState({
  onActionClick,
  onGenerateNotes,
  onGenerateSummary,
  showIntro = true,
}: PdfEmptyStateProps) {
  const suggestions = [
    {
      title: "Detailed Concepts",
      desc: "What are the core concepts and findings described here?",
      prompt: "Extract the core concepts and findings described in this document.",
      icon: Brain,
    },
    {
      title: "Key Takeaways",
      desc: "What are the top 5 key highlights of this text?",
      prompt: "Give me the top 5 key highlights and takeaways of this document.",
      icon: Sparkles,
    },
    {
      title: "Concept Clarification",
      desc: "Identify and explain any complex terms or terminology.",
      prompt: "Identify and explain any complex terms or technical terminology used in this document.",
      icon: HelpCircle,
    },
  ];

  return (
    <div
      className={
        showIntro
          ? "mx-auto flex max-w-2xl flex-col items-center justify-center py-10 text-center"
          : "mx-auto flex w-full max-w-3xl flex-col py-2 text-left"
      }
    >
      {showIntro && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-6"
        >
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-[rgba(139,156,255,0.08)] text-[var(--accent)]">
            <BookOpen size={28} />
          </div>
          <div className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-lg border border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.15)] text-[var(--success)]">
            <Sparkles size={11} className="animate-pulse" />
          </div>
        </motion.div>
      )}

      {showIntro && (
        <>
          <h2 className="text-3xl font-bold text-white">Your PDF is Indexed</h2>
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
            Ask questions directly about this document. The AI answers will be fully grounded in the text content with page number references.
          </p>
        </>
      )}

      <div className={`${showIntro ? "mt-8" : "mt-2"} grid w-full grid-cols-1 gap-3 sm:grid-cols-2`}>
        <button
          onClick={onGenerateSummary}
          className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c1018] px-4 py-3.5 text-left transition hover:border-white/[0.18] hover:bg-white/[0.02]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(139,156,255,0.1)] text-[var(--accent)]">
            <Sparkles size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">Summarize PDF</p>
            <p className="truncate text-sm text-[var(--text-muted)]">Get a quick high-level summary</p>
          </div>
        </button>

        <button
          onClick={onGenerateNotes}
          className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c1018] px-4 py-3.5 text-left transition hover:border-white/[0.18] hover:bg-white/[0.02]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(52,211,153,0.1)] text-[var(--success)]">
            <FileText size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">Generate Study Notes</p>
            <p className="truncate text-sm text-[var(--text-muted)]">Structure content into key concepts</p>
          </div>
        </button>
      </div>

      <div className={`${showIntro ? "mt-10" : "mt-8"} w-full text-left`}>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Suggested Questions</h3>
        <div className="grid gap-3">
          {suggestions.map((s, idx) => {
            const SuggestionIcon = s.icon;
            return (
              <button
                key={idx}
                onClick={() => onActionClick(s.prompt)}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/[0.04] bg-[#070a0e]/40 px-4 py-3 text-left transition hover:border-white/[0.12] hover:bg-white/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-[var(--text-muted)] transition group-hover:bg-white/[0.08] group-hover:text-white">
                    <SuggestionIcon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white">{s.title}</p>
                    <p className="truncate text-sm text-[var(--text-muted)]">{s.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  Ask -&gt;
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
