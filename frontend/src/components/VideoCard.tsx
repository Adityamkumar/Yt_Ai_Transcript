import { motion } from 'framer-motion';
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

  if (isLoading) {
    return (
      <div className="premium-card premium-card-hover relative overflow-hidden rounded-2xl border border-[rgba(157,165,255,0.14)] bg-[rgba(255,255,255,0.03)] p-3.5 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(157,165,255,0.08),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(77,162,255,0.06),transparent_26%)] pointer-events-none" />
        <div className="relative grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
            <div className="absolute inset-0 shimmer-loader opacity-50" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-[rgba(157,165,255,0.16)] bg-[rgba(8,9,12,0.55)]">
                <Youtube size={20} className="text-[var(--accent)]" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                Source
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(157,165,255,0.1)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Processing
              </span>
            </div>

            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Extracting transcript and preparing context
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              We’re converting the video into a grounded workspace.
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <motion.div
                className="h-full w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(157,165,255,0.7),rgba(77,162,255,0.95),rgba(157,165,255,0.7))]"
                animate={{ x: ['-30%', '110%'] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] backdrop-blur-lg transition-colors hover:border-[var(--border-medium)]'
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
