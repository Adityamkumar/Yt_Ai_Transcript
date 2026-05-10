import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
});

export const askAiAboutTranscript = async (
  transcript: string,
  question: string
) => {
  try {
    const prompt = `
You are a helpful AI assistant.

Answer ONLY from the provided transcript.

If the answer is not present in transcript, say:
"I could not find that in the video."

The transcript may be in Hindi or another language.
Always answer in English.

Transcript:
${transcript}

Question:
${question}
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return response;
  } catch (error) {
    throw new Error("Failed to generate AI response");
  }
};