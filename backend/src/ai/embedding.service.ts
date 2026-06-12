import { getGeminiClient } from "./gemini.client.js";
import { RAG_CONFIG } from "../rag/config/rag.config.js";

export type EmbeddingTaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY"
  | "SEMANTIC_SIMILARITY";

export type GenerateEmbeddingOptions = {
  taskType?: EmbeddingTaskType;
  title?: string;
};

const assertValidEmbedding = (embedding: number[], source: string) => {
  if (embedding.length !== RAG_CONFIG.embeddings.dimensions) {
    throw new Error(
      `${source} embedding dimension mismatch. Expected ${RAG_CONFIG.embeddings.dimensions}, received ${embedding.length}.`,
    );
  }
};

export const generateEmbedding = async (
  text: string,
  options: GenerateEmbeddingOptions = {},
) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("Cannot generate an embedding for empty text.");
  }

  const ai = getGeminiClient();
  const config: {
    outputDimensionality: number;
    taskType?: EmbeddingTaskType;
    title?: string;
  } = {
    outputDimensionality: RAG_CONFIG.embeddings.dimensions,
  };

  if (options.taskType) {
    config.taskType = options.taskType;
  }

  if (options.title) {
    config.title = options.title;
  }

  const response = await ai.models.embedContent({
    model: RAG_CONFIG.embeddings.model,
    contents: trimmedText,
    config,
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length === 0) {
    throw new Error("Gemini returned an empty embedding.");
  }

  assertValidEmbedding(embedding, "Gemini");

  return embedding;
};

export const generateDocumentEmbedding = async (text: string, title?: string) => {
  const options: GenerateEmbeddingOptions = {
    taskType: RAG_CONFIG.embeddings.documentTaskType,
  };

  if (title) {
    options.title = title;
  }

  return generateEmbedding(text, options);
};

export const generateQueryEmbedding = async (query: string) =>
  generateEmbedding(query, {
    taskType: RAG_CONFIG.embeddings.queryTaskType,
  });
