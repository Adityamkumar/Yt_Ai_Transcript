import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput, AuthPasswordInput } from "@/components/auth/AuthInput";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const passwordStrengthLabel = (pw: string): { label: string; color: string; width: string } => {
  if (pw.length === 0) return { label: "", color: "transparent", width: "0%" };
  if (pw.length < 6) return { label: "Too weak", color: "#ef4444", width: "25%" };
  if (pw.length < 10) return { label: "Fair", color: "#f59e0b", width: "55%" };
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: "Good", color: "#3b82f6", width: "75%" };
  return { label: "Strong", color: "#22c55e", width: "100%" };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default function SignupPage() {
  useAuthRedirect();
  const { register, user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const isOAuthReturn = sessionStorage.getItem("oauth_pending") === "true";

  if (user || isOAuthReturn || (loading && localStorage.getItem("isAuthenticated") === "true")) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const strength = passwordStrengthLabel(form.password);
  const passwordsMatch = Boolean(form.password && form.confirm && form.password === form.confirm);
  const passwordMismatch = Boolean(form.confirm && form.password !== form.confirm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) return;

    setIsLoading(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create account"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start analyzing videos in seconds, free forever"
      maxWidthClass="max-w-[440px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        <AuthInput
          id="signup-name"
          label="Full name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          placeholder="Alex Chen"
        />

        <AuthInput
          id="signup-email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="you@example.com"
        />

        <div className="space-y-1.5">
          <AuthPasswordInput
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
            placeholder="Create a strong password"
            visible={showPassword}
            onToggleVisible={() => setShowPassword((prev) => !prev)}
          />

          {form.password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
            >
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: strength.width }}
                  transition={{ duration: 0.3 }}
                  style={{ background: strength.color }}
                />
              </div>
              <span className="text-xs" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </motion.div>
          )}
        </div>

        <div>
          <AuthPasswordInput
            id="signup-confirm"
            label="Confirm password"
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={(value) => setForm((prev) => ({ ...prev, confirm: value }))}
            placeholder="Re-enter your password"
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((prev) => !prev)}
            hasError={passwordMismatch}
          />

          {passwordMismatch && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 mt-1.5">
              Passwords do not match
            </motion.p>
          )}
          {passwordsMatch && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-400 flex items-center gap-1 mt-1.5">
              <Check size={11} />
              Passwords match
            </motion.p>
          )}
        </div>

        <AuthPrimaryButton
          type="submit"
          disabled={passwordMismatch}
          isLoading={isLoading}
          loadingText="Creating account..."
          text="Create Account"
          icon={<ArrowRight size={15} />}
        />

        <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <div className="flex items-center gap-3 mt-5 mb-4">
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
        <span className="text-xs text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
      </div>

      <GoogleAuthButton label="Sign up with Google" />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
        <span className="text-xs text-[var(--text-muted)]">Already have an account?</span>
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
      </div>

      <Link
        to="/login"
        id="go-to-login"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-soft)] hover:border-[var(--border-medium)] bg-[var(--surface-3)] hover:bg-[var(--surface-hover)] transition-all duration-200"
      >
        Sign in instead
      </Link>
    </AuthShell>
  );
}

