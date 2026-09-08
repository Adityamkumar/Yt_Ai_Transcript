import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthSplitLayout, Button } from "@/components/ui/auth-ui";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/store/AuthContext";
import { useResendEmailVerificationRateLimit } from "@/hooks/useResendEmailVerificationRateLimit";

type VerificationStatus = "checking" | "success" | "invalid" | "error";

type PendingLocationState = {
  email?: string;
  resendCooldownUntil?: number;
};

export default function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("checking");
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const verificationRequest = useRef<{ token: string; promise: Promise<unknown> } | null>(null);

  const routeState = location.state as PendingLocationState | null;
  const email = routeState?.email ?? user?.email;
  const isPendingPage = !token;
  const {
    resendState,
    cooldownSeconds,
    isDisabled: isResendDisabled,
    setLoading,
    reset,
    startCooldown,
    handleRateLimitError,
  } = useResendEmailVerificationRateLimit(routeState?.resendCooldownUntil);

  useEffect(() => {
    if (!token) return;

    let isCurrent = true;

    const verify = async () => {
      setVerificationStatus("checking");

      const request = verificationRequest.current?.token === token
        ? verificationRequest.current.promise
        : authService.verifyEmail(token);

      verificationRequest.current = { token, promise: request };

      try {
        await request;
        // The backend has confirmed the link. Refresh the shared user record so
        // open account and dashboard UI updates without another sign-in.
        if (user) {
          await refreshUser();
        }
        if (isCurrent) setVerificationStatus("success");
      } catch (error) {
        if (!isCurrent) return;
        const status = (error as { status?: number }).status;
        setVerificationStatus(status && status < 500 ? "invalid" : "error");
      }
    };

    verify();

    return () => {
      isCurrent = false;
    };
  }, [token, refreshUser]);

  const handleResend = async () => {
    if (!email || isResendDisabled) return;

    setLoading();
    setResendStatus("idle");

    try {
      await authService.resendEmailVerification(email);
      setResendStatus("success");
      startCooldown(60);
    } catch (error) {
      if (!handleRateLimitError(error)) {
        setResendStatus("error");
        reset();
      }
    }
  };

  if (!isPendingPage) {
    return (
      <AuthShell
        title={verificationStatus === "success" ? "Email verified" : verificationStatus === "checking" ? "Verifying your email" : "We couldn't verify that link"}
        subtitle={
          verificationStatus === "success"
            ? "Your email has been successfully verified. Your Lumora account is ready."
            : verificationStatus === "checking"
              ? "Please wait while we confirm your verification link."
              : "The link is invalid, expired, or we could not reach the verification service."
        }
      >
        {verificationStatus === "checking" && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-5 text-center text-sm text-[var(--text-secondary)]" role="status" aria-live="polite">
            <Loader2 size={22} className="animate-spin text-[var(--accent)]" aria-hidden="true" />
            <span>Verifying your email...</span>
          </div>
        )}

        {verificationStatus === "success" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
              <CheckCircle2 size={24} aria-hidden="true" />
            </div>
            <AuthPrimaryButton type="button" text={user ? "Continue to dashboard" : "Continue to login"} icon={<ArrowRight size={15} />} onClick={() => navigate(user ? "/app" : "/login")} />
          </motion.div>
        )}

        {(verificationStatus === "invalid" || verificationStatus === "error") && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
              <div className="mb-2 flex items-center gap-2 text-amber-300">
                <AlertCircle size={16} aria-hidden="true" />
                <span className="text-sm font-medium">{verificationStatus === "invalid" ? "Verification link expired or invalid" : "Unable to verify your email"}</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{verificationStatus === "invalid" ? "Request a new verification email to continue." : "Please check your connection and request a new verification email if you still need one."}</p>
            </div>
            <AuthPrimaryButton type="button" text="Request a new email" icon={<ArrowRight size={15} />} onClick={() => navigate("/verify-email")} />
          </motion.div>
        )}
      </AuthShell>
    );
  }

  const canResend = Boolean(email);

  return (
    <AuthSplitLayout
      imageSrc="https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png"
      quoteText="Verify your email. Your Lumora workspace awaits."
      quoteAuthor="Lumora AI"
    >
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300 shadow-[0_0_30px_rgba(129,140,248,0.14)]">
            <Mail size={22} aria-hidden="true" />
          </span>
          <h1 className="pt-2 text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
          <p className="text-sm leading-6 text-muted-foreground">We sent a verification link to your email address.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-center gap-1.5 text-emerald-300">
            <CheckCircle2 size={14} strokeWidth={2.5} aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Verification email sent</p>
          </div>
          {email ? (
            <p className="mt-2 break-all text-sm font-semibold text-foreground">{email}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Use the email address you signed up with.</p>
          )}
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Open the email and select the verification link to activate your Lumora account.</p>
        </div>

        {resendStatus === "success" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-xs font-medium text-emerald-300" role="status">
            A new verification email has been sent.
          </motion.div>
        )}

        {resendStatus === "error" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-xs font-medium" style={{ color: "#ff6b6b" }} role="alert">
            We couldn&apos;t send another email. Please try again.
          </motion.div>
        )}

        {canResend ? (
          <div className="space-y-3 pt-1">
            <p className="text-center text-xs text-muted-foreground">Didn&apos;t receive it? Check your spam folder, then resend.</p>
            <Button type="button" disabled={isResendDisabled} onClick={handleResend} className="w-full bg-white font-semibold text-black hover:bg-neutral-200">
              {resendState === "loading" ? "Sending verification email..." : "Resend verification email"}
              {resendState === "idle" && <ArrowRight size={15} />}
            </Button>
            {resendState === "cooldown" && (
              <p className="text-center text-xs font-medium text-indigo-300" role="status" aria-live="polite">
                Available again in {cooldownSeconds}s
              </p>
            )}
            {resendState === "hourly_limit" && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-center" role="alert">
                <p className="text-xs font-semibold" style={{ color: "#ff5a5f" }}>Too many Email verification attempts</p>
                <p className="mt-1 text-[11px] leading-5" style={{ color: "#ff8a8d" }}>Please try again in 1 hour.</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">Sign in to request another verification email.</p>
            <Link to="/login" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:text-indigo-200">
              Go to login <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
}
