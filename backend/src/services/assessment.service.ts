import { createHash, randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { Assessment, type IAssessment } from "../models/assessment.model.js";
import { Conversation } from "../models/conversation.model.js";
import { PdfDocument } from "../models/pdfDocument.model.js";
import { SourceAccess } from "../models/sourceAccess.model.js";
import { Video } from "../models/VideoUrl.model.js";
import { PdfChunk } from "../models/pdfChunk.model.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../lib/logger.js";
import {
  AssessmentContentError,
  generateAssessmentQuestions,
} from "./assessment-generation.service.js";
import { evaluateAssessmentAnswers } from "./assessment-evaluation.service.js";
import type {
  AssessmentOverviewDto,
  AssessmentResultsDto,
  AssessmentSourceType,
  PublicAnswerSaveDto,
  PublicAssessmentQuestionDto,
  PublicAssessmentSessionDto,
  PublicQuestionResultDto,
} from "./assessment.types.js";
import type { CreateAssessmentRequest } from "./assessment.validation.js";
import type { ResponseLanguage } from "../rag/utils/languagePrompt.util.js";

const STALE_GENERATION_MS = 2 * 60 * 1000;

type ResolvedSource = {
  sourceType: AssessmentSourceType;
  sourceId: mongoose.Types.ObjectId;
  title: string;
  isReady: boolean;
};

const resolveOwnedSource = async (
  userId: string,
  request: CreateAssessmentRequest,
): Promise<ResolvedSource> => {
  if (!mongoose.isValidObjectId(request.conversationId)) {
    throw new ApiError(
      400,
      "Invalid conversation ID",
      [],
      "",
      "INVALID_REQUEST",
    );
  }

  const conversation = await Conversation.findOne({
    _id: request.conversationId,
    userId,
  }).lean();

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found",
      [],
      "",
      "CONVERSATION_NOT_FOUND",
    );
  }

  if (conversation.type === "video") {
    if (!conversation.videoId || conversation.pdfDocumentId) {
      throw new ApiError(
        409,
        "Conversation source is inconsistent",
        [],
        "",
        "SOURCE_MISMATCH",
      );
    }
    const sourceId = conversation.videoId;
    const [video, access] = await Promise.all([
      Video.findById(sourceId).select("title status ragStatus").lean(),
      SourceAccess.exists({ userId, sourceType: "video", sourceId }),
    ]);
    if (!video) {
      throw new ApiError(
        404,
        "Video source not found",
        [],
        "",
        "SOURCE_NOT_FOUND",
      );
    }
    if (!access) {
      throw new ApiError(
        403,
        "Reopen this video through transcript acquisition before creating an assessment.",
        [],
        "",
        "SOURCE_ACCESS_REQUIRED",
      );
    }
    return {
      sourceType: "video",
      sourceId,
      title: video.title,
      isReady: (video.ragStatus ?? video.status) === "ready",
    };
  }

  if (!conversation.pdfDocumentId || conversation.videoId) {
    throw new ApiError(
      409,
      "Conversation source is inconsistent",
      [],
      "",
      "SOURCE_MISMATCH",
    );
  }
  const sourceId = conversation.pdfDocumentId;
  const [pdf, access] = await Promise.all([
    PdfDocument.findById(sourceId).select("title status ragStatus").lean(),
    SourceAccess.exists({ userId, sourceType: "pdf", sourceId }),
  ]);
  if (!pdf) {
    throw new ApiError(404, "PDF source not found", [], "", "SOURCE_NOT_FOUND");
  }
  if (!access) {
    throw new ApiError(
      403,
      "Reupload this PDF to verify access before creating an assessment.",
      [],
      "",
      "SOURCE_ACCESS_REQUIRED",
    );
  }
  return {
    sourceType: "pdf",
    sourceId,
    title: pdf.title,
    isReady: (pdf.ragStatus ?? pdf.status) === "ready",
  };
};

const assertSourceReady = (source: ResolvedSource) => {
  if (!source.isReady) {
    throw new ApiError(
      409,
      "The source is not ready for assessment yet",
      [],
      "",
      "SOURCE_NOT_READY",
    );
  }
};

