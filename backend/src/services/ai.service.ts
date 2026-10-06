import { z } from "zod";
import type { ITranscriptChunk } from "../models/VideoUrl.model.js";
import { formatTimestamp } from "../utils/formatTimestamp.js";
import { CHAT_SYSTEM_PROMPT } from "../rag/prompts/chat.prompt.js";
import { NOTES_SYSTEM_PROMPT } from "../rag/prompts/notes.prompt.js";
import { PDF_CHAT_SYSTEM_PROMPT } from "../rag/prompts/pdf.prompt.js";
import { PDF_NOTES_SYSTEM_PROMPT } from "../rag/prompts/pdf_notes.prompt.js";
import { VIDEO_SUMMARY_SYSTEM_PROMPT } from "../rag/prompts/video_summary.prompt.js";
import { PDF_SUMMARY_SYSTEM_PROMPT } from "../rag/prompts/pdf_summary.prompt.js";
import {
  aiProviderService,
  sanitizeModelOutput,
} from "./ai/providers/aiProvider.service.js";
import logger from "../lib/logger.js";
import { INTERMEDIATE_SUMMARY_SYSTEM_PROMPT } from "../rag/prompts/intermediate_summary.prompt.js";
import {
  buildLanguageInstruction,
  buildResponseLanguageInstruction,
  type ResponseLanguage,
  type SummaryLanguage,
} from "../rag/utils/languagePrompt.util.js";
import {
  FINAL_SUMMARY_SYSTEM_PROMPT,
  LONG_CONTEXT_SUMMARY_SYSTEM_PROMPT,
} from "../rag/prompts/final_summary.prompt.js";
import type { IPdfChunk } from "../models/pdfChunk.model.js";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

const NotesSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  overview: z.array(z.string()),
  mainConcepts: z.array(
    z.object({
      heading: z.string(),
      points: z.array(z.string()),
    }),
  ),
  keyInsights: z.array(z.string()),
  actionableTakeaways: z.array(z.string()),
  examples: z.array(z.string()),
});

const SummarySchema = z.object({
  summary: z.array(
    z.object({
      text: z.string(),
      timestamp: z.number().nonnegative(),
      endTimestamp: z.number().nonnegative(),
    }),
  ),
});

const LongContextSummarySchema = z.object({
  summary: z.array(
    z.object({
      text: z.string(),
      startChunkIndex: z.number().int().nonnegative(),
      endChunkIndex: z.number().int().nonnegative(),
    }),
  ),
});

const PdfSummaryResponseSchema = {
  type: "object",
  properties: {
    summary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          startChunkIndex: { type: "integer" },
          endChunkIndex: { type: "integer" },
        },
        required: ["text", "startChunkIndex", "endChunkIndex"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary"],
  additionalProperties: false,
};

const PdfSummarySchema = z.object({
  summary: z.array(
    z.object({
      text: z.string(),
      startChunkIndex: z.number().int().nonnegative(),
      endChunkIndex: z.number().int().nonnegative(),
    }),
  ),
});

export type NotesResponse = z.infer<typeof NotesSchema>;

const TIMESTAMP_PATTERN =
  /(\[?\(?\b\d{1,2}:\d{2}(?::\d{2})?\b(?:\s*-\s*\d{1,2}:\d{2}(?::\d{2})?)?\)?\]?)/g;

const stripTimestampMentions = (value: string) =>
  value
    .replace(TIMESTAMP_PATTERN, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.:;!?])/g, "$1")
    .trim();

const sanitizeNotesResponse = (notes: NotesResponse): NotesResponse => ({
  ...notes,
  title: stripTimestampMentions(notes.title),
  subtitle: stripTimestampMentions(notes.subtitle),
  overview: notes.overview.map(stripTimestampMentions),
  mainConcepts: notes.mainConcepts.map((concept) => ({
    heading: stripTimestampMentions(concept.heading),
    points: concept.points.map(stripTimestampMentions),
  })),
  keyInsights: notes.keyInsights.map(stripTimestampMentions),
  actionableTakeaways: notes.actionableTakeaways.map(stripTimestampMentions),
  examples: notes.examples.map(stripTimestampMentions),
});

