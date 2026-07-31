import { Video } from "../models/VideoUrl.model.js";
import { getTranscriptFromYoutube } from "../services/transcript.service.js";
import { generateVideoTitle } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractVideoId } from "../utils/extractVideoId.js";
import { ingestVideoForRag } from "../rag/services/transcriptRagIngestion.service.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import logger from "../lib/logger.js";

const GENERIC_VIDEO_TITLES = new Set([
  "new conversation",
  "new chat",
  "untitled",
  "video",
  "youtube video",
]);


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

    
    const chunkCount = await TranscriptChunk.countDocuments({ videoDocumentId: videoExists._id });
    if (chunkCount === 0 || !videoExists.ragStatus || videoExists.ragStatus === "failed") {
      triggerIngestion = true;
    }
    
    if (!videoExists.title || isBadTitle(videoExists.title)) {
      const fetchedTranscript = await getTranscriptFromYoutube(videoId);
      if (fetchedTranscript) {
        const aiTitle = await generateVideoTitle(fetchedTranscript);
        videoExists.title = resolveVideoTitle(aiTitle, fetchedTranscript as any, videoId);
        await videoExists.save();
      }
    }

    if (triggerIngestion) {
      await Video.findByIdAndUpdate(videoExists._id, {
        status: "processing",
        ragStatus: "processing",
      });
      ingestVideoForRag({ videoDocumentId: videoExists._id }).catch((err) => {
        logger.error({ err }, "[RAG] Background video ingestion failed");
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
    title,
    uploadedBy:req.user?._id!,
    status: "processing",
    ragStatus: "processing",
  });

  ingestVideoForRag({ videoDocumentId: video._id }).catch((err) => {
    logger.error({ err }, "[RAG] Background video ingestion failed");
  });

  res
    .status(200)
    .json(new ApiResponse(200, video, "Transcript generated successfully"));
});

