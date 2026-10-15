import mongoose, { Document, Schema, Types } from "mongoose";

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
export type AssessmentQuestionType =
  | "recall"
  | "explain"
  | "connect"
  | "compare"
  | "apply"
  | "reason"
  | "analyze"
  | "solve"
  | "interpret";
export type AssessmentResponseFormat =
  | "multiple_choice"
  | "short_answer"
  | "extended_response";

export interface AssessmentOption {
  optionId: string;
  text: string;
}

export interface AssessmentSourceEvidence {
  chunkId: Types.ObjectId;
  page?: number;
  startSeconds?: number;
  endSeconds?: number;
}

export interface AssessmentQuestion {
  _id?: Types.ObjectId;
  position: number;
  prompt: string;
  questionType: AssessmentQuestionType;
  responseFormat: AssessmentResponseFormat;
  options: AssessmentOption[];
  topic: string;
  sourceEvidence: AssessmentSourceEvidence[];
  answerKey: {
    expectedAnswer: string;
    acceptedAnswers: string[];
    correctOptionId?: string;
  };
  evaluationRubric: string[];
  submittedAnswer?: {
    value: string;
    savedAt: Date;
    revision: number;
  };
  evaluation?: {
    outcome: AssessmentEvaluationOutcome;
    feedback: string;
    keyTakeaway?: string;
  };
}

export interface IAssessmentStrength {
  topic: string;
  reason: string;
  sourceEvidence: AssessmentSourceEvidence[];
}

export interface IAssessmentAreaToImprove {
  topic: string;
  missingOrMisunderstood: string;
  whatToRemember: string;
  sourceEvidence: AssessmentSourceEvidence[];
}

export interface IAssessmentResult {
  summary: string;
  strengths: IAssessmentStrength[];
  areasToImprove: IAssessmentAreaToImprove[];
  nextSteps: {
    focusTopics: string[];
    recommendation: string;
  };
  evaluatedAt: Date;
}

export interface IAssessment extends Document {
  userId: Types.ObjectId;
  conversationId: Types.ObjectId;
  sourceType: "video" | "pdf";
  videoId?: Types.ObjectId;
  pdfDocumentId?: Types.ObjectId;
  goal: AssessmentGoal;
  customGoal?: string;
  depth: AssessmentDepth;
  idempotencyKey: string;
  requestHash: string;
  status: AssessmentStatus;
  startedAt?: Date;
  submittedAt?: Date;
  generationStartedAt?: Date;
  generationAttemptId?: string;
  evaluationStartedAt?: Date;
  evaluationAttemptId?: string;
  questions: AssessmentQuestion[];
  result?: IAssessmentResult;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<AssessmentOption>(
  {
    optionId: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const sourceEvidenceSchema = new Schema<AssessmentSourceEvidence>(
  {
    chunkId: { type: Schema.Types.ObjectId, required: true },
    page: { type: Number, min: 1 },
    startSeconds: { type: Number, min: 0 },
    endSeconds: { type: Number, min: 0 },
  },
  { _id: false },
);

const questionSchema = new Schema<AssessmentQuestion>(
  {
    position: { type: Number, required: true, min: 0 },
    prompt: { type: String, required: true, trim: true, maxlength: 3000 },
    questionType: {
      type: String,
      enum: ["recall", "explain", "connect", "compare", "apply", "reason", "analyze", "solve", "interpret"],
      required: true,
    },
    responseFormat: {
      type: String,
      enum: ["multiple_choice", "short_answer", "extended_response"],
      required: true,
    },
    options: { type: [optionSchema], required: true, default: [] },
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    sourceEvidence: { type: [sourceEvidenceSchema], required: true },
    answerKey: {
      expectedAnswer: { type: String, required: true, trim: true, maxlength: 4000 },
      acceptedAnswers: { type: [String], required: true, default: [] },
      correctOptionId: { type: String, required: false },
    },
    evaluationRubric: {
      type: [{ type: String, trim: true, required: true }],
      required: true,
    },
    submittedAnswer: {
      value: { type: String, maxlength: 10000, required: false, default: "" },
      savedAt: { type: Date },
      revision: { type: Number, min: 1 },
    },
    evaluation: {
      outcome: {
        type: String,
        enum: ["strong", "partially_correct", "needs_work", "unanswered"],
        required: false,
      },
      feedback: { type: String, maxlength: 2000, required: false },
      keyTakeaway: { type: String, maxlength: 2000, required: false },
    },
  },
  { timestamps: false },
);

const strengthSchema = new Schema<IAssessmentStrength>(
  {
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    reason: { type: String, required: true, trim: true, maxlength: 2000 },
    sourceEvidence: { type: [sourceEvidenceSchema], required: true, default: [] },
  },
  { _id: false },
);

const areaToImproveSchema = new Schema<IAssessmentAreaToImprove>(
  {
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    missingOrMisunderstood: { type: String, required: true, trim: true, maxlength: 2000 },
    whatToRemember: { type: String, required: true, trim: true, maxlength: 2000 },
    sourceEvidence: { type: [sourceEvidenceSchema], required: true, default: [] },
  },
  { _id: false },
);

const resultSchema = new Schema<IAssessmentResult>(
  {
    summary: { type: String, required: true, trim: true, maxlength: 3000 },
    strengths: { type: [strengthSchema], required: true, default: [] },
    areasToImprove: { type: [areaToImproveSchema], required: true, default: [] },
    nextSteps: {
      focusTopics: { type: [String], required: true, default: [] },
      recommendation: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    evaluatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const assessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sourceType: { type: String, enum: ["video", "pdf"], required: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: false },
    pdfDocumentId: { type: Schema.Types.ObjectId, ref: "PdfDocument", required: false },
    goal: {
      type: String,
      enum: ["understand_deeply", "exam_certification", "interview_preparation", "practical_application", "refresh_knowledge", "custom"],
      required: true,
    },
    customGoal: { type: String, trim: true, minlength: 3, maxlength: 300 },
    depth: { type: String, enum: ["quick", "standard", "deep"], required: true },
    idempotencyKey: { type: String, required: true },
    requestHash: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "generating",
        "ready",
        "generation_failed",
        "in_progress",
        "evaluating",
        "evaluated",
        "evaluation_failed",
      ],
      required: true,
      default: "generating",
    },
    startedAt: { type: Date, required: false },
    submittedAt: { type: Date, required: false },
    generationStartedAt: { type: Date, required: false },
    generationAttemptId: { type: String, required: false },
    evaluationStartedAt: { type: Date, required: false },
    evaluationAttemptId: { type: String, required: false },
    questions: { type: [questionSchema], required: true, default: [] },
    result: { type: resultSchema, required: false },
  },
  { timestamps: true },
);

assessmentSchema.pre("validate", function () {
  const hasVideoId = Boolean(this.videoId);
  const hasPdfDocumentId = Boolean(this.pdfDocumentId);

  if (this.sourceType === "video" && (!hasVideoId || hasPdfDocumentId)) {
    this.invalidate("videoId", "Video assessments require only videoId.");
  }
  if (this.sourceType === "pdf" && (!hasPdfDocumentId || hasVideoId)) {
    this.invalidate("pdfDocumentId", "PDF assessments require only pdfDocumentId.");
  }
  if (this.goal === "custom" && !this.customGoal?.trim()) {
    this.invalidate("customGoal", "Custom assessments require a custom goal.");
  }
  if (this.goal !== "custom" && this.customGoal) {
    this.invalidate("customGoal", "customGoal is only valid for the custom goal.");
  }
});

assessmentSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
assessmentSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });

export const Assessment = mongoose.model<IAssessment>("Assessment", assessmentSchema);