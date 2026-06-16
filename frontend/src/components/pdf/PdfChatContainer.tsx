import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { usePdfChat } from "@/hooks/usePdfChat";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { MessageRenderer } from "../MessageRenderer";
import { ChatInput } from "../ChatInput";
import { PdfEmptyState } from "./PdfEmptyState";
import { PdfPreviewCard } from "./PdfPreviewCard";
import { PdfProcessingState } from "./PdfProcessingState";
import { PdfFailedState } from "./PdfFailedState";
import { PdfDocument } from "@/types";
import { WorkspaceAction } from "../workspace-actions/workspaceActionConfig";
import { pdfService } from "@/services/pdf.service";

interface PdfChatContainerProps {
  conversationId: string;
  pdf: PdfDocument;
  onActionReady?: (trigger: (action: WorkspaceAction) => void) => void;
}

const POLL_INTERVAL_MS = 4000;

/** Must match MAX_TOTAL_RETRIES on the backend (4 = 2 auto + 2 manual). */
const MAX_RETRIES_DISPLAY = 4;

/**
 * Derives the authoritative RAG status from a PdfDocument.
 * Falls back to `status` for documents that pre-date the ragStatus field.
 */
function resolveRagStatus(doc: PdfDocument): "processing" | "ready" | "failed" {
  return doc.ragStatus ?? doc.status;
}

export function PdfChatContainer({ conversationId, pdf, onActionReady }: PdfChatContainerProps) {
  const [livePdf, setLivePdf] = useState<PdfDocument>(pdf);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------- ragStatus derivation ----------
  const ragStatus = resolveRagStatus(livePdf);

  // ---------- Polling ----------
  const startPolling = useCallback(() => {
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(async () => {
      try {
        const { ragStatus: polledRagStatus, totalChunks, retryCount, maxRetries, cooldownUntil } = await pdfService.getPdfStatus(livePdf._id);
        setLivePdf((prev) => ({
          ...prev,
          ragStatus: polledRagStatus,
          status: polledRagStatus, // keep status in sync for legacy badge
          totalChunks,
          retryCount,
          cooldownUntil,
          // Store maxRetries as a transient field for the failed state UI
          ...(maxRetries !== undefined ? { _maxRetries: maxRetries } as any : {}),
        }));
        // Stop polling once we leave the processing state
        if (polledRagStatus !== "processing") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }
      } catch {
        // Silently retry next tick — network hiccup should not surface to user
      }
    }, POLL_INTERVAL_MS);
  }, [livePdf._id]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Sync if the parent passes a freshly-fetched pdf (e.g. after sidebar navigation)
  useEffect(() => {
    setLivePdf(pdf);
  }, [pdf._id, pdf.ragStatus, pdf.status]);

  // Start/stop polling based on current ragStatus
  useEffect(() => {
    if (ragStatus === "processing") {
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [ragStatus, startPolling, stopPolling]);

  // ---------- Handle retry: flip back to processing + restart poll ----------
  const handleRetryStarted = useCallback((newRetryCount?: number) => {
    setLivePdf((prev) => ({
      ...prev,
      ragStatus: "processing",
      status: "processing",
      cooldownUntil: undefined,
      ...(newRetryCount !== undefined ? { retryCount: newRetryCount } : {}),
    }));
    // Polling will auto-start via the useEffect above
  }, []);

  // ---------- Chat logic (only active when ragStatus === "ready") ----------
  const { messages, isLoading } = useMessages(conversationId);

  const {
    sendMessage,
    editMessage,
    generateNotes,
    generateSummary,
    triggerAction,
    stopStreaming,
    isStreaming,
    streamingMessage,
    isNotesRequest,
  } = usePdfChat(conversationId, livePdf._id);

  useEffect(() => {
    onActionReady?.(triggerAction);
  }, [triggerAction, onActionReady]);

  const streamingDisplayMessage = useMemo(() => {
    if (!isStreaming) return null;
    return {
      _id: "streaming",
      conversationId,
      role: "assistant",
      type: isNotesRequest ? "notes" : "chat",
      content: streamingMessage,
      isLoading: true,
      createdAt: "",
      updatedAt: "",
    } as any;
  }, [isStreaming, streamingMessage, isNotesRequest, conversationId]);

  const displayMessages = useMemo(
    () => (streamingDisplayMessage ? [...messages, streamingDisplayMessage] : messages),
    [messages, streamingDisplayMessage]
  );

  const lastAssistantMessageId = useMemo(() => {
    for (let i = displayMessages.length - 1; i >= 0; i--) {
      if (displayMessages[i].role === 'assistant') {
        return displayMessages[i]._id;
      }
    }
    return null;
  }, [displayMessages]);

  const getUserQuestionForMessage = useCallback((messageId: string) => {
    const msgIndex = displayMessages.findIndex(m => m._id === messageId);
    if (msgIndex === -1) return undefined;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (displayMessages[i].role === 'user') {
        return displayMessages[i].content;
      }
    }
    return undefined;
  }, [displayMessages]);

  const handleSelectSuggestedQuestion = useCallback((question: string) => {
    sendMessage(question, 'suggested_question');
  }, [sendMessage]);

  const bottomRef = useAutoScroll(displayMessages);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
      const canScroll = scrollHeight > clientHeight + 100;
      setShowScrollButton(!isNearBottom && canScroll);
    };
    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "auto" });
  };

  const handlePromptSelect = (text: string) => sendMessage(text);

  // ============================================================
  //  RAG STATUS SWITCH — the authoritative rendering gate
  // ============================================================

  if (ragStatus === "processing") {
    return <PdfProcessingState document={livePdf} />;
  }

  if (ragStatus === "failed") {
    return (
      <PdfFailedState
        document={livePdf}
        maxRetries={MAX_RETRIES_DISPLAY}
        onRetryStarted={handleRetryStarted}
      />
    );
  }

  // ragStatus === "ready" — render full AI workspace

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7C5CFF] border-t-transparent" />
      </div>
    );
  }

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain w-full"
      >
        {!hasMessages ? (
          <div className="flex flex-col gap-10 pb-40 pt-10 sm:pb-44 sm:pt-12">
            <PdfEmptyState
              onActionClick={handlePromptSelect}
              onGenerateNotes={generateNotes}
              onGenerateSummary={generateSummary}
            />
          </div>
        ) : (
          <div className="pb-36 pt-5 sm:pb-40 sm:pt-8">
            <div className="chat-container">
              <div className="mb-8 max-w-130">
                <PdfPreviewCard document={livePdf} />
              </div>

              <div className="mb-8">
                <PdfEmptyState
                  onActionClick={handlePromptSelect}
                  onGenerateNotes={generateNotes}
                  onGenerateSummary={generateSummary}
                  showIntro={false}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {displayMessages.map((message) => (
                <MessageRenderer
                  key={message._id}
                  message={message}
                  onEdit={editMessage}
                  isLatestAssistant={message._id === lastAssistantMessageId}
                  userQuestion={getUserQuestionForMessage(message._id)}
                  onSelectQuestion={handleSelectSuggestedQuestion}
                />
              ))}
              <div ref={bottomRef} className="h-2 w-full" />
            </div>
          </div>
        )}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-35 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#1A1A1A] text-white shadow-[0_8px_30px_rgb(0,0,0,0.6)] backdrop-blur-md transition-all hover:scale-110 hover:bg-[#252525] active:scale-95 sm:bottom-40"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      )}

      <ChatInput
        onSend={(message) => sendMessage(message)}
        onStop={stopStreaming}
        isPending={isStreaming}
        placeholder="Ask about the document..."
      />
    </section>
  );
}
