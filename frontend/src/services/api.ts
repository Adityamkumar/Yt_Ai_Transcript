import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { TranscriptResponse, AskQuestionResponse, AskQuestionPayload } from '@/types';

export const videoService = {
  extractTranscript: async (youtubeUrl: string): Promise<TranscriptResponse> => {
    const { data } = await axiosInstance.post<TranscriptResponse>(
      API_ENDPOINTS.TRANSCRIPT,
      { youtubeUrl }
    );
    return data;
  },
};

export const chatService = {
  askQuestion: async (payload: AskQuestionPayload): Promise<AskQuestionResponse> => {
    const { data } = await axiosInstance.post<AskQuestionResponse>(
      API_ENDPOINTS.CHAT_ASK,
      payload
    );
    return data;
  },
};
