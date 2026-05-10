import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';

export function useAutoScroll(messages: ChatMessage[]) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return bottomRef;
}
