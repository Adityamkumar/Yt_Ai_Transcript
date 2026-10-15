import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import {
  assessmentService,
  type AssessmentResults,
  type QuestionResult,
} from "@/services/assessment.service";
import { CitationChip } from "@/components/chat/CitationChip";
import { TimestampBadge } from "@/components/timestamps/TimestampBadge";
import { renderPromptWithCode, renderAnswerWithCode } from "@/components/assessment/PromptRenderer";

const goalDisplayLabels: Record<string, string> = {
  understand_deeply: "Understand the material deeply",
  exam_certification: "Prepare for an exam or certification",
  interview_preparation: "Prepare for an interview",
  practical_application: "Apply knowledge in practice",
  refresh_knowledge: "Refresh my knowledge",
  custom: "Custom goal",
};

export default function AssessmentResultsPage() {
  const { conversationId, assessmentId } = useParams<{
    conversationId: string;
    assessmentId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());

  const resultsQueryKey = ["assessment-results", assessmentId, conversationId];

  const resultsQuery = useQuery({
    queryKey: resultsQueryKey,
    queryFn: () => assessmentService.getResults(assessmentId!, conversationId!),
    enabled: Boolean(assessmentId && conversationId),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "evaluating" ? 2500 : false;
    },
    retry: 1,
  });

  const retryMutation = useMutation({
    mutationFn: () => assessmentService.retryEvaluation(assessmentId!, conversationId!),
    onSuccess: (data) => {
      queryClient.setQueryData(resultsQueryKey, data);
    },
  });

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const renderHeader = (results?: AssessmentResults, badgeText = "Assessment complete") => (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] py-4 sm:py-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <LumoraLogo size="sm" />
        {results && (
          <>
            <span className="hidden h-7 w-px bg-[var(--border-soft)] sm:block" aria-hidden="true" />
            <div className="hidden min-w-0 sm:block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
                LUMORA · YOUR RESULTS
              </span>
              <span className="block max-w-md truncate text-xs text-[var(--text-secondary)]">
                {results.source.type === "video" ? "VIDEO" : "PDF"} · {results.source.title}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {badgeText}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/workspace/${conversationId}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-medium)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={14} />
          Back to conversation
        </button>
      </div>
    </header>
  );

  // Render citation helper
  const renderEvidenceChips = (
    sourceType: "video" | "pdf",
    youtubeVideoId: string | undefined,
    evidenceList: Array<{ page?: number; startSeconds?: number }>,
  ) => {
    if (!evidenceList || evidenceList.length === 0) return null;
    return (
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-[var(--text-muted)]">Source evidence:</span>
        {evidenceList.map((ev, i) => {
          if (sourceType === "pdf" && typeof ev.page === "number") {
            return <CitationChip key={i} page={ev.page} />;
          }
          if (sourceType === "video" && typeof ev.startSeconds === "number" && youtubeVideoId) {
            return <TimestampBadge key={i} videoId={youtubeVideoId} seconds={ev.startSeconds} />;
          }
          return null;
        })}
      </div>
    );
  };

  // Loading or Evaluating State
  if (
    resultsQuery.isLoading ||
    resultsQuery.data?.status === "evaluating" ||
    retryMutation.isPending
  ) {
    const isRetrying = retryMutation.isPending;
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 sm:px-7">
          {renderHeader(resultsQuery.data, "Assessment submitted")}

          <main className="flex flex-1 items-center justify-center py-12">
            <section
              className="relative w-full max-w-xl rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-xl sm:p-10"
              aria-live="polite"
            >
              {/* Violet ambient glow */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(157,165,255,0.18)_0%,transparent_70%)] blur-2xl"
                aria-hidden="true"
              />

              {/* Status pill badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Assessment submitted
                </span>
              </div>

              {/* Icon visual */}
              <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[rgba(157,165,255,0.3)] bg-[radial-gradient(100%_100%_at_50%_0%,rgba(157,165,255,0.22)_0%,rgba(124,92,255,0.06)_100%)] text-[var(--accent-strong)] shadow-[0_8px_24px_rgba(93,72,220,0.2)]">
                <Brain size={38} className="animate-pulse" />
              </div>

              {/* Title & subtitle */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  Your answers are in.
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Lumora is looking beyond right and wrong to understand how you think.
                </p>
              </div>

              {/* Evaluation stages list */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3.5 rounded-xl border border-[rgba(157,165,255,0.2)] bg-[rgba(157,165,255,0.06)] p-3.5 sm:p-4">
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[rgba(157,165,255,0.15)] text-[var(--accent-strong)]">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Evaluating your responses
                    </h2>
                    <p className="text-xs leading-5 text-[var(--text-secondary)]">
                      Checking answers against each question's criteria and rubric
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-3.5 sm:p-4 opacity-80">
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)]">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Connecting answers to your source
                    </h2>
                    <p className="text-xs leading-5 text-[var(--text-secondary)]">
                      Using the original material to ground insights and citations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-3.5 sm:p-4 opacity-80">
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)]">
                    <Brain size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Identifying strengths and gaps
                    </h2>
                    <p className="text-xs leading-5 text-[var(--text-secondary)]">
                      Finding concepts you've grasped and areas needing work
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-3.5 sm:p-4 opacity-80">
                  <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      Preparing your learning guidance
                    </h2>
                    <p className="text-xs leading-5 text-[var(--text-secondary)]">
                      Turning the findings into actionable next steps
                    </p>
                  </div>
                </div>
              </div>

              {/* Reassuring footer banner */}
              <div className="mt-7 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-4 py-3 text-center text-xs text-[var(--text-muted)]">
                {isRetrying
                  ? "Retrying evaluation with your saved answers…"
                  : "Please keep this assessment open while your results are being prepared. Your submitted answers are saved."}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // Evaluation Failed State
  if (resultsQuery.isError || resultsQuery.data?.status === "evaluation_failed") {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 sm:px-7">
          {renderHeader(resultsQuery.data, "Evaluation needed")}

          <main className="flex flex-1 items-center justify-center py-16">
            <section className="w-full max-w-md rounded-2xl border border-rose-500/25 bg-[var(--surface-1)] p-6 text-center shadow-xl sm:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                <AlertCircle size={28} />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Evaluation took longer than expected
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Your submitted answers are safely saved. We encountered a temporary delay analyzing
                your responses against the source.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => retryMutation.mutate()}
                  disabled={retryMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <RefreshCw
                    size={16}
                    className={retryMutation.isPending ? "animate-spin" : undefined}
                  />
                  Retry evaluation
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/workspace/${conversationId}`)}
                  className="rounded-lg border border-[var(--border-medium)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  Back to chat
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const results = resultsQuery.data;
  if (!results) return null;

  const { stats, strengths, areasToImprove, questions, source, nextSteps } = results;
  const goalLabel =
    results.goal === "custom"
      ? results.customGoal || "Custom goal"
      : goalDisplayLabels[results.goal] || results.goal;

  const getOutcomeBadge = (outcome: QuestionResult["outcome"]) => {
    switch (outcome) {
      case "strong":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={12} />
            Strong
          </span>
        );
      case "partially_correct":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
            Partially correct
          </span>
        );
      case "needs_work":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            Needs work
          </span>
        );
      case "unanswered":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            Unanswered
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-16 sm:px-7">
        {renderHeader(results)}

        <main className="mt-8 space-y-9">
          {/* Section A: Hero Overview */}
          <section aria-labelledby="results-overview-heading">
            <h1
              id="results-overview-heading"
              className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
            >
              Here’s what you understood.
            </h1>
            <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
              {results.summary ||
                "Here is an overview of your demonstrated understanding based on your answers and the source material."}
            </p>

            {/* Learning Goal Card */}
            <div className="mt-5 rounded-2xl border border-[rgba(157,165,255,0.2)] bg-[radial-gradient(100%_100%_at_50%_0%,rgba(157,165,255,0.1)_0%,rgba(124,92,255,0.03)_100%)] p-5 backdrop-blur-sm sm:p-6">
              <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">
                YOUR LEARNING GOAL
              </span>
              <h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {goalLabel}
              </h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Your feedback is grounded in this assessment and its original source material.
              </p>
            </div>

            {/* Metric Cards Row */}
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-5">
                <span className="block text-2xl font-bold text-[var(--text-primary)]">
                  {stats.answeredCount}/{stats.totalQuestions}
                </span>
                <span className="mt-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Answered questions
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-500/25 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(52,211,153,0.12)_0%,rgba(16,185,129,0.02)_100%)] p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span className="text-2xl font-bold text-emerald-400">{strengths.length}</span>
                </div>
                <span className="mt-1 block text-xs font-semibold text-emerald-300">
                  Strong topics
                </span>
              </div>

              <div className="rounded-2xl border border-amber-500/25 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(251,191,36,0.12)_0%,rgba(245,158,11,0.02)_100%)] p-5">
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">{areasToImprove.length}</span>
                </div>
                <span className="mt-1 block text-xs font-semibold text-amber-300">Focus areas</span>
              </div>
            </div>
          </section>

          {/* Section B: What you're strong at */}
          {strengths.length > 0 && (
            <section aria-labelledby="strengths-heading" className="space-y-3.5">
              <h2 id="strengths-heading" className="text-lg font-bold text-[var(--text-primary)]">
                What you’re strong at
              </h2>
              <div className="space-y-3">
                {strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-emerald-500/20 bg-emerald-950/15 p-5 transition-colors hover:border-emerald-500/35"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.topic}
                        </h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        Strong
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)] sm:text-sm">
                      {item.reason}
                    </p>
                    {renderEvidenceChips(source.type, source.youtubeVideoId, item.sourceEvidence)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section C: Where to focus next */}
          {areasToImprove.length > 0 && (
            <section aria-labelledby="areas-to-improve-heading" className="space-y-3.5">
              <h2
                id="areas-to-improve-heading"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                Where to focus next
              </h2>
              <div className="space-y-3">
                {areasToImprove.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-5 transition-colors hover:border-amber-500/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Target size={18} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.topic}
                        </h3>
                      </div>
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                        Needs practice
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)] sm:text-sm">
                      {item.missingOrMisunderstood}
                    </p>
                    {item.whatToRemember && (
                      <div className="mt-2 rounded-lg bg-[var(--surface-3)] px-3 py-2 text-xs text-amber-200/90">
                        <span className="font-semibold text-amber-300">What to remember: </span>
                        {item.whatToRemember}
                      </div>
                    )}
                    {renderEvidenceChips(source.type, source.youtubeVideoId, item.sourceEvidence)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section D: Answer-by-answer review */}
          <section aria-labelledby="review-answers-heading" className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2
                id="review-answers-heading"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                Review your answers
              </h2>
              <span className="text-xs text-[var(--text-muted)]">{questions.length} questions</span>
            </div>

            <div className="space-y-2.5">
              {questions.map((q, idx) => {
                const isExpanded = expandedQuestionIds.has(q.questionId);
                const questionNum = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={q.questionId}
                    className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] transition-colors hover:border-[var(--border-medium)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleQuestion(q.questionId)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                          {questionNum}
                        </span>
                        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {q.topic}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {getOutcomeBadge(q.outcome)}
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-[var(--text-muted)]" />
                        ) : (
                          <ChevronDown size={16} className="text-[var(--text-muted)]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[var(--border-soft)] bg-[var(--surface-2)] p-4 sm:p-5">
                        <div className="text-sm font-medium leading-6 text-[var(--text-primary)]">
                          {renderPromptWithCode(q.prompt)}
                        </div>

                        <div className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-3.5">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Your response
                          </span>
                          <div className="mt-1">
                            {q.userAnswer.trim() ? (
                              renderAnswerWithCode(q.userAnswer)
                            ) : (
                              <p className="text-sm leading-6 text-[var(--text-muted)] italic">
                                (No answer provided)
                              </p>
                            )}
                          </div>
                        </div>

                        {q.feedback && (
                          <div className="mt-3 rounded-xl border border-[rgba(157,165,255,0.2)] bg-[rgba(157,165,255,0.06)] p-3.5">
                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
                              Evaluator feedback
                            </span>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                              {q.feedback}
                            </p>
                          </div>
                        )}

                        {q.expectedConcept && (
                          <div className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
                            <span className="font-semibold text-[var(--text-secondary)]">
                              Key takeaway:{" "}
                            </span>
                            {q.expectedConcept}
                          </div>
                        )}

                        {renderEvidenceChips(source.type, source.youtubeVideoId, q.sourceEvidence)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section E: Your next step */}
          {nextSteps && (
            <section
              aria-labelledby="next-step-heading"
              className="rounded-2xl border border-[rgba(157,165,255,0.25)] bg-[radial-gradient(100%_100%_at_50%_0%,rgba(157,165,255,0.12)_0%,rgba(124,92,255,0.04)_100%)] p-6 shadow-lg sm:p-7"
            >
              <div className="flex items-center gap-2.5 text-[var(--accent-strong)]">
                <Compass size={22} />
                <h2
                  id="next-step-heading"
                  className="text-base font-bold text-[var(--text-primary)]"
                >
                  Your next step
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {nextSteps.recommendation}
              </p>
              {nextSteps.focusTopics.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Recommended focus:
                  </span>
                  {nextSteps.focusTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[rgba(157,165,255,0.3)] bg-[rgba(157,165,255,0.12)] px-3 py-0.5 text-xs font-semibold text-[var(--accent-strong)]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/workspace/${conversationId}`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_8px_20px_rgba(93,72,220,0.25)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.99]"
                >
                  <ArrowLeft size={16} />
                  Return to chat
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
