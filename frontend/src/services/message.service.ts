import axiosInstance from '@/lib/axios';
import { ApiResponse, IMessage, MessageRole } from '@/types';

export const messageService = {
  createMessage: async (conversationId: string, role: MessageRole, content: string) => {
    const response = await axiosInstance.post<ApiResponse<IMessage>>('/api/v1/messages', {
      conversationId,
      role,
      content,
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
};
