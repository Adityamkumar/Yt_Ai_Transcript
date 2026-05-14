import axiosInstance from '@/lib/axios';
import { ApiResponse, IBookmark } from '@/types';

export const bookmarkService = {
  createBookmark: async (payload: {
    conversationId: string;
    messageId: string;
    type: 'chat' | 'notes';
    title: string;
    content: string;
  }) => {
    const response = await axiosInstance.post<ApiResponse<IBookmark>>('/api/v1/bookmarks/create', payload);
    return response.data.data;
  },

  getBookmarks: async () => {
    const response = await axiosInstance.get<ApiResponse<IBookmark[]>>('/api/v1/bookmarks/get');
    return response.data.data;
  },

  deleteBookmark: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/api/v1/bookmarks/delete/${id}`);
    return response.data.data;
  },
};
