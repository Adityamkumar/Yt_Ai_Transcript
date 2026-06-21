import { Children, cloneElement, isValidElement, useCallback, useState, useRef, useEffect } from 'react';
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
import { stripMarkdown } from '@/utils/stripMarkdown';
import { fixInlineLists } from '@/utils/fixInlineLists';
import { useFollowUpQuestions } from '@/hooks/useFollowUpQuestions';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import { CodeBlock } from './chat/CodeBlock';
import { CitationChip } from './chat/CitationChip';

export function renderCitations(content: string): string {
  if (!content) return content;
  return content.replace(
    /(\[[^\]]+\]\([^)]+\))|((?:\bSource:\s*)?(?:\(\s*)?\bPage\s*(?::\s*|\s+)(\d+)\b\s*\)?)/gi,
    (match, link, pagePattern, pageNum) => {
      if (link) return link;
      return `[📄 Page ${pageNum}](citation:${pageNum})`;
    }
  );
}

export function urlTransform(url: string): string {
  if (url.startsWith('citation:')) return url;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:' ||
      parsed.protocol === 'citation:'
    ) {
      return url;
    }
  } catch {
    if (url.startsWith('/') || url.startsWith('citation:')) {
      return url;
    }
  }
  return '';
}

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  children?: React.ReactNode;
  isLatestAssistant?: boolean;
  userQuestion?: string;
  onSelectQuestion?: (question: string) => void;
}

