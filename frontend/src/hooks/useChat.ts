import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import { chatService } from '@/services/chat.service';
import { IMessage, MessageType } from '@/types';
import { WorkspaceAction } from '@/components/workspace-actions/workspaceActionConfig';

export function useChat(conversationId: string | undefined, videoId: string | undefined) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isNotesRequest, setIsNotesRequest] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !videoId || isStreaming) return;

      const isNotesIntent = /create notes|generate notes|make notes|structured notes/i.test(content);
      const isSummaryIntent = /summarize this video|key highlights|video summary/i.test(content);
      
      const messageType: MessageType = isNotesIntent ? 'notes' : isSummaryIntent ? 'summary' : 'chat';

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
        
        if (messageType === 'notes' || messageType === 'summary') {
          const response = await chatService.askQuestion({
            videoId,
            question: content,
            recentMessages,
            type: messageType,
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

  const generateNotes = useCallback(
    async () => {
      if (!conversationId || !videoId || isStreaming) return;
      try {
        setIsStreaming(true);
        setIsNotesRequest(true);
        setStreamingMessage('');
        const response = await chatService.askQuestion({
          videoId,
          question: "Generate complete structured educational notes for this video.",
          recentMessages: [],
          type: 'notes',
        });
        const assistantMsg = await messageService.createMessage(conversationId, 'assistant', response.data, 'notes');
        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [...old, assistantMsg]);
        setStreamingMessage('');
      } catch (error) {
        console.error("Notes generation error:", error);
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, videoId, isStreaming, queryClient]
  );

  const generateSummary = useCallback(
    async () => {
      if (!conversationId || !videoId || isStreaming) return;
      try {
        setIsStreaming(true);
        setIsNotesRequest(false);
        setStreamingMessage('');
        const response = await chatService.askQuestion({
          videoId,
          question: "Provide a quick summary of this video with key highlights.",
          recentMessages: [],
          type: 'summary',
        });
        const assistantMsg = await messageService.createMessage(conversationId, 'assistant', response.data, 'summary');
        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [...old, assistantMsg]);
        setStreamingMessage('');
      } catch (error) {
        console.error("Summary generation error:", error);
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

  const triggerAction = useCallback(
    async (action: WorkspaceAction) => {
      if (!conversationId || !videoId || isStreaming) return;

      if (action.type === 'chat') {
        await sendMessage(action.prompt);
        return;
      }

      try {
        setIsStreaming(true);
        setIsNotesRequest(action.type === 'notes');
        setStreamingMessage('');

        const userMsg = await messageService.createMessage(conversationId, 'user', action.prompt);
        queryClient.setQueryData(['messages', conversationId], (old: IMessage[] = []) => [
          ...old,
          userMsg,
        ]);

        const response = await chatService.askQuestion({
          videoId,
          question: action.prompt,
          recentMessages: [],
          type: action.type,
        });

        const fullResponse = response.data || "I'm sorry, I encountered an issue. Please try again.";
        const assistantMsg = await messageService.createMessage(
          conversationId,
          'assistant',
          fullResponse,
          action.type,
        );
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
    [conversationId, videoId, isStreaming, queryClient, sendMessage],
  );

  return {
    sendMessage,
    editMessage,
    generateNotes,
    generateSummary,
    triggerAction,
    isStreaming,
    streamingMessage,
    isNotesRequest,
  };
}
