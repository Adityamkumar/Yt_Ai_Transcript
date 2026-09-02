import {
  authRequestRateLimiterConfig,
  type AuthRequestRateLimitAction,
} from "../config/authRequestRateLimiter.config.js";

interface RequestRateLimitState {
  requestCount: number;
  windowStartedAt: number;
  lockedUntil: number | null;
}

class AuthRequestRateLimiterService {
  private store = new Map<string, RequestRateLimitState>();

  private getKey(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): string {
    return `${action}:${identifier}`;
  }

  public isBlocked(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): boolean {
    const key = this.getKey(identifier, action);
    const state = this.store.get(key);

    if (!state) return false;

    const now = Date.now();

    // Still locked
    if (state.lockedUntil && now < state.lockedUntil) {
      return true;
    }

    // Lock expired
    if (state.lockedUntil && now >= state.lockedUntil) {
      this.store.delete(key);
      return false;
    }

    // Request window expired
    const config = authRequestRateLimiterConfig[action];

    if (now - state.windowStartedAt >= config.WINDOW_MS) {
      this.store.delete(key);
      return false;
    }

    return false;
  }

  public recordRequest(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): void {
    const key = this.getKey(identifier, action);
    const config = authRequestRateLimiterConfig[action];
    const now = Date.now();

    let state = this.store.get(key);

    // Create a new request window
    if (!state) {
      state = {
        requestCount: 0,
        windowStartedAt: now,
        lockedUntil: null,
      };

      this.store.set(key, state);
    }

    // Existing window has expired
    if (now - state.windowStartedAt >= config.WINDOW_MS) {
      state.requestCount = 0;
      state.windowStartedAt = now;
      state.lockedUntil = null;
    }

    // Already locked
    if (state.lockedUntil && now < state.lockedUntil) {
      return;
    }

    state.requestCount += 1;

    // Limit reached
    if (state.requestCount >= config.MAX_REQUESTS) {
      state.lockedUntil = now + config.LOCK_DURATION_MS;
    }
  }

  public getRetryAfter(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): number {
    const key = this.getKey(identifier, action);
    const state = this.store.get(key);

    if (state?.lockedUntil && state.lockedUntil > Date.now()) {
      return Math.ceil((state.lockedUntil - Date.now()) / 1000);
    }

    return 0;
  }
}

export const authRequestRateLimiterService =
  new AuthRequestRateLimiterService();
