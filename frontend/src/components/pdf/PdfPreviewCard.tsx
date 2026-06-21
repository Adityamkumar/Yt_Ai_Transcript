import { CheckCircle2, FileText, ExternalLink, Loader2 } from "lucide-react";
import { PdfDocument } from "@/types";
import { cn } from "@/utils/cn";

interface PdfPreviewCardProps {
  document: PdfDocument | null;
  isLoading?: boolean;
}

export function PdfPreviewCard({ document, isLoading = false }: PdfPreviewCardProps) {
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045] shadow-sm backdrop-blur-xl">
      <div className="grid gap-4 p-3 sm:grid-cols-[100px_minmax(0,1fr)] sm:p-4">
        {}
        <div className="grid aspect-[3/4] h-24 place-items-center rounded-xl bg-[#10141d] border border-white/[0.06] text-[var(--accent)]">
          <FileText size={32} />
        </div>

        {}
        <div className="flex flex-col justify-center min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.045] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
              Document
            </span>
            {isReady && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(52,211,153,0.1)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
                <CheckCircle2 size={12} />
                Indexed
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

          <h3 className="truncate text-sm font-semibold text-white">
            {document.title}
          </h3>
          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
            {document.fileName}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
            <span>{document.pageCount} {document.pageCount === 1 ? "page" : "pages"}</span>
            <span>•</span>
            <span>{document.totalChunks} context blocks</span>
            {document.fileUrl && (
              <>
                <span>•</span>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition hover:text-white text-[var(--accent)] font-medium"
                >
                  <ExternalLink size={12} />
                  Open original
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

