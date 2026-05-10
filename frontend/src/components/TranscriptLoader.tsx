import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Link as LinkIcon, Youtube } from 'lucide-react';
import { isValidYouTubeUrl } from '@/utils';
import { cn } from '@/utils/cn';

interface TranscriptLoaderProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function TranscriptLoader({ onSubmit, isLoading = false, error }: TranscriptLoaderProps) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = isValidYouTubeUrl(url);
  const showError = touched && url.length > 0 && !isValid;

  const handleSubmit = useCallback(() => {
    if (!isValid || isLoading) return;
    onSubmit(url.trim());
  }, [isValid, isLoading, onSubmit, url]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSubmit();
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="glass-surface rounded-[24px] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:px-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[rgba(239,68,68,0.12)] text-red-400">
              <Youtube size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Add source video</p>
              <p className="text-xs text-[var(--text-muted)]">Paste a YouTube URL to create a chat workspace.</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col gap-3 rounded-[20px] border bg-[#070a10]/72 p-2 transition sm:flex-row sm:items-center',
            isValid && !isLoading
              ? 'border-[rgba(139,156,255,0.36)] shadow-[0_0_0_1px_rgba(139,156,255,0.06),0_16px_60px_rgba(102,117,246,0.14)]'
              : 'border-white/[0.08] focus-within:border-white/[0.18]',
            showError && 'border-[rgba(251,113,133,0.52)]'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
            <LinkIcon size={18} className="shrink-0 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setTouched(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isLoading}
              className="h-12 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className={cn(
              'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition sm:w-auto',
              isValid && !isLoading
                ? 'bg-white text-neutral-950 shadow-sm hover:bg-[#eef1ff]'
                : 'cursor-not-allowed bg-white/[0.06] text-[var(--text-muted)]'
            )}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-neutral-500/25 border-t-neutral-900 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Analyze
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-5 text-center">
        <AnimatePresence mode="wait">
          {showError && (
            <motion.p
              key="invalid"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="inline-flex items-center gap-2 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={15} />
              Enter a valid YouTube URL.
            </motion.p>
          )}
          {error && !showError && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="inline-flex items-center gap-2 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={15} />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
