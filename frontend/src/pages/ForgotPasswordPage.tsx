import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to send reset link"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a secure reset link."
      maxWidthClass="max-w-[430px]"
    >

          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="flex items-center justify-center mb-2 text-green-400">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-sm text-[#F5F7FF] mb-1">Reset link sent</p>
              <p className="text-xs text-[#94A3B8]">Please check your inbox and spam folder for the password reset email.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <AuthInput
                id="forgot-email"
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />

              <AuthPrimaryButton
                type="submit"
                isLoading={isLoading}
                loadingText="Sending link..."
                text="Send reset link"
                icon={<ArrowRight size={15} />}
              />
            </form>
          )}

          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F7FF] transition-colors">
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

