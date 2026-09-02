import { signupRateLimiterConfig } from "../config/signupRateLimiterConfig.js";

interface SignupRateLimitState {
  failedAttempts: number;
  failedWindowStartedAt: number;
  failedLockedUntil: number | null;

  successfulSignups: number;
  successWindowStartedAt: number;
  successLockedUntil: number | null;
}

class SignupRateLimiterService {
  private store = new Map<string, SignupRateLimitState>();

  private getState(ip: string): SignupRateLimitState {
    let state = this.store.get(ip);

    if (!state) {
      const now = Date.now();

      state = {
        failedAttempts: 0,
        failedWindowStartedAt: now,
        failedLockedUntil: null,

        successfulSignups: 0,
        successWindowStartedAt: now,
        successLockedUntil: null,
      };

      this.store.set(ip, state);
    }

    return state;
  }

 
  public isFailedAttemptBlocked(ip: string): boolean {
    const state = this.store.get(ip);

    if (!state) return false;

    const now = Date.now();

    // Still locked
    if (
      state.failedLockedUntil &&
      now < state.failedLockedUntil
    ) {
      return true;
    }

    // Lock expired
    if (
      state.failedLockedUntil &&
      now >= state.failedLockedUntil
    ) {
      state.failedAttempts = 0;
      state.failedWindowStartedAt = now;
      state.failedLockedUntil = null;
    }

    // Failed-attempt window expired
    if (
      now - state.failedWindowStartedAt >=
      signupRateLimiterConfig.FAILED_WINDOW_MS
    ) {
      state.failedAttempts = 0;
      state.failedWindowStartedAt = now;
    }

    return false;
  }

  public recordFailedAttempt(ip: string): void {
    const state = this.getState(ip);
    const now = Date.now();

    // Reset expired window
    if (
      now - state.failedWindowStartedAt >=
      signupRateLimiterConfig.FAILED_WINDOW_MS
    ) {
      state.failedAttempts = 0;
      state.failedWindowStartedAt = now;
      state.failedLockedUntil = null;
    }

    // Already locked
    if (
      state.failedLockedUntil &&
      now < state.failedLockedUntil
    ) {
      return;
    }

    state.failedAttempts += 1;

    // Failed-attempt limit reached
    if (
      state.failedAttempts >=
      signupRateLimiterConfig.MAX_FAILED_ATTEMPTS
    ) {
      state.failedLockedUntil =
        now + signupRateLimiterConfig.FAILED_LOCK_DURATION_MS;
    }
  }

  public getFailedRetryAfter(ip: string): number {
    const state = this.store.get(ip);

    if (
      state?.failedLockedUntil &&
      state.failedLockedUntil > Date.now()
    ) {
      return Math.ceil(
        (state.failedLockedUntil - Date.now()) / 1000,
      );
    }

    return 0;
  }


  public isSuccessfulSignupBlocked(ip: string): boolean {
    const state = this.store.get(ip);

    if (!state) return false;

    const now = Date.now();

    // Still locked
    if (
      state.successLockedUntil &&
      now < state.successLockedUntil
    ) {
      return true;
    }

    // Lock expired
    if (
      state.successLockedUntil &&
      now >= state.successLockedUntil
    ) {
      state.successfulSignups = 0;
      state.successWindowStartedAt = now;
      state.successLockedUntil = null;
    }

    // Success window expired
    if (
      now - state.successWindowStartedAt >=
      signupRateLimiterConfig.SUCCESS_WINDOW_MS
    ) {
      state.successfulSignups = 0;
      state.successWindowStartedAt = now;
    }

    return false;
  }

  public recordSuccessfulSignup(ip: string): void {
    const state = this.getState(ip);
    const now = Date.now();

    // Reset expired window
    if (
      now - state.successWindowStartedAt >=
      signupRateLimiterConfig.SUCCESS_WINDOW_MS
    ) {
      state.successfulSignups = 0;
      state.successWindowStartedAt = now;
      state.successLockedUntil = null;
    }

    // Already locked
    if (
      state.successLockedUntil &&
      now < state.successLockedUntil
    ) {
      return;
    }

    state.successfulSignups += 1;

    // Successful signup limit reached
    if (
      state.successfulSignups >=
      signupRateLimiterConfig.MAX_SUCCESSFUL_SIGNUPS
    ) {
      state.successLockedUntil =
        now + signupRateLimiterConfig.SUCCESS_LOCK_DURATION_MS;
    }
  }

  public getSuccessfulRetryAfter(ip: string): number {
    const state = this.store.get(ip);

    if (
      state?.successLockedUntil &&
      state.successLockedUntil > Date.now()
    ) {
      return Math.ceil(
        (state.successLockedUntil - Date.now()) / 1000,
      );
    }

    return 0;
  }
}

export const signupRateLimiterService =
  new SignupRateLimiterService();