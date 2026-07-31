import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import {
  chunkTranscript,
  normalizeTranscriptChunks,
  type SemanticTranscriptChunk,
} from "../utils/chunkTranscript.js";
import logger from "../lib/logger.js";

const normalizeToSeconds = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value >= 1000 ? value / 1000 : value;
};

const fetchTranscriptFromFallbackApi = async (videoId: string) => {
  try {
    const url = `https://youtube-transcript.ai/transcript/${videoId}.txt`;
    const response = await axios.get(url, { responseType: "text" });
    const text = response.data;
    const transcriptSection = text.split(/## Transcript/i)[1] || text;
    const matches = [...transcriptSection.matchAll(/\[(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\]\s*([^]*?)(?=\s*\[(?:(?:\d{1,2}):)?(?:\d{1,2}):(?:\d{2})\]|$)/g)];
    
    if (matches.length === 0) {
      throw new Error("No timestamped lines matched in fallback transcript");
    }

    const parsed = matches.map((m) => {
      const hrs = m[1] ? parseInt(m[1], 10) : 0;
      const mins = parseInt(m[2] || "0", 10);
      const secs = parseInt(m[3] || "0", 10);
      const offset = hrs * 3600 + mins * 60 + secs;
      const rawText = (m[4] || "").trim().replace(/\s+/g, ' ');
      return {
        text: rawText,
        duration: 10,
        start: offset
      };
    });

    for (let i = 0; i < parsed.length; i++) {
      const current = parsed[i];
      const next = parsed[i + 1];
      if (current) {
        if (next) {
          current.duration = next.start - current.start;
        } else {
          current.duration = 15;
        }
      }
    }

    return parsed;
  } catch (err: any) {
    logger.error({ err }, "[Transcript Fallback] Failed to fetch from youtube-transcript.ai");
    throw err;
  }
};

export const getTranscriptFromYoutube = async (videoId: string) => {
  try {
    logger.info(`[Transcript] Fetching transcript via primary library for video: ${videoId}`);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const rawChunks = transcript.map(item => ({
      text: item.text,
      duration: normalizeToSeconds(item.duration),
      start: normalizeToSeconds(item.offset)
    }));

    return chunkTranscript(rawChunks);
  } catch (error: any) {
    logger.warn({ error, videoId }, "[Transcript] Primary library failed for video. Trying fallback API...");
    try {
      const rawChunks = await fetchTranscriptFromFallbackApi(videoId);
      return chunkTranscript(rawChunks);
    } catch (fallbackError) {
      throw new Error("Failed to fetch transcript");
    }
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
