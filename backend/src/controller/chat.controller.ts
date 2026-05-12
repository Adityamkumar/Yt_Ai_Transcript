import { Video } from "../models/VideoUrl.model.js";
import {
  askAiAboutTranscript,
  getRecentMessages,
  streamAiAboutTranscript,
  type ConversationMessage,
} from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type AskQuestionBody = {
  videoId?: string;
  question?: string;
  recentMessages?: ConversationMessage[];
  stream?: boolean;
};

const isStreamingRequest = (body: AskQuestionBody, acceptHeader?: string | string[]) => {
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(",") : acceptHeader ?? "";
  return body.stream === true || accept.includes("text/plain") || accept.includes("text/event-stream");
};

export const askQuestion = asyncHandler(async (req, res) => {
  const { videoId, question, recentMessages = [] } = req.body as AskQuestionBody;

  if (!videoId || !question) {
    throw new ApiError(400, "videoId and question are required");
  }

  const video = await Video.findOne({
    youtubeVideoId: videoId,
  });

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const transcript = video.transcript;
  const contextMessages = getRecentMessages(recentMessages, 10);

  if (!isStreamingRequest(req.body as AskQuestionBody, req.headers.accept)) {
    const answer = await askAiAboutTranscript(transcript, question, contextMessages);

    return res
      .status(200)
      .json(new ApiResponse(200, answer, "answer generated successfully"));
  }

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;

  req.on("close", () => {
    closed = true;
  });

  try {
    for await (const chunk of streamAiAboutTranscript(transcript, question, contextMessages)) {
      if (closed || res.destroyed) break;
      res.write(chunk);
    }

    if (!closed && !res.destroyed) {
      res.end();
    }
  } catch (error: any) {
    if (!closed && !res.destroyed) {
      if (!res.headersSent) {
        res.status(500);
      }
      const errorMessage = error?.message || "I encountered a brief technical issue. Please try asking your question again.";
      res.write(`\n\nI'm sorry, ${errorMessage}`);
      res.end();
    }
  }
});
