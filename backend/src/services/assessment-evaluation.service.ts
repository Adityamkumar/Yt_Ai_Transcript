import { z } from "zod";
import { Types } from "mongoose";
import type {
  AssessmentEvaluationOutcome,
  IAssessment,
  IAssessmentAreaToImprove,
  IAssessmentResult,
  IAssessmentStrength,
} from "../models/assessment.model.js";
import { PdfChunk } from "../models/pdfChunk.model.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import { aiProviderService } from "./ai/providers/aiProvider.service.js";
import logger from "../lib/logger.js";

const EVALUATION_OUTCOMES: AssessmentEvaluationOutcome[] = [
  "strong",
  "partially_correct",
  "needs_work",
  "unanswered",
];

const QUESTION_EVAL_SCHEMA = z.object({
  questionId: z.string(),
  outcome: z.enum(["strong", "partially_correct", "needs_work"]),
  feedback: z.string().trim().min(1).max(2000),
  keyTakeaway: z.string().trim().min(1).max(2000),
});

const TOPIC_STRENGTH_SCHEMA = z.object({
  topic: z.string().trim().min(1).max(120),
  reason: z.string().trim().min(1).max(2000),
});

const TOPIC_IMPROVE_SCHEMA = z.object({
  topic: z.string().trim().min(1).max(120),
  missingOrMisunderstood: z.string().trim().min(1).max(2000),
  whatToRemember: z.string().trim().min(1).max(2000),
});

const EVALUATION_RESPONSE_SCHEMA = z.object({
  questionEvaluations: z.array(QUESTION_EVAL_SCHEMA),
  summary: z.string().trim().min(1).max(3000),
  strengths: z.array(TOPIC_STRENGTH_SCHEMA),
  areasToImprove: z.array(TOPIC_IMPROVE_SCHEMA),
  nextStepsRecommendation: z.string().trim().min(1).max(2000),
});

const buildProviderJsonSchema = () => ({
  type: "object",
  properties: {
    questionEvaluations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          questionId: { type: "string" },
          outcome: {
            type: "string",
            enum: ["strong", "partially_correct", "needs_work"],
          },
          feedback: { type: "string" },
          keyTakeaway: { type: "string" },
        },
        required: ["questionId", "outcome", "feedback", "keyTakeaway"],
        additionalProperties: false,
      },
    },
    summary: { type: "string" },
    strengths: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          reason: { type: "string" },
        },
        required: ["topic", "reason"],
        additionalProperties: false,
      },
    },
    areasToImprove: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          missingOrMisunderstood: { type: "string" },
          whatToRemember: { type: "string" },
        },
        required: ["topic", "missingOrMisunderstood", "whatToRemember"],
        additionalProperties: false,
      },
    },
    nextStepsRecommendation: { type: "string" },
  },
  required: [
    "questionEvaluations",
    "summary",
    "strengths",
    "areasToImprove",
    "nextStepsRecommendation",
  ],
  additionalProperties: false,
});

const extractJson = (raw: string): string => {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return raw.trim();
  return raw.slice(firstBrace, lastBrace + 1);
};

export interface EvaluatedQuestionOutput {
  questionId: string;
  outcome: AssessmentEvaluationOutcome;
  feedback: string;
  keyTakeaway: string;
}

export interface AssessmentEvaluationResult {
  evaluatedQuestions: Map<string, EvaluatedQuestionOutput>;
  result: IAssessmentResult;
}

