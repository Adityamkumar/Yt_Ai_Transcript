import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { chatService } from '@/services/chat.service';
import { IMessage } from '@/types';

export function useChat(conversationId: string | undefined, videoId: string | undefined) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !videoId || isStreaming) return;

      try {
        setIsStreaming(true);
        setStreamingMessage('');

        const userMsg = await messageService.createMessage(conversationId, 'user', content);

        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [
          ...old,
          userMsg,
        ]);

        const history: IMessage[] = queryClient.getQueryData(['messages', conversationId]) || [];
        const recentMessages = history.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));

        let fullResponse = '';
        await chatService.streamQuestion(
          {
            videoId,
            question: content,
            recentMessages,
          },
          (token) => {
            fullResponse += token;
            setStreamingMessage(fullResponse);
          }
        );

        if (!fullResponse.trim()) {
          fullResponse = "I'm sorry, I encountered an issue while generating a response. Please try again.";
        }

        const assistantMsg = await messageService.createMessage(conversationId, 'assistant', fullResponse);

        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [
          ...old,
          assistantMsg,
        ]);
        setStreamingMessage('');
      } catch (error) {
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, videoId, isStreaming, queryClient]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversationId || !videoId || isStreaming) return;

      try {
        setIsStreaming(true);
        setStreamingMessage('');

        const updatedMsg = await messageService.updateMessage(messageId, newContent);

        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => {
          const index = old.findIndex(m => m._id === messageId);
          if (index === -1) return old;
          return [...old.slice(0, index), updatedMsg];
        });

        const history: IMessage[] = queryClient.getQueryData(['messages', conversationId]) || [];
        const recentMessages = history.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));

        let fullResponse = '';
        await chatService.streamQuestion(
          {
            videoId,
            question: newContent,
            recentMessages,
          },
          (token) => {
            fullResponse += token;
            setStreamingMessage(fullResponse);
          }
        );

        if (!fullResponse.trim()) {
          fullResponse = "I'm sorry, I couldn't generate a new response for this edited question. Please try again.";
        }

        const assistantMsg = await messageService.createMessage(conversationId, 'assistant', fullResponse);

        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [
          ...old,
          assistantMsg,
        ]);
        setStreamingMessage('');
      } catch (error) {
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, videoId, isStreaming, queryClient]
  );

  return {
    sendMessage,
    editMessage,
    isStreaming,
    streamingMessage,
  };
}
