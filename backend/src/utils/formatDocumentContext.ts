import type { IPdfChunk } from "../models/pdfDocument.model.js";

export const formatDocumentContext = (chunks: IPdfChunk[]): string => {
  if (chunks.length === 0) {
    return "No document context available.";
  }

  return chunks
    .map((chunk) => {
      return `[Page ${chunk.page}]:\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
};

