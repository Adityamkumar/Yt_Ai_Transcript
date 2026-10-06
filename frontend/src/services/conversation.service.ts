import axiosInstance from "@/lib/axios";
import { ApiResponse, IConversation } from "@/types";

export const conversationService = {
  createConversation: async (videoId: string, title: string) => {
    const response = await axiosInstance.post<ApiResponse<IConversation>>(
      "/api/v1/conversations",
      {
        videoId,
        title,
      },
    );
    return response.data.data;
  },

  getConversations: async () => {
    const response = await axiosInstance.get<ApiResponse<IConversation[]>>(
      "/api/v1/conversations/all",
    );
    return response.data.data;
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.delete(`/api/v1/conversations/${conversationId}`);
  },

  updateConversationPin: async (conversationId: string, isPinned: boolean) => {
    const response = await axiosInstance.patch<ApiResponse<IConversation>>(
      `/api/v1/conversations/${conversationId}`,
      { isPinned },
    );
    return response.data.data;
  },
};
