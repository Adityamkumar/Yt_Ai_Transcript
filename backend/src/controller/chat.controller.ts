import { Video } from "../models/VideoUrl.model.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import { retrieveRelevantTranscriptChunks } from "../utils/retrieveRelevantTranscriptChunks.js";
import { ingestVideoForRag } from "../rag/services/transcriptRagIngestion.service.js";
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

  // Fetch all chunks for the video first
  let chunks = await TranscriptChunk.find({ videoDocumentId: video._id }).sort({ chunkIndex: 1 });

  // Fallback: If chunks are empty, trigger RAG ingestion dynamically
  if (chunks.length === 0) {
    console.log(`Transcript chunks empty for video ${videoId}, attempting dynamic re-ingestion...`);
    try {
      await ingestVideoForRag({ videoDocumentId: video._id });
      chunks = await TranscriptChunk.find({ videoDocumentId: video._id }).sort({ chunkIndex: 1 });
    } catch (err: any) {
      console.error("[Chat] Failed to auto-ingest video transcript:", err.message);
    }
  }

  if (chunks.length === 0) {
    throw new ApiError(400, "Transcript is currently being prepared. Please try again shortly.");
  }

  // Determine RAG context context: top-N relevant chunks for chat, or all chunks for summaries/notes
  let relevantChunks: any[] = chunks;
  if (type === "chat" && question) {
    relevantChunks = await retrieveRelevantTranscriptChunks(video._id, question, 8);
  }

  const contextMessages = getRecentMessages(recentMessages, 10);

  if (type === "notes" || !isStreamingRequest(req.body as AskQuestionBody, req.headers.accept)) {
    const answer = await askAiAboutTranscript(relevantChunks, question || "", contextMessages, type);

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
    for await (const chunk of streamAiAboutTranscript(relevantChunks, question || "", contextMessages, type)) {
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

