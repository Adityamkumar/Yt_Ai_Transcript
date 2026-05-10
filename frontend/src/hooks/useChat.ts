import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '@/services/api';
import { useStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import type { ChatMessage } from '@/types';
import toast from 'react-hot-toast';

export function useChat(sessionId: string | null) {
  const { addMessage, updateMessage } = useStore();
  const [isTyping, setIsTyping] = useState(false);

  const askMutation = useMutation({
    mutationFn: chatService.askQuestion,
  });

  const sendMessage = useCallback(
    async (question: string, videoId: string) => {
      if (!sessionId || !question.trim()) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: question.trim(),
        timestamp: new Date(),
      };
      addMessage(sessionId, userMsg);

      const aiMsgId = generateId();
      const placeholderMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };
      addMessage(sessionId, placeholderMsg);
      setIsTyping(true);

      try {
        const response = await askMutation.mutateAsync({ videoId, question: question.trim() });
        const answer = response.data as string;

        updateMessage(sessionId, aiMsgId, {
          content: answer,
          isLoading: false,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get an answer. Try again.';
        updateMessage(sessionId, aiMsgId, {
          content: `Error: ${errorMsg}`,
          isLoading: false,
        });
        toast.error(errorMsg);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, addMessage, updateMessage, askMutation]
  );

  return { sendMessage, isTyping, isPending: askMutation.isPending };
}
