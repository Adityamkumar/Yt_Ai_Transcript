import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthSplitLayout, Input, PasswordInput, Button, Label } from "@/components/ui/auth-ui";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const isOAuthReturn = sessionStorage.getItem("oauth_pending") === "true";

  if (user || isOAuthReturn || (loading && localStorage.getItem("isAuthenticated") === "true")) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const strength = passwordStrengthLabel(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <AuthSplitLayout
      imageSrc="https://i.ibb.co/HTZ6DPsS/original-33b8479c324a5448d6145b3cad7c51e7-removebg-preview.png"
      quoteText="Create an account. A new chapter awaits."
      quoteAuthor="Lumora AI"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to sign up</p>
        </div>

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

        <div className="grid gap-3.5">
          <div className="grid gap-1.5">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="m@example.com"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <PasswordInput
              id="signup-password"
              placeholder="Create a password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />

            {form.password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1 mt-1"
              >
                <div className="h-1 rounded-full overflow-hidden bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                    transition={{ duration: 0.3 }}
                    style={{ background: strength.color }}
                  />
                </div>
                <span className="text-[11px] font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </motion.div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-white text-black font-semibold hover:bg-neutral-200"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
            {!isLoading && <ArrowRight size={15} />}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed mt-1">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </form>

      <div className="relative text-center text-xs my-2 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
        <span className="relative z-10 bg-[#08090c] px-3 text-muted-foreground">Or continue with</span>
      </div>

      <GoogleAuthButton label="Continue with Google" />

      <div className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link to="/login" id="go-to-login" className="font-semibold text-foreground underline underline-offset-4 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
