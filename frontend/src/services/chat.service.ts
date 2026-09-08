import axiosInstance, {
  EMAIL_NOT_VERIFIED_CODE,
  getApiBaseUrl,
  notifyEmailVerificationRequired,
} from '@/lib/axios';
import { AskQuestionPayload } from '@/types';

export const chatService = {
  askQuestion: async (payload: AskQuestionPayload) => {
    const response = await axiosInstance.post('/api/v1/chat/ask', payload);
    return response.data;
  },

  streamQuestion: async (
    payload: AskQuestionPayload,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ) => {
    const url = `${getApiBaseUrl()}/api/v1/chat/ask`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
      },
      credentials: 'include',
      body: JSON.stringify({ ...payload, stream: true }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Streaming failed' }));
      if (error.code === EMAIL_NOT_VERIFIED_CODE) {
        notifyEmailVerificationRequired();
      }
      const requestError = new Error(error.message || 'Streaming failed') as Error & { code?: string };
      requestError.code = error.code;
      throw requestError;
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        onToken(chunk);
      }
    } catch (err: any) {
      reader.cancel();
      if (err?.name !== 'AbortError') throw err;
    }
  },

  getFollowUpQuestions: async (
    payload: { question: string; answer: string; context?: string; conversationId?: string },
    signal?: AbortSignal,
  ): Promise<string[]> => {
    try {
      const response = await axiosInstance.post('/api/v1/chat/followup', payload, { signal });
      return response.data?.data?.followUpQuestions || [];
    } catch {
      return [];
    }
  },
};


