import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileSearch, Puzzle, Cpu, CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { PdfDocument } from "@/types";

interface PdfProcessingStateProps {
  document: PdfDocument;
}

const STEPS = [
  { label: "Uploading file", desc: "Storing document in secure cloud storage.", icon: CloudUpload },
  { label: "Extracting text", desc: "Running OCR and parsing text layers.", icon: FileSearch },
  { label: "Semantic chunking", desc: "Structuring text into logical learning nodes.", icon: Puzzle },
  { label: "Generating embeddings", desc: "Building vector index for AI retrieval.", icon: Cpu },
  { label: "Finalising workspace", desc: "Preparing the AI chat environment.", icon: CheckCircle2 },
];

export function PdfProcessingState({ document }: PdfProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [pollDot, setPollDot] = useState(0);

  // Animate through steps visually (cosmetic — actual readiness comes from polling)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 2) return prev + 1; // stop at second-to-last; last = "ready"
        return prev;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Animated poll dots
  useEffect(() => {
    const id = setInterval(() => setPollDot((d) => (d + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);

  const dots = ".".repeat(pollDot);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-4 py-12">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[500px]"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(139,156,255,0.2)] bg-[rgba(139,156,255,0.08)]">
              <RefreshCw
                size={26}
                className="animate-spin text-[var(--accent)]"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <span className="rounded-full bg-[rgba(139,156,255,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Indexing Pipeline
            </span>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Preparing AI workspace
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">
              Building semantic embeddings for{" "}
              <span className="font-medium text-white">&ldquo;{document.title}&rdquo;</span>.
              {" "}This takes a moment.
            </p>
          </div>

          {/* Steps */}
          <div className="relative rounded-2xl border border-white/[0.07] bg-[#070a10]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            {/* Vertical progress rail — centered on the 40px icons (left: p-6 + 20px = 44px) */}
            <div
              className="absolute top-[calc(1.5rem+20px)] bottom-[calc(1.5rem+20px)] w-px bg-white/[0.06]"
              style={{ left: "calc(1.5rem + 20px)" }}
            >
              <motion.div
                className="w-full bg-[var(--accent)] origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: currentStep / (STEPS.length - 1) }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ height: "100%" }}
              />
            </div>

            <div className="flex flex-col gap-6">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;

                return (
                  <div key={step.label} className="flex items-center gap-5">
                    {/* Icon — 40×40, z-10 so it sits above the line */}
                    <div
                      className={cn(
                        "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-all duration-300",
                        isCompleted && "border-[var(--success)] bg-[rgba(52,211,153,0.1)] text-[var(--success)]",
                        isActive &&
                          "border-[var(--accent)] bg-[rgba(139,156,255,0.15)] text-[var(--accent)] shadow-[0_0_15px_rgba(102,117,246,0.35)] scale-110",
                        isPending && "border-white/[0.06] bg-[#0c1018] text-[var(--text-muted)]"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border border-[var(--accent)]"
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                      <Icon size={17} className={cn(isActive && "animate-pulse")} />
                    </div>

                    {/* Label + description */}
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-snug transition-colors duration-300",
                          isCompleted && "text-white/90",
                          isActive && "text-[var(--accent)]",
                          isPending && "text-[var(--text-muted)]"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Polling status */}
          <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
            Checking indexing status{dots}&nbsp;
            <span className="opacity-40">(this page will update automatically)</span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
