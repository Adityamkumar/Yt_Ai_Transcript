import { getGeminiClient } from "./gemini.client.js";
import { RAG_CONFIG } from "../rag/RagConfig/rag.config.js";
import logger from "../lib/logger.js";

export type EmbeddingTaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY"
  | "SEMANTIC_SIMILARITY";

export type GenerateEmbeddingOptions = {
  taskType?: EmbeddingTaskType;
  title?: string;
};

const createEmbeddingConfig = (options: GenerateEmbeddingOptions) => ({
  outputDimensionality: RAG_CONFIG.embeddings.dimensions,
  ...(options.taskType && { taskType: options.taskType }),
  ...(options.title && { title: options.title }),
});

const assertValidEmbedding = (embedding: number[], source: string) => {
  if (embedding.length !== RAG_CONFIG.embeddings.dimensions) {
    throw new Error(
      `${source} embedding dimension mismatch. Expected ${RAG_CONFIG.embeddings.dimensions}, received ${embedding.length}.`,
    );
  }
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  const { maxAttempts, baseDelayMs } = RAG_CONFIG.retries;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        break;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * RAG_CONFIG.retries.maxJitterMs);

      logger.warn(
        {
          attempt,
          maxAttempts,
          retryAfterMs: delayMs + jitter,
          error: lastError.message,
        },
        "[Embedding] Request failed. Retrying...",
      );

      await sleep(delayMs + jitter);
    }
  }

  throw new Error(
    `[Embedding] All ${maxAttempts} attempts exhausted. Last error: ${
      lastError?.message ?? "Unknown"
    }`,
  );
};

export const generateEmbedding = async (
  text: string,
  options: GenerateEmbeddingOptions = {},
): Promise<number[]> =>
  withRetry(async () => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new Error("Cannot generate an embedding for empty text.");
    }

    const ai = getGeminiClient();

    const config = createEmbeddingConfig(options);

    const response = await ai.models.embedContent({
      model: RAG_CONFIG.embeddings.model,
      contents: [
        {
          parts: [{ text: trimmedText }],
        },
      ],
      config,
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Gemini returned an empty embedding.");
    }

    assertValidEmbedding(embedding, "Gemini");

    return embedding;
  });

export const generateDocumentEmbeddings = (
  texts: string[],
  title?: string,
) =>
  generateEmbeddings(texts, {
    taskType: RAG_CONFIG.embeddings.documentTaskType,
    ...(title && { title }),
  });

export const generateEmbeddings = async (
  texts: string[],
  options: GenerateEmbeddingOptions = {},
): Promise<number[][]> =>
  withRetry(async () => {
    const trimmedTexts = texts.map((text) => text.trim());

    if (trimmedTexts.length === 0) {
      throw new Error("Cannot generate embeddings for empty array.");
    }

    if (trimmedTexts.some((text) => text.length === 0)) {
      throw new Error("One or more texts are empty.");
    }

    const ai = getGeminiClient();

    const config = createEmbeddingConfig(options);

    const response = await ai.models.embedContent({
      model: RAG_CONFIG.embeddings.model,
      contents: trimmedTexts.map((text) => ({
        parts: [{ text }],
      })),
      config,
    });

    if (
      !response.embeddings ||
      response.embeddings.length !== trimmedTexts.length
    ) {
      throw new Error(
        `Expected ${trimmedTexts.length} embeddings, got ${
          response.embeddings?.length ?? 0
        }`,
      );
    }

    const embeddings = response.embeddings.map((emb, index) => {
      const values = emb.values;

      if (!values || values.length === 0) {
        throw new Error(
          `Gemini returned an empty embedding at index ${index}.`,
        );
      }

      assertValidEmbedding(values, `Gemini[${index}]`);

      return values;
    });

    logger.info(
      {
        generated: embeddings.length,
        requested: trimmedTexts.length,
        dimensions: embeddings[0]?.length,
        model: RAG_CONFIG.embeddings.model,
      },
      "[Embeddings] Batch generated",
    );

    return embeddings;
  });

export const generateQueryEmbedding = async (query: string) =>
  generateEmbedding(query, {
    taskType: RAG_CONFIG.embeddings.queryTaskType,
  });
