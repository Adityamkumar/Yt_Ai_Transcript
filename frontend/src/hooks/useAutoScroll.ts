import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';

export function useAutoScroll(messages: ChatMessage[]) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!bottomRef.current) return;
      const container = bottomRef.current.parentElement;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      isAutoScrollEnabled.current = isAtBottom;
    };

    const container = bottomRef.current?.parentElement;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isAutoScrollEnabled.current) return;

    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages]);

  return bottomRef;
}
