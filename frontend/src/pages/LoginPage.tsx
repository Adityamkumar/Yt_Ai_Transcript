import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput, AuthPasswordInput } from "@/components/auth/AuthInput";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(form.email, form.password);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      maxWidthClass="max-w-[420px]"
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
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="you@example.com"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <Link
              to="/forgot-password"
              id="forgot-password-link"
              className="text-xs text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          <AuthPasswordInput
            id="login-password"
            label=""
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
            placeholder="Enter your password"
            visible={showPassword}
            onToggleVisible={() => setShowPassword((prev) => !prev)}
          />
        </div>

        <AuthPrimaryButton
          type="submit"
          isLoading={isLoading}
          loadingText="Signing in..."
          text="Sign In"
          icon={<ArrowRight size={15} />}
        />
      </form>

      <div className="flex items-center gap-3 mt-5 mb-4">
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
        <span className="text-xs text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
      </div>

      <GoogleAuthButton />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
        <span className="text-xs text-[var(--text-muted)]">New to EchoMind?</span>
        <div className="flex-1 h-px" style={{ background: "var(--border-soft)" }} />
      </div>

      <Link
        to="/signup"
        id="go-to-signup"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-soft)] hover:border-[var(--border-medium)] bg-[var(--surface-3)] hover:bg-[var(--surface-hover)] transition-all duration-200"
      >
        Create your free account
      </Link>
    </AuthShell>
  );
}

