export type RawTranscriptChunk = {
  text: string;
  start: number;
  duration: number;
};

export type SemanticTranscriptChunk = {
  text: string;
  start: number;
  end: number;
  duration: number;
};

type ChunkingOptions = {
  minChars?: number;
  maxChars?: number;
  minWords?: number;
  maxWords?: number;
  maxGapSeconds?: number;
  maxDurationSeconds?: number;
};

const defaultOptions: Required<ChunkingOptions> = {
  minChars: 300,
  maxChars: 1000,
  minWords: 60,
  maxWords: 200,
  maxGapSeconds: 8,
  maxDurationSeconds: 90,
};

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const hasSentenceBoundary = (text: string) => /[.!?]["')\]]?\s*$/.test(text);

const estimateWords = (text: string) => (text.match(/\S+/g) || []).length;
const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const toSemanticChunk = (parts: RawTranscriptChunk[]): SemanticTranscriptChunk => {
  const start = Math.max(0, parts[0]?.start ?? 0);
  const last = parts[parts.length - 1];
  const lastEnd = Math.max(
    start,
    (last?.start ?? start) + (last?.duration ?? 0),
  );
  const text = normalizeText(parts.map((part) => part.text).join(" "));
  return {
    text,
    start,
    end: lastEnd,
    duration: Math.max(0, lastEnd - start),
  };
};

export const normalizeTranscriptChunks = (
  chunks: Array<{ text: string; start: number; duration: number; end?: number }>,
): SemanticTranscriptChunk[] => {
  return chunks
    .map((chunk) => {
      const start = Math.max(0, chunk.start || 0);
      const computedEnd = Math.max(
        start,
        typeof chunk.end === "number" && Number.isFinite(chunk.end)
          ? chunk.end
          : start + (chunk.duration || 0),
      );
      return {
        text: normalizeText(chunk.text || ""),
        start,
        end: computedEnd,
        duration: Math.max(0, computedEnd - start),
      };
    })
    .filter((chunk) => chunk.text.length > 0)
    .sort((a, b) => a.start - b.start);
};

export const chunkTranscript = (
  rawChunks: RawTranscriptChunk[],
  options: ChunkingOptions = {},
): SemanticTranscriptChunk[] => {
  const cfg = { ...defaultOptions, ...options };
  const normalizedRaw = rawChunks
    .map((chunk) => ({
      text: normalizeText(chunk.text),
      start: Math.max(0, chunk.start),
      duration: Math.max(0, chunk.duration),
    }))
    .filter((chunk) => chunk.text.length > 0)
    .sort((a, b) => a.start - b.start);

  if (normalizedRaw.length === 0) {
    return [];
  }

  const merged: SemanticTranscriptChunk[] = [];
  let buffer: RawTranscriptChunk[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const semantic = toSemanticChunk(buffer);
    if (semantic.text.length > 0) {
      merged.push(semantic);
    }
    buffer = [];
  };

  for (let i = 0; i < normalizedRaw.length; i += 1) {
    const current = normalizedRaw[i]!;
    const prev = buffer[buffer.length - 1];
    const prevEnd = prev ? prev.start + prev.duration : current.start;
    const gap = current.start - prevEnd;

    if (buffer.length > 0 && gap > cfg.maxGapSeconds) {
      flush();
    }

    buffer.push(current);

    const candidateText = normalizeText(buffer.map((part) => part.text).join(" "));
    const chars = candidateText.length;
    const words = estimateWords(candidateText);
    const bufferStart = buffer[0]?.start ?? current.start;
    const bufferDuration = Math.max(0, current.start + current.duration - bufferStart);
    const reachedMax = chars >= cfg.maxChars || words >= cfg.maxWords;
    const reachedMin = chars >= cfg.minChars || words >= cfg.minWords;
    const reachedMaxDuration = bufferDuration >= cfg.maxDurationSeconds;
    const boundary = hasSentenceBoundary(candidateText);
    const isLast = i === normalizedRaw.length - 1;

    if (
      isLast ||
      (reachedMax && boundary) ||
      (reachedMin && boundary && gap >= 0.5) ||
      (reachedMaxDuration && (boundary || reachedMin))
    ) {
      flush();
    }
  }

  const optimized: SemanticTranscriptChunk[] = [];
  for (const chunk of merged) {
    const previous = optimized[optimized.length - 1];
    if (!previous) {
      optimized.push(chunk);
      continue;
    }

    const previousWords = estimateWords(previous.text);
    const currentWords = estimateWords(chunk.text);
    const shouldMergeSmall =
      previousWords < cfg.minWords * 0.45 &&
      currentWords < cfg.minWords * 0.75 &&
      chunk.start - previous.end <= cfg.maxGapSeconds;

    if (shouldMergeSmall) {
      const text = normalizeText(`${previous.text} ${chunk.text}`);
      const end = Math.max(previous.end, chunk.end);
      previous.text = text;
      previous.end = end;
      previous.duration = Math.max(0, end - previous.start);
    } else {
      optimized.push(chunk);
    }
  }

  const enforceHardLimits = (chunks: SemanticTranscriptChunk[]) => {
    const result: SemanticTranscriptChunk[] = [];

    for (const chunk of chunks) {
      const words = estimateWords(chunk.text);
      const chars = chunk.text.length;
      const duration = chunk.duration;
      const exceeds =
        duration > cfg.maxDurationSeconds ||
        words > cfg.maxWords ||
        chars > cfg.maxChars;

      if (!exceeds) {
        result.push(chunk);
        continue;
      }

      const sentences = splitSentences(chunk.text);
      if (sentences.length <= 1) {
        const unitCount = Math.max(
          1,
          Math.ceil(duration / cfg.maxDurationSeconds),
          Math.ceil(words / cfg.maxWords),
          Math.ceil(chars / cfg.maxChars),
        );
        const tokens = chunk.text.split(/\s+/).filter(Boolean);
        const sliceSize = Math.max(1, Math.ceil(tokens.length / unitCount));
        for (let i = 0; i < unitCount; i += 1) {
          const partTokens = tokens.slice(i * sliceSize, (i + 1) * sliceSize);
          if (partTokens.length === 0) continue;
          const ratioStart = i / unitCount;
          const ratioEnd = (i + 1) / unitCount;
          const start = chunk.start + chunk.duration * ratioStart;
          const end = i === unitCount - 1 ? chunk.end : chunk.start + chunk.duration * ratioEnd;
          result.push({
            text: normalizeText(partTokens.join(" ")),
            start,
            end,
            duration: Math.max(0.1, end - start),
          });
        }
        continue;
      }

      let currentTextParts: string[] = [];
      let currentWords = 0;
      let currentChars = 0;
      let partStartSentenceIndex = 0;

      const flushSentencePart = (endSentenceIndex: number) => {
        if (currentTextParts.length === 0) return;
        const ratioStart = partStartSentenceIndex / sentences.length;
        const ratioEnd = endSentenceIndex / sentences.length;
        const start = chunk.start + chunk.duration * ratioStart;
        const end =
          endSentenceIndex >= sentences.length
            ? chunk.end
            : chunk.start + chunk.duration * ratioEnd;
        result.push({
          text: normalizeText(currentTextParts.join(" ")),
          start,
          end,
          duration: Math.max(0.1, end - start),
        });
        currentTextParts = [];
        currentWords = 0;
        currentChars = 0;
        partStartSentenceIndex = endSentenceIndex;
      };

      for (let i = 0; i < sentences.length; i += 1) {
        const sentence = sentences[i]!;
        const sentenceWords = estimateWords(sentence);
        const sentenceChars = sentence.length;

        const nextWords = currentWords + sentenceWords;
        const nextChars = currentChars + sentenceChars + (currentTextParts.length > 0 ? 1 : 0);
        const predictedDuration =
          chunk.duration * ((i + 1 - partStartSentenceIndex) / sentences.length);

        const shouldFlush =
          currentTextParts.length > 0 &&
          (nextWords > cfg.maxWords ||
            nextChars > cfg.maxChars ||
            predictedDuration > cfg.maxDurationSeconds);

        if (shouldFlush) {
          flushSentencePart(i);
        }

        currentTextParts.push(sentence);
        currentWords += sentenceWords;
        currentChars += sentenceChars + (currentTextParts.length > 1 ? 1 : 0);
      }

      flushSentencePart(sentences.length);
    }

    return result;
  };

  return enforceHardLimits(optimized).sort((a, b) => a.start - b.start);
};
