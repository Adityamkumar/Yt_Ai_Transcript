export const RAG_CONFIG = {
  embeddings: {
    model: "gemini-embedding-2",
    dimensions: 1536,
    documentTaskType: "RETRIEVAL_DOCUMENT",
    queryTaskType: "RETRIEVAL_QUERY",
    batchSize:20
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
    pdfChunks: "pdfchunks_vector_index",
    transcriptChunks: "transcript_chunks_vector_index",
  },
  retries: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxJitterMs: 250,
    MAX_AUTO_RETRIES: 2,
    MAX_MANUAL_RETRIES: 2,
  },
  summarization:{
    batch_size:5
  }

} as const;

export type RagConfig = typeof RAG_CONFIG;
