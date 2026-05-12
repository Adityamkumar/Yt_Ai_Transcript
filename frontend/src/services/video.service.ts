import axiosInstance from '@/lib/axios';
import { ApiResponse, VideoData } from '@/types';

export const videoService = {
  getTranscript: async (videoUrl: string) => {
    const response = await axiosInstance.post<ApiResponse<VideoData>>('/api/v1/video/transcript', {
      youtubeUrl: videoUrl,
    });
    return response.data.data;
  },
};
