import { CheckCircle2, Eye, FileText, Loader2 } from "lucide-react";
import { PdfDocument } from "@/types";
import { cn } from "@/utils/cn";
import { useSourcePanelStore } from "@/stores/sourcePanel.store";

interface PdfPreviewCardProps {
  document: PdfDocument | null;
  isLoading?: boolean;
}

export function PdfPreviewCard({ document, isLoading = false }: PdfPreviewCardProps) {
  const openSourcePanel = useSourcePanelStore((state) => state.openSourcePanel);

  if (isLoading || !document) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045] shadow-sm backdrop-blur-xl animate-pulse">
        <div className="grid gap-4 p-3 sm:grid-cols-[100px_minmax(0,1fr)] sm:p-4">
          <div className="grid aspect-[3/4] h-24 place-items-center rounded-xl bg-[#10141d]">
            <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-3 w-48 rounded bg-white/5" />
          </div>
        </div>
      </div>
    );
  }


  
  const effectiveStatus = document.ragStatus ?? document.status;
  const isReady = effectiveStatus === "ready";
  const isAiFailed = effectiveStatus === "failed";
  const isAiProcessing = effectiveStatus === "processing";

  return (
    <div className="group overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)),var(--surface-2)] shadow-[var(--shadow-md)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-lg)]">
      <div className="grid gap-4 p-3.5 sm:grid-cols-[108px_minmax(0,1fr)] sm:p-4">
        {}
        <button
          type="button"
          onClick={() => openSourcePanel(1)}
          className="grid aspect-[3/4] h-25 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--canvas)] text-[var(--accent)] shadow-inner transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="View document in Lumora"
        >
          <FileText size={32} />
        </button>

        {}
        <div className="flex flex-col justify-center min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(255,255,255,0.035)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              PDF document
            </span>
            {isReady && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--success)_20%,transparent)] bg-[var(--success-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                <CheckCircle2 size={10} />
                Ready
              </span>
            )}
            {isAiProcessing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-500 animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                Indexing
              </span>
            )}
            {isAiFailed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-[var(--danger)]">
                AI Failed
              </span>
            )}
          </div>

          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            {document.title}
          </h3>
          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
            {document.fileName}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-3 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium">
              <span>{document.pageCount} {document.pageCount === 1 ? "page" : "pages"}</span>
              <span className="text-[var(--border-strong)]">•</span>
              <span>{document.totalChunks} context blocks</span>
            </span>
            {document.fileUrl && (
              <button
                type="button"
                onClick={() => openSourcePanel(1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--accent-foreground)] shadow-sm transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-3)] active:scale-[0.98]"
              >
                <Eye size={13} />
                View document
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

