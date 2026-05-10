import { GoogleGenerativeAI } from "@google/generative-ai";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
});

export const getRecentMessages = (
  messages: ConversationMessage[] = [],
  limit = 10
) => messages.filter((message) => message.content?.trim()).slice(-limit);

export const formatConversationHistory = (
  messages: ConversationMessage[] = []
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

export const buildContextPrompt = (
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = []
) => `
You are EchoMind AI.

Use the transcript and recent conversation context to answer naturally and conversationally.
If the user asks follow-up questions, use previous conversation context.

Rules:
- Answer from the transcript and recent conversation context.
- If information is not in the transcript or conversation, say you could not find it in the video.
- Keep answers concise unless the user asks for detail.
- Do not repeat earlier answers unless the user asks.
- Support summaries, quizzes, explanations, follow-up questions, and action items.
- The transcript may be in Hindi or another language. Answer in the user's language when clear, otherwise answer in English.

Transcript:
${transcript}

Recent Conversation:
${formatConversationHistory(recentMessages)}

Current User Message:
${question}
`;

export const askAiAboutTranscript = async (
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = []
) => {
  try {
    const prompt = buildContextPrompt(transcript, question, recentMessages);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    throw new Error("Failed to generate AI response");
  }
};

export async function* streamAiAboutTranscript(
  transcript: string,
  question: string,
  recentMessages: ConversationMessage[] = []
) {
  try {
    const prompt = buildContextPrompt(transcript, question, recentMessages);
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch {
    throw new Error("Failed to stream AI response");
  }
}
