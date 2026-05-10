import { CheckCircle2, ExternalLink, FileText, Youtube } from 'lucide-react';
import { cn } from '@/utils/cn';

interface VideoCardProps {
  videoId: string;
  youtubeUrl: string;
  transcript?: string;
  isLoading?: boolean;
}

export function VideoCard({ videoId, youtubeUrl, transcript, isLoading = false }: VideoCardProps) {
  const thumbnailUrl = videoId !== 'loading' ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  return (
    <div
      className={cn(
        'cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045] shadow-sm backdrop-blur-xl',
        isLoading && 'animate-pulse'
      )}
    >
      <div className="grid gap-4 p-3 sm:grid-cols-[144px_minmax(0,1fr)] sm:p-4">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#10141d]">
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
              <Youtube size={30} className="text-[var(--text-muted)]" />
            </div>
          )}
        </div>

        <div className="min-w-0 py-0.5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.045] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
              Source
            </span>
            {transcript && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(52,211,153,0.1)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
                <CheckCircle2 size={12} />
                Indexed
              </span>
            )}
          </div>

          <h3 className="truncate text-sm font-semibold text-white">
            {isLoading ? 'Extracting transcript...' : 'YouTube content context'}
          </h3>
          <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{youtubeUrl || `ID: ${videoId}`}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={13} />
              Transcript ready
            </span>
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-white"
              >
                <ExternalLink size={13} />
                Open video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
