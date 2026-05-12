import { AnimatePresence, motion } from 'framer-motion';
import { useMessages } from '@/hooks/useMessages';
import { useChat } from '@/hooks/useChat';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { VideoCard } from './VideoCard';
import { IMessage, VideoData } from '@/types';

interface ChatContainerProps {
  conversationId: string;
  video: VideoData;
}

export function ChatContainer({ conversationId, video }: ChatContainerProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const targetVideoId = video?.youtubeVideoId || (typeof video === 'string' ? video : '');
  const { sendMessage, editMessage, isStreaming, streamingMessage } = useChat(conversationId, targetVideoId);
  
  const handleEdit = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  const displayMessages = [...messages];
  if (isStreaming) {
    displayMessages.push({
      _id: 'streaming',
      conversationId,
      role: 'assistant',
      content: streamingMessage,
      isLoading: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
  }

  const bottomRef = useAutoScroll(displayMessages);

  const hasMessages = messages.length > 0 || isStreaming;

  const handlePromptSelect = (text: string) => {
    sendMessage(text);
  };

  const handleRetry = (assistantMessageId: string) => {
    const index = messages.findIndex((message) => message._id === assistantMessageId);
    const previousUserMessage = [...messages.slice(0, index)]
      .reverse()
      .find((message) => message.role === 'user');

    if (previousUserMessage) {
      sendMessage(previousUserMessage.content);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                  <MessageBubble 
                    key={message._id} 
                    message={message} 
                    onRetry={handleRetry} 
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div ref={bottomRef} className="h-2" />
          </div>
        )}
      </div>

      <ChatInput
        onSend={(message) => sendMessage(message)}
        onStop={() => {}}
        isPending={isStreaming}
        placeholder="Ask about the video..."
      />
    </section>
  );
}
