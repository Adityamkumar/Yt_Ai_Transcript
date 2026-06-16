import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { MessageRenderer } from "./MessageRenderer";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { VideoCard } from "./VideoCard";
import { VideoData } from "@/types";
import { WorkspaceAction } from "./workspace-actions/workspaceActionConfig";

interface ChatContainerProps {
  conversationId: string;
  video: VideoData;
  onActionReady?: (trigger: (action: WorkspaceAction) => void) => void;
}

export function ChatContainer({ conversationId, video, onActionReady }: ChatContainerProps) {
  const { messages, isLoading } = useMessages(conversationId);

  const targetVideoId =
    video?.youtubeVideoId || (typeof video === "string" ? video : "");

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
  } = useChat(conversationId, targetVideoId);

  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const displayMessages = useMemo(() => {
    return streamingDisplayMessage
      ? [...messages, streamingDisplayMessage]
      : messages;
  }, [messages, streamingDisplayMessage]);

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

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "auto",
    });
  };

  const handlePromptSelect = (text: string) => {
    sendMessage(text);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--accent)] border-t-transparent" />
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
            <EmptyState
              hasTranscript
              onPromptSelect={handlePromptSelect}
              onNotesClick={generateNotes}
              onSummaryClick={generateSummary}
              isLoadingNotes={isStreaming}
            />
          </div>
        ) : (
          <div className="pb-36 pt-5 sm:pb-40 sm:pt-8">
            <div className="chat-container">
              <div className="mb-8 max-w-130">
                <VideoCard
                  videoId={video?.youtubeVideoId || "loading"}
                  youtubeUrl={video?.youtubeUrl || ""}
                  transcript="loaded"
                />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              {displayMessages.map((message) => (
                <MessageRenderer
                  key={message._id}
                  message={message}
                  onEdit={editMessage}
                  videoId={video?.youtubeVideoId}
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
          className="absolute bottom-35 left-1/2 z-50 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--border-medium)] bg-[var(--canvas)] text-[var(--text-primary)] shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-[var(--surface-hover)] active:scale-95 sm:bottom-40"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      <ChatInput
        onSend={(message) => sendMessage(message)}
        onStop={stopStreaming}
        isPending={isStreaming}
        placeholder="Ask about the video..."
      />
    </section>
  );
}
