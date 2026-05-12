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
- Be friendly, conversational, and engaging.
- Use relevant emojis throughout your response to make it more expressive and user-friendly (like ChatGPT).
- If the user greets you (e.g., "Hi", "Hello"), greet them back with a warm emoji and ask how you can help them with the video context.
- Use the provided transcript and recent conversation context to answer questions.
- If a question is NOT related to the video transcript or the conversation context, politely inform the user. For example: "I'd love to help with that, but my current focus is on the contents of this video. Feel free to ask me anything about [Video Topic] instead!"
- Keep answers concise unless the user asks for more detail.
- Ensure the tone is helpful, professional, and slightly enthusiastic.
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
  if (!process.env.GEMINI_API_KEY) {
    yield "I'm sorry, the AI service is not properly configured. Please check the API key.";
    return;
  }

  try {
    const prompt = buildContextPrompt(transcript, question, recentMessages);
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
    
    if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("Service Unavailable")) {
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
    return result.response.text().trim().replace(/["']/g, '');
  } catch {
    return "New Conversation";
  }
};
