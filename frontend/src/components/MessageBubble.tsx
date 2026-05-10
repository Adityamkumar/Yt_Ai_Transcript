import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Check, Copy, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatBubbleVariants } from '@/animations/variants';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@/types';
import { formatRelativeTime } from '@/utils';
import { cn } from '@/utils/cn';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  }, [message.content]);

  return (
    <motion.article
      variants={chatBubbleVariants}
      initial="initial"
      animate="animate"
      className="group px-4 py-4 sm:px-6 sm:py-5"
    >
      <div className={cn('chat-container flex gap-3 sm:gap-4', isUser && 'flex-row-reverse')}>
        <div className="mt-0.5 shrink-0">
          <div
            className={cn(
              'grid h-8 w-8 place-items-center rounded-xl border text-white',
              isUser
                ? 'border-white/[0.08] bg-white/[0.07] text-[var(--text-secondary)]'
                : 'border-[rgba(139,156,255,0.28)] bg-[rgba(139,156,255,0.16)] text-[var(--accent)]'
            )}
          >
            {isUser ? <User size={15} /> : <Bot size={16} />}
          </div>
        </div>

        <div className={cn('min-w-0 flex-1', isUser && 'flex justify-end')}>
          <div className={cn('max-w-full', isUser ? 'w-fit max-w-[86%]' : 'w-full')}>
            <div className={cn('mb-2 flex items-center gap-2 px-1', isUser && 'justify-end')}>
              <span className="text-xs font-medium text-white">{isUser ? 'You' : 'EchoMind'}</span>
              <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(message.timestamp)}</span>
            </div>

            <div
              className={cn(
                'relative rounded-2xl text-[15px] leading-7 shadow-sm',
                isUser
                  ? 'bg-white text-neutral-950 px-4 py-3'
                  : 'border border-white/[0.08] bg-white/[0.045] px-4 py-4 text-[var(--text-secondary)] backdrop-blur-xl sm:px-5'
              )}
            >
              {message.isLoading ? (
                <TypingIndicator />
              ) : isUser ? (
                <p className="user-message-text whitespace-pre-wrap text-[15px] leading-7">
                  {message.content}
                </p>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              )}

              {!isUser && !message.isLoading && (
                <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
