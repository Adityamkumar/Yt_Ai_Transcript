import { Video } from "../models/VideoUrl.model.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import { retrieveRelevantTranscriptChunks } from "../utils/retrieveRelevantTranscriptChunks.js";
import { isSimpleGreeting } from "../utils/greeting.js";
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
import logger from "../lib/logger.js";
import { generateHierarchicalSummary } from "../rag/services/summarization.service.js";
import { detectSummaryLanguage } from "../rag/utils/languagePrompt.util.js";
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
  const responseLanguage = req.user?.preferences.responseLanguage ?? 'en'
  if (!videoId || (!question && type !== "notes")) {
    throw new ApiError(400, "videoId and question are required");
  }

  const video = await Video.findOne({
    youtubeVideoId: videoId,
  });

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  let chunks = await TranscriptChunk.find({ videoDocumentId: video._id }).sort({ chunkIndex: 1 });
  if (chunks.length === 0) {
    logger.info(`Transcript chunks empty for video ${videoId}, attempting dynamic re-ingestion...`);
    try {
      await ingestVideoForRag({ videoDocumentId: video._id });
      chunks = await TranscriptChunk.find({ videoDocumentId: video._id }).sort({ chunkIndex: 1 });
    } catch (err: any) {
      logger.error({ err }, "[Chat] Failed to auto-ingest video transcript");
    }
  }

  if (chunks.length === 0) {
    throw new ApiError(400, "Transcript is currently being prepared. Please try again shortly.");
  }

  let relevantChunks: any[] = chunks;
  if (type === "chat" && question) {
    if (isSimpleGreeting(question)) {
      relevantChunks = [];
    } else {
      relevantChunks = await retrieveRelevantTranscriptChunks(video._id, question, 8);
    }
  }

 const contextMessages = getRecentMessages(recentMessages, 10);
 const language = detectSummaryLanguage(question!);
if (type === "summary") {
  const summary = await generateHierarchicalSummary(chunks, language);

  return res.status(200).json(
    new ApiResponse(
      200,
      summary,
      "Summary generated successfully",
    ),
  );
}

if (type === "notes" || !isStreamingRequest(req.body as AskQuestionBody, req.headers.accept)) {
  const answer = await askAiAboutTranscript(
    relevantChunks,
    question || "",
    contextMessages,
    type,
    responseLanguage
  );

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
    for await (const chunk of streamAiAboutTranscript(relevantChunks, question || "", contextMessages, type, responseLanguage)) {
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