const assertUsableContent = async (source: ResolvedSource) => {
  const count =
    source.sourceType === "video"
      ? await TranscriptChunk.countDocuments({
          videoDocumentId: source.sourceId,
        })
      : await PdfChunk.countDocuments({ documentId: source.sourceId });
  if (count === 0) {
    throw new ApiError(
      422,
      "The source has no usable content for an assessment",
      [],
      "",
      "SOURCE_CONTENT_UNAVAILABLE",
    );
  }
};

const requestHash = (request: CreateAssessmentRequest) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        conversationId: request.conversationId.toLowerCase(),
        goal: request.goal,
        customGoal: request.customGoal?.trim() ?? null,
        depth: request.depth,
      }),
    )
    .digest("hex");

const toOverviewDto = async (
  assessment: IAssessment,
  sourceTitle?: string,
): Promise<AssessmentOverviewDto> => ({
  assessmentId: assessment._id.toString(),
  status: assessment.status,
  conversationId: assessment.conversationId.toString(),
  source: {
    type: assessment.sourceType,
    title: sourceTitle ?? "Source",
  },
  goal: assessment.goal,
  ...(assessment.customGoal ? { customGoal: assessment.customGoal } : {}),
  depth: assessment.depth,
  questionCount: assessment.questions.length,
  topics: [...new Set(assessment.questions.map((question) => question.topic))],
});

const getCurrentSourceDetails = async (assessment: IAssessment) => {
  const conversation = await Conversation.findOne({
    _id: assessment.conversationId,
    userId: assessment.userId,
  })
    .select("type videoId pdfDocumentId")
    .lean();
  if (!conversation || conversation.type !== assessment.sourceType)
    return undefined;
  if (
    assessment.sourceType === "video" &&
    conversation.videoId?.equals(assessment.videoId)
  ) {
    const video = await Video.findById(assessment.videoId)
      .select("title youtubeVideoId")
      .lean();
    if (!video) return undefined;
    return {
      type: "video" as const,
      title: video.title,
      youtubeVideoId: video.youtubeVideoId,
    };
  }
  if (
    assessment.sourceType === "pdf" &&
    conversation.pdfDocumentId?.equals(assessment.pdfDocumentId)
  ) {
    const pdf = await PdfDocument.findById(assessment.pdfDocumentId)
      .select("title")
      .lean();
    if (!pdf) return undefined;
    return {
      type: "pdf" as const,
      title: pdf.title,
    };
  }
  return undefined;
};

const getCurrentSourceTitle = async (assessment: IAssessment) => {
  const details = await getCurrentSourceDetails(assessment);
  return details?.title;
};

const assertAssessmentSourceContext = async (
  assessment: IAssessment,
  userId: string,
  conversationId: string,
) => {
  if (assessment.conversationId.toString() !== conversationId) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }
  const conversation = await Conversation.findOne({
    _id: assessment.conversationId,
    userId,
  }).lean();
  if (!conversation || conversation.type !== assessment.sourceType) {
    throw new ApiError(
      404,
      "Assessment conversation not found",
      [],
      "",
      "CONVERSATION_NOT_FOUND",
    );
  }

  if (assessment.sourceType === "video") {
    if (
      !assessment.videoId ||
      assessment.pdfDocumentId ||
      !conversation.videoId?.equals(assessment.videoId) ||
      conversation.pdfDocumentId
    ) {
      throw new ApiError(
        409,
        "Assessment source does not match its conversation",
        [],
        "",
        "SOURCE_MISMATCH",
      );
    }
    const [source, access] = await Promise.all([
      Video.findById(assessment.videoId).select("title youtubeVideoId").lean(),
      SourceAccess.exists({
        userId,
        sourceType: "video",
        sourceId: assessment.videoId,
      }),
    ]);
    if (!source || !access) {
      throw new ApiError(
        404,
        "Assessment source is unavailable",
        [],
        "",
        "SOURCE_UNAVAILABLE",
      );
    }
    return {
      type: "video" as const,
      title: source.title,
      youtubeVideoId: source.youtubeVideoId,
    };
  }

  if (
    !assessment.pdfDocumentId ||
    assessment.videoId ||
    !conversation.pdfDocumentId?.equals(assessment.pdfDocumentId) ||
    conversation.videoId
  ) {
    throw new ApiError(
      409,
      "Assessment source does not match its conversation",
      [],
      "",
      "SOURCE_MISMATCH",
    );
  }
  const [source, access] = await Promise.all([
    PdfDocument.findById(assessment.pdfDocumentId).select("title").lean(),
    SourceAccess.exists({
      userId,
      sourceType: "pdf",
      sourceId: assessment.pdfDocumentId,
    }),
  ]);
  if (!source || !access) {
    throw new ApiError(
      404,
      "Assessment source is unavailable",
      [],
      "",
      "SOURCE_UNAVAILABLE",
    );
  }
  return { type: "pdf" as const, title: source.title };
};

