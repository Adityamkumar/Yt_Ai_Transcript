import { ArrowRight, BrainCircuit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export function TestUnderstandingCta() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();

  return (
    <button
      type="button"
      disabled={!conversationId}
      onClick={() => conversationId && navigate(`/workspace/${conversationId}/test`)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-[rgba(157,165,255,0.28)] bg-[linear-gradient(115deg,rgba(124,92,255,0.18),rgba(157,165,255,0.08)_55%,rgba(255,255,255,0.025))] p-4 text-left shadow-[0_12px_32px_rgba(72,56,180,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(157,165,255,0.48)] hover:shadow-[0_16px_38px_rgba(72,56,180,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--canvas) active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[rgba(183,173,255,0.24)] bg-[rgba(124,92,255,0.2)] text-(--accent-strong) shadow-inner sm:h-12 sm:w-12">
        <BrainCircuit size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-(--text-primary) sm:text-base">
          Test your understanding
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
          Discover what you've understood and where you need to improve.
        </span>
      </span>
      <ArrowRight
        size={18}
        aria-hidden="true"
        className="shrink-0 text-(--accent-strong) transition-transform duration-200 group-hover:translate-x-1"
      />
    </button>
  );
}
