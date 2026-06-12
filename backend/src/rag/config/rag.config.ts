export const RAG_CONFIG = {
  embeddings: {
    model: "gemini-embedding-2",
    dimensions: 1536,
    documentTaskType: "RETRIEVAL_DOCUMENT",
    queryTaskType: "RETRIEVAL_QUERY",
  },
  chunking: {
    chunkSize: 500,
    chunkOverlap: 100,
  },
  retrieval: {
    topK: 5,
    minSimilarityScore: 0.7,
    numCandidatesMultiplier: 20,
    vectorPath: "embedding",
    scoreField: "score",
  },
  indexes: {
    pdfChunks: "pdf_chunks_vector_index",
    transcriptChunks: "transcript_chunks_vector_index",
  },
  retries: {
    maxAttempts: 3,
    baseDelayMs: 500,
  },
} as const;

export type RagConfig = typeof RAG_CONFIG;
