import { BookOpen, Brain, Sparkles, HelpCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { TestUnderstandingCta } from "../TestUnderstandingCta";

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
      prompt:
        "Identify and explain any complex terms or technical terminology used in this document.",
      icon: HelpCircle,
    },
  ];

  return (
    <div
      className={
        showIntro
          ? "mx-auto flex w-full max-w-2xl flex-col items-center justify-center px-3 py-5 text-center sm:px-6 sm:py-10"
          : "mx-auto flex w-full max-w-3xl flex-col px-3 py-2 text-left sm:px-0"
      }
    >
      {showIntro && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-4 sm:mb-6"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-[rgba(139,156,255,0.08)] text(--accent) sm:h-16 sm:w-16 sm:rounded-2xl">
            <BookOpen size={24} className="sm:hidden" />
            <BookOpen size={28} className="hidden sm:block" />
          </div>
          <div className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-lg border border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.15)] text(--success)">
            <Sparkles size={11} className="animate-pulse" />
          </div>
        </motion.div>
      )}

      {showIntro && (
        <>
          <h2 className="max-w-full break-words text-2xl font-bold leading-tight text-white sm:text-3xl">Your PDF is Indexed</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text(--text-muted) sm:max-w-2xl sm:text-lg">
            Ask questions directly about this document. The AI answers will be fully grounded in the
            text content with page number references.
          </p>
        </>
      )}

      <div className={`${showIntro ? "mt-5 sm:mt-8" : "mt-2"} w-full`}>
        <TestUnderstandingCta />
      </div>

      <div
        className={`${showIntro ? "mt-4 sm:mt-8" : "mt-2"} grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3`}
      >
        <button
          onClick={onGenerateSummary}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0c1018] px-3.5 py-3 text-left transition hover:border-white/[0.18] hover:bg-white/[0.02] sm:rounded-2xl sm:px-4 sm:py-3.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(139,156,255,0.1)] text(--accent)">
            <Sparkles size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white sm:text-lg">Summarize PDF</p>
            <p className="truncate text-xs text(--text-muted) sm:text-sm">Get a quick high-level summary</p>
          </div>
        </button>

        <button
          onClick={onGenerateNotes}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0c1018] px-3.5 py-3 text-left transition hover:border-white/[0.18] hover:bg-white/[0.02] sm:rounded-2xl sm:px-4 sm:py-3.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(52,211,153,0.1)] text(--success)">
            <FileText size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white sm:text-lg">Generate Study Notes</p>
            <p className="truncate text-xs text(--text-muted) sm:text-sm">
              Structure content into key concepts
            </p>
          </div>
        </button>
      </div>

      <div className={`${showIntro ? "mt-6 sm:mt-10" : "mt-5 sm:mt-8"} w-full text-left`}>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text(--text-muted) sm:mb-4 sm:text-sm">
          Suggested Questions
        </h3>
        <div className="grid gap-2 sm:gap-3">
          {suggestions.map((s, idx) => {
            const SuggestionIcon = s.icon;
            return (
              <button
                key={idx}
                onClick={() => onActionClick(s.prompt)}
                className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-[#070a0e]/40 px-3 py-2.5 text-left transition hover:border-white/[0.12] hover:bg-white/[0.02] sm:gap-4 sm:px-4 sm:py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.04] text(--text-muted) transition group-hover:bg-white/[0.08] group-hover:text-white">
                    <SuggestionIcon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white sm:text-base">{s.title}</p>
                    <p className="truncate text-xs text(--text-muted) sm:text-sm">{s.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text(--accent) opacity-0 transition-opacity group-hover:opacity-100">
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