export function MessageBubble({
  message,
  onRetry,
  onEdit,
  children,
  isLatestAssistant,
  userQuestion,
  onSelectQuestion,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isUser = message.role === 'user';

  const { questions, isLoading: isLoadingSuggestions } = useFollowUpQuestions(
    message,
    isLatestAssistant || false,
    userQuestion
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editValue]);

  const copyToClipboard = useCallback(async () => {
    try {
      const cleaned = stripMarkdown(message.content);
      await navigator.clipboard.writeText(cleaned);
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

  const highlightInlineCodeInText = (text: string) => {
    const codeLikePattern = /(\b[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)+\([^()\n]{0,120}\))/g;
    const segments = text.split(codeLikePattern);

    return segments.map((segment, index) => {
      if (index % 2 === 1) {
        return (
          <code key={`auto-code-${index}`} className="font-mono text-[0.85em]">
            {segment}
          </code>
        );
      }
      return segment;
    });
  };

  const highlightInlineCodeNodes = (node: any): any => {
    if (typeof node === 'string') {
      return highlightInlineCodeInText(node);
    }

    if (Array.isArray(node)) {
      return node.map((child) => highlightInlineCodeNodes(child));
    }

    if (isValidElement(node)) {
      const element = node as any;
      const typeName = typeof element.type === 'string' ? element.type : '';
      if (
        typeName === 'code' ||
        typeName === 'pre' ||
        typeName === 'a' ||
        typeof element.type === 'function'
      ) {
        return node;
      }

      const originalChildren = element.props?.children;
      if (!originalChildren) {
        return node;
      }

      return cloneElement(element, {
        ...element.props,
        children: Children.map(originalChildren, (child) => highlightInlineCodeNodes(child)),
      });
    }

    return node;
  };

  const markdownComponents = {
    pre: ({ children }: any) => <>{children}</>,
    code: ({ className, children, ...props }: any) => {
      const language = typeof className === 'string' ? className.replace('language-', '') : '';
      const isBlockCode = Boolean(language) || (typeof children === 'string' && children.includes('\n'));

      if (isBlockCode) {
        return <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />;
      }

      return (
        <code
          className={cn(
            'inline rounded-md border border-[var(--border-soft)] bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--text-primary)]',
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    },
    p: ({ children }: any) => <p>{Children.map(children, (child) => highlightInlineCodeNodes(child))}</p>,
    li: ({ children }: any) => <li>{Children.map(children, (child) => highlightInlineCodeNodes(child))}</li>,
    a: ({ href, children, ...props }: any) => {
      const url = href || '';
      if (url.startsWith('citation:') || url.startsWith('unsafe:citation:')) {
        const pageNum = parseInt(url.replace(/^(?:unsafe:)?citation:/i, ''), 10);
        if (!isNaN(pageNum)) {
          return <CitationChip page={pageNum} />;
        }
      }
      return (
        <a href={href} className="text-[var(--accent)] hover:underline" {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <motion.article
      variants={chatBubbleVariants}
      initial="initial"
      animate="animate"
      className="group py-3 sm:py-4"
    >
      <div className={cn('chat-container flex gap-3 sm:gap-5', isUser && 'flex-row-reverse')}>
        {/* Avatar */}
        <div className="mt-1 shrink-0">
          <div
            className={cn(
              'grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl border',
              isUser
                ? 'border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--text-primary)]'
                : 'border-[rgba(139,156,247,0.20)] bg-[var(--accent-subtle)] text-[var(--accent)]'
            )}
          >
            {isUser ? <User size={15} className="sm:w-[17px] sm:h-[17px]" /> : <Bot size={16} className="sm:w-[18px] sm:h-[18px]" />}
          </div>
        </div>

        {/* Content */}
        <div className={cn('min-w-0 flex-1', isUser && 'flex flex-col items-end')}>
          <div className={cn(isUser ? 'w-fit max-w-[90%] sm:max-w-[75%] md:max-w-[65%]' : 'w-full')}>
            {/* Meta */}
            <div className={cn('mb-2.5 flex items-center gap-2 px-1', isUser && 'justify-end')}>
              <span className="text-[13px] font-semibold text-[var(--text-primary)]/85">{isUser ? 'You' : 'EchoMind AI'}</span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {formatRelativeTime(message.createdAt)}
              </span>
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'relative rounded-2xl text-[16px] leading-relaxed transition-all',
                isUser
                  ? isEditing
                    ? 'bg-[var(--surface-3)] border border-[var(--border-medium)] p-1.5 w-full sm:min-w-[450px] lg:min-w-[550px]'
                    : 'bg-[var(--text-primary)] px-4 py-3 sm:px-5 sm:py-4 shadow-md w-full'
                  : 'border border-[var(--border-soft)] bg-[var(--surface-3)] px-4 py-3 sm:px-6 sm:py-4 text-[var(--text-primary)]/95 backdrop-blur-md'
              )}
            >
              {isEditing ? (
                <div className="flex flex-col gap-3 p-1">
                  <textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-transparent p-3 text-[var(--text-primary)] outline-none resize-none min-h-[120px] text-[16px] leading-relaxed"
                    placeholder="Edit your message..."
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-3 p-3 border-t border-[var(--border-soft)]">
                    <button
                      onClick={handleCancel}
                      className="inline-flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    >
                      <X size={15} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!editValue.trim() || editValue === message.content}
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-[var(--text-primary)] px-4 text-sm font-semibold text-[var(--canvas)] transition-all hover:opacity-90 disabled:opacity-40"
                    >
                      <SendHorizontal size={15} />
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
                      <div className="markdown-content streaming-content inline-block w-full text-[16px]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                          urlTransform={urlTransform}
                          children={renderCitations(fixInlineLists(message.content))}
                        />
                        <span className="streaming-cursor" />
                      </div>
                    ) : (
                      <TypingIndicator />
                    )
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap text-[16px] !text-[#111827] font-medium opacity-100">
                      {message.content}
                    </p>
                  ) : (
                    <div className="markdown-content text-[16px]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                        urlTransform={urlTransform}
                        children={renderCitations(fixInlineLists(message.content))}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Follow-up Questions */}
            {!isUser && !message.isLoading && !isEditing && onSelectQuestion && (
              <FollowUpQuestions
                questions={questions}
                isLoading={isLoadingSuggestions}
                onSelectQuestion={onSelectQuestion}
              />
            )}

            {/* Actions */}
            <AnimatePresence>
              {!message.isLoading && !isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className={cn(
                    "mt-2.5 flex items-center gap-3.5 px-1",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  {isUser && onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                  )}

                  {message.error && onRetry && (
                    <button
                      onClick={() => onRetry(message._id)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--danger)]/70 transition-colors hover:text-[var(--danger)]"
                    >
                      <RotateCcw size={13} />
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
