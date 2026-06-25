import React, { lazy, Suspense } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { MessageBubble } from './MessageBubble';
import { SummaryMessage } from './chat/SummaryMessage';

const NotesMessage = lazy(() => import('./notes/NotesMessage').then(m => ({ default: m.NotesMessage })));

interface MessageRendererProps {
  message: ChatMessageType;
  onEdit?: (messageId: string, newContent: string) => void;
  videoId?: string;
  isLatestAssistant?: boolean;
  userQuestion?: string;
  onSelectQuestion?: (question: string) => void;
}

export const MessageRenderer = React.memo(function MessageRenderer({
  message,
  onEdit,
  videoId,
  isLatestAssistant,
  userQuestion,
  onSelectQuestion,
}: MessageRendererProps) {
  if (message.type === 'notes') {
    return (
      <Suspense fallback={
        <div className="flex h-20 items-center justify-center text-xs text-[var(--text-muted)] animate-pulse border border-[var(--border-soft)] bg-[var(--surface-3)] rounded-2xl p-4">
          Loading notes editor...
        </div>
      }>
        <NotesMessage
          message={message}
          videoId={videoId}
          isLatestAssistant={isLatestAssistant}
          userQuestion={userQuestion}
          onSelectQuestion={onSelectQuestion}
        />
      </Suspense>
    );
  }

  if (message.type === 'summary') {
    return (
      <MessageBubble
        message={message}
        onEdit={onEdit}
        isLatestAssistant={isLatestAssistant}
        userQuestion={userQuestion}
        onSelectQuestion={onSelectQuestion}
      >
        <SummaryMessage message={message} videoId={videoId} />
      </MessageBubble>
    );
  }

  return (
    <MessageBubble
      message={message}
      onEdit={onEdit}
      isLatestAssistant={isLatestAssistant}
      userQuestion={userQuestion}
      onSelectQuestion={onSelectQuestion}
    />
  );
});


