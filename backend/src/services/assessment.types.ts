export type AssessmentSourceType = "video" | "pdf";

export type AssessmentEvaluationOutcome =
  | "strong"
  | "partially_correct"
  | "needs_work"
  | "unanswered";

export interface AssessmentOverviewDto {
  assessmentId: string;
  status:
    | "generating"
    | "ready"
    | "generation_failed"
    | "in_progress"
    | "evaluating"
    | "evaluated"
    | "evaluation_failed";
  conversationId: string;
  source: {
    type: AssessmentSourceType;
    title: string;
  };
  goal:
    | "understand_deeply"
    | "exam_certification"
    | "interview_preparation"
    | "practical_application"
    | "refresh_knowledge"
    | "custom";
  customGoal?: string | undefined;
  depth: "quick" | "standard" | "deep";
  questionCount: number;
  topics: string[];
}

export interface PublicAssessmentQuestionDto {
  questionId: string;
  position: number;
  prompt: string;
  questionType: string;
  responseFormat: string;
  options: Array<{ optionId: string; text: string }>;
  topic: string;
  savedAnswer?: string | undefined;
  answerRevision: number;
}

export interface PublicAssessmentSessionDto {
  assessmentId: string;
  conversationId: string;
  status:
    | "in_progress"
    | "evaluating"
    | "evaluated"
    | "evaluation_failed";
  source: {
    type: AssessmentSourceType;
    title: string;
    youtubeVideoId?: string | undefined;
  };
  startedAt: string;
  submittedAt?: string | undefined;
  questionCount: number;
  questions: PublicAssessmentQuestionDto[];
}

export interface PublicAnswerSaveDto {
  questionId: string;
  answer: string;
  answerRevision: number;
  applied: boolean;
}

export interface PublicEvidenceDto {
  page?: number | undefined;
  startSeconds?: number | undefined;
  endSeconds?: number | undefined;
}

export interface PublicQuestionResultDto {
  questionId: string;
  position: number;
  prompt: string;
  questionType: string;
  responseFormat: string;
  topic: string;
  userAnswer: string;
  outcome: AssessmentEvaluationOutcome;
  feedback: string;
  expectedConcept?: string | undefined;
  sourceEvidence: PublicEvidenceDto[];
}

export interface PublicStrengthDto {
  topic: string;
  reason: string;
  sourceEvidence: PublicEvidenceDto[];
}

export interface PublicAreaToImproveDto {
  topic: string;
  missingOrMisunderstood: string;
  whatToRemember: string;
  sourceEvidence: PublicEvidenceDto[];
}

export interface AssessmentResultsDto {
  assessmentId: string;
  conversationId: string;
  status: "evaluating" | "evaluated" | "evaluation_failed";
  submittedAt?: string | undefined;
  source: {
    type: AssessmentSourceType;
    title: string;
    youtubeVideoId?: string | undefined;
  };
  goal:
    | "understand_deeply"
    | "exam_certification"
    | "interview_preparation"
    | "practical_application"
    | "refresh_knowledge"
    | "custom";
  customGoal?: string | undefined;
  depth: "quick" | "standard" | "deep";
  stats: {
    totalQuestions: number;
    answeredCount: number;
    unansweredCount: number;
    strongCount: number;
    partiallyCorrectCount: number;
    needsWorkCount: number;
  };
  summary?: string | undefined;
  strengths: PublicStrengthDto[];
  areasToImprove: PublicAreaToImproveDto[];
  questions: PublicQuestionResultDto[];
  nextSteps?: {
    focusTopics: string[];
    recommendation: string;
  } | undefined;
}