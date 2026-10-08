import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Play, Youtube } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useYouTubePlayer } from '@/store/YouTubePlayerContext';

interface VideoCardProps {
  videoId: string;
  youtubeUrl: string;
  transcript?: any;
  isLoading?: boolean;
}

export function VideoCard({ videoId, youtubeUrl, transcript, isLoading = false }: VideoCardProps) {
  const { openPlayer } = useYouTubePlayer();
  const thumbnailUrl = videoId !== 'loading' ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  const canPlay = Boolean(youtubeUrl && videoId && videoId !== 'loading');

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
        'group overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)),var(--surface-2)] shadow-[var(--shadow-md)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-lg)]'
      )}
    >
      <div className="grid gap-4 p-3.5 sm:grid-cols-[156px_minmax(0,1fr)] sm:p-4">
        <button
          type="button"
          onClick={() => canPlay && openPlayer(videoId, 0)}
          disabled={!canPlay}
          className="relative aspect-video overflow-hidden rounded-xl bg-[var(--canvas)] text-left ring-1 ring-inset ring-[rgba(255,255,255,0.06)] transition-transform duration-300 enabled:cursor-pointer enabled:group-hover:scale-[1.015] enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-[var(--accent)] disabled:cursor-default"
          aria-label="Play video in Lumora"
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(event) => {
                (event.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
              }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Youtube size={28} className="text-[var(--text-muted)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,7,12,0.04),rgba(5,7,12,0.48))]" />
          {canPlay && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                <Play size={16} className="ml-0.5 fill-current" />
              </span>
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-col py-0.5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-[var(--border-soft)] bg-[rgba(255,255,255,0.035)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              YouTube source
            </span>
            {transcript && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--success)_20%,transparent)] bg-[var(--success-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                <CheckCircle2 size={10} />
                Ready
              </span>
            )}
          </div>

          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            {isLoading ? 'Extracting transcript...' : 'YouTube content context'}
          </h3>
          <p className="mt-1 truncate text-xs leading-5 text-[var(--text-muted)]">{youtubeUrl || `ID: ${videoId}`}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
              <FileText size={13} />
              Transcript ready
            </span>
            {canPlay && (
              <button
                type="button"
                onClick={() => openPlayer(videoId, 0)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--accent-foreground)] shadow-sm transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-3)] active:scale-[0.98]"
              >
                <Play size={12} className="fill-current" />
                Watch in Lumora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
