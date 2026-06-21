import type { IPdfChunk } from "../models/pdfChunk.model.js";

export const formatDocumentContext = (chunks: IPdfChunk[]): string => {
  if (chunks.length === 0) {
    return "";
  }

  return chunks
    .map((chunk) => {
      return `[Page ${chunk.page}]:\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
};

