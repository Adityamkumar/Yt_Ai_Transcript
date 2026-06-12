import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, FileText, ExternalLink, WifiOff } from "lucide-react";
import { pdfService } from "@/services/pdf.service";
import { PdfDocument } from "@/types";
import toast from "react-hot-toast";

interface PdfFailedStateProps {
  document: PdfDocument;
  /** Total maximum retries allowed (backend constant passed through). */
  maxRetries: number;
  onRetryStarted: (newRetryCount?: number) => void;
}

export function PdfFailedState({ document, maxRetries, onRetryStarted }: PdfFailedStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const retryCount = document.retryCount ?? 0;
  const retriesExhausted = retryCount >= maxRetries;

  const handleRetry = async () => {
    if (isRetrying || retriesExhausted) return;
    setIsRetrying(true);
    try {
      const result = await pdfService.retryIngestion(document._id);
      toast.success("Re-indexing document…", { duration: 3000 });
      onRetryStarted(result.retryCount);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        toast.error("Maximum retry attempts reached. Please try again later.");
      } else {
        const msg = err?.response?.data?.message || err?.message || "Failed to start re-indexing";
        toast.error(msg);
      }
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-[460px]"
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

        {/* Status card — deliberately soft, not alarming */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8">
            <WifiOff size={22} className="text-amber-400" />
          </div>

          {/* Headline */}
          <h2 className="text-base font-semibold text-white">
            AI indexing temporarily unavailable
          </h2>

          {/* Body — reassuring, not technical */}
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
            Your document is safely stored and can be re-indexed without re-uploading.
            This is usually caused by a temporary provider rate-limit or service blip.
          </p>

          {/* Divider */}
          <div className="my-4 border-t border-white/[0.06]" />

          {/* Unavailable features — minimal, not alarming */}
          <div className="mb-5 space-y-1.5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] opacity-60">
              Paused until re-indexed
            </p>
            {["AI chat", "Summary", "Study notes", "Semantic search"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="h-1 w-1 rounded-full bg-amber-400/50" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Retry CTA — hidden when exhausted, loading state during attempt */}
          {!retriesExhausted ? (
            <button
              id="retry-indexing-btn"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.09] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} />
              {isRetrying ? "Starting re-index…" : "Retry AI Indexing"}
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-[var(--text-muted)]">
              <Clock size={14} className="shrink-0 opacity-60" />
              <span>Please try again later — retry limit reached.</span>
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-[var(--text-muted)] opacity-50">
            No re-upload needed. Your PDF is stored securely.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
