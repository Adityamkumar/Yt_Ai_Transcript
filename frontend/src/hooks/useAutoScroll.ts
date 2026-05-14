import { useEffect, useLayoutEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

export function useAutoScroll(messages: ChatMessage[]) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const autoScrollEnabledRef = useRef(true);

  const userScrollingRef = useRef(false);

  const programmaticScrollRef = useRef(false);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container =
      bottomRef.current?.closest(".overflow-y-auto") ||
      bottomRef.current?.parentElement;

    if (!container) return;

    const handleScroll = () => {
      if (programmaticScrollRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      const distanceFromBottom =
        scrollHeight - scrollTop - clientHeight;

      const isNearBottom = distanceFromBottom < 150;

      autoScrollEnabledRef.current = isNearBottom;

      userScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false;
      }, 120);
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const container =
      bottomRef.current?.closest(".overflow-y-auto") ||
      bottomRef.current?.parentElement;

    if (!container) return;

    if (userScrollingRef.current) return;

    if (!autoScrollEnabledRef.current) return;

    programmaticScrollRef.current = true;

    container.scrollTop = container.scrollHeight;

    requestAnimationFrame(() => {
      programmaticScrollRef.current = false;
    });
  }, [messages]);

  return bottomRef;
}