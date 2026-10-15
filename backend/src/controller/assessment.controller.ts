import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  assessmentAnswerSchema,
  assessmentConversationSchema,
  createAssessmentRequestSchema,
} from "../services/assessment.validation.js";
import {
  createAssessment,
  getAssessmentResults,
  getAssessmentSession,
  getAssessmentOverview,
  retryAssessmentEvaluation,
  saveAssessmentAnswer,
  startAssessmentSession,
  submitAssessment,
} from "../services/assessment.service.js";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const postAssessment = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createAssessmentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid assessment request",
      [],
      "",
      "INVALID_REQUEST",
    );
  }

  const idempotencyKey = req.header("Idempotency-Key");
  if (typeof idempotencyKey !== "string" || !z.uuid().safeParse(idempotencyKey).success) {
    throw new ApiError(400, "A valid Idempotency-Key UUID is required", [], "", "INVALID_IDEMPOTENCY_KEY");
  }
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }

  const responseLanguage = req.user?.preferences.responseLanguage ?? "en";
  const result = await createAssessment(
    req.authUserId,
    parsed.data,
    idempotencyKey,
    responseLanguage,
  );
  const statusCode = result.replay ? 200 : 201;
  return res.status(statusCode).json(
    new ApiResponse(statusCode, result.overview, result.replay
      ? "Assessment overview retrieved successfully"
      : "Assessment prepared successfully"),
  );
});

export const getAssessment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const assessmentId = Array.isArray(req.params.assessmentId)
    ? req.params.assessmentId[0] ?? ""
    : req.params.assessmentId ?? "";
  const overview = await getAssessmentOverview(req.authUserId, assessmentId);
  return res.status(200).json(
    new ApiResponse(200, overview, "Assessment overview fetched successfully"),
  );
});

export const startAssessment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const parsed = assessmentConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "A valid conversationId is required", [], "", "INVALID_REQUEST");
  }
  const session = await startAssessmentSession(
    req.authUserId,
    getParam(req.params.assessmentId),
    parsed.data.conversationId,
  );
  return res.status(200).json(new ApiResponse(200, session, "Assessment session started"));
});

export const getAssessmentSessionController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const parsed = assessmentConversationSchema.safeParse({ conversationId: req.query.conversationId });
  if (!parsed.success) {
    throw new ApiError(400, "A valid conversationId query parameter is required", [], "", "INVALID_REQUEST");
  }
  const session = await getAssessmentSession(
    req.authUserId,
    getParam(req.params.assessmentId),
    parsed.data.conversationId,
  );
  return res.status(200).json(new ApiResponse(200, session, "Assessment session fetched successfully"));
});

export const putAssessmentAnswer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const parsed = assessmentAnswerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid answer request", [], "", "INVALID_REQUEST");
  }
  const result = await saveAssessmentAnswer(
    req.authUserId,
    getParam(req.params.assessmentId),
    getParam(req.params.questionId),
    parsed.data.conversationId,
    parsed.data.answer,
    parsed.data.revision,
  );
  return res.status(200).json(new ApiResponse(200, result, "Answer saved"));
});

export const submitAssessmentController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const parsed = assessmentConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "A valid conversationId is required", [], "", "INVALID_REQUEST");
  }
  const results = await submitAssessment(
    req.authUserId,
    getParam(req.params.assessmentId),
    parsed.data.conversationId,
  );
  return res.status(200).json(new ApiResponse(200, results, "Assessment submitted successfully"));
});

export const retryAssessmentEvaluationController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const parsed = assessmentConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "A valid conversationId is required", [], "", "INVALID_REQUEST");
  }
  const results = await retryAssessmentEvaluation(
    req.authUserId,
    getParam(req.params.assessmentId),
    parsed.data.conversationId,
  );
  return res.status(200).json(new ApiResponse(200, results, "Assessment evaluation retried"));
});

export const getAssessmentResultsController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.authUserId) {
    throw new ApiError(401, "Authentication required", [], "", "AUTHENTICATION_REQUIRED");
  }
  const parsed = assessmentConversationSchema.safeParse({ conversationId: req.query.conversationId });
  if (!parsed.success) {
    throw new ApiError(400, "A valid conversationId query parameter is required", [], "", "INVALID_REQUEST");
  }
  const results = await getAssessmentResults(
    req.authUserId,
    getParam(req.params.assessmentId),
    parsed.data.conversationId,
  );
  return res.status(200).json(new ApiResponse(200, results, "Assessment results fetched successfully"));
});