import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { TranscriptResponse, AskQuestionResponse, AskQuestionPayload } from '@/types';
import { streamResponseHandler } from '@/utils/streamResponseHandler';

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
  streamQuestion: async (
    payload: AskQuestionPayload,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> => {
    const response = await fetch(API_ENDPOINTS.CHAT_ASK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
      },
      body: JSON.stringify({ ...payload, stream: true }),
      signal,
    });

    return streamResponseHandler({ response, onChunk, signal });
  },
};
