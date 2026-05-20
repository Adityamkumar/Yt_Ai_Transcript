export interface RawPageInput {
  page: number;
  text: string;
}

export interface ChunkOutput {
  text: string;
  chunkIndex: number;
  page: number;
  wordCount: number;
}

const MIN_CHARS = 400;
const MAX_CHARS = 1200;
const MIN_WORDS = 80;
const MAX_WORDS = 250;

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();
const estimateWords = (text: string) => (text.match(/\S+/g) || []).length;
const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const chunkDocument = (pages: RawPageInput[]): ChunkOutput[] => {
  const chunks: ChunkOutput[] = [];
  let chunkIndex = 0;

  let currentBuffer: string[] = [];
  let currentWordCount = 0;
  let currentPage = 1;

  const flush = () => {
    if (currentBuffer.length === 0) return;
    const text = normalizeText(currentBuffer.join(" "));
    if (text.length > 0) {
      chunks.push({
        text,
        chunkIndex,
        page: currentPage,
        wordCount: currentWordCount,
      });
      chunkIndex++;
    }
    currentBuffer = [];
    currentWordCount = 0;
  };

  for (const pageObj of pages) {
    const pageText = pageObj.text.trim();
    if (!pageText) continue;

    const sentences = splitSentences(pageText);
    for (const sentence of sentences) {
      const sentenceWords = estimateWords(sentence);
      
      // If single sentence is too long, split it by words
      if (sentenceWords > MAX_WORDS) {
        flush();
        const words = sentence.split(/\s+/).filter(Boolean);
        let subBuffer: string[] = [];
        for (const w of words) {
          subBuffer.push(w);
          if (subBuffer.length >= MAX_WORDS) {
            chunks.push({
              text: subBuffer.join(" "),
              chunkIndex,
              page: pageObj.page,
              wordCount: subBuffer.length,
            });
            chunkIndex++;
            subBuffer = [];
          }
        }
        if (subBuffer.length > 0) {
          currentPage = pageObj.page;
          currentBuffer = [subBuffer.join(" ")];
          currentWordCount = subBuffer.length;
        }
        continue;
      }

      if (currentBuffer.length === 0) {
        currentPage = pageObj.page;
      }

      const predictedWords = currentWordCount + sentenceWords;
      const predictedChars = currentBuffer.join(" ").length + sentence.length + 1;

      // If adding this sentence exceeds maximum limits, flush first
      if (predictedWords > MAX_WORDS || predictedChars > MAX_CHARS) {
        flush();
        currentPage = pageObj.page;
      }

      currentBuffer.push(sentence);
      currentWordCount += sentenceWords;

      // If we met the minimum criteria, flush
      const currentChars = currentBuffer.join(" ").length;
      if (currentChars >= MIN_CHARS || currentWordCount >= MIN_WORDS) {
        flush();
      }
    }
  }

  // Flush remaining buffer
  flush();

  return chunks;
};
