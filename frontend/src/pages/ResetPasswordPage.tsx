import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthPasswordInput } from "@/components/auth/AuthInput";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";

type TokenStatus = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <AuthShell
      title="Reset Password"
      subtitle="Choose a new password for your account."
      maxWidthClass="max-w-[430px]"
    >

          {tokenStatus === "checking" && (
            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-4 text-center text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2">
              <Loader2 size={15} className="animate-spin" />
              Verifying reset link...
            </div>
          )}

          {tokenStatus === "invalid" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-amber-300 mb-2">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Reset link is invalid or expired</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4">For security, password reset links are time-limited and single-use. Request a new reset link to continue.</p>
              <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] transition-colors">
                Request New Link
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          )}

          {tokenStatus === "valid" && isSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="flex items-center justify-center mb-2 text-green-400">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Password reset successful</p>
              <p className="text-xs text-[var(--text-secondary)] mb-4">Your password has been updated. You can now sign in with your new password.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] transition-colors">
                Go to Login
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          )}

          {tokenStatus === "valid" && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <AuthPasswordInput
                id="reset-password"
                label="New password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={setPassword}
                placeholder="Enter new password"
                visible={showPassword}
                onToggleVisible={() => setShowPassword((v) => !v)}
              />

              <div>
                <AuthPasswordInput
                  id="confirm-reset-password"
                  label="Confirm password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter new password"
                  visible={showConfirmPassword}
                  onToggleVisible={() => setShowConfirmPassword((v) => !v)}
                  hasError={mismatch}
                />
                {mismatch && <p className="text-xs text-red-400 mt-1.5">Passwords do not match.</p>}
              </div>

              <AuthPrimaryButton
                type="submit"
                disabled={mismatch || password.length < 6}
                isLoading={isSubmitting}
                loadingText="Resetting password..."
                text="Reset Password"
                icon={<ArrowRight size={15} />}
              />
            </form>
          )}

          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft size={14} />
            Back to login
          </Link>
    </AuthShell>
  );
}
  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

