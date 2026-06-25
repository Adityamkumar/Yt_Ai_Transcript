import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CloudUpload, FileSearch, Puzzle, Cpu, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface PdfIndexingStatusProps {
  fileName: string;
}

export function PdfIndexingStatus({ fileName }: PdfIndexingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Uploading file", desc: "Storing document in secure cloud storage.", icon: CloudUpload },
    { label: "Extracting text", desc: "Running OCR and parsing text layers.", icon: FileSearch },
    { label: "Semantic chunking", desc: "Structuring text into logical learning nodes.", icon: Puzzle },
    { label: "AI alignment", desc: "Aligning context vector index.", icon: Cpu },
    { label: "Workspace ready", desc: "Launching document chat conversation.", icon: CheckCircle2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[500px] rounded-3xl border border-white/[0.08] bg-[#070a10]/80 p-4 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <div className="mb-6 text-center">
        <span className="inline-block rounded-full bg-[rgba(139,156,255,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Indexing Pipeline
        </span>
        <h3 className="mt-3 text-base sm:text-lg font-semibold text-white mx-auto max-w-full px-2">
          <span className="block truncate text-center">Processing &quot;{fileName}&quot;</span>
        </h3>
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">
          Structuring source files for grounded AI workspace chat.
        </p>
      </div>

      <div className="relative flex flex-col gap-6 pl-4">
        {}
        <div className="absolute left-9 top-4 bottom-4 w-0.5 bg-white/[0.06]">
          <motion.div
            className="w-full bg-[var(--accent)] origin-top"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: currentStep / (steps.length - 1) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ height: "100%" }}
          />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={step.label} className="relative flex gap-5 items-start">
              {}
              <div
                className={cn(
                  "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-all duration-300",
                  isCompleted && "border-[var(--success)] bg-[rgba(52,211,153,0.1)] text-[var(--success)]",
                  isActive && "border-[var(--accent)] bg-[rgba(139,156,255,0.15)] text-[var(--accent)] shadow-[0_0_15px_rgba(102,117,246,0.35)] scale-110",
                  isPending && "border-white/[0.06] bg-[#0c1018] text-[var(--text-muted)]"
                )}
              >
                {isActive && !isCompleted && idx < steps.length - 1 ? (
                  <motion.div
                    className="absolute inset-0 rounded-xl border border-[var(--accent)]"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                ) : null}
                <Icon size={18} className={cn(isActive && idx < steps.length - 1 && "animate-pulse")} />
              </div>

              {}
              <div className="min-w-0 pt-0.5 text-left">
                <p
                  className={cn(
                    "text-sm font-semibold transition-colors duration-300",
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
  );
}

