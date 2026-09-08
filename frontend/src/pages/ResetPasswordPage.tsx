import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { AuthSplitLayout, Button, PasswordInput } from "@/components/ui/auth-ui";

type TokenStatus = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = useMemo(() => confirmPassword.length > 0 && password !== confirmPassword, [password, confirmPassword]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        return;
      }

      try {
        await authService.validateResetToken(token);
        setTokenStatus("valid");
      } catch {
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || mismatch) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Unable to reset password");
      setError(message);
      if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
        setTokenStatus("invalid");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      imageSrc="https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png"
      quoteText="A fresh start for your Lumora account."
      quoteAuthor="Lumora AI"
    >
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300 shadow-[0_0_30px_rgba(129,140,248,0.14)]">
            <CheckCircle2 size={22} aria-hidden="true" />
          </span>
          <h1 className="pt-2 text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
          <p className="text-sm leading-6 text-muted-foreground">Choose a strong new password for your account.</p>
        </div>

        {tokenStatus === "checking" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-4 text-sm text-muted-foreground" role="status">
            <Loader2 size={16} className="animate-spin text-indigo-300" />
            Verifying your reset link…
          </div>
        )}

        {tokenStatus === "invalid" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-center">
            <AlertCircle size={22} className="mx-auto text-amber-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">This reset link is invalid or expired</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Reset links are time-limited and can only be used once. Request a new link to continue.</p>
            <Button asChild className="mt-5 w-full">
              <Link to="/forgot-password">Request a new link <ArrowRight size={15} /></Link>
            </Button>
          </motion.div>
        )}

        {tokenStatus === "valid" && isSuccess && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-center">
            <CheckCircle2 size={26} className="mx-auto text-emerald-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">Password reset successful</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Your password has been updated. You can now sign in securely.</p>
            <Button asChild className="mt-5 w-full">
              <Link to="/login">Go to login <ArrowRight size={15} /></Link>
            </Button>
          </motion.div>
        )}

        {tokenStatus === "valid" && !isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-xs font-medium text-red-400" role="alert">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <PasswordInput id="reset-password" label="New password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a new password" />
            <div>
              <PasswordInput id="confirm-reset-password" label="Confirm password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your new password" className={mismatch ? "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/20" : undefined} />
              {mismatch && <p className="mt-1.5 text-xs text-red-400">Passwords do not match.</p>}
            </div>

            <Button type="submit" disabled={isSubmitting || mismatch || password.length < 6} className="mt-2 w-full">
              {isSubmitting ? "Resetting password..." : "Reset password"}
              {!isSubmitting && <ArrowRight size={15} />}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

