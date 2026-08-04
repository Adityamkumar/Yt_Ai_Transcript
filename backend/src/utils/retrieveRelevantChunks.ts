import { generateQueryEmbedding } from "../ai/embedding.service.js";
import { Types } from "mongoose";
import {
  executeVectorSearch,
  filterBySimilarityThreshold,
} from "../vector/mongoVectorSearch.util.js";
import { RAG_CONFIG } from "../rag/RagConfig/rag.config.js";
import { PdfChunk, type IPdfChunk } from "../models/pdfChunk.model.js";

export const retrieveRelevantChunks = async (
  documentId: string | Types.ObjectId,
  question: string,
  limit = 8
): Promise<IPdfChunk[]> => {

  const docId = typeof documentId === "string" ? new Types.ObjectId(documentId) : documentId;

  const queryVector = await generateQueryEmbedding(question);

 const results = await executeVectorSearch<
  IPdfChunk & { score: number }
>(PdfChunk, {
  index: RAG_CONFIG.indexes.pdfChunks,
  queryVector,
  limit,
  filter:{
    documentId: docId
  }
});


  const finalResult = filterBySimilarityThreshold(results);

  finalResult.sort((a, b) => a.chunkIndex - b.chunkIndex);

  return finalResult;
};
