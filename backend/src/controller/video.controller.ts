import { Video } from "../models/VideoUrl.model.js";
import { getTranscriptFromYoutube, optimizeStoredTranscript } from "../services/transcript.service.js";
import { generateVideoTitle } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractVideoId } from "../utils/extractVideoId.js";
import { ingestVideoForRag } from "../rag/services/transcriptRagIngestion.service.js";

const GENERIC_VIDEO_TITLES = new Set([
  "new conversation",
  "new chat",
  "untitled",
  "video",
  "youtube video",
]);

// Patterns that indicate the title was generated from intro noise
const BAD_TITLE_PATTERNS = [
  /\[music\]/i,
  /\bhi\b.*\bmy name\b/i,
  /\bhello\b.*\beverybody\b/i,
  /\bwelcome\b.*\bchannel\b/i,
  /\bsubscribe\b/i,
  /\banchorman\b/i,
  /^(hi|hey|hello|what'?s up)\b/i,
  /\bmy name is\b/i,
  /\bguys (welcome|today)\b/i,
];

const isBadTitle = (title: string): boolean => {
  if (!title) return true;
  const lower = title.toLowerCase().trim();
  if (GENERIC_VIDEO_TITLES.has(lower)) return true;
  return BAD_TITLE_PATTERNS.some((pattern) => pattern.test(title));
};

const buildTitleFromTranscript = (
  transcript: Array<{ text: string }> = [],
  videoId: string,
) => {
  // Skip first 10 chunks to avoid intro noise
  const skip = Math.min(10, Math.floor(transcript.length * 0.08));
  const combined = transcript
    .slice(skip, skip + 8)
    .map((chunk) => chunk.text || "")
    .join(" ")
    .replace(/\[Music\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!combined) {
    return `Video ${videoId}`;
  }

  const words = combined.split(" ").slice(0, 7).join(" ");
  return words.length > 70 ? `${words.slice(0, 67).trim()}...` : words;
};

const resolveVideoTitle = (
  aiTitle: string | undefined,
  transcript: Array<{ text: string }> = [],
  videoId: string,
) => {
  const cleaned = (aiTitle || "")
    .replace(/[\"'`*#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned && !isBadTitle(cleaned)) {
    return cleaned;
  }

  return buildTitleFromTranscript(transcript, videoId);
};

export const getTranscript = asyncHandler(async (req, res) => {
  const { youtubeUrl } = req.body;

  if (!youtubeUrl) {
    throw new ApiError(400, "YoutubeUrl is required");
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new ApiError(400, "Invalid YouTube URL");
  }
  
  const videoExists = await Video.findOne({
    youtubeVideoId: videoId,
  });

  if (videoExists) {
    let triggerIngestion = false;

    if (!videoExists.transcript || (Array.isArray(videoExists.transcript) && videoExists.transcript.length === 0)) {
      videoExists.transcript = await getTranscriptFromYoutube(videoId);
      await videoExists.save();
      triggerIngestion = true;
    } else {
      const optimized = optimizeStoredTranscript(videoExists.transcript);
      const shouldSave =
        optimized.length !== videoExists.transcript.length ||
        optimized.some((chunk, index) => {
          const existing = videoExists.transcript[index];
          return (
            !existing ||
            existing.start !== chunk.start ||
            (existing as any).end !== chunk.end ||
            existing.duration !== chunk.duration ||
            existing.text !== chunk.text
          );
        });

      if (shouldSave) {
        videoExists.transcript = optimized as any;
        await videoExists.save();
        triggerIngestion = true;
      }
    }
    
    if (!videoExists.title || isBadTitle(videoExists.title)) {
      const aiTitle = await generateVideoTitle(videoExists.transcript);
      videoExists.title = resolveVideoTitle(aiTitle, videoExists.transcript as any, videoId);
      await videoExists.save();
    }

    if (triggerIngestion || !videoExists.ragStatus || videoExists.ragStatus === "failed") {
      ingestVideoForRag({ videoDocumentId: videoExists._id }).catch((err) => {
        console.error("[RAG] Background video ingestion failed:", err.message);
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          videoExists,
          "Transcript generated successfully",
        ),
      );
  }

  const transcript = await getTranscriptFromYoutube(videoId);

  if (!transcript) {
    throw new ApiError(400, "transcript generation failed. Try again");
  }

  const aiTitle = await generateVideoTitle(transcript);
  const title = resolveVideoTitle(aiTitle, transcript as any, videoId);

  const video = await Video.create({
    youtubeUrl,
    youtubeVideoId: videoId,
    transcript,
    title,
  });

  ingestVideoForRag({ videoDocumentId: video._id }).catch((err) => {
    console.error("[RAG] Background video ingestion failed:", err.message);
  });

  res
    .status(200)
    .json(new ApiResponse(200, video, "Transcript generated successfully"));
});

