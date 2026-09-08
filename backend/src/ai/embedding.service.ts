import { getGeminiEmbeddingClient } from "./gemini.client.js";
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

export class EmbeddingError extends Error {
  public readonly retryable: boolean;
  public readonly status?: number;
  public readonly retryAfterMs?: number;

  constructor(
    message: string,
    options: {
      retryable: boolean;
      status?: number;
      retryAfterMs?: number;
    },
  ) {
    super(message);

    this.name = "EmbeddingError";
    this.retryable = options.retryable;
    if (options.status !== undefined) {
      this.status = options.status;
    }
    if (options.retryAfterMs !== undefined) {
      this.retryAfterMs = options.retryAfterMs;
    }
  }
}

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

const getErrorStatus = (error: any): number | null => {
  if (typeof error?.status === "number") {
    return error.status;
  }

  if (typeof error?.statusCode === "number") {
    return error.statusCode;
  }

  return null;
};

const isRetryableError = (error: any): boolean => {
  const status = getErrorStatus(error);

  // errors that may recover if we wait.
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

const getRetryAfterMs = (error: any): number | null => {
  const headers = error?.headers;

  if (headers) {
    let retryAfter: string | null = null;

    if (typeof headers.get === "function") {
      retryAfter = headers.get("retry-after");
    } else if (typeof headers["retry-after"] === "string") {
      retryAfter = headers["retry-after"];
    } else if (typeof headers["Retry-After"] === "string") {
      retryAfter = headers["Retry-After"];
    }

    if (retryAfter) {
      const seconds = Number(retryAfter);

      if (Number.isFinite(seconds) && seconds >= 0) {
        return seconds * 1000;
      }

      const retryDate = Date.parse(retryAfter);

      if (!Number.isNaN(retryDate)) {
        return Math.max(0, retryDate - Date.now());
      }
    }
  }

  const details = error?.error?.details ?? error?.details;

  if (Array.isArray(details)) {
    for (const detail of details) {
      const retryDelay = detail?.retryDelay;

      if (typeof retryDelay === "string") {
        const match = retryDelay.match(/^([\d.]+)s$/);

        if (match) {
          const seconds = Number(match[1]);

          if (Number.isFinite(seconds) && seconds >= 0) {
            return seconds * 1000;
          }
        }
      }
    }
  }

  return null;
};

const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  const { maxAttempts, baseDelayMs, maxJitterMs } = RAG_CONFIG.retries;

  let lastError: EmbeddingError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const status = getErrorStatus(error);
      const retryAfterMs = getRetryAfterMs(error);
      const retryable = isRetryableError(error);
      const errorOptions: {
        retryable: boolean;
        status?: number;
        retryAfterMs?: number;
      } = {
        retryable,
      };

      if (status !== null) {
        errorOptions.status = status;
      }

      if (retryAfterMs !== null) {
        errorOptions.retryAfterMs = retryAfterMs;
      }

      lastError = new EmbeddingError(
        error?.message ?? String(error),
        errorOptions,
      );

      if (!retryable) {
        logger.error(
          {
            attempt,
            maxAttempts,
            status,
            error: lastError.message,
          },
          "[Embedding] Non-retryable error. Stopping retry.",
        );

        throw lastError;
      }

      if (attempt === maxAttempts) {
        break;
      }

      let delayMs: number;

      if (retryAfterMs !== null) {
        delayMs = retryAfterMs;

        logger.warn(
          {
            attempt,
            maxAttempts,
            status,
            retryAfterMs: delayMs,
            error: lastError.message,
          },
          "[Embedding] Gemini requested a retry delay. Respecting it.",
        );
      } else {
        const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);

        const jitter = Math.floor(Math.random() * maxJitterMs);

        delayMs = exponentialDelay + jitter;

        logger.warn(
          {
            attempt,
            maxAttempts,
            status,
            retryAfterMs: delayMs,
            error: lastError.message,
          },
          "[Embedding] Transient error. Retrying with exponential backoff.",
        );
      }

      await sleep(delayMs);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new EmbeddingError(
    `[Embedding] All ${maxAttempts} attempts exhausted.`,
    {
      retryable: true,
    },
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

    const ai = getGeminiEmbeddingClient();

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

export const generateDocumentEmbeddings = (texts: string[], title?: string) =>
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

    const ai = getGeminiEmbeddingClient();

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
