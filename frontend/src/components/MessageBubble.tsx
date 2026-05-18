import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Check,
  Copy,
  RotateCcw,
  User,
  Pencil,
  SendHorizontal,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatBubbleVariants } from '@/animations/variants';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@/types';
import { formatRelativeTime } from '@/utils';
import { cn } from '@/utils/cn';

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  children?: React.ReactNode;
}

export function MessageBubble({ message, onRetry, onEdit, children }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isUser = message.role === 'user';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editValue]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [message.content]);

  const handleEdit = () => {
    if (isEditing) return;
    setEditValue(message.content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(message.content);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== message.content && onEdit) {
      onEdit(message._id, editValue);
    }
    setIsEditing(false);
  };

  return (
    <motion.article
      variants={chatBubbleVariants}
      initial="initial"
      animate="animate"
      className="group py-3.5 sm:py-4"
    >
      <div className={cn('chat-container flex gap-4 sm:gap-5', isUser && 'flex-row-reverse')}>
        <div className="mt-1 shrink-0">
          <div
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl border text-white',
              isUser
                ? 'border-white/[0.08] bg-white/[0.07]'
                : 'border-[rgba(139,156,255,0.28)] bg-[rgba(139,156,255,0.16)] text-[var(--accent)]'
            )}
          >
            {isUser ? <User size={18} /> : <Bot size={20} />}
          </div>
        </div>

        <div className={cn('min-w-0 flex-1', isUser && 'flex flex-col items-end')}>
          <div className={cn('max-w-full', isUser ? 'w-fit max-w-[88%]' : 'w-full')}>
            <div className={cn('mb-3 flex items-center gap-2.5 px-1', isUser && 'justify-end')}>
              <span className="text-[13px] font-semibold text-white/90">{isUser ? 'You' : 'EchoMind AI'}</span>
              <span className="text-[12px] text-white/40">
                {formatRelativeTime(message.createdAt)}
              </span>
            </div>

            <div
              className={cn(
                'relative rounded-3xl text-base leading-relaxed shadow-md transition-all duration-300',
                isUser
                  ? isEditing 
                    ? 'bg-white/[0.06] border border-white/15 p-1.5 w-full sm:min-w-[450px] lg:min-w-[550px]' 
                    : 'bg-white px-5 py-4 shadow-xl'
                  : 'border border-white/[0.1] bg-white/[0.06] px-5 py-5 text-white/95 backdrop-blur-2xl sm:px-6'
              )}
            >
              {isEditing ? (
                <div className="flex flex-col gap-3 p-1">
                  <textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-transparent p-3 text-white outline-none resize-none min-h-[120px] text-base leading-relaxed"
                    placeholder="Edit your message..."
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-3 p-3 border-t border-white/10">
                    <button
                      onClick={handleCancel}
                      className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!editValue.trim() || editValue === message.content}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-neutral-100 disabled:opacity-40"
                    >
                      <SendHorizontal size={16} />
                      Save & Send
                    </button>
                  </div>
                </div>
              ) : children ? (
                children
              ) : (
                <>
                  {message.isLoading ? (
                    message.content ? (
                      <div className="markdown-content streaming-content inline-block w-full text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} children={message.content} />
                        <span className="streaming-cursor" />
                      </div>
                    ) : (
                      <TypingIndicator />
                    )
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap text-base !text-black font-medium opacity-100">
                      {message.content}
                    </p>
                  ) : (
                    <div className="markdown-content text-base">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} children={message.content} />
                    </div>
                  )}
                </>
              )}
            </div>

            <AnimatePresence>
              {!message.isLoading && !isEditing && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-3 flex items-center gap-4 px-2",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-[12px] font-semibold text-white/40 transition hover:text-white"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  
                  {isUser && onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 text-[12px] font-semibold text-white/40 transition hover:text-white"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  )}

                  {message.error && onRetry && (
                    <button
                      onClick={() => onRetry(message._id)}
                      className="flex items-center gap-2 text-[12px] font-semibold text-rose-400/80 transition hover:text-rose-300"
                    >
                      <RotateCcw size={14} />
                      Retry
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
