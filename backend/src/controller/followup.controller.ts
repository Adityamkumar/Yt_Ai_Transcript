import { FOLLOWUP_SYSTEM_PROMPT } from "../services/followup.prompts.js";
import { aiProviderService } from "../services/ai/providers/aiProvider.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    const rawText = await aiProviderService.generateStructuredResponse(prompt, GeminiFollowUpSchema);

    if (!rawText) {
      return res
        .status(200)
        .json(new ApiResponse(200, { followUpQuestions: [] }, "No suggestions generated"));
    }

    let parsed: { questions?: string[] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      
      const jsonMatch = rawText.match(/```json\s?([\s\S]*?)\s?```/) || rawText.match(/```\s?([\s\S]*?)\s?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]!.trim());
      } else {
        parsed = { questions: [] };
      }
    }

    const uniqueQuestions: string[] = [];
    const seen = new Set<string>();

    for (const q of parsed.questions || []) {
      if (typeof q !== "string") continue;
      const trimmed = q.trim();
      if (trimmed.length === 0) continue;

      
      const normalized = trimmed.toLowerCase().replace(/[?.,!]/g, "").replace(/\s+/g, " ");
      if (seen.has(normalized)) continue;

      
      const normalizedUserQ = question.trim().toLowerCase().replace(/[?.,!]/g, "").replace(/\s+/g, " ");
      if (normalized === normalizedUserQ) continue;

      seen.add(normalized);
      uniqueQuestions.push(trimmed);
    }

    const questions = uniqueQuestions.slice(0, 3);

    return res
      .status(200)
      .json(new ApiResponse(200, { followUpQuestions: questions }, "Follow-up questions generated"));
  } catch (error: any) {
    
    return res
      .status(200)
      .json(new ApiResponse(200, { followUpQuestions: [] }, "Follow-up generation skipped"));
  }
});
