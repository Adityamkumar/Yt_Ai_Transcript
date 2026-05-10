import { Video } from "../models/VideoUrl.model.js";
import { askAiAboutTranscript } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const askQuestion = asyncHandler(async (req, res) => {
  const { videoId, question } = req.body;

  if (!videoId || !question) {
    throw new ApiError(400, "videoId and question are required");
  }

  const video = await Video.findOne({
   youtubeVideoId: videoId
})
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const transcript = video.transcript;

  const answer = await askAiAboutTranscript(transcript, question);

  return res
    .status(200)
    .json(new ApiResponse(200, answer, "answer generated successfully"));
});
