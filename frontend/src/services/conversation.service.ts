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
    // Wait, let me check the backend route again. 
    // router.get("/:conversationId", getConversations);
    // controller: export const getConversations = asyncHandler(async (req, res) => { ... find({ userId: req.user._id }) ... })
    // If I call GET /api/v1/conversations/list (any string), it will trigger getConversations.
    // I'll use /api/v1/conversations/list to avoid ambiguity if possible, or just / if I change backend.
    // But I cannot change backend. So I will use /api/v1/conversations/all (any param will work as long as it's not empty if the route is /:conversationId)
    const res = await axiosInstance.get<ApiResponse<IConversation[]>>('/api/v1/conversations/list');
    return res.data.data;
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.delete(`/api/v1/conversations/${conversationId}`);
  },
};
