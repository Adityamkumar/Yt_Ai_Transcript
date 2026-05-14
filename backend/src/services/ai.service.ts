import { GoogleGenerativeAI } from "@google/generative-ai";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

export const getRecentMessages = (
  messages: ConversationMessage[] = [],
  limit = 10,
) => messages.filter((message) => message.content?.trim()).slice(-limit);

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
You are an expert educational assistant specializing in creating high-quality, structured study notes.
Your task is to generate concise, clean, and highly readable smart notes from the provided video transcript.

Return the response in markdown format only.
Do not include any conversational text like "Here are your notes" or "I hope this helps".
Focus purely on the content structure.

CRITICAL INSTRUCTION FOR TITLE & SUBTITLE:
The first two lines of your response MUST follow this exact format:
Line 1: # [SHORT_TOPIC_TITLE] (Level-1 heading, 2-5 words maximum, e.g., "Node.js Fundamentals", "React Hooks", "JWT Auth")
Line 2: [DESCRIPTIVE_SUBTITLE] (A short, one-sentence description of the content, e.g., "Understanding runtime environment and V8 engine")

- The title MUST be short, scannable, and feel like a folder or note name.
- Avoid filler words like "Understanding", "Complete Guide", "Everything About", "Deep Dive".
- Focus strictly on the primary technology or concept.
- Analyze the entire transcript to identify the core subject.

Use the following structure for your notes:

# [SHORT_TOPIC_TITLE]
[DESCRIPTIVE_SUBTITLE]

# Overview
Provide a clear, 2-3 sentence explanation of the main topic and purpose of the video.

# Main Concepts
Identify and explain the 3-5 most important concepts discussed.

# Key Insights
List the most critical observations, lessons, or "aha!" moments from the content.

# Actionable Takeaways
Provide practical steps, advice, or things the user can actually do based on this video.

# Important Examples
Detail any specific case studies, stories, or scenarios used to illustrate points.

# Key Quotes
Include 2-3 most memorable or impactful direct lines (if available in transcript).

# Summary
Provide a final, high-level wrap-up of the entire content.

- Use clear headings and bullet points.
- Use relevant emojis for each section.
- Be precise and avoid fluff.
- Always generate notes in English, regardless of the transcript language.
- Only use another language if the user explicitly asks for it in their message.
`;

const CHAT_SYSTEM_PROMPT = `
You are EchoMind AI, a helpful and engaging YouTube knowledge assistant.
Use the transcript and recent conversation context to answer the user's questions naturally.

Rules:
- Be friendly, conversational, and slightly enthusiastic.
- Use relevant emojis throughout your response.
- If the user greets you, greet them back warmly.
- If a question is NOT related to the video transcript or context, politely inform the user and suggest what they can ask instead.
- Keep answers concise unless the user asks for more detail.
- Ensure the tone is helpful and professional.
- Always respond in English unless the user explicitly asks you to speak in another language.
`;

export const buildContextPrompt = (
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat"
) => `
${type === "notes" ? NOTES_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT}

Transcript:
${transcript}

Recent Conversation:
${formatConversationHistory(recentMessages)}

Current User Message:
${type === "notes" ? "Generate structured smart notes for this video based on the transcript." : question}
`;

export const askAiAboutTranscript = async (
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat"
) => {
  try {
    const prompt = buildContextPrompt(transcript, question, recentMessages, type);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    throw new Error("Failed to generate AI response");
  }
};

export async function* streamAiAboutTranscript(
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = [],
  type: "chat" | "notes" = "chat"
) {
  if (!process.env.GEMINI_API_KEY) {
    yield "I'm sorry, the AI service is not properly configured. Please check the API key.";
    return;
  }

  try {
    const prompt = buildContextPrompt(transcript, question, recentMessages, type);
    const result = await model.generateContentStream(prompt);

    try {
      for await (const chunk of result.stream) {
        try {
          const text = chunk.text();
          if (text) yield text;
        } catch (e) {
          continue;
        }
      }
    } catch (streamError: any) {
      if (streamError?.message?.includes("Failed to parse stream")) {
        yield " [Note: The AI response was partially interrupted, but I hope the above information helps!]";
      } else {
        throw streamError;
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown AI error";

    if (
      errorMessage.includes("503") ||
      errorMessage.includes("high demand") ||
      errorMessage.includes("Service Unavailable")
    ) {
      yield "EchoMind AI is currently receiving a lot of questions! 🚀 Please wait a few seconds and try again. Spikes in demand are usually temporary.";
    } else if (errorMessage.includes("API_KEY_INVALID")) {
      yield "The AI API key is invalid. Please update it in the backend configuration.";
    } else {
      yield "I'm sorry, I'm having a bit of trouble connecting to my brain right now. 🧠 Please try your question again in a moment!";
    }
  }
}

export const generateVideoTitle = async (transcript: string) => {
  try {
    const prompt = `
    Summarize the following video transcript into a concise, catchy, and descriptive title (4-7 words maximum).
    Return ONLY the title text. Do not include quotes or symbols.
    
    Transcript Snippet:
    ${transcript.slice(0, 3000)}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/["']/g, "");
  } catch {
    return "New Conversation";
  }
};
