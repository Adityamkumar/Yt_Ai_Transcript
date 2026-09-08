import { useCallback, useEffect, useState } from "react";

export type ResendState = "idle" | "loading" | "cooldown" | "hourly_limit";

type RateLimitError = {
  status?: number;
  reason?: "cooldown" | "hourly_limit";
  retryAfter?: number;
};

export function useResendEmailVerificationRateLimit(initialCooldownUntil?: number) {
  const [resendState, setResendState] = useState<ResendState>(
    initialCooldownUntil && initialCooldownUntil > Date.now() ? "cooldown" : "idle",
  );
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(
    initialCooldownUntil && initialCooldownUntil > Date.now() ? initialCooldownUntil : null,
  );
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) return;

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(seconds);
      if (seconds === 0) {
        setCooldownUntil(null);
        setResendState("idle");
      }
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownUntil]);

  const startCooldown = useCallback((seconds: number) => {
    setResendState("cooldown");
    setCooldownUntil(Date.now() + Math.max(0, seconds) * 1000);
  }, []);

  const handleRateLimitError = useCallback((error: unknown) => {
    const rateLimitError = error as RateLimitError;
    if (rateLimitError.status !== 429) return false;

    if (rateLimitError.reason === "cooldown" && typeof rateLimitError.retryAfter === "number") {
      startCooldown(rateLimitError.retryAfter);
      return true;
    }

    if (rateLimitError.reason === "hourly_limit") {
      setCooldownUntil(null);
      setResendState("hourly_limit");
      return true;
    }

    return false;
  }, [startCooldown]);

  return {
    resendState,
    cooldownSeconds,
    isDisabled: resendState !== "idle",
    setLoading: () => setResendState("loading"),
    reset: () => setResendState("idle"),
    startCooldown,
    handleRateLimitError,
  };
}