const toPublicQuestion = (
  question: IAssessment["questions"][number],
): PublicAssessmentQuestionDto => ({
  questionId: question._id?.toString() ?? "",
  position: question.position,
  prompt: question.prompt,
  questionType: question.questionType,
  responseFormat: question.responseFormat,
  options:
    question.responseFormat === "multiple_choice"
      ? question.options.map(({ optionId, text }) => ({ optionId, text }))
      : [],
  topic: question.topic,
  ...(question.submittedAnswer?.revision
    ? { savedAnswer: question.submittedAnswer.value }
    : {}),
  answerRevision: question.submittedAnswer?.revision ?? 0,
});

const toPublicSession = (
  assessment: IAssessment,
  source: {
    type: AssessmentSourceType;
    title: string;
    youtubeVideoId?: string;
  },
): PublicAssessmentSessionDto => ({
  assessmentId: assessment._id.toString(),
  conversationId: assessment.conversationId.toString(),
  status: assessment.status as PublicAssessmentSessionDto["status"],
  source,
  startedAt: (assessment.startedAt ?? assessment.createdAt).toISOString(),
  submittedAt: assessment.submittedAt?.toISOString(),
  questionCount: assessment.questions.length,
  questions: assessment.questions.map(toPublicQuestion),
});

export const startAssessmentSession = async (
  userId: string,
  assessmentId: string,
  conversationId: string,
) => {
  if (
    !mongoose.isValidObjectId(assessmentId) ||
    !mongoose.isValidObjectId(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid assessment or conversation ID",
      [],
      "",
      "INVALID_REQUEST",
    );
  }
  let assessment = await Assessment.findOne({ _id: assessmentId, userId });
  if (!assessment) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }
  const source = await assertAssessmentSourceContext(
    assessment,
    userId,
    conversationId,
  );

  if (assessment.status === "ready") {
    assessment =
      (await Assessment.findOneAndUpdate(
        { _id: assessment._id, userId, conversationId, status: "ready" },
        { $set: { status: "in_progress", startedAt: new Date() } },
        { new: true, runValidators: true },
      )) ??
      (await Assessment.findOne({ _id: assessmentId, userId, conversationId }));
  }
  if (!assessment || assessment.status !== "in_progress") {
    throw new ApiError(
      409,
      "Assessment cannot be started in its current state",
      [],
      "",
      "INVALID_ASSESSMENT_STATE",
    );
  }
  if (assessment.questions.length === 0) {
    throw new ApiError(
      409,
      "Assessment has no questions",
      [],
      "",
      "ASSESSMENT_QUESTIONS_UNAVAILABLE",
    );
  }
  return toPublicSession(assessment, source);
};

export const getAssessmentSession = async (
  userId: string,
  assessmentId: string,
  conversationId: string,
) => {
  if (
    !mongoose.isValidObjectId(assessmentId) ||
    !mongoose.isValidObjectId(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid assessment or conversation ID",
      [],
      "",
      "INVALID_REQUEST",
    );
  }
  const assessment = await Assessment.findOne({ _id: assessmentId, userId });
  if (!assessment) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }
  const source = await assertAssessmentSourceContext(
    assessment,
    userId,
    conversationId,
  );
  if (assessment.status !== "in_progress") {
    throw new ApiError(
      409,
      "Assessment is not in progress",
      [],
      "",
      "INVALID_ASSESSMENT_STATE",
    );
  }
  return toPublicSession(assessment, source);
};

