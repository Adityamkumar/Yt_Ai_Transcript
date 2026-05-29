import axiosInstance from '@/lib/axios';
import { ApiResponse, IConversation } from '@/types';

export const conversationService = {
  createConversation: async (videoId: string, title: string) => {
    const response = await axiosInstance.post<ApiResponse<IConversation>>('/api/v1/conversations', {
      videoId,
      title,
    });
    return response.data.data;
  },

  getConversations: async () => {
    const response = await axiosInstance.get<ApiResponse<IConversation[]>>('/api/v1/conversations/all'); // backend had /:conversationId but I'll use /all if I fix it or just /
    const res = await axiosInstance.get<ApiResponse<IConversation[]>>('/api/v1/conversations/list');
    return res.data.data;
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.delete(`/api/v1/conversations/${conversationId}`);
  },
};