export const evaluateAssessmentAnswers = async (
  assessment: IAssessment,
): Promise<AssessmentEvaluationResult> => {
  const evaluatedQuestions = new Map<string, EvaluatedQuestionOutput>();

  // 1. Evaluate multiple-choice deterministically and identify unanswered questions
  const freeTextQuestionsToEvaluate: typeof assessment.questions = [];

  for (const question of assessment.questions) {
    const questionId = question._id?.toString() ?? "";
    const rawAnswer = question.submittedAnswer?.value?.trim() ?? "";

    if (!rawAnswer) {
      evaluatedQuestions.set(questionId, {
        questionId,
        outcome: "unanswered",
        feedback: "This question was left unanswered.",
        keyTakeaway: question.answerKey.expectedAnswer,
      });
      continue;
    }

    if (question.responseFormat === "multiple_choice") {
      const correctOptionId = question.answerKey.correctOptionId;
      const isCorrect = correctOptionId && rawAnswer === correctOptionId;
      const selectedOption = question.options.find(
        (opt) => opt.optionId === rawAnswer,
      );
      const correctOption = question.options.find(
        (opt) => opt.optionId === correctOptionId,
      );

      if (isCorrect) {
        evaluatedQuestions.set(questionId, {
          questionId,
          outcome: "strong",
          feedback: `Correct! You accurately identified "${selectedOption?.text ?? rawAnswer}".`,
          keyTakeaway: question.answerKey.expectedAnswer,
        });
      } else {
        const correctText = correctOption?.text ?? question.answerKey.expectedAnswer;
        evaluatedQuestions.set(questionId, {
          questionId,
          outcome: "needs_work",
          feedback: `You selected "${selectedOption?.text ?? rawAnswer}". The correct answer is "${correctText}".`,
          keyTakeaway: question.answerKey.expectedAnswer,
        });
      }
      continue;
    }

    // Short answer or extended response with non-empty student answer
    freeTextQuestionsToEvaluate.push(question);
  }

  // 2. Fetch source evidence chunks for context
  const chunkIds: Types.ObjectId[] = [];
  for (const q of freeTextQuestionsToEvaluate) {
    for (const ev of q.sourceEvidence) {
      if (ev.chunkId) chunkIds.push(ev.chunkId);
    }
  }

  const chunkMap = new Map<string, string>();
  if (chunkIds.length > 0) {
    try {
      if (assessment.sourceType === "video") {
        const chunks = await TranscriptChunk.find({ _id: { $in: chunkIds } })
          .select("text")
          .lean();
        chunks.forEach((c) => chunkMap.set(c._id.toString(), c.text));
      } else {
        const chunks = await PdfChunk.find({ _id: { $in: chunkIds } })
          .select("text")
          .lean();
        chunks.forEach((c) => chunkMap.set(c._id.toString(), c.text));
      }
    } catch (chunkError) {
      logger.warn(
        { chunkError },
        "[Assessment Evaluation] Non-critical: Could not preload source chunks",
      );
    }
  }

  // Group questions by topic to derive strengths / areas to improve
  const topicMap = new Map<
    string,
    {
      topic: string;
      questions: typeof assessment.questions;
      evidence: typeof assessment.questions[number]["sourceEvidence"];
    }
  >();

  for (const q of assessment.questions) {
    const existing = topicMap.get(q.topic) ?? {
      topic: q.topic,
      questions: [],
      evidence: [],
    };
    existing.questions.push(q);
    for (const ev of q.sourceEvidence) {
      if (!existing.evidence.some((e) => e.chunkId?.equals(ev.chunkId))) {
        existing.evidence.push(ev);
      }
    }
    topicMap.set(q.topic, existing);
  }

  // 3. AI Evaluation for free text (if any exist)
  if (freeTextQuestionsToEvaluate.length > 0) {
    const questionsBlock = freeTextQuestionsToEvaluate
      .map((q, idx) => {
        const qId = q._id?.toString() ?? "";
        const studentAnswer = q.submittedAnswer?.value?.trim() ?? "";
        const evidenceTexts = q.sourceEvidence
          .map((ev) => chunkMap.get(ev.chunkId?.toString() ?? "") ?? "")
          .filter(Boolean)
          .join(" ")
          .slice(0, 1500);

        return [
          `--- QUESTION ${idx + 1} (ID: ${qId}) ---`,
          `TOPIC: ${q.topic}`,
          `PROMPT: ${q.prompt}`,
          `EXPECTED ANSWER: ${q.answerKey.expectedAnswer}`,
          `RUBRIC: ${q.evaluationRubric.join("; ")}`,
          evidenceTexts ? `SOURCE CONTEXT: ${evidenceTexts}` : "",
          `STUDENT'S ANSWER: ${studentAnswer}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const prompt = [
      `You are evaluating answers for an assessment in Lumora.`,
      `LEARNING GOAL: ${assessment.goal === "custom" ? assessment.customGoal : assessment.goal}`,
      `ASSESSMENT DEPTH: ${assessment.depth}`,
      `SOURCE TYPE: ${assessment.sourceType}`,
      "",
      `INSTRUCTIONS:`,
      `1. Evaluate each of the following student answers fairly based on the prompt, expected answer, rubric, and source context.`,
      `2. Assign an outcome: "strong", "partially_correct", or "needs_work".`,
      `   - "strong": Demonstrates accurate conceptual understanding of core points.`,
      `     For code or practical questions: any code that satisfies the rubric criteria and produces`,
      `     the correct observable behaviour is "strong", regardless of syntax style or naming conventions.`,
      `   - "partially_correct": Has the right general intuition but is incomplete or lacks key specifics.`,
      `     For code questions: correct logic with a minor omission (e.g. missing edge-case) or a small syntax error.`,
      `   - "needs_work": Contains substantial misconceptions, is off-topic, or fails to address the rubric.`,
      `3. For code and practical questions:`,
      `   a. Accept semantically equivalent implementations — do not penalise a different but correct approach.`,
      `   b. Judge against the rubric criteria (observable behaviour, logic) not against exact wording of expectedAnswer.`,
      `   c. Provide concrete, mentor-like feedback (1-3 sentences) noting what works and what is missing or incorrect.`,
      `4. For conceptual questions: provide concise, mentor-like feedback (1-3 sentences) explaining what was done well or what was missing.`,
      `5. Provide a 1-sentence keyTakeaway explaining the correct concept or approach to remember.`,
      `6. Provide an overall summary (2-3 encouraging sentences) grounded in the user's learning goal.`,
      `7. Highlight topic-level strengths and areas needing focus.`,
      `8. Provide a prioritized nextStepsRecommendation (1-2 sentences).`,
      "",
      `QUESTIONS TO EVALUATE:`,
      questionsBlock,
    ].join("\n");

    const systemPrompt =
      "You are Lumora's supportive, source-grounded learning evaluator. Return strict JSON matching the schema.";

    const raw = await aiProviderService.generateStructuredResponse(
      prompt,
      buildProviderJsonSchema(),
      systemPrompt,
      (text) => {
        try {
          const parsed = JSON.parse(extractJson(text));
          return EVALUATION_RESPONSE_SCHEMA.safeParse(parsed).success;
        } catch {
          return false;
        }
      },
      { purpose: "assessment-generation" },
    );

    const parsedData = EVALUATION_RESPONSE_SCHEMA.parse(
      JSON.parse(extractJson(raw)),
    );

    for (const qEval of parsedData.questionEvaluations) {
      evaluatedQuestions.set(qEval.questionId, {
        questionId: qEval.questionId,
        outcome: qEval.outcome,
        feedback: qEval.feedback,
        keyTakeaway: qEval.keyTakeaway,
      });
    }

    // Assemble strengths and areasToImprove
    const strengths: IAssessmentStrength[] = [];
    const areasToImprove: IAssessmentAreaToImprove[] = [];

    for (const [topicName, topicData] of topicMap.entries()) {
      const topicOutcomes = topicData.questions.map((q) => {
        const qId = q._id?.toString() ?? "";
        return evaluatedQuestions.get(qId)?.outcome ?? "unanswered";
      });

      const hasStrong = topicOutcomes.includes("strong");
      const hasNeedsWork =
        topicOutcomes.includes("needs_work") ||
        topicOutcomes.includes("partially_correct");

      const aiStrength = parsedData.strengths.find(
        (s) => s.topic.toLowerCase() === topicName.toLowerCase(),
      );
      const aiImprove = parsedData.areasToImprove.find(
        (a) => a.topic.toLowerCase() === topicName.toLowerCase(),
      );

      if (hasStrong && !hasNeedsWork) {
        strengths.push({
          topic: topicName,
          reason:
            aiStrength?.reason ??
            `You demonstrated clear understanding and accurate explanations for ${topicName}.`,
          sourceEvidence: topicData.evidence,
        });
      } else if (hasNeedsWork) {
        areasToImprove.push({
          topic: topicName,
          missingOrMisunderstood:
            aiImprove?.missingOrMisunderstood ??
            `Review the core principles and mechanisms behind ${topicName}.`,
          whatToRemember:
            aiImprove?.whatToRemember ??
            topicData.questions[0]?.answerKey.expectedAnswer ??
            "Pay close attention to key details and definitions.",
          sourceEvidence: topicData.evidence,
        });
      } else if (hasStrong) {
        strengths.push({
          topic: topicName,
          reason:
            aiStrength?.reason ??
            `You grasped the fundamentals of ${topicName}.`,
          sourceEvidence: topicData.evidence,
        });
      }
    }

    return {
      evaluatedQuestions,
      result: {
        summary: parsedData.summary,
        strengths,
        areasToImprove,
        nextSteps: {
          focusTopics: areasToImprove.map((a) => a.topic),
          recommendation: parsedData.nextStepsRecommendation,
        },
        evaluatedAt: new Date(),
      },
    };
  }

  // Fallback / deterministic-only evaluation (when only multiple-choice or unanswered existed)
  const strengths: IAssessmentStrength[] = [];
  const areasToImprove: IAssessmentAreaToImprove[] = [];

  for (const [topicName, topicData] of topicMap.entries()) {
    const topicOutcomes = topicData.questions.map((q) => {
      const qId = q._id?.toString() ?? "";
      return evaluatedQuestions.get(qId)?.outcome ?? "unanswered";
    });

    const isAllStrong = topicOutcomes.every((o) => o === "strong");
    const hasNeedsWork =
      topicOutcomes.includes("needs_work") ||
      topicOutcomes.includes("partially_correct");

    if (isAllStrong) {
      strengths.push({
        topic: topicName,
        reason: `You answered all questions on ${topicName} correctly.`,
        sourceEvidence: topicData.evidence,
      });
    } else if (hasNeedsWork) {
      const firstWeakQ = topicData.questions.find((q) => {
        const qId = q._id?.toString() ?? "";
        const out = evaluatedQuestions.get(qId)?.outcome;
        return out === "needs_work" || out === "partially_correct";
      });

      areasToImprove.push({
        topic: topicName,
        missingOrMisunderstood: `One or more questions on ${topicName} were answered incorrectly or incompletely.`,
        whatToRemember:
          firstWeakQ?.answerKey.expectedAnswer ??
          "Review the core concepts from the source material.",
        sourceEvidence: topicData.evidence,
      });
    }
  }

  const focusTopicNames = areasToImprove.map((a) => a.topic);
  const totalCount = assessment.questions.length;
  const strongCount = Array.from(evaluatedQuestions.values()).filter(
    (e) => e.outcome === "strong",
  ).length;

  let summary = "";
  if (strongCount === totalCount) {
    summary = `Excellent work! You demonstrated complete understanding across all topics assessed from this source.`;
  } else if (strongCount >= Math.floor(totalCount / 2)) {
    summary = `Good progress! You have a solid grasp of key fundamentals, with a few specific areas that will benefit from focused review.`;
  } else {
    summary = `You have taken an important first step. Review the highlighted topics below to strengthen your understanding of this material.`;
  }

  const recommendation =
    focusTopicNames.length > 0
      ? `Focus on ${focusTopicNames.slice(0, 2).join(" and ")}; you do not need to reread the entire source.`
      : "You have demonstrated strong understanding across all assessed areas.";

  return {
    evaluatedQuestions,
    result: {
      summary,
      strengths,
      areasToImprove,
      nextSteps: {
        focusTopics: focusTopicNames,
        recommendation,
      },
      evaluatedAt: new Date(),
    },
  };
};
