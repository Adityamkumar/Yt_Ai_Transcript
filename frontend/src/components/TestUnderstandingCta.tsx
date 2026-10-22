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
      className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-[#5b62bc]/70 bg-[linear-gradient(115deg,#24265a,#171b45_58%,#101936)] p-3 text-left shadow-[0_14px_38px_rgba(39,51,153,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#969dff] hover:bg-[linear-gradient(115deg,#2e3270,#1c2154_58%,#142049)] hover:shadow-[0_18px_44px_rgba(64,80,210,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aab1ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001219] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-4 sm:rounded-2xl sm:p-5"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#949bff]/65 bg-[#45449a] text-white shadow-[0_0_24px_rgba(133,137,255,0.4)] sm:h-12 sm:w-12">
        <BrainCircuit size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-(--text-primary)">
          Test your understanding
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-(--text-secondary) sm:mt-1 sm:text-sm">
          Discover what you've understood and where you need to improve.
        </span>
      </span>
      <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.13] px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 group-hover:border-white/30 group-hover:bg-white/[0.22] sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm">
        <span className="hidden min-[380px]:inline">Start test</span>
        <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </button>
  );
}
