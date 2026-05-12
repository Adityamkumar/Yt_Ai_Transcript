import axiosInstance from '@/lib/axios';
import { AskQuestionPayload } from '@/types';

export const chatService = {
  askQuestion: async (payload: AskQuestionPayload) => {
    const response = await axiosInstance.post('/api/v1/chat/ask', payload);
    return response.data;
  },

  streamQuestion: async (payload: AskQuestionPayload, onToken: (token: string) => void) => {
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/chat/ask`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
      },
      credentials: 'include',
      body: JSON.stringify({ ...payload, stream: true }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Streaming failed' }));
      throw new Error(error.message || 'Streaming failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      onToken(chunk);
    }
  },
};
