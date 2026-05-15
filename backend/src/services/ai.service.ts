import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

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

  summary: z.array(z.string()),
});

export type NotesResponse = z.infer<typeof NotesSchema>;

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
You are an expert educational AI assistant.

Generate concise educational revision notes from YouTube transcripts.

IMPORTANT RULES:
- Keep notes concise
- Focus on scan-friendly learning
- Use short educational bullet points
- Avoid long paragraphs
- Optimize for revision/study material
- Use educational hierarchy
- Focus on readability
- Use **bold** markers (e.g. **keyword**) for important technical terms and concepts
- Use \`inline code\` markers (e.g. \`console.log()\`) for functions, methods, and commands
- Generate short searchable titles
- Title should be 2-5 words
- Avoid filler words
- Use concise explanations
- Return educational structured notes as VALID JSON ONLY.
- DO NOT include any preamble, introduction, or trailing text.
- Return ONLY the JSON object.
`;

const CHAT_SYSTEM_PROMPT = `
You are EchoMind AI, a helpful YouTube learning assistant.

RULES:
- Be conversational
- Friendly and concise
- Use transcript context only
- If unrelated question asked, politely refuse
- Use emojis naturally
- Keep responses readable

IMPORTANT CONTEXT AWARENESS RULES:

If the user's message is short, vague, or follow-up oriented such as:
- "tell me more"
- "more insights"
- "explain further"
- "can you elaborate"
- "what else"
- "more examples"

then ALWAYS infer context from:
- the current transcript
- recent conversation history
- previously discussed concepts

Do NOT incorrectly treat these as unrelated questions.

Instead:
- continue expanding the current video topic
- provide deeper educational insights
- elaborate on important concepts
- explain implications and practical understanding

Only refuse questions when they are CLEARLY unrelated to the transcript topic.

Examples of unrelated questions:
- weather
- politics unrelated to video
- random celebrity questions
- unrelated coding topics not discussed

For transcript-related follow-up questions:
- be proactive
- expand intelligently
- teach naturally
- provide educational explanations
`;

export const buildContextPrompt = (
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat",
) => `
${type === "notes" ? NOTES_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT}

Transcript:
${transcript}

Recent Conversation:
${formatConversationHistory(recentMessages)}

Current User Message:
${
  type === "notes"
    ? "Generate structured educational revision notes."
    : question
}
`;

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
          points: { type: "array", items: { type: "string" } }
        },
        required: ["heading", "points"]
      }
    },
    keyInsights: { type: "array", items: { type: "string" } },
    actionableTakeaways: { type: "array", items: { type: "string" } },
    examples: { type: "array", items: { type: "string" } },
    summary: { type: "array", items: { type: "string" } }
  },
  required: ["title", "subtitle", "overview", "mainConcepts", "keyInsights", "actionableTakeaways", "examples", "summary"]
};

export const askAiAboutTranscript = async (
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat",
) => {
  try {
    const prompt = buildContextPrompt(
      transcript,
      question,
      recentMessages,
      type,
    );

    if (type === "notes") {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema: GeminiNotesSchema as any,
        },
      });

      const rawText = response.text?.trim();

      if (!rawText) {
        throw new Error(
          "Empty notes response received"
        );
      }

      let jsonStr = rawText;
      
      const jsonMatch = rawText.match(/```json\s?([\s\S]*?)\s?```/) || 
                       rawText.match(/```\s?([\s\S]*?)\s?```/);
      
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
        const validatedNotes = NotesSchema.parse(parsed);
        return JSON.stringify(validatedNotes);
      } catch (parseError: any) {
        console.error("JSON Parse/Validation Error:", parseError);
        console.error("Attempted to parse:", jsonStr);
        throw new Error(`Invalid JSON structure in notes: ${parseError.message}`);
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Service Error:", error);

    throw new Error(
      "Failed to generate AI response"
    );
  }
};

export async function* streamAiAboutTranscript(
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat",
) {
  if (!process.env.GEMINI_API_KEY) {
    yield "AI service not configured.";
    return;
  }

  try {
    if (type === "notes") {
      const notes = await askAiAboutTranscript(
        transcript,
        question,
        recentMessages,
        "notes",
      );

      yield notes;

      return;
    }

    const prompt = buildContextPrompt(
      transcript,
      question,
      recentMessages,
      type,
    );

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    for await (const chunk of response) {
      const text = chunk.text;

      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error(error);

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

export const generateVideoTitle = async (transcript: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: `
Generate a concise searchable title for this YouTube video.

RULES:
- 2-5 words
- Educational
- Topic-focused
- No quotes
- No filler words

Transcript:
${transcript.slice(0, 3000)}
`,
    });

    return response.text?.trim().replace(/["']/g, "").replace(/\*\*/g, "");
  } catch {
    return "New Conversation";
  }
};
