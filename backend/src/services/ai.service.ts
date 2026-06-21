import { z } from "zod";
import type{ ITranscriptChunk } from "../models/VideoUrl.model.js";
import { formatTimestamp } from "../utils/formatTimestamp.js";
import {
  CHAT_SYSTEM_PROMPT,
  NOTES_SYSTEM_PROMPT,
  PDF_CHAT_SYSTEM_PROMPT,
  PDF_NOTES_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
} from "./ai.prompts.js";
import { aiProviderService, sanitizeModelOutput } from "./ai/providers/aiProvider.service.js";

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
      timestamp: z.number().int().nonnegative(),
      endTimestamp: z.number().int().nonnegative().optional(),
    }),
  ),
});

export type NotesResponse = z.infer<typeof NotesSchema>;
type SummaryResponse = z.infer<typeof SummarySchema>;

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

export const buildContextPrompt = (
  transcript: string | ITranscriptChunk[],
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
  durationSeconds?: number,
) => {
  let formattedTranscript = "";
  
  const minutes = durationSeconds ? Math.floor(durationSeconds / 60) : 0;
  const seconds = durationSeconds ? Math.floor(durationSeconds % 60) : 0;
  const durationStr = durationSeconds ? `${minutes}:${seconds.toString().padStart(2, "0")}` : "Unknown";

  if (Array.isArray(transcript)) {
    if (transcript.length === 0) {
      formattedTranscript = "";
    } else {
      if (type === "summary") {
        formattedTranscript = formatTranscriptWithTimestamps(transcript);
      } else {
        formattedTranscript = transcript.map(c => c.text).join(" ");
      }
    }
  } else {
    formattedTranscript = transcript || "";
  }

  const systemPrompt = type === "notes" ? NOTES_SYSTEM_PROMPT : type === "summary" ? SUMMARY_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT;

  return `
${systemPrompt}

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
            items: { type: "string" }
          }
        },
        required: ["heading", "points"]
      }
    },
    keyInsights: { type: "array", items: { type: "string" } },
    actionableTakeaways: { type: "array", items: { type: "string" } },
    examples: { type: "array", items: { type: "string" } }
  },
  required: ["title", "subtitle", "overview", "mainConcepts", "keyInsights", "actionableTakeaways", "examples"]
};

const GeminiSummarySchema = {
  type: "object",
  properties: {
    summary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          timestamp: { type: "number" },
          endTimestamp: { type: "number" }
        },
        required: ["text", "timestamp"]
      }
    }
  },
  required: ["summary"]
};

const toNearestTranscriptStart = (timestamp: number, chunks: ITranscriptChunk[]) => {
  if (chunks.length === 0) {
    return Math.max(0, Math.floor(timestamp));
  }

  const target = Math.max(0, Math.floor(timestamp));
  let nearest = Math.max(0, Math.floor(chunks[0]!.start));
  let minDistance = Math.abs(nearest - target);

  for (let i = 1; i < chunks.length; i += 1) {
    const start = Math.max(0, Math.floor(chunks[i]!.start));
    const distance = Math.abs(start - target);
    if (distance < minDistance) {
      nearest = start;
      minDistance = distance;
    }
  }

  return nearest;
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

const normalizeSummaryTimeline = (
  summary: SummaryResponse["summary"],
  chunks: ITranscriptChunk[],
  totalDurationSeconds: number,
): SummaryResponse["summary"] => {
  const normalized = summary
    .map((item) => ({
      text: item.text,
      timestamp: toNearestTranscriptStart(item.timestamp, chunks),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const deduped = normalized.filter((item, index) => {
    if (index === 0) return true;
    const prev = normalized[index - 1]!;
    return item.timestamp - prev.timestamp >= 15;
  });

  const withRanges = deduped.map((item, index) => {
    const next = deduped[index + 1];
    const endTimestamp = next ? next.timestamp : totalDurationSeconds;
    return {
      text: item.text,
      timestamp: item.timestamp,
      endTimestamp:
        endTimestamp > item.timestamp
          ? endTimestamp
          : Math.min(totalDurationSeconds, item.timestamp + 20),
    };
  });

  const last = withRanges[withRanges.length - 1];
  if (!last) return withRanges;

  const remainingTail = totalDurationSeconds - last.timestamp;
  if (remainingTail > 75 && chunks.length > 0) {
    const tailStartTarget = Math.max(0, totalDurationSeconds - Math.min(120, remainingTail));
    const tailStart = toNearestTranscriptStart(tailStartTarget, chunks);

    withRanges.push({
      text: "Final section: Closing recap and final implementation notes, including wrap-up checks, expected outcomes, and end-of-video conclusions.",
      timestamp: tailStart,
      endTimestamp: totalDurationSeconds,
    });
  } else if (last.endTimestamp && last.endTimestamp < totalDurationSeconds) {
    last.endTimestamp = totalDurationSeconds;
  }

  return withRanges
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item, index, arr) => {
      const next = arr[index + 1];
      if (next && item.endTimestamp && item.endTimestamp > next.timestamp) {
        return { ...item, endTimestamp: next.timestamp };
      }
      return item;
    });
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
  
  const jsonMatch = sanitized.match(/```json\s?([\s\S]*?)\s?```/) || sanitized.match(/```\s?([\s\S]*?)\s?```/);
  if (jsonMatch) {
    return jsonMatch[1]!.trim();
  }
  const firstBrace = sanitized.indexOf('{');
  const lastBrace = sanitized.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return sanitized.substring(firstBrace, lastBrace + 1).trim();
  }
  return sanitized;
};

const extractAndValidateJson = (rawText: string, validator: z.ZodSchema): boolean => {
  try {
    const jsonStr = extractJsonString(rawText);
    const parsed = JSON.parse(jsonStr);
    validator.parse(parsed);
    return true;
  } catch (err: any) {
    console.error("[AI Validation Error]:", err.message || err);
    if (err.errors) {
      console.error("[AI Validation Zod Errors]:", JSON.stringify(err.errors, null, 2));
    }
    return false;
  }
};

export const askAiAboutTranscript = async (
  transcript: string | ITranscriptChunk[],
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) => {
  try {
    const totalDurationSeconds =
      Array.isArray(transcript) && transcript.length > 0
        ? getTranscriptDurationSeconds(transcript)
        : 0;

    const prompt = buildContextPrompt(transcript, question, recentMessages, type, totalDurationSeconds);

    if (type === "notes" || type === "summary") {
      const schema = type === "notes" ? GeminiNotesSchema : GeminiSummarySchema;
      const validator = type === "notes" ? NotesSchema : SummarySchema;


      const rawText = await aiProviderService.generateStructuredResponse(
        prompt,
        schema,
        undefined,
        (text) => extractAndValidateJson(text, validator)
      );
      if (!rawText) throw new Error(`Empty ${type} response received`);

      const jsonStr = extractJsonString(rawText);

      try {
        const parsed = JSON.parse(jsonStr);
        const validated = validator.parse(parsed);
        if (type === "summary" && Array.isArray(transcript)) {
          const normalizedSummary: SummaryResponse = {
            summary: normalizeSummaryTimeline(
              (validated as SummaryResponse).summary,
              transcript,
              totalDurationSeconds,
            ),
          };
          return JSON.stringify(normalizedSummary);
        }
        if (type === "notes") {
          return JSON.stringify(sanitizeNotesResponse(validated as NotesResponse));
        }
        return JSON.stringify(validated);
      } catch (parseError: any) {
        console.error(`${type} JSON Error:`, parseError);
        throw new Error(`Invalid ${type} structure`);
      }
    }

    const text = await aiProviderService.generateResponse(prompt);
    return type === "chat" ? stripTimestampMentions(text) : text;
  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(`Failed to generate AI response: ${error?.message || "Unknown error"}`);
  }
};

export async function* streamAiAboutTranscript(
  transcript: string | ITranscriptChunk[],
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) {
  try {
    if (type === "notes" || type === "summary") {
      const result = await askAiAboutTranscript(
        transcript,
        question,
        recentMessages,
        type,
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
      totalDurationSeconds
    );

    const stream = aiProviderService.generateStream(prompt);

    for await (const chunk of stream) {
      if (chunk) {
        yield chunk;
      }
    }
  } catch (error: any) {
    console.error("Stream Error:", error);

    const errorMessage =
      error?.message || "Unknown AI error";

    if (
      errorMessage.includes("503") ||
      errorMessage.includes("overloaded")
    ) {
      yield "EchoMind AI is currently busy 🚀 Please try again in a moment.";
    } else {
      yield "Something went wrong while generating the response.";
    }
  }
}

export const generateVideoTitle = async (transcript: string | ITranscriptChunk[]) => {
  try {
    let transcriptSample = "";

    if (typeof transcript === "string") {
      
      const stripped = transcript.slice(500);
      transcriptSample = stripped.slice(0, 4000);
    } else if (transcript.length > 0) {
      
      
      const skip = Math.min(10, Math.floor(transcript.length * 0.08));
      const total = transcript.length;

      const startChunks = transcript.slice(skip, skip + 20).map(c => c.text);
      const midStart = Math.floor(total * 0.35);
      const midChunks = transcript.slice(midStart, midStart + 20).map(c => c.text);
      const endStart = Math.max(0, total - 20);
      const endChunks = transcript.slice(endStart).map(c => c.text);

      transcriptSample = [
        "--- Beginning of video ---",
        startChunks.join(" "),
        "--- Middle of video ---",
        midChunks.join(" "),
        "--- End of video ---",
        endChunks.join(" "),
      ].join("\n\n").slice(0, 5000);
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
    return text.trim().replace(/[\"'`*#]/g, "").replace(/\s+/g, " ").trim();
  } catch {
    return "New Conversation";
  }
};


