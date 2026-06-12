import { chunkTranscript } from "../../utils/chunkTranscript.js";
import type { ITranscriptChunk } from "../../models/VideoUrl.model.js";

export type TranscriptRagChunkInput = {
  text: string;
  chunkIndex: number;
  start: number;
  end: number;
  duration: number;
};

/**
 * Service to divide video transcript chunks into semantic chunks suited for RAG,
 * preserving timestamp boundaries.
 */
export const chunkTranscriptForRag = (
  transcript: ITranscriptChunk[],
): TranscriptRagChunkInput[] => {
  const rawChunks = transcript.map((chunk) => ({
    text: chunk.text,
    start: chunk.start,
    duration: chunk.duration,
  }));

  const semanticChunks = chunkTranscript(rawChunks);

  return semanticChunks.map((chunk, index) => ({
    text: chunk.text,
    chunkIndex: index,
    start: chunk.start,
    end: chunk.end,
    duration: chunk.duration,
  }));
};
