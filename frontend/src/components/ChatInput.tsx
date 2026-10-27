import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/utils/cn";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isPending?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onStop, disabled, isPending, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isPending) return;

    onSend(trimmed);
    setValue("");
    requestAnimationFrame(resizeTextarea);
  }, [value, disabled, isPending, onSend, resizeTextarea]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
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
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-4 pt-6 sm:pb-6">
      <div className="chat-container pointer-events-auto">
        <div
          className={cn(
            "rounded-[22px] border border-white/15 bg-[#151515] px-2 py-1.5 transition-colors",
            "focus-within:border-white/25",
          )}
        >
          <div className="flex items-end gap-1.5">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder ?? "Message AI..."}
              disabled={disabled || isPending}
              rows={1}
              className="max-h-45 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-45 sm:px-3"
            />

            <button
              onClick={isPending ? onStop : handleSend}
              disabled={!canSend && !canStop}
              aria-label={isPending ? "Generating answer" : "Send message"}
              className={cn(
                "mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all",
                canSend || canStop
                  ? "bg-[#e8e8e8] text-[#141414] hover:bg-white"
                  : "cursor-not-allowed bg-white/[0.06] text-[var(--text-muted)]",
              )}
            >
              {isPending ? <Square size={14} fill="currentColor" /> : <ArrowUp size={18} />}
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
