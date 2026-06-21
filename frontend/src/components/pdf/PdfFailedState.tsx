import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { pdfService } from "@/services/pdf.service";
import { PdfDocument } from "@/types";
import toast from "react-hot-toast";

interface PdfFailedStateProps {
  document: PdfDocument;
  /** Total maximum retries allowed (backend constant passed through). */
  maxRetries: number;
  onRetryStarted: (newRetryCount?: number) => void;
}

export function PdfFailedState({ document, maxRetries: _maxRetries, onRetryStarted }: PdfFailedStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  
  useEffect(() => {
    if (!document.cooldownUntil) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(document.cooldownUntil!).getTime() - Date.now();
      return difference > 0 ? difference : 0;
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) return;

    const timer = setInterval(() => {
      const rem = calculateTimeLeft();
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [document.cooldownUntil]);

  const isInCooldown = timeLeft > 0;

  const handleRetry = async () => {
    if (isRetrying || isInCooldown) return;
    setIsRetrying(true);
    try {
      const result = await pdfService.retryIngestion(document._id);
      toast.success("Retrying AI setup...", { duration: 3000 });
      onRetryStarted(result.retryCount);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        toast.error("Please try again in a little while.");
      } else {
        const msg = err?.response?.data?.message || err?.message || "Failed to start re-indexing";
        toast.error(msg);
      }
      setIsRetrying(false);
    }
  };

  const formatTimeLeft = (ms: number) => {
    const totalSecs = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-[440px]"
      >
        {/* Document context strip */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#10141d] text-[var(--text-muted)]">
            <FileText size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{document.title}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{document.fileName}</p>
          </div>
          {document.fileUrl && (
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 text-[var(--text-muted)] transition hover:text-white"
              title="Open original PDF"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Lightweight Status Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.3)] text-center flex flex-col items-center">
          {/* Softer Warning Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-[var(--text-muted)]">
            {isInCooldown ? (
              <Clock size={20} className="text-[var(--text-secondary)] animate-pulse" />
            ) : (
              <AlertCircle size={20} className="text-[var(--text-secondary)]" />
            )}
          </div>

          {/* Calm, Friendly Headline */}
          <h2 className="text-base font-semibold text-white px-2">
            AI is temporarily unavailable. Please try again shortly.
          </h2>

          {/* Short, Calm, Reassuring Subtitle */}
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed px-4">
            {isInCooldown
              ? "Please try again in a little while."
              : "Your document is safe. You can trigger a new setup attempt below."}
          </p>

          {/* Divider */}
          <div className="my-4 w-full border-t border-white/[0.06]" />

          {/* Retry CTA */}
          <button
            id="retry-indexing-btn"
            onClick={handleRetry}
            disabled={isRetrying || isInCooldown}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.09] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRetrying ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Retrying AI setup...</span>
              </>
            ) : isInCooldown ? (
              <>
                <Clock size={14} />
                <span>Try again later ({formatTimeLeft(timeLeft)})</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Try again</span>
              </>
            )}
          </button>

          <p className="mt-3 text-[11px] text-[var(--text-muted)] opacity-50">
            No re-upload needed. Your PDF is stored securely.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
