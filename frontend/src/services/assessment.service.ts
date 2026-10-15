import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types";

export type AssessmentGoal =
  | "understand_deeply"
  | "exam_certification"
  | "interview_preparation"
  | "practical_application"
  | "refresh_knowledge"
  | "custom";

export type AssessmentDepth = "quick" | "standard" | "deep";
export type AssessmentStatus =
  | "generating"
  | "ready"
  | "generation_failed"
  | "in_progress"
  | "evaluating"
  | "evaluated"
  | "evaluation_failed";

export type AssessmentEvaluationOutcome =
  | "strong"
  | "partially_correct"
  | "needs_work"
  | "unanswered";

export interface AssessmentOverview {
  assessmentId: string;
  status: AssessmentStatus;
  conversationId: string;
  source: {
    type: "video" | "pdf";
    title: string;
  };
  goal: AssessmentGoal;
  customGoal?: string;
  depth: AssessmentDepth;
  questionCount: number;
  topics: string[];
}

export interface CreateAssessmentPayload {
  conversationId: string;
  goal: AssessmentGoal;
  customGoal?: string;
  depth: AssessmentDepth;
}

export interface PublicAssessmentQuestion {
  questionId: string;
  position: number;
  prompt: string;
  questionType: string;
  responseFormat: "multiple_choice" | "short_answer" | "extended_response";
  options: Array<{ optionId: string; text: string }>;
  topic: string;
  savedAnswer?: string;
  answerRevision: number;
}

export interface AssessmentSession {
  assessmentId: string;
  conversationId: string;
  status: AssessmentStatus;
  source: {
    type: "video" | "pdf";
    title: string;
    youtubeVideoId?: string;
  };
  startedAt: string;
  submittedAt?: string;
  questionCount: number;
  questions: PublicAssessmentQuestion[];
}

export interface SaveAnswerResult {
  questionId: string;
  answer: string;
  answerRevision: number;
  applied: boolean;
}

export interface PublicEvidence {
  page?: number;
  startSeconds?: number;
  endSeconds?: number;
}

export interface QuestionResult {
  questionId: string;
  position: number;
  prompt: string;
  questionType: string;
  responseFormat: "multiple_choice" | "short_answer" | "extended_response";
  topic: string;
  userAnswer: string;
  outcome: AssessmentEvaluationOutcome;
  feedback: string;
  expectedConcept?: string;
  sourceEvidence: PublicEvidence[];
}

export interface TopicStrength {
  topic: string;
  reason: string;
  sourceEvidence: PublicEvidence[];
}

export interface TopicAreaToImprove {
  topic: string;
  missingOrMisunderstood: string;
  whatToRemember: string;
  sourceEvidence: PublicEvidence[];
}

export interface AssessmentResults {
  assessmentId: string;
  conversationId: string;
  status: "evaluating" | "evaluated" | "evaluation_failed";
  submittedAt?: string;
  source: {
    type: "video" | "pdf";
    title: string;
    youtubeVideoId?: string;
  };
  goal: AssessmentGoal;
  customGoal?: string;
  depth: AssessmentDepth;
  stats: {
    totalQuestions: number;
    answeredCount: number;
    unansweredCount: number;
    strongCount: number;
    partiallyCorrectCount: number;
    needsWorkCount: number;
  };
  summary?: string;
  strengths: TopicStrength[];
  areasToImprove: TopicAreaToImprove[];
  questions: QuestionResult[];
  nextSteps?: {
    focusTopics: string[];
    recommendation: string;
  };
}

export const assessmentService = {
  create: async (
    payload: CreateAssessmentPayload,
    idempotencyKey: string,
  ): Promise<AssessmentOverview> => {
    const response = await axiosInstance.post<ApiResponse<AssessmentOverview>>(
      "/api/v1/assessments",
      payload,
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return response.data.data;
  },

  getOverview: async (assessmentId: string): Promise<AssessmentOverview> => {
    const response = await axiosInstance.get<ApiResponse<AssessmentOverview>>(
      `/api/v1/assessments/${assessmentId}`,
    );
    return response.data.data;
  },

  start: async (assessmentId: string, conversationId: string): Promise<AssessmentSession> => {
    const response = await axiosInstance.post<ApiResponse<AssessmentSession>>(
      `/api/v1/assessments/${assessmentId}/start`,
      { conversationId },
    );
    return response.data.data;
  },

  getSession: async (assessmentId: string, conversationId: string): Promise<AssessmentSession> => {
    const response = await axiosInstance.get<ApiResponse<AssessmentSession>>(
      `/api/v1/assessments/${assessmentId}/session`,
      { params: { conversationId } },
    );
    return response.data.data;
  },

  saveAnswer: async (
    assessmentId: string,
    questionId: string,
    conversationId: string,
    answer: string,
    revision: number,
  ): Promise<SaveAnswerResult> => {
    const response = await axiosInstance.put<ApiResponse<SaveAnswerResult>>(
      `/api/v1/assessments/${assessmentId}/questions/${questionId}/answer`,
      { conversationId, answer, revision },
    );
    return response.data.data;
  },

  submit: async (assessmentId: string, conversationId: string): Promise<AssessmentResults> => {
    const response = await axiosInstance.post<ApiResponse<AssessmentResults>>(
      `/api/v1/assessments/${assessmentId}/submit`,
      { conversationId },
    );
    return response.data.data;
  },

  retryEvaluation: async (
    assessmentId: string,
    conversationId: string,
  ): Promise<AssessmentResults> => {
    const response = await axiosInstance.post<ApiResponse<AssessmentResults>>(
      `/api/v1/assessments/${assessmentId}/retry-evaluation`,
      { conversationId },
    );
    return response.data.data;
  },

  getResults: async (assessmentId: string, conversationId: string): Promise<AssessmentResults> => {
    const response = await axiosInstance.get<ApiResponse<AssessmentResults>>(
      `/api/v1/assessments/${assessmentId}/results`,
      { params: { conversationId } },
    );
    return response.data.data;
  },
};
