import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { TranscriptResponse, AskQuestionResponse, AskQuestionPayload } from '@/types';

// ─── Video Service ────────────────────────────────────────────────────────────

export const videoService = {
  /**
   * POST /api/v1/video/transcript
   * Body: { youtubeUrl: string }
   * Returns the video document (with transcript) or the transcript string directly.
   */
  extractTranscript: async (youtubeUrl: string): Promise<TranscriptResponse> => {
    const { data } = await axiosInstance.post<TranscriptResponse>(
      API_ENDPOINTS.TRANSCRIPT,
      { youtubeUrl }
    );
    return data;
  },
};

// ─── Chat Service ─────────────────────────────────────────────────────────────

export const chatService = {
  /**
   * POST /api/v1/chat/ask
   * Body: { videoId: string, question: string }
   * Returns the AI answer string.
   */
  askQuestion: async (payload: AskQuestionPayload): Promise<AskQuestionResponse> => {
    const { data } = await axiosInstance.post<AskQuestionResponse>(
      API_ENDPOINTS.CHAT_ASK,
      payload
    );
    return data;
  },
};
