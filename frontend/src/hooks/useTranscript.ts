import { useMutation } from '@tanstack/react-query';
import { videoService } from '@/services/api';
import { extractVideoId } from '@/utils';
import type { VideoData } from '@/types';

export type TranscriptData = { videoId: string; videoData: VideoData };

interface UseTranscriptResult {
  extract: (url: string) => Promise<TranscriptData>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  data: TranscriptData | null;
  reset: () => void;
}

export function useTranscript(): UseTranscriptResult {
  const mutation = useMutation({
    mutationFn: async (youtubeUrl: string): Promise<TranscriptData> => {
      const response = await videoService.extractTranscript(youtubeUrl);
      const rawData = response.data;

      let videoId: string;
      let videoData: VideoData;

      if (typeof rawData === 'string') {
        const id = extractVideoId(youtubeUrl);
        if (!id) throw new Error('Could not extract video ID from URL');
        videoId = id;
        videoData = {
          _id: id,
          youtubeUrl,
          youtubeVideoId: id,
          transcript: rawData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        videoId = rawData.youtubeVideoId;
        videoData = rawData;
      }

      return { videoId, videoData };
    },
  });

  return {
    extract: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}