export const saveAssessmentAnswer = async (
  userId: string,
  assessmentId: string,
  questionId: string,
  conversationId: string,
  answer: string,
  revision: number,
): Promise<PublicAnswerSaveDto> => {
  if (
    ![assessmentId, questionId, conversationId].every((id) =>
      mongoose.isValidObjectId(id),
    )
  ) {
    throw new ApiError(
      400,
      "Invalid assessment, conversation, or question ID",
      [],
      "",
      "INVALID_REQUEST",
    );
  }
  const assessment = await Assessment.findOne({ _id: assessmentId, userId });
  if (!assessment) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }
  await assertAssessmentSourceContext(assessment, userId, conversationId);
  if (assessment.status !== "in_progress") {
    throw new ApiError(
      409,
      "Answers can only be changed while the assessment is in progress",
      [],
      "",
      "INVALID_ASSESSMENT_STATE",
    );
  }

  const question = assessment.questions.find(
    (candidate) => candidate._id?.toString() === questionId,
  );
  if (!question) {
    throw new ApiError(404, "Question not found", [], "", "QUESTION_NOT_FOUND");
  }
  const normalizedAnswer = answer.trim();
  if (
    question.responseFormat === "multiple_choice" &&
    normalizedAnswer &&
    !question.options.some((option) => option.optionId === normalizedAnswer)
  ) {
    throw new ApiError(
      400,
      "Select one of the available options",
      [],
      "",
      "INVALID_ANSWER",
    );
  }

  const updated = await Assessment.findOneAndUpdate(
    {
      _id: assessmentId,
      userId,
      conversationId,
      status: "in_progress",
      questions: {
        $elemMatch: {
          _id: question._id,
          $or: [
            { "submittedAnswer.revision": { $exists: false } },
            { "submittedAnswer.revision": { $lt: revision } },
          ],
        },
      },
    },
    {
      $set: {
        "questions.$.submittedAnswer": {
          value: normalizedAnswer,
          savedAt: new Date(),
          revision,
        },
      },
    },
    { new: true, runValidators: true },
  );

  const finalAssessment =
    updated ?? (await Assessment.findOne({ _id: assessmentId, userId }));
  const finalQuestion = finalAssessment?.questions.find(
    (candidate) => candidate._id?.toString() === questionId,
  );
  if (!finalQuestion) {
    throw new ApiError(404, "Question not found", [], "", "QUESTION_NOT_FOUND");
  }
  return {
    questionId: finalQuestion._id?.toString() ?? questionId,
    answer: finalQuestion.submittedAnswer?.value ?? "",
    answerRevision: finalQuestion.submittedAnswer?.revision ?? 0,
    applied: Boolean(updated),
  };
};

const isDuplicateKey = (error: unknown) =>
  Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000,
  );

type ClaimedAssessment = {
  assessment: IAssessment;
  attemptId: string;
  isNew: boolean;
};

const claimGeneration = async (
  userId: string,
  request: CreateAssessmentRequest,
  source: ResolvedSource,
  normalizedHash: string,
  idempotencyKey: string,
): Promise<ClaimedAssessment | { ready: AssessmentOverviewDto }> => {
  const now = new Date();
  const attemptId = randomUUID();
  try {
    const assessment = await Assessment.create({
      userId,
      conversationId: request.conversationId,
      sourceType: source.sourceType,
      ...(source.sourceType === "video"
        ? { videoId: source.sourceId }
        : { pdfDocumentId: source.sourceId }),
      goal: request.goal,
      ...(request.customGoal ? { customGoal: request.customGoal.trim() } : {}),
      depth: request.depth,
      idempotencyKey,
      requestHash: normalizedHash,
      status: "generating",
      generationStartedAt: now,
      generationAttemptId: attemptId,
      questions: [],
    });
    return { assessment, attemptId, isNew: true };
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }

  const existing = await Assessment.findOne({ userId, idempotencyKey });
  if (!existing)
    throw new ApiError(
      503,
      "Unable to reserve assessment request",
      [],
      "",
      "ASSESSMENT_RESERVATION_FAILED",
    );
  if (existing.requestHash !== normalizedHash) {
    throw new ApiError(
      409,
      "This idempotency key was already used for different assessment options",
      [],
      "",
      "IDEMPOTENCY_KEY_CONFLICT",
    );
  }
  if (existing.status === "ready") {
    return { ready: await toOverviewDto(existing, source.title) };
  }

  const staleBefore = new Date(Date.now() - STALE_GENERATION_MS);
  const claimableStatus =
    existing.status === "generation_failed" ||
    (existing.status === "generating" &&
      existing.generationStartedAt &&
      existing.generationStartedAt < staleBefore);
  if (!claimableStatus) {
    throw new ApiError(
      409,
      "Assessment generation is already in progress",
      [],
      "",
      "ASSESSMENT_GENERATING",
    );
  }

  const priorStatus = existing.status;
  const filter: Record<string, unknown> = {
    _id: existing._id,
    userId,
    requestHash: normalizedHash,
    status: priorStatus,
  };
  if (priorStatus === "generating") {
    filter.generationStartedAt = existing.generationStartedAt;
  }
  const claimed = await Assessment.findOneAndUpdate(
    filter,
    {
      $set: {
        status: "generating",
        generationStartedAt: now,
        generationAttemptId: attemptId,
      },
    },
    { new: true },
  );
  if (!claimed) {
    throw new ApiError(
      409,
      "Assessment generation is already in progress",
      [],
      "",
      "ASSESSMENT_GENERATING",
    );
  }
  return { assessment: claimed, attemptId, isNew: false };
};

