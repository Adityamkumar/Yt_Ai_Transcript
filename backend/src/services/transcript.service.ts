import { YoutubeTranscript } from "youtube-transcript";
import {
  chunkTranscript,
  normalizeTranscriptChunks,
  type SemanticTranscriptChunk,
} from "../utils/chunkTranscript.js";

const normalizeToSeconds = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value >= 1000 ? value / 1000 : value;
};

export const getTranscriptFromYoutube = async (videoId: string) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const rawChunks = transcript.map(item => ({
      text: item.text,
      duration: normalizeToSeconds(item.duration),
      start: normalizeToSeconds(item.offset)
    }));

    return chunkTranscript(rawChunks);
  } catch (error) {
    throw new Error("Failed to fetch transcript");
  }
};

export const optimizeStoredTranscript = (
  chunks: Array<{ text: string; start: number; duration: number; end?: number }>,
): SemanticTranscriptChunk[] => {
  const normalized = normalizeTranscriptChunks(chunks);

  if (normalized.length === 0) {
    return [];
  }

  const exceedsLimits = normalized.some(
    (chunk) =>
      chunk.duration > 90 ||
      chunk.text.length > 1000 ||
      (chunk.text.match(/\S+/g) || []).length > 200,
  );

  if (normalized.length <= 80 && !exceedsLimits) {
    return normalized;
  }

  const rawForChunking = normalized.map((chunk) => ({
    text: chunk.text,
    start: chunk.start,
    duration: chunk.duration,
  }));

  return chunkTranscript(rawForChunking);
};