export const getRecentMessages = (
  messages: ConversationMessage[] = [],
  limit = 10,
) => {
  return messages.filter((message) => message.content?.trim()).slice(-limit);
};

export const formatConversationHistory = (
  messages: ConversationMessage[] = [],
) => {
  const recentMessages = getRecentMessages(messages);

  if (recentMessages.length === 0) {
    return "No prior conversation.";
  }

  return recentMessages
    .map((message) => {
      const role = message.role === "assistant" ? "Assistant" : "User";

      return `${role}: ${message.content.trim()}`;
    })
    .join("\n\n");
};

export const formatTranscriptWithTimestamps = (chunks: ITranscriptChunk[]) => {
  return chunks
    .map((chunk) => {
      const timestamp = `[${formatTimestamp(chunk.start)}]`;
      return `${timestamp}\n${chunk.text}`;
    })
    .join("\n\n");
};

const formatTranscriptForLongContextSummary = (chunks: ITranscriptChunk[]) => {
  return chunks
    .map((chunk, index) => {
      const startSeconds = Math.floor(chunk.start);
      const endSeconds = Math.floor(
        typeof (chunk as { end?: number }).end === "number"
          ? (chunk as { end: number }).end
          : chunk.start + chunk.duration,
      );

      return [
        `[CHUNK ${index}]`,
        `START_SECONDS: ${startSeconds}`,
        `END_SECONDS: ${endSeconds}`,
        `TEXT: ${chunk.text}`,
      ].join("\n");
    })
    .join("\n\n");
};

export const buildContextPrompt = (
  transcript: string | ITranscriptChunk[],
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
  language: ResponseLanguage,
  durationSeconds?: number,
) => {
  let formattedTranscript = "";

  const minutes = durationSeconds ? Math.floor(durationSeconds / 60) : 0;
  const seconds = durationSeconds ? Math.floor(durationSeconds % 60) : 0;
  const durationStr = durationSeconds
    ? `${minutes}:${seconds.toString().padStart(2, "0")}`
    : "Unknown";

  if (Array.isArray(transcript)) {
    if (transcript.length === 0) {
      formattedTranscript = "";
    } else {
      if (type === "summary") {
        formattedTranscript = formatTranscriptWithTimestamps(transcript);
      } else {
        formattedTranscript = transcript.map((c) => c.text).join(" ");
      }
    }
  } else {
    formattedTranscript = transcript || "";
  }

  const systemPrompt =
    type === "notes"
      ? NOTES_SYSTEM_PROMPT
      : type === "summary"
        ? VIDEO_SUMMARY_SYSTEM_PROMPT
        : CHAT_SYSTEM_PROMPT;

  const languageInstruction = buildResponseLanguageInstruction(language);

  return `
${systemPrompt}

${languageInstruction}

Video Duration: ${durationStr} (${durationSeconds || 0} seconds)

Transcript Context:
${formattedTranscript}

Recent Conversation History:
${formatConversationHistory(recentMessages)}

Current User Message:
${
  type === "notes"
    ? "Generate structured educational revision notes for quick study and revision. Do not include any timestamps."
    : type === "summary"
      ? "Provide a lightweight conversational summary of this video with key highlights."
      : question
}
`;
};

const GeminiNotesSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    overview: { type: "array", items: { type: "string" } },
    mainConcepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          points: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["heading", "points"],
      },
    },
    keyInsights: { type: "array", items: { type: "string" } },
    actionableTakeaways: { type: "array", items: { type: "string" } },
    examples: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "subtitle",
    "overview",
    "mainConcepts",
    "keyInsights",
    "actionableTakeaways",
    "examples",
  ],
};

