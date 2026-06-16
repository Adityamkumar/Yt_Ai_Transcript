import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { MessageBubble } from './MessageBubble';
import { SummaryMessage } from './chat/SummaryMessage';
import { NotesMessage } from './notes/NotesMessage';

interface MessageRendererProps {
  message: ChatMessageType;
  onEdit?: (messageId: string, newContent: string) => void;
  videoId?: string;
  isLatestAssistant?: boolean;
  userQuestion?: string;
  onSelectQuestion?: (question: string) => void;
}

export function MessageRenderer({
  message,
  onEdit,
  videoId,
  isLatestAssistant,
  userQuestion,
  onSelectQuestion,
}: MessageRendererProps) {
  if (message.type === 'notes') {
    return <NotesMessage message={message} videoId={videoId} />;
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
}


