import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  Loader2,
  Layers3,
  MessageSquare,
  PencilLine,
  RefreshCw,
  Telescope,
  Wrench,
  Zap,
  Youtube,
} from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import type { IConversation, PdfDocument, VideoData } from "@/types";
import {
  assessmentService,
  type AssessmentGoal,
  type AssessmentDepth,
} from "@/services/assessment.service";
import type { AxiosError } from "axios";

const goals = [
  {
    value: "understand_deeply",
    label: "Understand deeply",
    description: "Build a strong understanding of the concepts.",
    icon: BookOpen,
  },
  {
    value: "exam_certification",
    label: "Prepare for an exam or certification",
    description: "Check knowledge, recall, and exam-style reasoning.",
    icon: GraduationCap,
  },
  {
    value: "interview_preparation",
    label: "Prepare for an interview",
    description: "Practise explanations and relevant scenarios.",
    icon: MessageSquare,
  },
  {
    value: "practical_application",
    label: "Apply the knowledge in practice",
    description: "Test the ability to use what has been learned.",
    icon: Wrench,
  },
  {
    value: "refresh_knowledge",
    label: "Refresh my knowledge",
    description: "Discover what you remember and what needs review.",
    icon: RefreshCw,
  },
  {
    value: "custom",
    label: "My own goal",
    description: "Describe your specific objective.",
    icon: PencilLine,
  },
] satisfies Array<{
  value: AssessmentGoal;
  label: string;
  description: string;
  icon: typeof BookOpen;
}>;

const depths: Array<{
  value: AssessmentDepth;
  label: string;
  description: string;
  icon: typeof Zap;
}> = [
  { value: "quick", label: "Quick", description: "Quick check", icon: Zap },
  { value: "standard", label: "Standard", description: "Balanced", icon: Layers3 },
  { value: "deep", label: "Deep dive", description: "Thorough", icon: Telescope },
];

function resolveSource(conversation: IConversation) {
  if (conversation.type === "video") {
    if (!conversation.videoId || typeof conversation.videoId === "string") {
      return null;
    }

    const video = conversation.videoId as VideoData;
    return {
      type: "video" as const,
      title: video.title,
      isReady: video.status === "ready" && video.ragStatus === "ready",
    };
  }

  if (!conversation.pdfDocumentId || typeof conversation.pdfDocumentId === "string") {
    return null;
  }

  const pdf = conversation.pdfDocumentId as PdfDocument;
  return {
    type: "pdf" as const,
    title: pdf.title,
    isReady: (pdf.ragStatus ?? pdf.status) === "ready",
  };
}

