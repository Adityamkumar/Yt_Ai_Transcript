import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { MessageBubble } from './MessageBubble';
import { NotesMessage } from './notes/NotesMessage';

interface MessageRendererProps {
  message: ChatMessageType;
  onEdit?: (messageId: string, newContent: string) => void;
}

export function MessageRenderer({ message, onEdit }: MessageRendererProps) {
  if (message.type === 'notes') {
    return <NotesMessage message={message} />;
  }

  return (
    <MessageBubble 
      message={message} 
      onEdit={onEdit} 
    />
  );
}
