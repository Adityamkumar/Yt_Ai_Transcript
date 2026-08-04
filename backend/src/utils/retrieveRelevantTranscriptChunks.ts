import { generateQueryEmbedding } from "../ai/embedding.service.js";
import {
  TranscriptChunk,
  type ITranscriptChunk,
} from "../models/transcriptChunk.model.js";
import { Types } from "mongoose";
import {
  executeVectorSearch,
  filterBySimilarityThreshold,
} from "../vector/mongoVectorSearch.util.js";
import { RAG_CONFIG } from "../rag/RagConfig/rag.config.js";

export const retrieveRelevantTranscriptChunks = async (
  videoDocumentId: string | Types.ObjectId,
  question: string,
  limit = 8,
): Promise<ITranscriptChunk[]> => {
  const videoId = typeof videoDocumentId === "string" ? new Types.ObjectId(videoDocumentId) : videoDocumentId;

  const queryVector = await generateQueryEmbedding(question);

  const results = await executeVectorSearch<
    ITranscriptChunk & { score: number }
  >(TranscriptChunk, {
    index: RAG_CONFIG.indexes.transcriptChunks,
    queryVector,
    limit,
    filter: {
      videoDocumentId: videoId,
    },
  });

  const finalResult = filterBySimilarityThreshold(results);

  finalResult.sort((a, b) => a.chunkIndex - b.chunkIndex);

  return finalResult;
};
