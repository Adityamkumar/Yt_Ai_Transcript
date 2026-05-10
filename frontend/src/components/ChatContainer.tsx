import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useAppStore';
import { useChat } from '@/hooks/useChat';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { VideoCard } from './VideoCard';

interface ChatContainerProps {
  sessionId: string;
  videoId: string;
}

export function ChatContainer({ sessionId, videoId }: ChatContainerProps) {
  const { state } = useStore();
  const session = state.sessions.find((item) => item.id === sessionId);
  const { sendMessage, stopStreaming, isPending } = useChat(sessionId);
  const bottomRef = useAutoScroll(session?.messages ?? []);

  if (!session) return null;

  const hasMessages = session.messages.length > 0;

  const handlePromptSelect = (text: string) => {
    sendMessage(text, videoId);
  };

  const handleRetry = (assistantMessageId: string) => {
    const index = session.messages.findIndex((message) => message.id === assistantMessageId);
    const previousUserMessage = [...session.messages.slice(0, index)]
      .reverse()
      .find((message) => message.role === 'user');

    if (previousUserMessage) {
      sendMessage(previousUserMessage.content, videoId);
    }
  };

  return (
    <section className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
        {!hasMessages ? (
          <EmptyState hasTranscript onPromptSelect={handlePromptSelect} />
        ) : (
          <div className="pb-36 pt-5 sm:pb-40 sm:pt-8">
            <div className="chat-container">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 max-w-[520px]"
              >
                <VideoCard videoId={videoId} youtubeUrl={session.videoUrl} transcript="loaded" />
              </motion.div>
            </div>

            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {session.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} onRetry={handleRetry} />
                ))}
              </AnimatePresence>
            </div>

            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>

      <ChatInput
        onSend={(message) => sendMessage(message, videoId)}
        onStop={stopStreaming}
        isPending={isPending}
        placeholder="Ask about the video..."
      />
    </section>
  );
}