export const createAssessment = async (
  userId: string,
  request: CreateAssessmentRequest,
  idempotencyKey: string,
  responseLanguage: ResponseLanguage = "en",
) => {
  const normalizedHash = requestHash(request);
  const existing = await Assessment.findOne({ userId, idempotencyKey });
  if (existing && existing.requestHash !== normalizedHash) {
    throw new ApiError(
      409,
      "This idempotency key was already used for different assessment options",
      [],
      "",
      "IDEMPOTENCY_KEY_CONFLICT",
    );
  }

  const source = await resolveOwnedSource(userId, request);
  if (existing?.status === "ready") {
    return {
      overview: await toOverviewDto(existing, source.title),
      replay: true,
    };
  }
  if (
    existing?.status === "generating" &&
    existing.generationStartedAt &&
    existing.generationStartedAt.getTime() > Date.now() - STALE_GENERATION_MS
  ) {
    throw new ApiError(
      409,
      "Assessment generation is already in progress",
      [],
      "",
      "ASSESSMENT_GENERATING",
    );
  }
  assertSourceReady(source);
  await assertUsableContent(source);
  const claim = await claimGeneration(
    userId,
    request,
    source,
    normalizedHash,
    idempotencyKey,
  );
  if ("ready" in claim) return { overview: claim.ready, replay: true };

  try {
    const questions = await generateAssessmentQuestions({
      sourceType: source.sourceType,
      sourceId: source.sourceId.toString(),
      goal: request.goal,
      ...(request.customGoal ? { customGoal: request.customGoal.trim() } : {}),
      depth: request.depth,
      responseLanguage,
    });
    const completed = await Assessment.findOneAndUpdate(
      {
        _id: claim.assessment._id,
        userId,
        status: "generating",
        generationAttemptId: claim.attemptId,
      },
      { $set: { questions, status: "ready" } },
      { new: true, runValidators: true },
    );
    if (!completed) {
      throw new ApiError(
        409,
        "Assessment generation attempt was superseded",
        [],
        "",
        "ASSESSMENT_ATTEMPT_SUPERSEDED",
      );
    }
    return {
      overview: await toOverviewDto(completed, source.title),
      replay: false,
    };
  } catch (error) {
    await Assessment.updateOne(
      {
        _id: claim.assessment._id,
        userId,
        status: "generating",
        generationAttemptId: claim.attemptId,
      },
      { $set: { status: "generation_failed" } },
    );
    logger.error(
      {
        err: error,
        assessmentId: claim.assessment._id,
        userId,
        stage: "assessment_generation",
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : typeof error,
      },
      "[Assessment] Generation failed during creation attempt",
    );
    if (error instanceof ApiError) throw error;
    if (error instanceof AssessmentContentError) {
      throw new ApiError(422, error.message, [], "", "SOURCE_NOT_ASSESSABLE");
    }
    throw new ApiError(
      503,
      "Assessment generation failed. You can retry this request.",
      [],
      error instanceof Error ? (error.stack ?? "") : "",
      "ASSESSMENT_GENERATION_FAILED",
    );
  }
};

export const getAssessmentOverview = async (
  userId: string,
  assessmentId: string,
) => {
  if (!mongoose.isValidObjectId(assessmentId)) {
    throw new ApiError(
      400,
      "Invalid assessment ID",
      [],
      "",
      "INVALID_ASSESSMENT_ID",
    );
  }
  const assessment = await Assessment.findOne({ _id: assessmentId, userId });
  if (!assessment) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }
  const title = await getCurrentSourceTitle(assessment);
  if (!title) {
    throw new ApiError(
      404,
      "Assessment source is no longer available",
      [],
      "",
      "SOURCE_UNAVAILABLE",
    );
  }
  return toOverviewDto(assessment, title);
};

