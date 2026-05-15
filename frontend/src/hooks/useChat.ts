import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { chatService } from '@/services/chat.service';
import { IMessage, MessageType } from '@/types';

export function useChat(conversationId: string | undefined, videoId: string | undefined) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isNotesRequest, setIsNotesRequest] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !videoId || isStreaming) return;

      const isNotesIntent = /create notes|generate notes|make notes|summarize into notes|structured notes/i.test(content);
      const messageType: MessageType = isNotesIntent ? 'notes' : 'chat';

      try {
        setIsStreaming(true);
        setIsNotesRequest(messageType === 'notes');
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
        
        if (messageType === 'notes') {
          const response = await chatService.askQuestion({
            videoId,
            question: content,
            recentMessages,
            type: 'notes',
          });
          fullResponse = response.data;
        } else {
          await chatService.streamQuestion(
            {
              videoId,
              question: content,
              recentMessages,
              type: messageType,
            },
            (token) => {
              fullResponse += token;
              setStreamingMessage(fullResponse);
            }
          );
        }

        if (!fullResponse.trim()) {
          fullResponse = "I'm sorry, I encountered an issue while generating a response. Please try again.";
        }

        const assistantMsg = await messageService.createMessage(conversationId, 'assistant', fullResponse, messageType);

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

  const generateNotes = useCallback(
    async () => {
      if (!conversationId || !videoId || isStreaming) return;

      try {
        setIsStreaming(true);
        setIsNotesRequest(true);
        setStreamingMessage('');

        const response = await chatService.askQuestion({
          videoId,
          question: "Generate smart notes",
          recentMessages: [],
          type: 'notes',
        });

        // The askQuestion service returns response.data (which is the ApiResponse object)
        // We need the 'data' field inside the ApiResponse, which contains our JSON string
        const fullResponse = response.data;

        if (!fullResponse) {
          throw new Error("Failed to receive notes from AI");
        }

        const assistantMsg = await messageService.createMessage(conversationId, 'assistant', fullResponse, 'notes');

        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [
          ...old,
          assistantMsg,
        ]);
        setStreamingMessage('');
      } catch (error) {
        console.error("Notes generation error:", error);
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
    generateNotes,
    isStreaming,
    streamingMessage,
    isNotesRequest,
  };
}
