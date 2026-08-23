import { GoogleGenAI } from "@google/genai";

let geminiGenerationClient: GoogleGenAI | null = null;
let geminiEmbeddingClient: GoogleGenAI | null = null;

export const getGeminiGenerationClient = () => {
  const apiKey = process.env.GEMINI_GENERATION_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_GENERATION_API_KEY is required for Gemini generation operations.");
  }

  if (!geminiGenerationClient) {
    geminiGenerationClient = new GoogleGenAI({ apiKey });
  }

  return geminiGenerationClient;
};

export const getGeminiEmbeddingClient = () => {
  const apiKey = process.env.GEMINI_EMBEDDING_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_EMBEDDING_API_KEY is required for Gemini embedding operations.");
  }

  if (!geminiEmbeddingClient) {
    geminiEmbeddingClient = new GoogleGenAI({ apiKey });
  }

  return geminiEmbeddingClient;
};
