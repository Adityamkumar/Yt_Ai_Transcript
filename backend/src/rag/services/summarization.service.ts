import Plimit from "p-limit";
import type { ITranscriptChunk } from "../../models/transcriptChunk.model.js";
import { groupIntoBatches } from "../utils/groupIntoBatches.util.js";
import type { IntermediateSummary } from "../types/summary.types.js";
import { RAG_CONFIG } from "../RagConfig/rag.config.js";
import { generateIntermediateSummary } from "../../services/ai.service.js";
import { generateFinalSummary } from "../../services/ai.service.js";
import logger from "../../lib/logger.js";
import type { SummaryLanguage } from "../utils/languagePrompt.util.js";
import { formatTimestamp } from "../../utils/formatTimestamp.js";

export const createSummaryBatches = (chunks: ITranscriptChunk[]) => {
  return groupIntoBatches(chunks, RAG_CONFIG.summarization.batch_size);
};

export const generateIntermediateSummaries = async (
  batches: ITranscriptChunk[][],
  language: SummaryLanguage,
): Promise<IntermediateSummary[]> => {
  const limit = Plimit(RAG_CONFIG.summarization.concurrency);
  const startedAt = performance.now();
  const summaries = await Promise.all(
    batches.map((batch, index) =>
      limit(async () => {
        const start = batch[0]!.start;
        const end = batch[batch.length - 1]!.end;

        const transcript = batch.map((chunk) => chunk.text).join("\n\n");

        const summary = await generateIntermediateSummary(
          transcript,
          language,
          formatTimestamp(start),
          formatTimestamp(end),
        );

        return {
          start,
          end,
          summary,
        };
      }),
    ),
  );
  const totalDurationMs = performance.now() - startedAt;

  logger.info(
    {
      totalBatches: batches.length,
      concurrency: RAG_CONFIG.summarization.concurrency,
      totalDurationMs: Math.round(totalDurationMs),
    },
    "[Summary] All intermediate summaries completed",
  );

  return summaries;
};

export const mergeIntermediateSummaries = async (
  summaries: IntermediateSummary[],
  language: SummaryLanguage,
): Promise<string> => {
  const mergedInput = summaries
    .map(
      (summary, index) => `
Section ${index + 1}

Start Seconds:
${summary.start}

End Seconds:
${summary.end}

Summary:
${summary.summary}
`,
    )
    .join("\n\n====================================\n\n");

  return await generateFinalSummary(mergedInput, language);
};

export const generateHierarchicalSummary = async (
  chunks: ITranscriptChunk[],
  language: SummaryLanguage,
): Promise<string> => {
  const batches = createSummaryBatches(chunks);

  const intermediateSummaries = await generateIntermediateSummaries(
    batches,
    language,
  );

  return await mergeIntermediateSummaries(intermediateSummaries, language);
};