export const buildPdfContextPrompt = (
  context: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) => {
  const systemPrompt = type === "notes" ? PDF_NOTES_SYSTEM_PROMPT : type === "summary" ? SUMMARY_SYSTEM_PROMPT : PDF_CHAT_SYSTEM_PROMPT;

  return `
${systemPrompt}

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
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) => {
  try {
    const prompt = buildPdfContextPrompt(context, question, recentMessages, type);

    if (type === "notes" || type === "summary") {
      const schema = type === "notes" ? GeminiNotesSchema : GeminiSummarySchema;
      const validator = type === "notes" ? NotesSchema : SummarySchema;


      const rawText = await aiProviderService.generateStructuredResponse(
        prompt,
        schema,
        undefined,
        (text) => extractAndValidateJson(text, validator)
      );
      if (!rawText) throw new Error(`Empty ${type} response received`);

      const jsonStr = extractJsonString(rawText);

      try {
        const parsed = JSON.parse(jsonStr);
        const validated = validator.parse(parsed);
        if (type === "notes") {
          return JSON.stringify(sanitizeNotesResponse(validated as NotesResponse));
        }
        return JSON.stringify(validated);
      } catch (parseError: any) {
        console.error(`${type} JSON Error:`, parseError);
        throw new Error(`Invalid ${type} structure`);
      }
    }

    const text = await aiProviderService.generateResponse(prompt);
    return text || "";
  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(`Failed to generate AI response: ${error?.message || "Unknown error"}`);
  }
};

export async function* streamAiAboutPdf(
  context: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" | "summary" = "chat",
) {
  try {
    if (type === "notes" || type === "summary") {
      const result = await askAiAboutPdf(
        context,
        question,
        recentMessages,
        type,
      );
      yield result;
      return;
    }

    const prompt = buildPdfContextPrompt(
      context,
      question,
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
    console.error("Stream Error:", error);
    const errorMessage = error?.message || "Unknown AI error";
    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      yield "EchoMind AI is currently busy 🚀 Please try again in a moment.";
    } else {
      yield "Something went wrong while generating the response.";
    }
  }
}

export const generatePdfTitle = async (sampleText: string) => {
  try {
    const prompt = `
Generate a concise searchable title based on this document text sample.

RULES:
- 2-5 words
- Educational / Professional
- Topic-focused
- No quotes
- No filler words

Sample Text:
${sampleText.slice(0, 3000)}
`;

    const text = await aiProviderService.generateResponse(prompt);
    return text.trim().replace(/["']/g, "").replace(/\*\*/g, "");
  } catch {
    return "New Document";
  }
};

