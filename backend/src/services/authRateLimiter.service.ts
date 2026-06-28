import { authRateLimiterConfig } from "../config/authRateLimiter.config.js";

interface IpRateLimitState {
  failedAttempts: number;
  lockedUntil: number | null;
}

class AuthRateLimiterService {
  private store = new Map<string, IpRateLimitState>();

  public isBlocked(ip: string): boolean {
    const state = this.store.get(ip);
    if (!state) return false;

    if (state.lockedUntil) {
      if (Date.now() < state.lockedUntil) {
        return true;
      }
      // Lock has expired, clean up memory
      this.store.delete(ip);
    }
    return false;
  }

  public recordFailure(ip: string): void {
    let state = this.store.get(ip);

    if (state && state.lockedUntil && Date.now() >= state.lockedUntil) {
      // Stale lock has expired, clean up memory before starting new count
      this.store.delete(ip);
      state = undefined;
    }

    if (!state) {
      state = {
        failedAttempts: 0,
        lockedUntil: null,
      };
      this.store.set(ip, state);
    }

    // Do not continue incrementing counter while already locked
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      return;
    }

    state.failedAttempts += 1;

    if (state.failedAttempts >= authRateLimiterConfig.MAX_FAILED_ATTEMPTS) {
      state.lockedUntil = Date.now() + authRateLimiterConfig.LOCK_DURATION_MS;
    }
  }

  public reset(ip: string): void {
    this.store.delete(ip);
  }

  public getRetryAfter(ip: string): number {
    const state = this.store.get(ip);
    if (state && state.lockedUntil && state.lockedUntil > Date.now()) {
      return Math.ceil((state.lockedUntil - Date.now()) / 1000);
    }
    return 0;
  }
}

export const authRateLimiterService = new AuthRateLimiterService();
