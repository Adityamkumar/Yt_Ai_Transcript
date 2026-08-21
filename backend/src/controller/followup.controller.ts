import { FOLLOWUP_SYSTEM_PROMPT } from "../services/followup.prompts.js";
import { aiProviderService } from "../services/ai/providers/aiProvider.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Conversation } from "../models/conversation.model.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import { PdfChunk } from "../models/pdfChunk.model.js";
import { retrieveRelevantTranscriptChunks } from "../utils/retrieveRelevantTranscriptChunks.js";
import { retrieveRelevantChunks } from "../utils/retrieveRelevantChunks.js";
import logger from "../lib/logger.js";
import { buildResponseLanguageInstruction } from "../rag/utils/languagePrompt.util.js";

const GeminiFollowUpSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["questions"],
};

export const generateFollowUp = asyncHandler(async (req, res) => {
  const { question, answer, context, conversationId } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "question and answer are required");
  }

  let retrievedContext = "";
  if (conversationId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        if (conversation.type === "video" && conversation.videoId) {
          // 1. Fetch up to 4 semantically relevant chunks
          const relevantChunks = await retrieveRelevantTranscriptChunks(conversation.videoId, question, 4);
          
          // 2. Fetch up to 4 chunks spread out evenly across the video transcript index
          const totalChunks = await TranscriptChunk.countDocuments({ videoDocumentId: conversation.videoId });
          let spreadChunks: any[] = [];
          if (totalChunks > 0) {
            const indices: number[] = [];
            const step = Math.max(1, Math.floor(totalChunks / 4));
            for (let i = 0; i < 4; i++) {
              const idx = Math.min(totalChunks - 1, i * step);
              if (!indices.includes(idx)) {
                indices.push(idx);
              }
            }
            spreadChunks = await TranscriptChunk.find({
              videoDocumentId: conversation.videoId,
              chunkIndex: { $in: indices }
            }).sort({ chunkIndex: 1 });
          }

          // Combine and deduplicate
          const combined = [...relevantChunks];
          const seenIds = new Set(combined.map(c => c._id.toString()));
          for (const sc of spreadChunks) {
            if (!seenIds.has(sc._id.toString())) {
              combined.push(sc);
            }
          }
          combined.sort((a, b) => a.chunkIndex - b.chunkIndex);
          retrievedContext = combined.map(c => c.text).join(" ");
        } else if (conversation.type === "pdf" && conversation.pdfDocumentId) {
          // 1. Fetch up to 4 semantically relevant chunks
          const relevantChunks = await retrieveRelevantChunks(conversation.pdfDocumentId, question, 4);

          // 2. Fetch up to 4 chunks spread out evenly across the PDF pages/index
          const totalChunks = await PdfChunk.countDocuments({ documentId: conversation.pdfDocumentId });
          let spreadChunks: any[] = [];
          if (totalChunks > 0) {
            const indices: number[] = [];
            const step = Math.max(1, Math.floor(totalChunks / 4));
            for (let i = 0; i < 4; i++) {
              const idx = Math.min(totalChunks - 1, i * step);
              if (!indices.includes(idx)) {
                indices.push(idx);
              }
            }
            spreadChunks = await PdfChunk.find({
              documentId: conversation.pdfDocumentId,
              chunkIndex: { $in: indices }
            }).sort({ chunkIndex: 1 });
          }

          // Combine and deduplicate
          const combined = [...relevantChunks];
          const seenIds = new Set(combined.map(c => c._id.toString()));
          for (const sc of spreadChunks) {
            if (!seenIds.has(sc._id.toString())) {
              combined.push(sc);
            }
          }
          combined.sort((a, b) => a.chunkIndex - b.chunkIndex);
          retrievedContext = combined.map(c => c.text).join(" ");
        }
      }
    } catch (err) {
      logger.error({ err }, "[FollowUp] Failed to fetch context chunks for grounding");
    }
  }

  const finalContext = retrievedContext || context || "";
  const truncatedAnswer = answer.slice(0, 1500);
  const truncatedContext = finalContext.slice(0, 3000);
  const language = req.user?.preferences?.responseLanguage ?? "en";
 const followUpResponseLanguage = buildResponseLanguageInstruction(language);

  const prompt = `
${FOLLOWUP_SYSTEM_PROMPT}

${followUpResponseLanguage}
User Question:
${question}

AI Answer:
${truncatedAnswer}

${truncatedContext ? `Source Context:\n${truncatedContext}` : ""}

Generate follow-up questions:
`;

  try {
    const rawText = await aiProviderService.generateStructuredResponse(prompt, GeminiFollowUpSchema);

    if (!rawText) {
      return res
        .status(200)
        .json(new ApiResponse(200, { followUpQuestions: [] }, "No suggestions generated"));
    }

    let parsed: { questions?: string[] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/```json\s?([\s\S]*?)\s?```/) || rawText.match(/```\s?([\s\S]*?)\s?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]!.trim());
      } else {
        parsed = { questions: [] };
      }
    }

    const uniqueQuestions: string[] = [];
    const seen = new Set<string>();

    for (const q of parsed.questions || []) {
      if (typeof q !== "string") continue;
      const trimmed = q.trim();
      if (trimmed.length === 0) continue;

      const normalized = trimmed.toLowerCase().replace(/[?.,!]/g, "").replace(/\s+/g, " ");
      if (seen.has(normalized)) continue;

      const normalizedUserQ = question.trim().toLowerCase().replace(/[?.,!]/g, "").replace(/\s+/g, " ");
      if (normalized === normalizedUserQ) continue;

      seen.add(normalized);
      uniqueQuestions.push(trimmed);
    }

    const questions = uniqueQuestions.slice(0, 3);

    return res
      .status(200)
      .json(new ApiResponse(200, { followUpQuestions: questions }, "Follow-up questions generated"));
  } catch (error: any) {
    return res
      .status(200)
      .json(new ApiResponse(200, { followUpQuestions: [] }, "Follow-up generation skipped"));
  }
});
