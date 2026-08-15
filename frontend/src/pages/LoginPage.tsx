import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthSplitLayout, Input, PasswordInput, Button, Label } from "@/components/ui/auth-ui";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function LoginPage() {
  useAuthRedirect();
  const { login, user, authStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem("loginLockedUntil");
    if (stored) {
      const time = parseInt(stored, 10);
      if (time > Date.now()) {
        return time;
      }
      localStorage.removeItem("loginLockedUntil");
    }
    return null;
  });
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!lockedUntil) {
      setRemainingTime(0);
      return;
    }

    const diff = lockedUntil - Date.now();
    if (diff <= 0) {
      setLockedUntil(null);
      localStorage.removeItem("loginLockedUntil");
      return;
    }

    setRemainingTime(diff);

    const interval = setInterval(() => {
      const currentDiff = lockedUntil - Date.now();
      if (currentDiff <= 0) {
        setLockedUntil(null);
        localStorage.removeItem("loginLockedUntil");
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(currentDiff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "loginLockedUntil") {
        const value = e.newValue;
        if (value) {
          const time = parseInt(value, 10);
          if (time > Date.now()) {
            setLockedUntil(time);
          } else {
            setLockedUntil(null);
          }
        } else {
          setLockedUntil(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    if (totalSeconds <= 0) return "00:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isLocked = Boolean(lockedUntil && remainingTime > 0);

  const isOAuthReturn = sessionStorage.getItem("oauth_pending") === "true";

  if (user || isOAuthReturn || (authStatus === 'checking' && localStorage.getItem("isAuthenticated") === "true")) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setIsLoading(true);
    setError(null);

    try {
      await login(form.email, form.password);
      localStorage.removeItem("loginLockedUntil");
    } catch (err: any) {
      if (err.status === 429 && err.retryAfter) {
        const retryAfterSeconds = err.retryAfter;
        const lockTime = Date.now() + retryAfterSeconds * 1000;
        localStorage.setItem("loginLockedUntil", lockTime.toString());
        setLockedUntil(lockTime);
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      imageSrc="https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png"
      quoteText="Welcome Back! The journey continues."
      quoteAuthor="Lumora AI"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your email and password below to sign in</p>
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

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              disabled={isLocked}
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link
                to="/forgot-password"
                id="forgot-password-link"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              disabled={isLocked}
            />
          </div>

          <Button
            type="submit"
            disabled={isLocked || isLoading}
            className="mt-1 w-full bg-white text-black font-semibold hover:bg-neutral-200"
          >
            {isLoading ? "Signing in..." : isLocked ? `Try again in ${formatTime(remainingTime)}` : "Sign In"}
            {!isLocked && !isLoading && <ArrowRight size={15} />}
          </Button>
        </div>
      </form>

      <div className="relative text-center text-xs my-2 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
        <span className="relative z-10 bg-[#08090c] px-3 text-muted-foreground">Or continue with</span>
      </div>

      <GoogleAuthButton />

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don't have an account?{" "}
        <Link to="/signup" id="go-to-signup" className="font-semibold text-foreground underline underline-offset-4 hover:text-indigo-300 transition-colors">
          Sign up
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
