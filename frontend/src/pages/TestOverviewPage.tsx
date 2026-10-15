import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, Youtube } from "lucide-react";
import { assessmentService } from "@/services/assessment.service";

const goalLabels: Record<string, string> = {
  understand_deeply: "Understand deeply",
  exam_certification: "Prepare for an exam or certification",
  interview_preparation: "Prepare for an interview",
  practical_application: "Apply the knowledge in practice",
  refresh_knowledge: "Refresh my knowledge",
  custom: "My own goal",
};

const depthLabels: Record<string, string> = {
  quick: "Quick",
  standard: "Standard",
  deep: "Deep dive",
};

export default function TestOverviewPage() {
  const { conversationId, assessmentId } = useParams<{
    conversationId: string;
    assessmentId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const backToChat = () => navigate(`/workspace/${conversationId}`);
  const overviewQuery = useQuery({
    queryKey: ["assessment-overview", assessmentId],
    queryFn: () => assessmentService.getOverview(assessmentId!),
    enabled: Boolean(assessmentId),
    retry: false,
  });

  const overview = overviewQuery.data;
  const conversationMatches = overview?.conversationId === conversationId;
  const handleStartAssessment = async () => {
    if (!assessmentId || !conversationId || isStarting) return;
    setIsStarting(true);
    setStartError("");
    try {
      const session = await assessmentService.start(assessmentId, conversationId);
      queryClient.setQueryData(["assessment-session", assessmentId, conversationId], session);
      void navigate(`/workspace/${conversationId}/test/${assessmentId}/session`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Couldn’t start the assessment. Please try again.";
      setStartError(message);
    } finally {
      setIsStarting(false);
    }
  };
  const renderShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-7 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[var(--border-soft)] py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            {overview && conversationMatches && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--accent)]">
                {overview.source.type === "video" ? (
                  <Youtube size={17} aria-hidden="true" />
                ) : (
                  <FileText size={17} aria-hidden="true" />
                )}
              </span>
            )}
            {overview && conversationMatches && (
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {overview.source.type === "video" ? "YouTube video" : "PDF document"}
                </span>
                <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                  {overview.source.title}
                </span>
              </span>
            )}
            {(!overview || !conversationMatches) && (
              <span className="text-sm font-semibold text-[var(--text-secondary)]">
                Lumora · Test
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Assessment</span>
            <button
              type="button"
              onClick={backToChat}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to chat
            </button>
          </div>
        </header>
        {content}
      </div>
    </div>
  );

  if (overviewQuery.isLoading) {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16" aria-live="polite">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <Loader2 size={18} className="animate-spin text-[var(--accent)]" aria-hidden="true" />
          Loading your assessment…
        </div>
      </main>,
    );
  }

  if (overviewQuery.isError || !overview || !conversationMatches) {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold">We couldn’t load this assessment</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            It may be unavailable or may not belong to this conversation. Return to your chat to
            continue.
          </p>
          <button
            type="button"
            onClick={backToChat}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to chat
          </button>
        </section>
      </main>,
    );
  }

  if (overview.status === "generating") {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16" aria-live="polite">
        <section className="w-full max-w-md text-center">
          <Loader2
            size={25}
            className="mx-auto animate-spin text-[var(--accent)]"
            aria-hidden="true"
          />
          <h1 className="mt-5 text-xl font-semibold">Your assessment is being prepared</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Return to your setup and retry after the current preparation request finishes.
          </p>
          <button
            type="button"
            onClick={backToChat}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to chat
          </button>
        </section>
      </main>,
    );
  }

  if (overview.status === "generation_failed") {
    return renderShell(
      <main className="flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold">We couldn’t prepare this assessment</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            This attempt wasn’t marked ready. Return to the chat to begin a new attempt.
          </p>
          <button
            type="button"
            onClick={backToChat}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Back to chat
          </button>
        </section>
      </main>,
    );
  }

  return renderShell(
    <main className="flex flex-1 justify-center overflow-y-auto py-6 sm:py-10">
      <section className="h-fit w-full max-w-3xl rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-lg)] sm:p-8">
        <div className="border-b border-[var(--border-soft)] pb-6">
          <h1 className="text-lg font-semibold leading-6 text-[var(--text-primary)] sm:text-xl">
            {overview.status === "in_progress" ? "Assessment in progress" : "Assessment ready"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            {overview.status === "in_progress"
              ? "Your saved answers are ready when you are."
              : "Built from your source and tailored to your learning goal."}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)]">Questions</p>
            <p className="mt-1 text-lg font-semibold">{overview.questionCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)]">Assessment depth</p>
            <p className="mt-1 text-lg font-semibold">{depthLabels[overview.depth]}</p>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Your learning goal</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {overview.goal === "custom" ? overview.customGoal : goalLabels[overview.goal]}
          </p>
        </section>

        <section className="mt-6 border-t border-[var(--border-soft)] pt-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Topics covered</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {overview.topics.map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-[var(--border-medium)] bg-[var(--surface-3)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
              >
                {topic}
              </li>
            ))}
          </ul>
        </section>

        {startError && (
          <p
            className="mt-5 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-3 text-sm text-rose-200"
            role="alert"
          >
            {startError}
          </p>
        )}
        <button
          type="button"
          disabled={isStarting}
          onClick={handleStartAssessment}
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_10px_26px_rgba(93,72,220,0.22)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--canvas) active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
        >
          {isStarting
            ? "Opening assessment…"
            : overview.status === "in_progress"
              ? "Resume assessment"
              : "Start assessment"}
        </button>
      </section>
    </main>,
  );
}
