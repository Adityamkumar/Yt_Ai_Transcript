import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useChat } from '@/hooks/useChat';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageRenderer } from './MessageRenderer';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { VideoCard } from './VideoCard';
import { VideoData } from '@/types';

interface ChatContainerProps {
  conversationId: string;
  video: VideoData;
}

export function ChatContainer({ conversationId, video }: ChatContainerProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const targetVideoId = video?.youtubeVideoId || (typeof video === 'string' ? video : '');
  const { sendMessage, editMessage, generateNotes, isStreaming, streamingMessage, isNotesRequest } = useChat(conversationId, targetVideoId);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayMessages = [...messages];
  if (isStreaming) {
    displayMessages.push({
      _id: 'streaming',
      conversationId,
      role: 'assistant',
      type: isNotesRequest ? 'notes' : 'chat',
      content: streamingMessage,
      isLoading: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
  }

  const bottomRef = useAutoScroll(displayMessages);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      const canScroll = scrollHeight > clientHeight + 100;
      setShowScrollButton(!isNearBottom && canScroll);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, isStreaming]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handlePromptSelect = (text: string) => {
    sendMessage(text);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <section className="relative flex h-full min-h-0 flex-col">
      <div 
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {!hasMessages ? (
          <div className="flex flex-col gap-10 pb-40 pt-10 sm:pb-44 sm:pt-12">
            <EmptyState 
              hasTranscript 
              onPromptSelect={handlePromptSelect} 
              onNotesClick={generateNotes}
              isLoadingNotes={isStreaming}
            />
          </div>
        ) : (
          <div className="pb-36 pt-5 sm:pb-40 sm:pt-8">
            <div className="chat-container">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 max-w-[520px]"
              >
                <VideoCard 
                  videoId={video?.youtubeVideoId || 'loading'} 
                  youtubeUrl={video?.youtubeUrl || ''} 
                  transcript="loaded" 
                />
              </motion.div>
            </div>

            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {displayMessages.map((message) => (
                  <MessageRenderer 
                    key={message._id} 
                    message={message} 
                    onEdit={editMessage}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-[140px] left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#1A1A1A] text-white shadow-[0_8px_30px_rgb(0,0,0,0.6)] backdrop-blur-md transition-all hover:bg-[#252525] hover:scale-110 active:scale-95 sm:bottom-[160px]"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatInput
        onSend={(message) => sendMessage(message)}
        onStop={() => {}}
        isPending={isStreaming}
        placeholder="Ask about the video..."
      />
    </section>
  );
}
