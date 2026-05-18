import { Video } from "../models/VideoUrl.model.js";
import { getTranscriptFromYoutube, optimizeStoredTranscript } from "../services/transcript.service.js";
import { generateVideoTitle } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractVideoId } from "../utils/extractVideoId.js";

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
    if (!videoExists.transcript || (Array.isArray(videoExists.transcript) && videoExists.transcript.length === 0)) {
      videoExists.transcript = await getTranscriptFromYoutube(videoId);
      await videoExists.save();
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
      }
    }
    
    if (!videoExists.title) {
      videoExists.title = (await generateVideoTitle(videoExists.transcript)) || "New Conversation";
      await videoExists.save();
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

  const title = (await generateVideoTitle(transcript)) || "New Conversation";

  const video = await Video.create({
    youtubeUrl,
    youtubeVideoId: videoId,
    transcript,
    title,
  });

  res
    .status(200)
    .json(new ApiResponse(200, video, "Transcript generated successfully"));
});