const SummaryResponseSchema = {
  type: "object",
  properties: {
    summary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          timestamp: { type: "number" },
          endTimestamp: { type: "number" },
        },
        required: ["text", "timestamp", "endTimestamp"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary"],
  additionalProperties: false,
};

const LongContextSummaryResponseSchema = {
  type: "object",
  properties: {
    summary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          startChunkIndex: { type: "integer" },
          endChunkIndex: { type: "integer" },
        },
        required: ["text", "startChunkIndex", "endChunkIndex"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary"],
  additionalProperties: false,
};

const getTranscriptDurationSeconds = (chunks: ITranscriptChunk[]) => {
  if (chunks.length === 0) {
    return 0;
  }

  const last = chunks[chunks.length - 1]!;
  const lastEnd =
    typeof (last as { end?: number }).end === "number"
      ? (last as { end: number }).end
      : last.start + last.duration;
  return Math.max(0, Math.floor(lastEnd));
};

const extractJsonString = (rawText: string): string => {
  if (!rawText) return "";
  const sanitized = sanitizeModelOutput(rawText).trim();
  if (sanitized.startsWith("{") && sanitized.endsWith("}")) {
    return sanitized;
  }
  if (sanitized.startsWith("[") && sanitized.endsWith("]")) {
    return sanitized;
  }

  const jsonMatch =
    sanitized.match(/```json\s?([\s\S]*?)\s?```/) ||
    sanitized.match(/```\s?([\s\S]*?)\s?```/);
  if (jsonMatch) {
    return jsonMatch[1]!.trim();
  }
  const firstBrace = sanitized.indexOf("{");
  const lastBrace = sanitized.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return sanitized.substring(firstBrace, lastBrace + 1).trim();
  }
  return sanitized;
};

const extractAndValidateJson = (
  rawText: string,
  validator: z.ZodSchema,
): boolean => {
  try {
    const jsonStr = extractJsonString(rawText);
    const parsed = JSON.parse(jsonStr);
    validator.parse(parsed);
    return true;
  } catch (err: any) {
    logger.error({ err }, "[AI Validation Error]");
    if (err.errors) {
      logger.error({ zodErrors: err.errors }, "[AI Validation Zod Errors]");
    }
    return false;
  }
};

export const askAiAboutTranscript = async (
  transcript: string | ITranscriptChunk[],
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat",
  language: ResponseLanguage,
) => {
  try {
    const totalDurationSeconds =
      Array.isArray(transcript) && transcript.length > 0
        ? getTranscriptDurationSeconds(transcript)
        : 0;

    const prompt = buildContextPrompt(
      transcript,
      question,
      recentMessages,
      type,
      language,
      totalDurationSeconds,
    );

    if (type === "notes") {
      const schema =
        type === "notes" ? GeminiNotesSchema : SummaryResponseSchema;
      const validator = type === "notes" ? NotesSchema : SummarySchema;

      const rawText = await aiProviderService.generateStructuredResponse(
        prompt,
        schema,
        undefined,
        (text) => extractAndValidateJson(text, validator),
      );
      if (!rawText) throw new Error(`Empty ${type} response received`);

      const jsonStr = extractJsonString(rawText);

      try {
        const parsed = JSON.parse(jsonStr);
        const validated = validator.parse(parsed);
        if (type === "notes") {
          return JSON.stringify(
            sanitizeNotesResponse(validated as NotesResponse),
          );
        }
        return JSON.stringify(validated);
      } catch (parseError: any) {
        logger.error({ parseError, type }, "JSON Error");
        throw new Error(`Invalid ${type} structure`);
      }
    }

    const text = await aiProviderService.generateResponse(prompt);
    return type === "chat" ? stripTimestampMentions(text) : text;
  } catch (error: any) {
    logger.error({ error }, "AI Service Error");
    throw new Error(
      `Failed to generate AI response: ${error?.message || "Unknown error"}`,
    );
  }
};

export const generateIntermediateSummary = async (
  transcript: string,
  language: SummaryLanguage,
  startTimestamp: string,
  endTimestamp: string,
): Promise<string> => {
  try {
    const prompt = `
${INTERMEDIATE_SUMMARY_SYSTEM_PROMPT}
${buildLanguageInstruction(language)}

Timestamp:

${startTimestamp} - ${endTimestamp}

Transcript:

${transcript}
`;

    const summary = await aiProviderService.generateResponse(
      prompt,
      undefined,
      {
        purpose: "summary",
      },
    );

    return summary.trim();
  } catch (error: any) {
    logger.error({ error }, "[AI] Failed to generate intermediate summary");

    throw new Error(
      `Failed to generate intermediate summary: ${
        error?.message ?? "Unknown error"
      }`,
    );
  }
};

export const generateFinalSummary = async (
  summaries: string,
  language: SummaryLanguage,
): Promise<string> => {
  try {
    const prompt = `
${FINAL_SUMMARY_SYSTEM_PROMPT}
${buildLanguageInstruction(language)}

Intermediate Summaries:

${summaries}
`;

    const rawText = await aiProviderService.generateStructuredResponse(
      prompt,
      SummaryResponseSchema,
      undefined,
      (text) => extractAndValidateJson(text, SummarySchema),
      {
        purpose: "summary",
      },
    );

    const jsonStr = extractJsonString(rawText);

    const parsed = JSON.parse(jsonStr);

    const validated = SummarySchema.parse(parsed);

    return JSON.stringify(validated);
  } catch (error: any) {
    logger.error({ error }, "[AI] Failed to generate final summary");

    throw new Error(
      `Failed to generate final summary: ${error?.message ?? "Unknown error"}`,
    );
  }
};

export const generateVideoLongContextSummary = async (
  chunks: ITranscriptChunk[],
  language: SummaryLanguage,
): Promise<string | null> => {
  try {
    const transcript = formatTranscriptForLongContextSummary(chunks);

    const prompt = `
${LONG_CONTEXT_SUMMARY_SYSTEM_PROMPT}

${buildLanguageInstruction(language)}

FULL VIDEO TRANSCRIPT:

${transcript}
`;

    const inputTokens = await aiProviderService.countTokens("Gemini", prompt);

    const maxInputTokens = Number(
      process.env.GEMINI_SUMMARY_MAX_INPUT_TOKENS ?? 900000,
    );

    logger.info(
      {
        inputTokens,
        maxInputTokens,
        chunks: chunks.length,
      },
      "[Summary] Gemini long-context token check",
    );

    if (inputTokens > maxInputTokens) {
      logger.info(
        {
          inputTokens,
          maxInputTokens,
        },
        "[Summary] Transcript exceeds Gemini long-context threshold",
      );

      return null;
    }

    const rawText = await aiProviderService.generateStructuredResponse(
      prompt,
      LongContextSummaryResponseSchema,
      undefined,
      (text) => extractAndValidateJson(text, LongContextSummarySchema),
      {
        purpose: "long-summary",
      },
    );

    const jsonStr = extractJsonString(rawText);
    const parsed = JSON.parse(jsonStr);
    const validated = LongContextSummarySchema.parse(parsed);

    const summary = validated.summary.map((item) => {
      if (item.startChunkIndex >= chunks.length) {
        throw new Error(`Invalid startChunkIndex: ${item.startChunkIndex}`);
      }

      if (item.endChunkIndex >= chunks.length) {
        throw new Error(`Invalid endChunkIndex: ${item.endChunkIndex}`);
      }

      if (item.startChunkIndex > item.endChunkIndex) {
        throw new Error(
          `Invalid chunk range: ${item.startChunkIndex}-${item.endChunkIndex}`,
        );
      }

      const startChunk = chunks[item.startChunkIndex]!;
      const endChunk = chunks[item.endChunkIndex]!;

      const start = Math.floor(startChunk.start);

      const end = Math.floor(
        typeof (endChunk as { end?: number }).end === "number"
          ? (endChunk as { end: number }).end
          : endChunk.start + endChunk.duration,
      );

      if (end <= start) {
        throw new Error(`Invalid timestamp range: ${start}-${end}`);
      }

      return {
        text: item.text,
        timestamp: start,
        endTimestamp: end,
      };
    });

    for (let i = 1; i < summary.length; i += 1) {
      if (summary[i]!.timestamp < summary[i - 1]!.timestamp) {
        throw new Error("Long-context summary is not chronological.");
      }
    }

    return JSON.stringify({
      summary,
    });
  } catch (error: any) {
    logger.error({ error }, "[AI] Failed to generate long-context summary");

    throw new Error(
      `Failed to generate long-context summary: ${
        error?.message ?? "Unknown error"
      }`,
    );
  }
};

export const generatePdfLongContextSummary = async (
  chunks: IPdfChunk[],
  language: ResponseLanguage,
): Promise<string> => {
  try {
    if (chunks.length === 0) {
      throw new Error("No PDF chunks available for summary.");
    }

    const context = chunks
      .map((chunk, index) => {
        return [
          `[CHUNK ${index}]`,
          `PAGE: ${chunk.page}`,
          `TEXT: ${chunk.text}`,
        ].join("\n");
      })
      .join("\n\n");

    const prompt = `
${PDF_SUMMARY_SYSTEM_PROMPT}

${buildResponseLanguageInstruction(language)}

FULL PDF DOCUMENT:

${context}
`;

    const inputTokens = await aiProviderService.countTokens(
      "Gemini",
      prompt,
    );

    const maxInputTokens = Number(
      process.env.GEMINI_SUMMARY_MAX_INPUT_TOKENS ?? 900000,
    );

    logger.info(
      {
        inputTokens,
        maxInputTokens,
        chunks: chunks.length,
      },
      "[PDF Summary] Gemini long-context token check",
    );

    if (inputTokens > maxInputTokens) {
      throw new Error(
        `PDF document is too large for long-context summarization. ` +
          `Input tokens: ${inputTokens}, maximum: ${maxInputTokens}`,
      );
    }

    const rawText = await aiProviderService.generateStructuredResponse(
      prompt,
      PdfSummaryResponseSchema,
      undefined,
      (text) => extractAndValidateJson(text, PdfSummarySchema),
      {
        purpose: "long-summary",
      },
    );

    if (!rawText) {
      throw new Error("Empty PDF summary response received.");
    }

    const jsonStr = extractJsonString(rawText);

    const parsed = JSON.parse(jsonStr);

    const validated = PdfSummarySchema.parse(parsed);

    const summary = validated.summary.map((item) => {
      if (item.startChunkIndex >= chunks.length) {
        throw new Error(
          `Invalid startChunkIndex: ${item.startChunkIndex}`,
        );
      }

      if (item.endChunkIndex >= chunks.length) {
        throw new Error(
          `Invalid endChunkIndex: ${item.endChunkIndex}`,
        );
      }

      if (item.startChunkIndex > item.endChunkIndex) {
        throw new Error(
          `Invalid chunk range: ${item.startChunkIndex}-${item.endChunkIndex}`,
        );
      }

      const startChunk = chunks[item.startChunkIndex]!;
      const endChunk = chunks[item.endChunkIndex]!;

      return {
        text: item.text,
        startPage: startChunk.page,
        endPage: endChunk.page,
      };
    });

    for (let i = 1; i < summary.length; i += 1) {
      const previous = summary[i - 1]!;
      const current = summary[i]!;

      if (
        current.startPage < previous.startPage
      ) {
        throw new Error(
          "PDF summary is not in chronological document order.",
        );
      }
    }

    return JSON.stringify({
      summary,
    });
  } catch (error: any) {
    logger.error(
      { error },
      "[AI] Failed to generate PDF long-context summary",
    );

    throw new Error(
      `Failed to generate PDF summary: ${
        error?.message ?? "Unknown error"
      }`,
    );
  }
};

export async function* streamAiAboutTranscript(
  transcript: string | ITranscriptChunk[],
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat",
  language: ResponseLanguage,
) {
  try {
    if (type === "notes") {
      const result = await askAiAboutTranscript(
        transcript,
        question,
        recentMessages,
        type,
        language,
      );

      yield result;

      return;
    }

    const totalDurationSeconds =
      Array.isArray(transcript) && transcript.length > 0
        ? getTranscriptDurationSeconds(transcript)
        : 0;

    const prompt = buildContextPrompt(
      transcript,
      question,
      recentMessages,
      type,
      language,
      totalDurationSeconds,
    );

    const stream = aiProviderService.generateStream(prompt);

    for await (const chunk of stream) {
      if (chunk) {
        yield chunk;
      }
    }
  } catch (error: any) {
    logger.error({ error }, "Stream Error");

    const errorMessage = error?.message || "Unknown AI error";

    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      yield "Lumora is currently busy 🚀 Please try again in a moment.";
    } else {
      yield "Something went wrong while generating the response.";
    }
  }
}