const toPublicResultsDto = (
  assessment: IAssessment,
  source: {
    type: AssessmentSourceType;
    title: string;
    youtubeVideoId?: string;
  },
): AssessmentResultsDto => {
  const totalQuestions = assessment.questions.length;
  let answeredCount = 0;
  let unansweredCount = 0;
  let strongCount = 0;
  let partiallyCorrectCount = 0;
  let needsWorkCount = 0;

  const publicQuestions: PublicQuestionResultDto[] = assessment.questions.map(
    (q) => {
      const userAns = q.submittedAnswer?.value?.trim() ?? "";
      if (userAns) answeredCount++;
      else unansweredCount++;

      const outcome =
        q.evaluation?.outcome ?? (userAns ? "partially_correct" : "unanswered");
      if (outcome === "strong") strongCount++;
      else if (outcome === "partially_correct") partiallyCorrectCount++;
      else if (outcome === "needs_work") needsWorkCount++;

      return {
        questionId: q._id?.toString() ?? "",
        position: q.position,
        prompt: q.prompt,
        questionType: q.questionType,
        responseFormat: q.responseFormat,
        topic: q.topic,
        userAnswer: q.submittedAnswer?.value ?? "",
        outcome,
        feedback: q.evaluation?.feedback ?? "",
        expectedConcept: q.evaluation?.keyTakeaway ?? q.answerKey.expectedAnswer,
        sourceEvidence: q.sourceEvidence.map((ev) => ({
          page: ev.page,
          startSeconds: ev.startSeconds,
          endSeconds: ev.endSeconds,
        })),
      };
    },
  );

  return {
    assessmentId: assessment._id.toString(),
    conversationId: assessment.conversationId.toString(),
    status: assessment.status as
      | "evaluating"
      | "evaluated"
      | "evaluation_failed",
    submittedAt: assessment.submittedAt?.toISOString(),
    source,
    goal: assessment.goal,
    ...(assessment.customGoal ? { customGoal: assessment.customGoal } : {}),
    depth: assessment.depth,
    stats: {
      totalQuestions,
      answeredCount,
      unansweredCount,
      strongCount,
      partiallyCorrectCount,
      needsWorkCount,
    },
    summary: assessment.result?.summary,
    strengths: (assessment.result?.strengths ?? []).map((s) => ({
      topic: s.topic,
      reason: s.reason,
      sourceEvidence: s.sourceEvidence.map((ev) => ({
        page: ev.page,
        startSeconds: ev.startSeconds,
        endSeconds: ev.endSeconds,
      })),
    })),
    areasToImprove: (assessment.result?.areasToImprove ?? []).map((a) => ({
      topic: a.topic,
      missingOrMisunderstood: a.missingOrMisunderstood,
      whatToRemember: a.whatToRemember,
      sourceEvidence: a.sourceEvidence.map((ev) => ({
        page: ev.page,
        startSeconds: ev.startSeconds,
        endSeconds: ev.endSeconds,
      })),
    })),
    questions: publicQuestions,
    nextSteps: assessment.result?.nextSteps,
  };
};

