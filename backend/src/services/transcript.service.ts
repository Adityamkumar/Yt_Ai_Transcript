import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { YouTubeTranscriptApi } from "youtube-transcript-api";
import {
  chunkTranscript,
  normalizeTranscriptChunks,
  type SemanticTranscriptChunk,
} from "../utils/chunkTranscript.js";
import logger from "../lib/logger.js";
import "dotenv/config.js";

const normalizeToSeconds = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value >= 1000 ? value / 1000 : value;
};

const fetchTranscriptFromFallbackApi = async (videoId: string) => {
  try {
    const url = `https://youtube-transcript.ai/transcript/${videoId}.txt`;
    const response = await axios.get(url, {
      responseType: "text",
      headers: {
        Authorization: `Bearer ${process.env.YOUTUBE_TRANSCRIPT_API_KEY}`,
      },
    });
    const text = response.data;
    const transcriptSection = text.split(/## Transcript/i)[1] || text;
    const matches = [
      ...transcriptSection.matchAll(
        /\[(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\]\s*([^]*?)(?=\s*\[(?:(?:\d{1,2}):)?(?:\d{1,2}):(?:\d{2})\]|$)/g,
      ),
    ];

    if (matches.length === 0) {
      throw new Error("No timestamped lines matched in fallback transcript");
    }

    const parsed = matches.map((m) => {
      const hrs = m[1] ? parseInt(m[1], 10) : 0;
      const mins = parseInt(m[2] || "0", 10);
      const secs = parseInt(m[3] || "0", 10);
      const offset = hrs * 3600 + mins * 60 + secs;
      const rawText = (m[4] || "").trim().replace(/\s+/g, " ");
      return {
        text: rawText,
        duration: 10,
        start: offset,
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
    logger.error(
      { err },
      "[Transcript Fallback] Failed to fetch from youtube-transcript.ai",
    );
    throw err;
  }
};

export const getTranscriptFromYoutube = async (videoId: string) => {
  let newExtractorError: unknown;
  let primaryError: unknown;

  const describeError = (error: unknown) =>
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { message: String(error) };

  // 1. Try the new TypeScript extractor first.
  try {
    logger.info(
      { videoId },
      "[Transcript] Fetching transcript via new TypeScript extractor",
    );

    const api = new YouTubeTranscriptApi();
    const transcript = await api.fetch(videoId);

    if (!transcript.snippets?.length) {
      throw new Error("New extractor returned an empty transcript");
    }

    const rawChunks = transcript.snippets.map((item) => ({
      text: item.text,
      start: normalizeToSeconds(item.start),
      duration: normalizeToSeconds(item.duration),
    }));

    logger.info(
      {
        videoId,
        chunks: rawChunks.length,
        extractor: "youtube-transcript-api",
      },
      "[Transcript] New TypeScript extractor succeeded",
    );

    return chunkTranscript(rawChunks);
  } catch (error: unknown) {
    newExtractorError = error;

    if (error instanceof Error) {
    logger.error(
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      "[Transcript] New extractor diagnostic",
    );
  } else {
    logger.error(
      { error: String(error) },
      "[Transcript] New extractor diagnostic",
    );
  }
  }

  // 2. Try the existing primary extractor.
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const rawChunks = transcript.map((item) => ({
      text: item.text,
      duration: normalizeToSeconds(item.duration),
      start: normalizeToSeconds(item.offset),
    }));

    logger.info(
      { videoId, chunks: rawChunks.length, extractor: "youtube-transcript" },
      "[Transcript] Old primary extractor succeeded",
    );

    return chunkTranscript(rawChunks);
  } catch (error: unknown) {
    primaryError = error;

    logger.warn(
      { err: error, videoId },
      "[Transcript] Old primary extractor failed. Trying API fallback",
    );
  }

  // 3. Use the limited API only if both libraries fail.
  try {
    const rawChunks = await fetchTranscriptFromFallbackApi(videoId);

    logger.info(
      { videoId, chunks: rawChunks.length, extractor: "youtube-transcript.ai" },
      "[Transcript] API fallback succeeded",
    );

    return chunkTranscript(rawChunks);
  } catch (fallbackError: unknown) {
    logger.error(
      {
        videoId,
        newExtractorError: describeError(newExtractorError),
        primaryError: describeError(primaryError),
        fallbackError: describeError(fallbackError),
      },
      "[Transcript] All transcript extractors failed",
    );

    throw new Error("Failed to fetch transcript");
  }
};

export const optimizeStoredTranscript = (
  chunks: Array<{
    text: string;
    start: number;
    duration: number;
    end?: number;
  }>,
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
