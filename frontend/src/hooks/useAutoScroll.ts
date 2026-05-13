import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';

export function useAutoScroll(messages: ChatMessage[]) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);

  useEffect(() => {
    const container = bottomRef.current?.closest('.overflow-y-auto') || bottomRef.current?.parentElement;
    if (!container) return;

    // Native scroll anchoring for stability
    (container as HTMLElement).style.overflowAnchor = 'auto';

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 10px threshold is a good balance for detecting 'at the bottom'
      isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 10;
    };

    const manualPause = () => {
      isAutoScrollEnabled.current = false;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', manualPause, { passive: true });
    container.addEventListener('touchstart', manualPause, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', manualPause);
      container.removeEventListener('touchstart', manualPause);
    };
  }, []);

  // useLayoutEffect runs synchronously after all DOM mutations.
  // This is the best place to update scroll position to prevent jitter.
  useLayoutEffect(() => {
    const container = bottomRef.current?.closest('.overflow-y-auto') || bottomRef.current?.parentElement;
    if (!container || !isAutoScrollEnabled.current) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return bottomRef;
}
