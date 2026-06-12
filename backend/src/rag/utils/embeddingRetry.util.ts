import { generateDocumentEmbedding } from "../../ai/embedding.service.js";
import { RAG_CONFIG } from "../config/rag.config.js";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const generateDocumentEmbeddingWithRetry = async (
  text: string,
  title?: string,
): Promise<number[]> => {
  const { maxAttempts, baseDelayMs } = RAG_CONFIG.retries;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generateDocumentEmbedding(text, title);
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isLastAttempt = attempt === maxAttempts;

      if (isLastAttempt) {
        break;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `[EmbeddingRetry] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delayMs}ms. Error: ${lastError.message}`,
      );

      await sleep(delayMs);
    }
  }

  throw new Error(
    `[EmbeddingRetry] All ${maxAttempts} attempts exhausted. Last error: ${lastError?.message ?? "Unknown"}`,
  );
};
