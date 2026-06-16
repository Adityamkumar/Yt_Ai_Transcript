import { GoogleGenAI } from "@google/genai";
import { FOLLOWUP_SYSTEM_PROMPT } from "../services/followup.prompts.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const GeminiFollowUpSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["questions"],
};

export const generateFollowUp = asyncHandler(async (req, res) => {
  const { question, answer, context } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "question and answer are required");
  }

  const truncatedAnswer = answer.slice(0, 1500);
  const truncatedContext = context ? context.slice(0, 1000) : "";

  const prompt = `
${FOLLOWUP_SYSTEM_PROMPT}

User Question:
${question}

AI Answer:
${truncatedAnswer}

${truncatedContext ? `Source Context:\n${truncatedContext}` : ""}

Generate follow-up questions:
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GeminiFollowUpSchema as any,
        temperature: 0.7,
      },
    });

    const rawText = response.text?.trim();

    if (!rawText) {
      return res
        .status(200)
        .json(new ApiResponse(200, { followUpQuestions: [] }, "No suggestions generated"));
    }

    let parsed: { questions?: string[] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = rawText.match(/```json\s?([\s\S]*?)\s?```/) || rawText.match(/```\s?([\s\S]*?)\s?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]!.trim());
      } else {
        parsed = { questions: [] };
      }
    }

    const questions = (parsed.questions || [])
      .filter((q: unknown) => typeof q === "string" && q.trim().length > 0)
      .slice(0, 3);

    return res
      .status(200)
      .json(new ApiResponse(200, { followUpQuestions: questions }, "Follow-up questions generated"));
  } catch (error: any) {
    // Silent degradation — never fail the request, just return empty
    return res
      .status(200)
      .json(new ApiResponse(200, { followUpQuestions: [] }, "Follow-up generation skipped"));
  }
});
