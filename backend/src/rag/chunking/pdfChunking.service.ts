import { RAG_CONFIG } from "../config/rag.config.js";
import type { PageText } from "../../utils/extractPdfText.js";

export type PdfRagChunkInput = {
  text: string;
  chunkIndex: number;
  page: number;
  wordCount: number;
};

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const countWords = (text: string) => (text.match(/\S+/g) || []).length;

const findChunkEnd = (text: string, targetEnd: number) => {
  if (targetEnd >= text.length) {
    return text.length;
  }

  const sentenceEnd = Math.max(
    text.lastIndexOf(". ", targetEnd),
    text.lastIndexOf("? ", targetEnd),
    text.lastIndexOf("! ", targetEnd),
  );

  if (sentenceEnd > targetEnd - RAG_CONFIG.chunking.chunkOverlap) {
    return sentenceEnd + 1;
  }

  const whitespaceEnd = text.lastIndexOf(" ", targetEnd);

  if (whitespaceEnd > targetEnd - RAG_CONFIG.chunking.chunkOverlap) {
    return whitespaceEnd;
  }

  return targetEnd;
};

export const chunkPdfPagesForRag = (pages: PageText[]) => {
  const chunks: PdfRagChunkInput[] = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageText = normalizeText(page.text);

    if (!pageText) {
      continue;
    }

    let start = 0;

    while (start < pageText.length) {
      const targetEnd = Math.min(
        start + RAG_CONFIG.chunking.chunkSize,
        pageText.length,
      );
      const end = findChunkEnd(pageText, targetEnd);
      const text = normalizeText(pageText.slice(start, end));

      if (text) {
        chunks.push({
          text,
          chunkIndex,
          page: page.page,
          wordCount: countWords(text),
        });
        chunkIndex += 1;
      }

      if (end >= pageText.length) {
        break;
      }

      start = Math.max(0, end - RAG_CONFIG.chunking.chunkOverlap);
    }
  }

  return chunks;
};
