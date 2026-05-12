import { Video } from "../models/VideoUrl.model.js";
import { getTranscriptFromYoutube } from "../services/transcript.service.js";
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
  
  const videoExists = await Video.findOne({
    youtubeVideoId: videoId,
  });

  if (videoExists) {
    if (!videoExists.title) {
      videoExists.title = await generateVideoTitle(videoExists.transcript);
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

  const title = await generateVideoTitle(transcript);

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
