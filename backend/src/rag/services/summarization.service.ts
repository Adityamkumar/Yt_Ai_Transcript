import type { ITranscriptChunk } from "../../models/transcriptChunk.model.js";
import { groupIntoBatches } from "../utils/groupIntoBatches.util.js";
import type { IntermediateSummary } from "../types/summary.types.js";
import { RAG_CONFIG } from "../RagConfig/rag.config.js";
import { generateIntermediateSummary } from "../../services/ai.service.js";
import { generateFinalSummary } from "../../services/ai.service.js";
import logger from "../../lib/logger.js";
import type { SummaryLanguage } from "../utils/languagePrompt.util.js";
import { secondsToTimestamp } from "../utils/timestamp.util.js";

export const createSummaryBatches = (chunks: ITranscriptChunk[]) => {
  return groupIntoBatches(chunks, RAG_CONFIG.summarization.batch_size);
};



export const generateIntermediateSummaries = async (
  batches: ITranscriptChunk[][],
  language:SummaryLanguage
): Promise<IntermediateSummary[]> => {
  const summaries: IntermediateSummary[] = [];

  for (const batch of batches) {
    const start = batch[0]!.start;
    const end = batch[batch.length - 1]!.end;

    const startTimestamp = secondsToTimestamp(start);
    const endTimestamp = secondsToTimestamp(end);
    const transcript = batch.map((chunk) => chunk.text).join("\n\n");
    const summary = await generateIntermediateSummary(
      transcript, 
      language,
      startTimestamp,
      endTimestamp
    );
    summaries.push({
      start,
      end,
      summary,
    });
    logger.info(
      {
        start,
        end,
        summaryLength: summary.length,
      },
      "[Summary] Intermediate summary generated",
    );
  }

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
  language:SummaryLanguage
): Promise<string> => {
  const batches = createSummaryBatches(chunks);

  const intermediateSummaries =
    await generateIntermediateSummaries(batches, language);

  return await mergeIntermediateSummaries(intermediateSummaries, language);
};
