import { useCallback, useRef, useState } from 'react';
import { chatService } from '@/services/api';
import { useStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import { getRecentMessages } from '@/utils/chatContext';
import type { ChatMessage } from '@/types';
import toast from 'react-hot-toast';

export function useChat(sessionId: string | null) {
  const { addMessage, updateMessage, activeSession } = useStore();
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (question: string, videoId: string) => {
      if (!sessionId || !question.trim()) return;

      abortControllerRef.current?.abort();

      const createdAt = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: question.trim(),
        createdAt,
      };

      const sourceMessages = activeSession?.id === sessionId ? activeSession.messages : [];
      const recentMessages = getRecentMessages(sourceMessages, 10);

      addMessage(sessionId, userMsg);

      const assistantMessageId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isLoading: true,
      };

      addMessage(sessionId, assistantMsg);
      setIsTyping(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let streamedText = '';
      let scheduledText = '';
      let animationFrame: number | null = null;

      const flush = () => {
        animationFrame = null;
        if (scheduledText === streamedText) return;
        scheduledText = streamedText;
        updateMessage(sessionId, assistantMessageId, {
          content: scheduledText,
          isLoading: true,
        });
      };

      const scheduleFlush = () => {
        if (animationFrame !== null) return;
        animationFrame = window.requestAnimationFrame(flush);
      };

      try {
        const finalText = await chatService.streamQuestion(
          {
            videoId,
            question: question.trim(),
            recentMessages,
          },
          (chunk) => {
            streamedText += chunk;
            scheduleFlush();
          },
          abortController.signal
        );

        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
        }

        updateMessage(sessionId, assistantMessageId, {
          content: finalText || streamedText,
          isLoading: false,
        });
      } catch (err) {
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
          updateMessage(sessionId, assistantMessageId, {
            content: streamedText || 'Response stopped.',
            isLoading: false,
          });
          return;
        }

        const errorMsg = err instanceof Error ? err.message : 'Failed to get an answer. Try again.';
        updateMessage(sessionId, assistantMessageId, {
          content: streamedText || `Error: ${errorMsg}`,
          isLoading: false,
          error: errorMsg,
        });
        toast.error(errorMsg);
      } finally {
        setIsTyping(false);
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [sessionId, activeSession, addMessage, updateMessage]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { sendMessage, stopStreaming, isTyping, isPending: isTyping };
}
