import { Loader2 } from "lucide-react";

interface AuthPrimaryButtonProps {
  type?: "button" | "submit";
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text: string;
  icon?: React.ReactNode;
}

export function AuthPrimaryButton({
  type = "button",
  disabled,
  isLoading,
  loadingText,
  text,
  icon,
}: AuthPrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_18px_40px_rgba(110,127,255,0.22)]"
    >
      <span className="absolute inset-0 bg-[linear-gradient(135deg,#dfe3ff_0%,#9da5ff_45%,#87b8ff_100%)]" />
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          <>
            {text}
            {icon}
          </>
        )}
      </span>
    </button>
  );
}

