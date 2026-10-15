import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Save,
  TriangleAlert,
} from "lucide-react";
import { renderPromptWithCode } from "@/components/assessment/PromptRenderer";
import { LumoraLogo } from "@/components/ui/LumoraLogo";
import { assessmentService, type PublicAssessmentQuestion } from "@/services/assessment.service";

type SaveState = "saving" | "saved" | "error";

const questionTypeLabels: Record<string, string> = {
  recall: "Recall",
  explain: "Explain",
  connect: "Connect ideas",
  compare: "Compare",
  apply: "Application",
  reason: "Reasoning",
  analyze: "Analysis",
  solve: "Problem solving",
  interpret: "Interpretation",
};

export default function AssessmentSessionPage() {
  const { conversationId, assessmentId } = useParams<{
    conversationId: string;
    assessmentId: string;
  }>();
  const navigate = useNavigate();
  const sessionKey = ["assessment-session", assessmentId, conversationId];
  const sessionQuery = useQuery({
    queryKey: sessionKey,
    queryFn: () => assessmentService.getSession(assessmentId!, conversationId!),
    enabled: Boolean(assessmentId && conversationId),
    retry: false,
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [exitError, setExitError] = useState("");
  const [failedSaveQuestionId, setFailedSaveQuestionId] = useState<string | null>(null);
  const hydratedAssessmentRef = useRef<string | null>(null);
  const draftRevisionRef = useRef(new Map<string, number>());
  const serverRevisionRef = useRef(new Map<string, number>());
  const dirtyQuestionsRef = useRef(new Set<string>());
  const inFlightQuestionsRef = useRef(new Set<string>());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const session = sessionQuery.data;
    if (!session) return;

    if (
      session.status === "evaluating" ||
      session.status === "evaluated" ||
      session.status === "evaluation_failed"
    ) {
      void navigate(`/workspace/${conversationId}/test/${assessmentId}/results`, {
        replace: true,
      });
      return;
    }

    if (hydratedAssessmentRef.current === session.assessmentId) return;

    const restoredAnswers: Record<string, string> = {};
    const restoredSavedAnswers: Record<string, string> = {};
    let lastAnsweredIndex = -1;
    session.questions.forEach((question, index) => {
      serverRevisionRef.current.set(question.questionId, question.answerRevision);
      draftRevisionRef.current.set(question.questionId, 0);
      if (question.answerRevision > 0 && question.savedAnswer !== undefined) {
        restoredAnswers[question.questionId] = question.savedAnswer;
        restoredSavedAnswers[question.questionId] = question.savedAnswer;
        if (question.savedAnswer.trim()) lastAnsweredIndex = index;
      }
    });
    setAnswers(restoredAnswers);
    setSavedAnswers(restoredSavedAnswers);
    setCurrentIndex(Math.min(lastAnsweredIndex + 1, session.questions.length - 1));
    hydratedAssessmentRef.current = session.assessmentId;
  }, [sessionQuery.data]);

  const session = sessionQuery.data;
  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.questionId] ?? currentQuestion.savedAnswer ?? "")
    : "";

  const saveAnswer = useCallback(
    async (question: PublicAssessmentQuestion, answer: string): Promise<boolean> => {
      if (!assessmentId || !conversationId) return false;
      const questionId = question.questionId;
      const draftRevision = draftRevisionRef.current.get(questionId) ?? 0;
      const revision = (serverRevisionRef.current.get(questionId) ?? question.answerRevision) + 1;
      serverRevisionRef.current.set(questionId, revision);
      inFlightQuestionsRef.current.add(questionId);
      setSaveStates((previous) => ({ ...previous, [questionId]: "saving" }));

      try {
        const result = await assessmentService.saveAnswer(
          assessmentId,
          questionId,
          conversationId,
          answer,
          revision,
        );
        serverRevisionRef.current.set(questionId, Math.max(revision, result.answerRevision));
        const persistedRevision = serverRevisionRef.current.get(`persisted:${questionId}`) ?? 0;
        if (result.answerRevision >= persistedRevision) {
          serverRevisionRef.current.set(`persisted:${questionId}`, result.answerRevision);
          if (result.answerRevision > 0) {
            setSavedAnswers((previous) => ({
              ...previous,
              [questionId]: result.answer,
            }));
          }
        }

        if ((draftRevisionRef.current.get(questionId) ?? 0) === draftRevision) {
          if (!result.applied) {
            setAnswers((previous) => ({
              ...previous,
              [questionId]: result.answer,
            }));
          }
          dirtyQuestionsRef.current.delete(questionId);
          setSaveStates((previous) => ({ ...previous, [questionId]: "saved" }));
          setFailedSaveQuestionId((failedId) => (failedId === questionId ? null : failedId));
        }
        return result.applied || result.answerRevision >= revision;
      } catch {
        if ((draftRevisionRef.current.get(questionId) ?? 0) === draftRevision) {
          dirtyQuestionsRef.current.add(questionId);
          setSaveStates((previous) => ({ ...previous, [questionId]: "error" }));
          setFailedSaveQuestionId(questionId);
        }
        return false;
      } finally {
        inFlightQuestionsRef.current.delete(questionId);
      }
    },
    [assessmentId, conversationId],
  );

  const updateDraft = (question: PublicAssessmentQuestion, answer: string) => {
    const questionId = question.questionId;
    draftRevisionRef.current.set(questionId, (draftRevisionRef.current.get(questionId) ?? 0) + 1);
    dirtyQuestionsRef.current.add(questionId);
    setAnswers((previous) => ({ ...previous, [questionId]: answer }));
    setSaveStates((previous) => ({ ...previous, [questionId]: "saving" }));
  };

  useEffect(() => {
    if (
      !currentQuestion ||
      currentQuestion.responseFormat === "multiple_choice" ||
      !dirtyQuestionsRef.current.has(currentQuestion.questionId)
    )
      return;

    if (
      !currentAnswer.trim() &&
      !Object.prototype.hasOwnProperty.call(savedAnswers, currentQuestion.questionId)
    ) {
      dirtyQuestionsRef.current.delete(currentQuestion.questionId);
      setSaveStates((previous) => {
        const next = { ...previous };
        delete next[currentQuestion.questionId];
        return next;
      });
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const question = currentQuestion;
    const answer = currentAnswer;
    debounceTimerRef.current = setTimeout(() => {
      void saveAnswer(question, answer);
      debounceTimerRef.current = null;
    }, 550);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    };
  }, [currentAnswer, currentQuestion, saveAnswer, savedAnswers]);

  const flushCurrentAnswer = async () => {
    if (!currentQuestion || !dirtyQuestionsRef.current.has(currentQuestion.questionId)) return true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = null;
    if (
      !currentAnswer.trim() &&
      !Object.prototype.hasOwnProperty.call(savedAnswers, currentQuestion.questionId)
    ) {
      dirtyQuestionsRef.current.delete(currentQuestion.questionId);
      setSaveStates((previous) => {
        const next = { ...previous };
        delete next[currentQuestion.questionId];
        return next;
      });
      return true;
    }
    return saveAnswer(currentQuestion, currentAnswer);
  };

  const navigateToQuestion = async (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    if (!(await flushCurrentAnswer())) return;
    setCurrentIndex(targetIndex);
  };

  const handleSkip = async () => {
    if (!currentQuestion || currentIndex >= questions.length - 1) return;
    const questionId = currentQuestion.questionId;
    const needsClear =
      Boolean((savedAnswers[questionId] ?? "").trim()) ||
      inFlightQuestionsRef.current.has(questionId);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = null;
    if (needsClear) {
      updateDraft(currentQuestion, "");
      void saveAnswer(currentQuestion, "");
    } else {
      dirtyQuestionsRef.current.delete(questionId);
      draftRevisionRef.current.set(questionId, (draftRevisionRef.current.get(questionId) ?? 0) + 1);
      setAnswers((previous) => ({ ...previous, [questionId]: "" }));
      setSaveStates((previous) => {
        const next = { ...previous };
        delete next[questionId];
        return next;
      });
    }
    setCurrentIndex(currentIndex + 1);
  };

  const handleExit = async () => {
    const saved = await flushCurrentAnswer();
    if (!saved) {
      setExitError(
        "Your latest answer could not be saved. Retry the save before leaving, or stay and try again.",
      );
      return;
    }
    setShowExitConfirm(false);
    void navigate(`/workspace/${conversationId}`);
  };

  const retryLoad = () => {
    hydratedAssessmentRef.current = null;
    void sessionQuery.refetch();
  };

  const answeredCount = questions.filter(
    (question) => (savedAnswers[question.questionId] ?? "").trim().length > 0,
  ).length;

  const handleOpenSubmit = async () => {
    setSubmitError("");
    const flushed = await flushCurrentAnswer();
    if (!flushed) {
      setSubmitError("We couldn’t save your current answer. Please retry before submitting.");
      return;
    }
    setShowSubmitConfirm(true);
  };

  const handleReviewUnanswered = () => {
    setShowSubmitConfirm(false);
    const firstUnansweredIndex = questions.findIndex(
      (q) => !(savedAnswers[q.questionId] ?? "").trim(),
    );
    if (firstUnansweredIndex >= 0) {
      void navigateToQuestion(firstUnansweredIndex);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!assessmentId || !conversationId) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await assessmentService.submit(assessmentId, conversationId);
      void navigate(`/workspace/${conversationId}/test/${assessmentId}/results`);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(
        err?.response?.data?.message || "Unable to submit assessment right now. Please try again.",
      );
    }
  };

  const saveState = currentQuestion ? saveStates[currentQuestion.questionId] : undefined;
  const percent =
    questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const renderShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] py-4 sm:py-5">
          <div className="flex min-w-0 items-center gap-4">
            <LumoraLogo size="sm" />
            {session && (
              <>
                <span
                  className="hidden h-8 w-px bg-[var(--border-soft)] sm:block"
                  aria-hidden="true"
                />
                <span className="hidden min-w-0 sm:block">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    {session.source.type === "video" ? "YouTube video" : "PDF document"}
                  </span>
                  <span className="block max-w-md truncate text-sm font-medium text-[var(--text-primary)]">
                    {session.source.title}
                  </span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleOpenSubmit()}
              className="rounded-lg border border-[rgba(157,165,255,0.25)] bg-[rgba(124,92,255,0.12)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-strong)] transition-colors hover:bg-[rgba(124,92,255,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Submit test
            </button>
            <button
              type="button"
              onClick={() => {
                setExitError("");
                setShowExitConfirm(true);
              }}
              className="shrink-0 rounded-lg border border-[var(--border-medium)] px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Exit test
            </button>
          </div>
        </header>
        <div className="border-b border-[var(--border-soft)] py-3 sm:hidden">
          {session && (
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {session.source.type === "video" ? "YouTube video" : "PDF document"} ·{" "}
              {session.source.title}
            </p>
          )}
        </div>
        {content}
      </div>
    </div>
  );

  if (sessionQuery.isLoading) {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16" aria-live="polite">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <Loader2 size={18} className="animate-spin text-[var(--accent)]" aria-hidden="true" />
          Restoring your assessment…
        </div>
      </main>,
    );
  }

  if (sessionQuery.isError || !session) {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-md text-center">
          <TriangleAlert size={22} className="mx-auto text-amber-300" aria-hidden="true" />
          <h1 className="mt-4 text-lg font-semibold">We couldn’t restore this assessment</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Your access or saved session may be unavailable. You can return to the conversation
            without deleting this attempt.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={retryLoad}
              className="rounded-lg border border-[var(--border-medium)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Retry loading
            </button>
            <button
              type="button"
              onClick={() => navigate(`/workspace/${conversationId}`)}
              className="rounded-lg bg-[var(--surface-active)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Back to chat
            </button>
          </div>
        </section>
      </main>,
    );
  }

  if (showExitConfirm) {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-12">
        <section
          className="w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 text-center shadow-[var(--shadow-lg)] sm:p-8"
          role="alertdialog"
          aria-labelledby="exit-test-title"
          aria-describedby="exit-test-description"
        >
          <h1 id="exit-test-title" className="text-lg font-semibold">
            Exit this assessment?
          </h1>
          <p
            id="exit-test-description"
            className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"
          >
            Saved answers and progress will be kept. You can return to this same attempt later.
          </p>
          {exitError && (
            <p className="mt-3 text-sm text-rose-200" role="alert">
              {exitError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setExitError("");
                setShowExitConfirm(false);
              }}
              className="rounded-lg border border-[var(--border-medium)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Stay in assessment
            </button>
            <button
              type="button"
              onClick={() => void handleExit()}
              className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Exit to conversation
            </button>
          </div>
        </section>
      </main>,
    );
  }

  if (showSubmitConfirm) {
    const unansweredCount = questions.length - answeredCount;
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-12">
        <section
          className="w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 text-center shadow-[var(--shadow-lg)] sm:p-8"
          role="alertdialog"
          aria-labelledby="submit-test-title"
          aria-describedby="submit-test-description"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(157,165,255,0.12)] text-[var(--accent)]">
            <CheckCircle2 size={24} />
          </div>
          <h1 id="submit-test-title" className="text-lg font-semibold text-[var(--text-primary)]">
            {unansweredCount > 0
              ? "Submit with unanswered questions?"
              : "Ready to submit your assessment?"}
          </h1>
          <p
            id="submit-test-description"
            className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"
          >
            {unansweredCount > 0
              ? `You have answered ${answeredCount} of ${questions.length} questions (${unansweredCount} remaining). You can review unanswered questions or submit now.`
              : `All ${questions.length} questions are answered. Once submitted, your answers will be evaluated and can no longer be edited.`}
          </p>
          {submitError && (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {submitError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setSubmitError("");
                setShowSubmitConfirm(false);
              }}
              className="rounded-lg border border-[var(--border-medium)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              Stay and review
            </button>
            {unansweredCount > 0 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReviewUnanswered}
                className="rounded-lg border border-[rgba(157,165,255,0.3)] bg-[rgba(157,165,255,0.1)] px-4 py-2.5 text-sm font-medium text-[var(--accent-strong)] hover:bg-[rgba(157,165,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              >
                Review unanswered
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleConfirmSubmit()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : unansweredCount > 0 ? (
                "Submit anyway"
              ) : (
                "Confirm submission"
              )}
            </button>
          </div>
        </section>
      </main>,
    );
  }

  if (questions.length === 0 || !currentQuestion) {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16">
        <section className="text-center">
          <h1 className="text-lg font-semibold">No questions are available</h1>
          <button
            type="button"
            onClick={() => navigate(`/workspace/${conversationId}`)}
            className="mt-5 rounded-lg border border-[var(--border-medium)] px-4 py-2 text-sm hover:bg-[var(--surface-hover)]"
          >
            Back to chat
          </button>
        </section>
      </main>,
    );
  }

  const currentSaveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Saved"
        : saveState === "error"
          ? "Couldn’t save"
          : "";
  const failedSaveQuestion = failedSaveQuestionId
    ? questions.find((question) => question.questionId === failedSaveQuestionId)
    : undefined;

  return renderShell(
    <main className="flex flex-1 flex-col py-5 sm:py-8">
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <div className="border-b border-[var(--border-soft)] pb-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-medium text-[var(--text-primary)]">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <p className="text-[var(--text-secondary)]">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-active)]"
            role="progressbar"
            aria-label="Question position"
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-valuenow={currentIndex + 1}
            aria-valuetext={`Question ${currentIndex + 1} of ${questions.length}`}
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {failedSaveQuestion && (
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100"
            role="alert"
          >
            <span>We couldn’t save an answer. Your last confirmed answer is still saved.</span>
            <button
              type="button"
              onClick={() =>
                void saveAnswer(failedSaveQuestion, answers[failedSaveQuestion.questionId] ?? "")
              }
              className="font-semibold text-[var(--accent-strong)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Retry save
            </button>
          </div>
        )}

        <article className="flex-1 py-7 sm:py-10" aria-labelledby="current-question">
          <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {currentQuestion.questionType && (
                <span className="rounded-full border border-[rgba(157,165,255,0.2)] bg-[rgba(124,92,255,0.1)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]">
                  {questionTypeLabels[currentQuestion.questionType] ?? currentQuestion.questionType}
                </span>
              )}
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {currentQuestion.responseFormat === "multiple_choice"
                  ? "Multiple choice"
                  : currentQuestion.responseFormat === "short_answer"
                    ? "Short answer"
                    : "Extended response"}
              </span>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[var(--text-muted)]"
              aria-live="polite"
            >
              {saveState === "saving" && (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              )}
              {saveState === "saved" && <Save size={13} aria-hidden="true" />}
              {currentSaveLabel}
              {saveState === "error" && (
                <button
                  type="button"
                  onClick={() => void saveAnswer(currentQuestion, currentAnswer)}
                  className="ml-1 font-semibold text-[var(--accent-strong)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Retry
                </button>
              )}
            </span>
          </div>

          {currentQuestion.topic && (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {currentQuestion.topic}
            </p>
          )}
          <div id="current-question" className="max-w-4xl">
            {renderPromptWithCode(currentQuestion.prompt)}
          </div>

          {currentQuestion.responseFormat === "multiple_choice" ? (
            <fieldset className="mt-7 grid gap-3">
              <legend className="sr-only">Choose an answer</legend>
              {currentQuestion.options.map((option, index) => {
                const selected = currentAnswer === option.optionId;
                return (
                  <label
                    key={option.optionId}
                    className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors focus-within:ring-1 focus-within:ring-[rgba(157,165,255,0.55)] sm:gap-4 sm:p-4 ${
                      selected
                        ? "border-[var(--accent)] bg-[rgba(124,92,255,0.13)]"
                        : "border-[var(--border-medium)] bg-[var(--surface-3)] hover:border-[rgba(157,165,255,0.4)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.questionId}`}
                      className="sr-only"
                      value={option.optionId}
                      checked={selected}
                      onChange={() => {
                        updateDraft(currentQuestion, option.optionId);
                        void saveAnswer(currentQuestion, option.optionId);
                      }}
                    />
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm font-semibold ${selected ? "border-[rgba(183,173,255,0.42)] bg-[rgba(124,92,255,0.2)] text-[var(--accent-strong)]" : "border-[var(--border-soft)] bg-[var(--canvas)] text-[var(--text-secondary)]"}`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-6 text-[var(--text-primary)] sm:text-base">
                      {option.text}
                    </span>
                    {selected && (
                      <Check
                        size={17}
                        className="shrink-0 text-[var(--accent-strong)]"
                        aria-hidden="true"
                      />
                    )}
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <div className="mt-7">
              <label
                htmlFor={`answer-${currentQuestion.questionId}`}
                className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
              >
                {["apply", "solve", "analyze", "reason", "interpret"].includes(
                  currentQuestion.questionType,
                )
                  ? "Your answer (write code or explain your approach)"
                  : "Your answer"}
              </label>
              <textarea
                id={`answer-${currentQuestion.questionId}`}
                value={currentAnswer}
                maxLength={10000}
                rows={currentQuestion.responseFormat === "extended_response" ? 10 : 4}
                onChange={(event) => updateDraft(currentQuestion, event.target.value)}
                className={`w-full resize-y rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-4 py-3 font-mono text-sm leading-6 text-[var(--text-primary)] placeholder:font-sans placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(157,165,255,0.2)] ${currentQuestion.responseFormat === "extended_response" ? "min-h-56" : "min-h-28"}`}
                placeholder={
                  ["apply", "solve"].includes(currentQuestion.questionType)
                    ? "Write your code here…"
                    : currentQuestion.responseFormat === "extended_response"
                      ? "Write your explanation…"
                      : "Type your answer…"
                }
              />
              <p className="mt-2 text-right text-xs text-[var(--text-muted)]">
                {currentAnswer.length}/1000
              </p>
            </div>
          )}
        </article>

        <footer className="flex items-end justify-between gap-3 border-t border-[var(--border-soft)] py-4 sm:py-5">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => void navigateToQuestion(currentIndex - 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border-medium)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Previous
          </button>
          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => void handleSkip()}
                  className="min-h-11 rounded-lg border border-[var(--border-medium)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => void navigateToQuestion(currentIndex + 1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_8px_22px_rgba(93,72,220,0.18)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--canvas) active:scale-[0.99]"
                >
                  Next question
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void handleOpenSubmit()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_8px_22px_rgba(93,72,220,0.18)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.99]"
              >
                Submit assessment
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </main>,
  );
}