export const generateVideoTitle = async (
  transcript: string | ITranscriptChunk[],
) => {
  try {
    let transcriptSample = "";

    if (typeof transcript === "string") {
      const stripped = transcript.slice(500);
      transcriptSample = stripped.slice(0, 4000);
    } else if (transcript.length > 0) {
      const skip = Math.min(10, Math.floor(transcript.length * 0.08));
      const total = transcript.length;

      const startChunks = transcript.slice(skip, skip + 20).map((c) => c.text);
      const midStart = Math.floor(total * 0.35);
      const midChunks = transcript
        .slice(midStart, midStart + 20)
        .map((c) => c.text);
      const endStart = Math.max(0, total - 20);
      const endChunks = transcript.slice(endStart).map((c) => c.text);

      transcriptSample = [
        "--- Beginning of video ---",
        startChunks.join(" "),
        "--- Middle of video ---",
        midChunks.join(" "),
        "--- End of video ---",
        endChunks.join(" "),
      ]
        .join("\n\n")
        .slice(0, 5000);
    }

    const prompt = `You are a video title generator. Analyze the transcript sample below and generate a single, meaningful, topic-focused title for this video.

IMPORTANT RULES:
- First, identify the MAIN SUBJECT or TOPIC of the video (e.g. a programming concept, a framework, a tutorial subject, a course topic).
- Do NOT base the title on the instructor's name, their introduction, greetings, or music segments.
- Ignore lines like "[Music]", "hi my name is", "welcome to my channel", "subscribe", etc.
- The title must reflect what the video is actually TEACHING or COVERING.
- 3 to 7 words maximum.
- No quotes, no markdown, no asterisks, no filler words.
- Write only the title — nothing else.

Examples of GOOD titles:
- React Hooks Deep Dive
- Building REST APIs with Node.js
- CSS Grid Layout Complete Guide
- Machine Learning for Beginners
- Docker Container Orchestration Tutorial

Transcript Sample:
${transcriptSample}
`;

    const text = await aiProviderService.generateResponse(prompt);
    return text
      .trim()
      .replace(/[\"'`*#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "New Conversation";
  }
};

export const buildPdfContextPrompt = (
  context: string,
  question: string,
  language: ResponseLanguage,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) => {
  const systemPrompt =
    type === "notes"
      ? PDF_NOTES_SYSTEM_PROMPT
      : type === "summary"
        ? VIDEO_SUMMARY_SYSTEM_PROMPT
        : PDF_CHAT_SYSTEM_PROMPT;

  const responseLanguageInstruction =
    buildResponseLanguageInstruction(language);

  return `
${systemPrompt}

${responseLanguageInstruction}
PDF Document Context:
${context}

Recent Conversation History:
${formatConversationHistory(recentMessages)}

Current User Message:
${
  type === "notes"
    ? "Generate structured educational revision notes for quick study and revision based on the document context."
    : type === "summary"
      ? "Provide a lightweight conversational summary of this document with key highlights."
      : question
}
`;
};

export const askAiAboutPdf = async (
  context: string,
  question: string,
  language: ResponseLanguage,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) => {
  try {
    const prompt = buildPdfContextPrompt(
      context,
      question,
      language,
      recentMessages,
      type,
    );

    if (type === "notes" || type === "summary") {
      const schema =
        type === "notes" ? GeminiNotesSchema : SummaryResponseSchema;
      const validator = type === "notes" ? NotesSchema : SummarySchema;

      const rawText = await aiProviderService.generateStructuredResponse(
        prompt,
        schema,
        undefined,
        (text) => extractAndValidateJson(text, validator),
      );
      if (!rawText) throw new Error(`Empty ${type} response received`);

      const jsonStr = extractJsonString(rawText);

      try {
        const parsed = JSON.parse(jsonStr);
        const validated = validator.parse(parsed);
        if (type === "notes") {
          return JSON.stringify(
            sanitizeNotesResponse(validated as NotesResponse),
          );
        }
        return JSON.stringify(validated);
      } catch (parseError: any) {
        logger.error({ parseError, type }, "JSON Error");
        throw new Error(`Invalid ${type} structure`);
      }
    }

    const text = await aiProviderService.generateResponse(prompt);
    return text || "";
  } catch (error: any) {
    logger.error({ error }, "AI Service Error");
    throw new Error(
      `Failed to generate AI response: ${error?.message || "Unknown error"}`,
    );
  }
};

export async function* streamAiAboutPdf(
  context: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
  language: ResponseLanguage,
) {
  try {
    if (type === "notes" || type === "summary") {
      const result = await askAiAboutPdf(
        context,
        question,
        language,

        recentMessages,
        type,
      );
      yield result;
      return;
    }

    const prompt = buildPdfContextPrompt(
      context,
      question,
      language,
      recentMessages,
      type,
    );

    const stream = aiProviderService.generateStream(prompt);

    for await (const chunk of stream) {
      if (chunk) {
        yield chunk;
      }
    }
  } catch (error: any) {
    logger.error({ error }, "Stream Error");
    const errorMessage = error?.message || "Unknown AI error";
    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      yield "Lumora is currently busy 🚀 Please try again in a moment.";
    } else {
      yield "Something went wrong while generating the response.";
    }
  }
}

export const generatePdfTitle = async (sampleText: string) => {
  try {
    // Analyze the whole document content up to 40,000 characters to capture overall context
    const trimmed = sampleText.trim().slice(0, 40000);

    const systemPrompt = `You are a professional document classifier and title generator.
Your job is to analyze the document content and return ONLY a high-quality, topic-focused title of 2 to 5 words.

STRICT RULES:
1. Output ONLY the title text. No quotes, no asterisks, no markdown, no punctuation, and no preambles/explanations (e.g. do NOT write "Title: ...").
2. The title must be a concise noun phrase of 2 to 5 words (e.g., "Effective Prompt Design Guide", "Prompt Engineering Basics").
3. Prioritize using the main heading or title of the document (often found in the very first few lines of the text).
4. Never copy random sentence fragments, formatting instructions, or body text fragments (like "to indicate that a new" or "paragraph breaks or bullet points").
5. If the document is a guide, tutorial, notes, or article, incorporate that context into the title.`;

    const prompt = `Document Content:
"""
${trimmed}
"""

Generate Title:`;

    const text = await aiProviderService.generateResponse(prompt, systemPrompt);

    let title = text
      .trim()
      .replace(/^(title:\s*)/i, "")
      .replace(/[\"'`*#\n\r]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Hard limit: if AI still returns something too long, take only the first 5 words
    const words = title.split(" ");
    if (words.length > 6) {
      title = words.slice(0, 5).join(" ");
    }

    // If the title is absurdly long in characters, truncate
    if (title.length > 50) {
      title = title.slice(0, 47) + "...";
    }

    return title || "New Document";
  } catch {
    return "New Document";
  }
};
