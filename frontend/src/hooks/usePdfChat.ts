import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { pdfService } from "@/services/pdf.service";
import { IMessage, MessageType, MessageRole } from "@/types";
import { WorkspaceAction } from "@/components/workspace-actions/workspaceActionConfig";

export function usePdfChat(conversationId: string | undefined, documentId: string | undefined) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isNotesRequest, setIsNotesRequest] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setStreamingMessage("");
  }, []);
  const sanitizePdfChatResponse = useCallback((text: string, type: MessageType): string => {
    if (type !== "chat" || !text) return text;
    return text
      .replace(/\[\s*Page\s+\d+\s*\]/gi, "")
      .replace(/\(\s*Page\s+\d+\s*\)/gi, "")
      .replace(/\bPage\s+\d+\b/gi, "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]+([,.:;!?])/g, "$1")
      .trim();
  }, []);


  const sendMessage = useCallback(
    async (content: string, source?: 'user' | 'suggested_question') => {
      if (!conversationId || !documentId || isStreaming) return;

      const isNotesIntent = /create notes|generate notes|make notes|structured notes/i.test(content);
      const isSummaryIntent = /summarize this document|key highlights|document summary/i.test(content);
      
      const messageType: MessageType = isNotesIntent ? "notes" : isSummaryIntent ? "summary" : "chat";

      try {
        setIsStreaming(true);
        setIsNotesRequest(messageType === "notes");
        setStreamingMessage("");

        const userMsg = await messageService.createMessage(
          conversationId,
          "user",
          content,
          messageType,
          source
        );

        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [
          ...old,
          userMsg,
        ]);

        const history: IMessage[] = queryClient.getQueryData(["messages", conversationId]) || [];
        const recentMessages = history.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));

        let fullResponse = "";
        
        if (messageType === "notes" || messageType === "summary") {
          const response = await pdfService.askQuestion({
            documentId,
            question: content,
            recentMessages,
            type: messageType,
          });
          fullResponse = response.data;
        } else {
          const controller = new AbortController();
          abortControllerRef.current = controller;
          await pdfService.streamQuestion(
            {
              documentId,
              question: content,
              recentMessages,
              type: messageType,
            },
            (token) => {
              fullResponse += token;
              setStreamingMessage(fullResponse);
            },
            controller.signal,
          );
        }

        fullResponse = sanitizePdfChatResponse(fullResponse, messageType);

        if (!fullResponse.trim()) {
          fullResponse = "I'm sorry, I encountered an issue while generating a response. Please try again.";
        }

        const assistantMsg = await messageService.createMessage(conversationId, "assistant", fullResponse, messageType);

        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [
          ...old,
          assistantMsg,
        ]);
        setStreamingMessage("");
      } catch (error: any) {
        if (error?.name !== "AbortError") throw error;
      } finally {
        setIsStreaming(false);
        setStreamingMessage("");
      }
    },
    [conversationId, documentId, isStreaming, queryClient]
  );

  const generateNotes = useCallback(
    async () => {
      if (!conversationId || !documentId || isStreaming) return;
      try {
        setIsStreaming(true);
        setIsNotesRequest(true);
        setStreamingMessage("");
        const response = await pdfService.askQuestion({
          documentId,
          question: "Generate complete structured educational notes for this document.",
          recentMessages: [],
          type: "notes",
        });
        const assistantMsg = await messageService.createMessage(conversationId, "assistant", response.data, "notes");
        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [...old, assistantMsg]);
        setStreamingMessage("");
      } catch (error) {
        console.error("PDF notes generation error:", error);
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, documentId, isStreaming, queryClient]
  );

  const generateSummary = useCallback(
    async () => {
      if (!conversationId || !documentId || isStreaming) return;
      try {
        setIsStreaming(true);
        setIsNotesRequest(false);
        setStreamingMessage("");
        const response = await pdfService.askQuestion({
          documentId,
          question: "Provide a quick summary of this document with key highlights.",
          recentMessages: [],
          type: "summary",
        });
        const assistantMsg = await messageService.createMessage(conversationId, "assistant", response.data, "summary");
        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [...old, assistantMsg]);
        setStreamingMessage("");
      } catch (error) {
        console.error("PDF summary generation error:", error);
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, documentId, isStreaming, queryClient]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversationId || !documentId || isStreaming) return;

      try {
        setIsStreaming(true);
        setStreamingMessage("");

        const updatedMsg = await messageService.updateMessage(messageId, newContent);

        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => {
          const index = old.findIndex(m => m._id === messageId);
          if (index === -1) return old;
          return [...old.slice(0, index), updatedMsg];
        });

        const history: IMessage[] = queryClient.getQueryData(["messages", conversationId]) || [];
        const recentMessages = history.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));

        let fullResponse = "";
        const controller = new AbortController();
        abortControllerRef.current = controller;
        await pdfService.streamQuestion(
          {
            documentId,
            question: newContent,
            recentMessages,
          },
          (token) => {
            fullResponse += token;
            setStreamingMessage(fullResponse);
          },
          controller.signal,
        );

        fullResponse = sanitizePdfChatResponse(fullResponse, "chat");
        const assistantMsg = await messageService.createMessage(conversationId, "assistant", fullResponse);

        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [
          ...old,
          assistantMsg,
        ]);
        setStreamingMessage("");
      } catch (error: any) {
        if (error?.name !== "AbortError") throw error;
      } finally {
        setIsStreaming(false);
        setStreamingMessage("");
      }
    },
    [conversationId, documentId, isStreaming, queryClient]
  );

  const triggerAction = useCallback(
    async (action: WorkspaceAction) => {
      if (!conversationId || !documentId || isStreaming) return;

      if (action.type === "chat") {
        await sendMessage(action.prompt);
        return;
      }

      try {
        setIsStreaming(true);
        setIsNotesRequest(action.type === "notes");
        setStreamingMessage("");

        const userMsg = await messageService.createMessage(conversationId, "user", action.prompt);
        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [
          ...old,
          userMsg,
        ]);

        const response = await pdfService.askQuestion({
          documentId,
          question: action.prompt,
          recentMessages: [],
          type: action.type,
        });

        const fullResponse = sanitizePdfChatResponse(
          response.data || "I'm sorry, I encountered an issue. Please try again.",
          action.type,
        );
        const assistantMsg = await messageService.createMessage(
          conversationId,
          "assistant",
          fullResponse,
          action.type,
        );
        queryClient.setQueryData(["messages", conversationId], (old: IMessage[] = []) => [
          ...old,
          assistantMsg,
        ]);
        setStreamingMessage("");
      } catch (error) {
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, documentId, isStreaming, queryClient, sendMessage]
  );

  return {
    sendMessage,
    editMessage,
    generateNotes,
    generateSummary,
    triggerAction,
    stopStreaming,
    isStreaming,
    streamingMessage,
    isNotesRequest,
  };
}

