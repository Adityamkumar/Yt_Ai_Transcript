import {
  authRateLimiterConfig,
  type AuthRateLimitAction,
} from "../config/authRateLimiter.config.js";

interface IpRateLimitState {
  failedAttempts: number;
  lockedUntil: number | null;
}

class AuthRateLimiterService {
  private store = new Map<string, IpRateLimitState>();

  private getKey(ip: string, action: AuthRateLimitAction): string {
    return `${action}:${ip}`;
  }

  public isBlocked(ip: string, action: AuthRateLimitAction): boolean {
    const key = this.getKey(ip, action);
    const state = this.store.get(key);
    if (!state) return false;

    if (state.lockedUntil) {
      if (Date.now() < state.lockedUntil) {
        return true;
      }
      this.store.delete(ip);
    }
    return false;
  }

  public recordFailure(ip: string, action: AuthRateLimitAction): void {
    let key = this.getKey(ip, action);
    let state = this.store.get(key);

    if (state && state.lockedUntil && Date.now() >= state.lockedUntil) {
      this.store.delete(key);
      state = undefined;
    }

    if (!state) {
      state = {
        failedAttempts: 0,
        lockedUntil: null,
      };
      this.store.set(key, state);
    }

    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      return;
    }

    state.failedAttempts += 1;

    if (state.failedAttempts >= authRateLimiterConfig.MAX_FAILED_ATTEMPTS) {
      state.lockedUntil = Date.now() + authRateLimiterConfig.LOCK_DURATION_MS;
    }
  }

  public reset(ip: string, action: AuthRateLimitAction): void {
    const key = this.getKey(ip, action);
    this.store.delete(key);
  }

  public getRetryAfter(ip: string, action: AuthRateLimitAction): number {
    const key = this.getKey(ip, action);
    const state = this.store.get(key);
    if (state && state.lockedUntil && state.lockedUntil > Date.now()) {
      return Math.ceil((state.lockedUntil - Date.now()) / 1000);
    }
    return 0;
  }
}

export const authRateLimiterService = new AuthRateLimiterService();
