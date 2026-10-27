import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useState,
  useRef,
  useEffect,
  lazy,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatBubbleVariants } from "@/animations/variants";
import type { ChatMessage } from "@/types";
import { cn } from "@/utils/cn";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { fixInlineLists } from "@/utils/fixInlineLists";
import { useFollowUpQuestions } from "@/hooks/useFollowUpQuestions";
import { FollowUpQuestions } from "@/components/chat/FollowUpQuestions";
const CodeBlock = lazy(() => import("./chat/CodeBlock").then((m) => ({ default: m.CodeBlock })));
import { CitationChip } from "./chat/CitationChip";
import { ReasoningSteps } from "./reasoning-steps";

const reasoningMessages = [
  "Reviewing the context",
  "Finding the most useful details",
  "Connecting ideas from your source",
  "Preparing a clear answer",
];

export function renderCitations(content: string): string {
  if (!content) return content;
  return content.replace(
    /(\[[^\]]+\]\([^)]+\))|((?:\bSource:\s*)?(?:\(\s*)?\bPage\s*(?::\s*|\s+)(\d+)\b\s*\)?)/gi,
    (match, link, pagePattern, pageNum) => {
      if (link) return link;
      return `[📄 Page ${pageNum}](citation:${pageNum})`;
    },
  );
}

export function urlTransform(url: string): string {
  if (url.startsWith("citation:")) return url;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:" ||
      parsed.protocol === "tel:" ||
      parsed.protocol === "citation:"
    ) {
      return url;
    }
  } catch {
    if (url.startsWith("/") || url.startsWith("citation:")) {
      return url;
    }
  }
  return "";
}

interface MessageBubbleProps {
  message: ChatMessage;
  onEdit?: (messageId: string, content: string) => void;
  children?: React.ReactNode;
  isLatestAssistant?: boolean;
  userQuestion?: string;
  onSelectQuestion?: (question: string) => void;
}

export function MessageBubble({
  message,
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

  const isUser = message.role === "user";

  const { questions, isLoading: isLoadingSuggestions } = useFollowUpQuestions(
    message,
    isLatestAssistant || false,
    userQuestion,
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
    if (typeof node === "string") {
      return highlightInlineCodeInText(node);
    }

    if (Array.isArray(node)) {
      return node.map((child) => highlightInlineCodeNodes(child));
    }

    if (isValidElement(node)) {
      const element = node as any;
      const typeName = typeof element.type === "string" ? element.type : "";
      if (
        typeName === "code" ||
        typeName === "pre" ||
        typeName === "a" ||
        typeof element.type === "function"
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
      const language = typeof className === "string" ? className.replace("language-", "") : "";
      const isBlockCode =
        Boolean(language) || (typeof children === "string" && children.includes("\n"));

      if (isBlockCode) {
        const rawCode = String(children).replace(/\n$/, "");
        return (
          <Suspense
            fallback={
              <div className="my-4 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[#0b0e14] shadow-lg">
                <div className="flex h-11 items-center justify-between border-b border-[var(--border-soft)] bg-[#0e121a] px-4 text-xs font-medium text-[var(--text-secondary)] select-none">
                  <div className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-[var(--border-soft)] bg-[#111622]/65 text-[var(--text-secondary)] font-sans text-[11px] font-medium tracking-wide">
                    {language || "Code"}
                  </div>
                </div>
                <div className="relative overflow-x-auto pl-6 pr-4 py-4 font-mono text-[13px] leading-relaxed no-scrollbar max-w-full">
                  <pre className="whitespace-pre text-gray-100">{rawCode}</pre>
                </div>
              </div>
            }
          >
            <CodeBlock code={rawCode} language={language} />
          </Suspense>
        );
      }

      return (
        <code
          className={cn(
            "inline rounded-md border border-[var(--border-soft)] bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--text-primary)]",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    },
    p: ({ children }: any) => (
      <p>{Children.map(children, (child) => highlightInlineCodeNodes(child))}</p>
    ),
    li: ({ children }: any) => (
      <li>{Children.map(children, (child) => highlightInlineCodeNodes(child))}</li>
    ),
    a: ({ href, children, ...props }: any) => {
      const url = href || "";
      if (url.startsWith("citation:") || url.startsWith("unsafe:citation:")) {
        const pageNum = parseInt(url.replace(/^(?:unsafe:)?citation:/i, ""), 10);
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

  if (message.isLoading && !message.content) {
    return (
      <motion.article
        variants={chatBubbleVariants}
        initial="initial"
        animate="animate"
        className="py-3 sm:py-4"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[900px]">
          <ReasoningSteps messages={reasoningMessages} />
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={chatBubbleVariants}
      initial="initial"
      animate="animate"
      className="group py-3 sm:py-4"
    >
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[900px]">
        {/* Content */}
        <div className={cn("min-w-0", isUser && "flex flex-col items-end")}>
          <div
            className={cn(
              isUser
                ? isEditing
                  ? "w-md max-w-full"
                  : "w-fit max-w-[90%] sm:max-w-[85%]"
                : "w-full max-w-[900px]",
            )}
          >
            {isEditing ? (
              <>
                  <textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="min-h-0 w-md max-w-full resize-none rounded-[18px] border-0 bg-[#242424] px-3.5 py-2.5 text-[15px]/6 text-[#f0f2f7] outline-none focus-visible:ring-0"
                    placeholder="Edit your message..."
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5 self-end">
                    <button
                      onClick={handleCancel}
                      className="inline-flex h-9 items-center rounded-full bg-[#252525] px-3 text-sm font-medium text-[#9ca3af] transition-colors hover:bg-[#303030]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!editValue.trim()}
                      className="inline-flex h-9 items-center rounded-full bg-[#e5e5e5] px-3.5 text-sm font-medium text-[#111827] transition-colors hover:bg-white disabled:opacity-40"
                    >
                      Send
                    </button>
                  </div>
              </>
            ) : (
              /* Starter chat-02 user bubble and clean assistant message. */
              <div
                className={cn(
                  "relative rounded-[18px] text-[15px] leading-[1.5] transition-all",
                  isUser
                    ? "w-fit bg-[#242424] px-3.5 py-2.5 text-[#f0f2f7]"
                    : "px-1 py-1 text-[var(--text-secondary)]",
                )}
              >
                {children ? children : (
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
                    ) : null
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap text-[15px] leading-[1.5] !text-white font-medium opacity-100">
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
            )}

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
                    "mt-2.5 flex items-center gap-0.5 px-1",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    aria-label={copied ? "Copied" : "Copy message"}
                    title={copied ? "Copied" : "Copy"}
                    className="inline-flex size-7 items-center justify-center rounded-md text-[#a3a3a3] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>

                  {isUser && onEdit && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      aria-label="Edit message"
                      title="Edit"
                      className="inline-flex size-7 items-center justify-center rounded-md text-[#a3a3a3] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    >
                      <Pencil size={14} />
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
