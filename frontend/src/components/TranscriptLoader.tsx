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
      <div className="glass-surface rounded-[var(--radius-2xl)] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:px-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[rgba(239,68,68,0.10)] text-red-400">
              <Youtube size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Add source video</p>
              <p className="text-[11px] text-[var(--text-muted)]">Paste a YouTube URL to create a chat workspace.</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col gap-3 rounded-[var(--radius-xl)] border bg-[var(--canvas)]/70 p-2 transition-all sm:flex-row sm:items-center',
            isValid && !isLoading
              ? 'border-[rgba(139,156,247,0.28)] shadow-[0_0_0_1px_rgba(139,156,247,0.05),0_12px_48px_rgba(102,117,246,0.10)]'
              : 'border-[var(--border-soft)] focus-within:border-[var(--border-strong)]',
            showError && 'border-[rgba(248,113,113,0.45)]'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
            <LinkIcon size={17} className="shrink-0 text-[var(--text-muted)]" />
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
              className="h-12 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-all sm:w-auto',
              isValid && !isLoading
                ? 'bg-[var(--text-primary)] text-[var(--canvas)] hover:opacity-90'
                : 'cursor-not-allowed bg-[var(--surface-3)] text-[var(--text-muted)]'
            )}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-[var(--text-muted)]/30 border-t-[var(--canvas)] animate-spin" />
                Processing
              </>
            ) : (
              <>
                Analyze
                <ArrowRight size={15} />
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
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={14} />
              Enter a valid YouTube URL.
            </motion.p>
          )}
          {error && !showError && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={14} />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
