import { CheckCircle2, ExternalLink, FileText, Youtube } from 'lucide-react';
import { cn } from '@/utils/cn';

interface VideoCardProps {
  videoId: string;
  youtubeUrl: string;
  transcript?: any;
  isLoading?: boolean;
}

export function VideoCard({ videoId, youtubeUrl, transcript, isLoading = false }: VideoCardProps) {
  const thumbnailUrl = videoId !== 'loading' ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] backdrop-blur-lg transition-colors hover:border-[var(--border-medium)]',
        isLoading && 'shimmer-loader'
      )}
    >
      <div className="grid gap-4 p-3 sm:grid-cols-[144px_minmax(0,1fr)] sm:p-4">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[var(--canvas)]">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="h-full w-full object-cover"
              onError={(event) => {
                (event.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
              }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Youtube size={28} className="text-[var(--text-muted)]" />
            </div>
          )}
        </div>

        <div className="min-w-0 py-0.5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
              Source
            </span>
            {transcript && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
                <CheckCircle2 size={11} />
                Indexed
              </span>
            )}
          </div>

          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {isLoading ? 'Extracting transcript...' : 'YouTube content context'}
          </h3>
          <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{youtubeUrl || `ID: ${videoId}`}</p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={12} />
              Transcript ready
            </span>
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text-primary)]"
              >
                <ExternalLink size={12} />
                Open video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
