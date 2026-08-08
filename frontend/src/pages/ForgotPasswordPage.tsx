import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { AuthSplitLayout, Input, Button, Label } from "@/components/ui/auth-ui";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

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
    <AuthSplitLayout
      imageSrc="https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png"
      quoteText="Reset your credentials. Recover your workspace."
      quoteAuthor="Lumora AI"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground">Enter your email and we will send you a secure reset link.</p>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center space-y-2">
            <div className="flex items-center justify-center text-green-400">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-semibold text-foreground">Reset link sent</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please check your inbox and spam folder for the password reset email.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-red-400 text-xs font-medium"
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full bg-white text-black font-semibold hover:bg-neutral-200"
            >
              {isLoading ? "Sending link..." : "Send Reset Link"}
              {!isLoading && <ArrowRight size={15} />}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
