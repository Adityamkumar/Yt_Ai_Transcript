import axiosInstance from '@/lib/axios';
import { ApiResponse, IMessage, MessageRole, MessageType } from '@/types';

export const messageService = {
  createMessage: async (
    conversationId: string,
    role: MessageRole,
    content: string,
    type: MessageType = 'chat',
    source?: 'user' | 'suggested_question',
  ) => {
    const response = await axiosInstance.post<ApiResponse<IMessage>>('/api/v1/messages', {
      conversationId,
      role,
      content,
      type,
      ...(source ? { source } : {}),
    });
    return response.data.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await axiosInstance.get<ApiResponse<IMessage[]>>(`/api/v1/messages/${conversationId}`);
    return response.data.data;
  },

  updateMessage: async (messageId: string, content: string) => {
    const response = await axiosInstance.patch<ApiResponse<IMessage>>(`/api/v1/messages/${messageId}`, {
      content,
    });
    return response.data.data;
  },

  patchSuggestedQuestions: async (messageId: string, suggestedQuestions: string[]) => {
    const response = await axiosInstance.patch<ApiResponse<IMessage>>(
      `/api/v1/messages/${messageId}/suggestions`,
      { suggestedQuestions },
    );
    return response.data.data;
  },
};