const runEvaluationLifecycle = async (
  assessment: IAssessment,
  attemptId: string,
  sourceDetails: {
    type: AssessmentSourceType;
    title: string;
    youtubeVideoId?: string;
  },
): Promise<AssessmentResultsDto> => {
  try {
    const { evaluatedQuestions, result } =
      await evaluateAssessmentAnswers(assessment);

    for (const q of assessment.questions) {
      const qId = q._id?.toString() ?? "";
      const evalData = evaluatedQuestions.get(qId);
      if (evalData) {
        q.evaluation = {
          outcome: evalData.outcome,
          feedback: evalData.feedback,
          keyTakeaway: evalData.keyTakeaway,
        };
      }
    }

    const completed = await Assessment.findOneAndUpdate(
      {
        _id: assessment._id,
        evaluationAttemptId: attemptId,
        status: "evaluating",
      },
      {
        $set: {
          questions: assessment.questions,
          result,
          status: "evaluated",
        },
      },
      { new: true },
    );

    if (!completed) {
      throw new ApiError(
        409,
        "Evaluation attempt was superseded",
        [],
        "",
        "ASSESSMENT_ATTEMPT_SUPERSEDED",
      );
    }

    return toPublicResultsDto(completed, sourceDetails);
  } catch (error) {
    await Assessment.updateOne(
      {
        _id: assessment._id,
        evaluationAttemptId: attemptId,
        status: "evaluating",
      },
      { $set: { status: "evaluation_failed" } },
    );

    logger.error(
      {
        err: error,
        assessmentId: assessment._id,
        userId: assessment.userId,
        stage: "assessment_evaluation",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      "[Assessment] Evaluation failed",
    );

    if (error instanceof ApiError) throw error;
    throw new ApiError(
      503,
      "Assessment evaluation failed. You can retry this evaluation.",
      [],
      error instanceof Error ? (error.stack ?? "") : "",
      "ASSESSMENT_EVALUATION_FAILED",
    );
  }
};

export const submitAssessment = async (
  userId: string,
  assessmentId: string,
  conversationId: string,
): Promise<AssessmentResultsDto> => {
  if (
    !mongoose.isValidObjectId(assessmentId) ||
    !mongoose.isValidObjectId(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid assessment or conversation ID",
      [],
      "",
      "INVALID_REQUEST",
    );
  }

  const assessment = await Assessment.findOne({ _id: assessmentId, userId });
  if (!assessment) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }

  await assertAssessmentSourceContext(assessment, userId, conversationId);
  const sourceDetails = await getCurrentSourceDetails(assessment);
  if (!sourceDetails) {
    throw new ApiError(
      404,
      "Assessment source is unavailable",
      [],
      "",
      "SOURCE_UNAVAILABLE",
    );
  }

  if (assessment.status === "evaluated") {
    return toPublicResultsDto(assessment, sourceDetails);
  }

  const staleThreshold = new Date(Date.now() - 2 * 60 * 1000);
  if (
    assessment.status === "evaluating" &&
    assessment.evaluationStartedAt &&
    assessment.evaluationStartedAt > staleThreshold
  ) {
    return toPublicResultsDto(assessment, sourceDetails);
  }

  const attemptId = randomUUID();
  const claimed = await Assessment.findOneAndUpdate(
    {
      _id: assessment._id,
      userId,
      conversationId,
      status: {
        $in: ["in_progress", "ready", "evaluating", "evaluation_failed"],
      },
    },
    {
      $set: {
        status: "evaluating",
        submittedAt: assessment.submittedAt ?? new Date(),
        evaluationStartedAt: new Date(),
        evaluationAttemptId: attemptId,
      },
    },
    { new: true },
  );

  if (!claimed) {
    throw new ApiError(
      409,
      "Assessment is not in a submittable state",
      [],
      "",
      "INVALID_ASSESSMENT_STATE",
    );
  }

  return runEvaluationLifecycle(claimed, attemptId, sourceDetails);
};

export const retryAssessmentEvaluation = async (
  userId: string,
  assessmentId: string,
  conversationId: string,
): Promise<AssessmentResultsDto> => {
  return submitAssessment(userId, assessmentId, conversationId);
};

export const getAssessmentResults = async (
  userId: string,
  assessmentId: string,
  conversationId: string,
): Promise<AssessmentResultsDto> => {
  if (
    !mongoose.isValidObjectId(assessmentId) ||
    !mongoose.isValidObjectId(conversationId)
  ) {
    throw new ApiError(
      400,
      "Invalid assessment or conversation ID",
      [],
      "",
      "INVALID_REQUEST",
    );
  }

  const assessment = await Assessment.findOne({ _id: assessmentId, userId });
  if (!assessment) {
    throw new ApiError(
      404,
      "Assessment not found",
      [],
      "",
      "ASSESSMENT_NOT_FOUND",
    );
  }

  await assertAssessmentSourceContext(assessment, userId, conversationId);
  const sourceDetails = await getCurrentSourceDetails(assessment);
  if (!sourceDetails) {
    throw new ApiError(
      404,
      "Assessment source is unavailable",
      [],
      "",
      "SOURCE_UNAVAILABLE",
    );
  }

  if (assessment.status === "ready" || assessment.status === "in_progress") {
    throw new ApiError(
      409,
      "Assessment has not been submitted yet",
      [],
      "",
      "ASSESSMENT_NOT_SUBMITTED",
    );
  }

  return toPublicResultsDto(assessment, sourceDetails);
};
