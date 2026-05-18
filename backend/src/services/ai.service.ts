import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type{ ITranscriptChunk } from "../models/VideoUrl.model.js";
import { formatTimestamp } from "../utils/formatTimestamp.js";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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

const NOTES_SYSTEM_PROMPT = `
You are an expert educational AI assistant specializing in video understanding.
Generate structured educational revision notes for quick study and revision.

RULES:
- Default response language is English.
- Only switch to another language if the user explicitly requests that language.
- Extract 3-5 Main Concepts with detailed, self-contained bullet points
- Include Key Insights and Actionable Takeaways
- Do NOT include any timestamps or time references in the notes
- Use **bold** for technical terms, concepts, and keywords
- Use \`inline code\` for commands, functions, and code snippets
- Each point should be a complete, informative sentence
- Return VALID JSON ONLY.
`;

const SUMMARY_SYSTEM_PROMPT = `
You are a helpful AI assistant. Generate a lightweight conversational summary of the video.
Focus on key highlights and takeaways.

RULES:
- Default response language is English.
- Only switch to another language if the user explicitly requests that language.
- Translate non-English transcript segments into natural English unless user asked for another language.
- Provide 8-12 highlights for videos around 10-20 minutes.
- Each highlight text should start with a short topic label, then a colon, then a detailed 2-3 sentence explanation.
- For each highlight, provide the exact START time in TOTAL SECONDS (integer)
- Ensure timeline coverage from beginning, middle, and end of the video
- Keep highlights ordered by timestamp ascending
- Avoid mixed-language output in a single summary.
- Return VALID JSON ONLY: { "summary": [{ "text": "...", "timestamp": 120 }] }
`;

const CHAT_SYSTEM_PROMPT = `
You are EchoMind AI, a helpful YouTube learning assistant.

RULES:
- Be conversational
- Friendly and concise
- Default response language is English.
- Only switch to another language if the user explicitly requests that language.
- Use the provided transcript context for EVERYTHING.
- If the user asks about the video, you MUST answer based on the transcript provided below.
- If unrelated question asked, politely refuse
- Do NOT include any timestamps or time references in your response.
- Use emojis naturally
- Keep responses readable

IMPORTANT: The Transcript is provided below. Use it to answer the user's question accurately.
`;

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
      formattedTranscript = "No transcript available for this video.";
    } else {
      if (type === "summary") {
        formattedTranscript = formatTranscriptWithTimestamps(transcript);
      } else {
        formattedTranscript = transcript.map(c => c.text).join(" ");
      }
    }
  } else {
    formattedTranscript = transcript || "No transcript available for this video.";
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

      console.log(`GENERATING ${type.toUpperCase()}...`);
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema as any,
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) throw new Error(`Empty ${type} response received`);

      let jsonStr = rawText;
      const jsonMatch = rawText.match(/```json\s?([\s\S]*?)\s?```/) || rawText.match(/```\s?([\s\S]*?)\s?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1]!.trim();
      } else {
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = rawText.substring(firstBrace, lastBrace + 1).trim();
        }
      }

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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
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
  if (!process.env.GEMINI_API_KEY) {
    yield "AI service not configured.";
    return;
  }

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

    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    for await (const chunk of response) {
      const text = chunk.text;

      if (text) {
        yield text;
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
    const formattedTranscript = typeof transcript === "string" 
      ? transcript 
      : transcript.slice(0, 50).map(c => c.text).join(" ");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",

      contents: `
Generate a concise searchable title for this YouTube video.

RULES:
- 2-5 words
- Educational
- Topic-focused
- No quotes
- No filler words

Transcript Sample:
${formattedTranscript.slice(0, 3000)}
`,
    });

    return response.text?.trim().replace(/["']/g, "").replace(/\*\*/g, "");
  } catch {
    return "New Conversation";
  }
};
