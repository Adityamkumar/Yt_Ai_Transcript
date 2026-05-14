import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isPending?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onStop, disabled, isPending, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isPending) return;

    onSend(trimmed);
    setValue('');
    requestAnimationFrame(resizeTextarea);
  }, [value, disabled, isPending, onSend, resizeTextarea]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [value, resizeTextarea]);

  useEffect(() => {
    if (window.innerWidth >= 768) textareaRef.current?.focus();
  }, []);

  const canSend = value.trim().length > 0 && !disabled && !isPending;
  const canStop = Boolean(isPending && onStop);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#050608] via-[#050608]/92 to-transparent pb-4 pt-12 sm:pb-6">
      <div className="chat-container pointer-events-auto">
        <div
          className={cn(
            'glass-surface rounded-[24px] p-2 transition duration-200',
            'focus-within:border-[rgba(139,156,255,0.34)] focus-within:shadow-[0_20px_70px_rgba(0,0,0,0.38),0_0_0_1px_rgba(139,156,255,0.08)]'
          )}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder ?? 'Message AI...'}
              disabled={disabled || isPending}
              rows={1}
              className="max-h-[180px] min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-45 sm:px-4"
            />

            <button
              onClick={isPending ? onStop : handleSend}
              disabled={!canSend && !canStop}
              aria-label={isPending ? 'Generating answer' : 'Send message'}
              className={cn(
                'mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition',
                canSend || canStop
                  ? 'bg-white text-neutral-950 shadow-sm hover:scale-[1.03] hover:bg-[#eef1ff]'
                  : 'cursor-not-allowed bg-white/[0.07] text-[var(--text-muted)]'
              )}
            >
              {isPending ? <Square size={15} fill="currentColor" /> : <ArrowUp size={19} />}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] leading-5 text-[var(--text-muted)]">
          AI responses can be incomplete. Verify important details against the source.
        </p>
      </div>
    </div>
  );
}
