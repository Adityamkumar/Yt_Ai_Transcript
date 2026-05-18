import { Video } from "../models/VideoUrl.model.js";
import { getTranscriptFromYoutube, optimizeStoredTranscript } from "../services/transcript.service.js";
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
  type?: "chat" | "notes" | "summary";
};

const isStreamingRequest = (body: AskQuestionBody, acceptHeader?: string | string[]) => {
  if (body.stream === true) return true;
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(",") : acceptHeader ?? "";
  return accept.includes("text/event-stream") || (accept.includes("text/plain") && !accept.includes("application/json"));
};

export const askQuestion = asyncHandler(async (req, res) => {
  const { videoId, question, recentMessages = [], type = "chat" } = req.body as AskQuestionBody;

  if (!videoId || (!question && type !== "notes")) {
    throw new ApiError(400, "videoId and question are required");
  }

  const video = await Video.findOne({
    youtubeVideoId: videoId,
  });

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  let transcript = video.transcript;

  // Robust fallback: if transcript is empty, try to re-fetch it
  if (!transcript || (Array.isArray(transcript) && transcript.length === 0)) {
    console.log(`Transcript empty for video ${videoId}, attempting re-fetch...`);
    const fetchedTranscript = await getTranscriptFromYoutube(video.youtubeVideoId);
    if (fetchedTranscript) {
      video.transcript = fetchedTranscript;
      await video.save();
      transcript = video.transcript;
    }
  }

  if (Array.isArray(transcript) && transcript.length > 0) {
    const optimized = optimizeStoredTranscript(transcript);
    const shouldSave =
      optimized.length !== transcript.length ||
      optimized.some((chunk, index) => {
        const existing = transcript[index];
        return (
          !existing ||
          existing.start !== chunk.start ||
          (existing as any).end !== chunk.end ||
          existing.duration !== chunk.duration ||
          existing.text !== chunk.text
        );
      });

    if (shouldSave) {
      video.transcript = optimized as any;
      await video.save();
      transcript = video.transcript;
    }
  }

  const contextMessages = getRecentMessages(recentMessages, 10);

  // Notes should NEVER stream as per architecture requirements
  if (type === "notes" || !isStreamingRequest(req.body as AskQuestionBody, req.headers.accept)) {
    const answer = await askAiAboutTranscript(transcript, question || "", contextMessages, type);

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
    for await (const chunk of streamAiAboutTranscript(transcript, question || "", contextMessages, type)) {
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
