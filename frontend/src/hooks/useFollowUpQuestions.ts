import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { messageService } from '@/services/message.service';
import { ChatMessage } from '@/types';

export function useFollowUpQuestions(
  message: ChatMessage | undefined,
  isLatest: boolean,
  userQuestion: string | undefined
) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentFetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const messageId = message?._id;
    const conversationId = message?.conversationId;
    const messageContent = message?.content;

    // Conditions to skip fetching suggested questions:
    if (
      !message ||
      !messageId ||
      !conversationId ||
      !messageContent ||
      message.role !== 'assistant' ||
      !isLatest ||
      message.isLoading ||
      (message.suggestedQuestions && message.suggestedQuestions.length > 0)
    ) {
      return;
    }

    // Skip if we have already fetched or started fetching for this message
    if (currentFetchedIdRef.current === messageId) {
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    currentFetchedIdRef.current = messageId;
    setIsLoading(true);

    const fetchSuggestions = async () => {
      try {
        const questions = await chatService.getFollowUpQuestions(
          {
            question: userQuestion || 'What are the key highlights?',
            answer: messageContent,
          },
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        if (questions && questions.length > 0) {
          // Save to DB so they persist
          await messageService.patchSuggestedQuestions(messageId, questions);

          // Update React Query cache
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: ChatMessage[] = []) => {
              return old.map((m) =>
                m._id === messageId ? { ...m, suggestedQuestions: questions } : m
              );
            }
          );
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('[FollowUp Hook] Failed to generate suggestions:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      controller.abort();
      currentFetchedIdRef.current = null;
    };
  }, [message?._id, message?.isLoading, message?.content, isLatest, userQuestion, queryClient]);

  return {
    questions: message?.suggestedQuestions || [],
    isLoading,
  };
}
