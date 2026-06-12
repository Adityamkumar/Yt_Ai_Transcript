import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for Gemini AI operations.");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
};
