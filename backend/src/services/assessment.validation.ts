import { z } from "zod";

export const createAssessmentRequestSchema = z
  .object({
    conversationId: z.string().regex(/^[a-f\d]{24}$/i),
    goal: z.enum([
      "understand_deeply",
      "exam_certification",
      "interview_preparation",
      "practical_application",
      "refresh_knowledge",
      "custom",
    ]),
    customGoal: z.string().trim().min(3).max(300).optional(),
    depth: z.enum(["quick", "standard", "deep"]),
  })
  .strict()
  .superRefine((request, context) => {
    if (request.goal === "custom" && !request.customGoal) {
      context.addIssue({
        code: "custom",
        path: ["customGoal"],
        message: "A custom goal between 3 and 300 characters is required.",
      });
    }
    if (request.goal !== "custom" && request.customGoal !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["customGoal"],
        message: "customGoal is only valid when goal is custom.",
      });
    }
  });

export type CreateAssessmentRequest = z.infer<
  typeof createAssessmentRequestSchema
>;

export const assessmentConversationSchema = z.object({
  conversationId: z.string().regex(/^[a-f\d]{24}$/i),
}).strict();

export const assessmentAnswerSchema = z.object({
  conversationId: z.string().regex(/^[a-f\d]{24}$/i),
  answer: z.string().max(10000),
  revision: z.number().int().min(1).max(1000000000),
}).strict();