export default function TestSetupPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { conversations, isLoading, isError } = useConversations(conversationId);
  const [selectedGoal, setSelectedGoal] = useState<AssessmentGoal | "">("");
  const [customGoal, setCustomGoal] = useState("");
  const [depth, setDepth] = useState<AssessmentDepth>("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyRequestRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const conversation = conversations.find((item) => item._id === conversationId);
  const source = conversation ? resolveSource(conversation) : null;
  const trimmedCustomGoal = customGoal.trim();
  const customGoalIsValid = trimmedCustomGoal.length >= 3 && trimmedCustomGoal.length <= 300;
  const customGoalError =
    selectedGoal === "custom" && !customGoalIsValid
      ? trimmedCustomGoal.length === 0
        ? "Enter a goal between 3 and 300 characters."
        : trimmedCustomGoal.length < 3
          ? "Your goal needs at least 3 characters."
          : "Your goal must be 300 characters or fewer."
      : "";
  const formIsValid = Boolean(selectedGoal) && (selectedGoal !== "custom" || customGoalIsValid);

  const handleBuildAssessment = async () => {
    if (!conversationId || !selectedGoal || !formIsValid || isSubmitting) return;
    setIsSubmitting(true);
    const payload = {
      conversationId,
      goal: selectedGoal,
      ...(selectedGoal === "custom" ? { customGoal: trimmedCustomGoal } : {}),
      depth,
    };
    const fingerprint = JSON.stringify(payload);
    if (idempotencyRequestRef.current?.fingerprint !== fingerprint) {
      idempotencyRequestRef.current = { fingerprint, key: crypto.randomUUID() };
    }
    try {
      const overview = await assessmentService.create(payload, idempotencyRequestRef.current.key);
      void navigate(`/workspace/${conversationId}/test/${overview.assessmentId}`);
    } catch (error) {
      const requestError = error as AxiosError<{ code?: string }> & {
        message?: string;
        code?: string;
      };
      const errorCode = requestError.response?.data?.code ?? requestError.code;
      const friendlyMessage =
        errorCode === "SOURCE_NOT_READY"
          ? "Your source is still getting ready. Return to your chat and try again shortly."
          : errorCode === "SOURCE_ACCESS_REQUIRED"
            ? "Reopen this source from its conversation, then try again."
            : errorCode === "SOURCE_CONTENT_UNAVAILABLE" || errorCode === "SOURCE_NOT_ASSESSABLE"
              ? "There isn’t enough usable material to build an assessment yet."
              : errorCode === "ASSESSMENT_GENERATING"
                ? "Your assessment is already being prepared. Please wait a moment and retry."
                : "We couldn’t prepare your assessment. Your choices are still here, so you can try again.";
      toast.error(friendlyMessage, { duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exitToConversation = () => {
    if (conversationId) {
      void navigate(`/workspace/${conversationId}`);
    } else {
      void navigate("/app");
    }
  };

  const renderFrame = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--surface-1)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            fontSize: "14px",
          },
        }}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-7 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[var(--border-soft)] py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={exitToConversation}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:hidden"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>
            <div className="hidden h-8 w-px bg-[var(--border-soft)] sm:block" aria-hidden="true" />
            {source && conversation && (
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--accent)]">
                  {source.type === "video" ? (
                    <Youtube size={17} aria-hidden="true" />
                  ) : (
                    <FileText size={17} aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    {source.type === "video" ? "YouTube video" : "PDF document"}
                  </span>
                  <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                    {source.title || conversation.title}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Setup</span>
            <div
              className="flex items-center gap-2"
              role="progressbar"
              aria-label="Setup progress"
              aria-valuemin={1}
              aria-valuemax={2}
              aria-valuenow={1}
              aria-valuetext="Setup step 1 of 2"
            >
              <span className="h-1.5 w-8 rounded-full bg-[var(--accent)]" />
              <span className="h-1.5 w-8 rounded-full bg-[var(--border-strong)]" />
              <span className="ml-1 text-xs text-[var(--text-muted)]">1 of 2</span>
            </div>
            <button
              type="button"
              onClick={exitToConversation}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:inline-flex"
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

  if (isLoading) {
    return renderFrame(
      <main className="flex flex-1 items-center justify-center py-16" aria-live="polite">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <Loader2 size={18} className="animate-spin text-[var(--accent)]" aria-hidden="true" />
          Loading your source…
        </div>
      </main>,
    );
  }

  if (isError || !conversation || !source || !source.title) {
    return renderFrame(
      <main className="flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold">This source isn’t available</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            We couldn’t load this conversation and its source. Return to the workspace and open a
            conversation you can access.
          </p>
          <button
            type="button"
            onClick={exitToConversation}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to workspace
          </button>
        </section>
      </main>,
    );
  }

  if (!source.isReady) {
    return renderFrame(
      <main className="flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold">This source isn’t ready yet</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Return to the conversation and try again when its source has finished processing.
          </p>
          <button
            type="button"
            onClick={exitToConversation}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to conversation
          </button>
        </section>
      </main>,
    );
  }

  if (isSubmitting) {
    return renderFrame(
      <main className="flex flex-1 items-center justify-center py-16" aria-live="polite">
        <section className="w-full max-w-md text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[rgba(157,165,255,0.2)] bg-[rgba(124,92,255,0.12)] text-[var(--accent-strong)]">
            <Loader2 size={25} className="animate-spin" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-xl font-semibold">Preparing your assessment</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            We’re grounding questions in your source and learning goal.
          </p>
        </section>
      </main>,
    );
  }

  return renderFrame(
    <main className="flex flex-1 justify-center overflow-y-auto py-6 sm:py-10">
      <section className="h-fit w-full max-w-3xl rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-lg)] sm:p-7 lg:p-8">
        <div className="border-b border-[var(--border-soft)] pb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
            Lumora · Test
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)] sm:text-3xl">
            What are you trying to achieve?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Lumora will adapt your assessment to your learning goal and the material you’re
            studying.
          </p>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Choose your learning goal
          </legend>
          <div className="grid gap-2.5">
            {goals.map(({ value, label, description, icon: Icon }) => {
              const isSelected = selectedGoal === value;
              return (
                <label
                  key={value}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-150 focus-within:ring-1 focus-within:ring-[rgba(157,165,255,0.55)] sm:gap-4 sm:px-4 ${
                    isSelected
                      ? "border-[var(--accent)] bg-[rgba(124,92,255,0.14)] shadow-[0_0_0_1px_rgba(157,165,255,0.12)]"
                      : "border-[var(--border-medium)] bg-[var(--surface-3)] hover:border-[rgba(157,165,255,0.38)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="assessment-goal"
                    value={value}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedGoal(value);
                    }}
                  />
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border-soft)] bg-[var(--canvas)] text-[var(--accent-strong)] transition-colors group-hover:border-[var(--border-medium)] peer-checked:border-[rgba(183,173,255,0.28)] peer-checked:bg-[rgba(124,92,255,0.18)]">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--text-primary)]">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--text-secondary)]">
                      {description}
                    </span>
                  </span>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${isSelected ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--canvas)]" : "border-[var(--border-strong)] text-transparent"}`}
                  >
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {selectedGoal === "custom" && (
          <div className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.025)] p-4">
            <label
              htmlFor="custom-goal"
              className="block text-sm font-semibold text-[var(--text-primary)]"
            >
              What’s your specific goal?
            </label>
            <textarea
              id="custom-goal"
              value={customGoal}
              onChange={(event) => {
                setCustomGoal(event.target.value);
              }}
              rows={3}
              maxLength={600}
              aria-invalid={Boolean(customGoalError)}
              aria-describedby={customGoalError ? "custom-goal-error" : "custom-goal-count"}
              placeholder="For example, explain the main ideas confidently in my own words."
              className="mt-2 w-full resize-y rounded-lg border border-[var(--border-medium)] bg-[var(--canvas)] px-3.5 py-3 text-sm leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(157,165,255,0.22)]"
            />
            <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-xs">
              {customGoalError ? (
                <p id="custom-goal-error" className="text-rose-300" role="alert">
                  {customGoalError}
                </p>
              ) : (
                <p id="custom-goal-count" className="text-[var(--text-muted)]">
                  Use 3–300 characters.
                </p>
              )}
              <span className="ml-auto text-[var(--text-muted)]" aria-live="polite">
                {trimmedCustomGoal.length}/300
              </span>
            </div>
          </div>
        )}

        <fieldset className="mt-6 border-t border-[var(--border-soft)] pt-6">
          <legend className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Choose your assessment depth
          </legend>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {depths.map(({ icon: Icon, ...option }) => {
              const isSelected = depth === option.value;
              return (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-150 focus-within:ring-1 focus-within:ring-[rgba(157,165,255,0.55)] sm:flex-col sm:gap-1.5 sm:py-4 ${
                    isSelected
                      ? "border-[var(--accent)] bg-[rgba(124,92,255,0.14)]"
                      : "border-[var(--border-medium)] bg-[var(--surface-3)] hover:border-[rgba(157,165,255,0.38)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="assessment-depth"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => {
                      setDepth(option.value);
                    }}
                  />
                  <span className="flex min-w-0 flex-1 flex-col sm:flex-none">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {option.label}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {option.description}
                    </span>
                  </span>
                  <Icon
                    className="ml-auto h-4 w-4 shrink-0 text-[var(--accent-strong)] sm:absolute sm:right-3 sm:top-3"
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="mt-5 text-xs leading-5 text-[var(--text-secondary)]">
          Lumora selects suitable topics, question types, and evaluation criteria automatically.
        </p>

        <button
          type="button"
          disabled={!formIsValid || isSubmitting}
          onClick={handleBuildAssessment}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_10px_26px_rgba(93,72,220,0.22)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--canvas) active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          Build my assessment
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    </main>,
  );
}
