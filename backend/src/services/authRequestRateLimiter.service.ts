import {
  authRequestRateLimiterConfig,
  type AuthRequestRateLimitAction,
} from "../config/authRequestRateLimiter.config.js";

interface RequestRateLimitState {
  requestCount: number;
  windowStartedAt: number;
  lockedUntil: number | null;
  lastRequestAt: number | null;
}

export type RateLimitBlockReason =
  | "cooldown"
  | "hourly_limit";

export interface RateLimitStatus {
  blocked: boolean;
  reason: RateLimitBlockReason | null;
  retryAfter: number;
}

class AuthRequestRateLimiterService {
  private store = new Map<
    string,
    RequestRateLimitState
  >();

  private getKey(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): string {
    return `${action}:${identifier}`;
  }

  public getRateLimitStatus(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): RateLimitStatus {
    const key = this.getKey(identifier, action);
    const state = this.store.get(key);

    if (!state) {
      return {
        blocked: false,
        reason: null,
        retryAfter: 0,
      };
    }

    const now = Date.now();
    const config = authRequestRateLimiterConfig[action];

    if (
      state.lockedUntil !== null &&
      now < state.lockedUntil
    ) {
      return {
        blocked: true,
        reason: "hourly_limit",
        retryAfter: Math.ceil(
          (state.lockedUntil - now) / 1000,
        ),
      };
    }

    if (
      state.lockedUntil !== null &&
      now >= state.lockedUntil
    ) {
      this.store.delete(key);

      return {
        blocked: false,
        reason: null,
        retryAfter: 0,
      };
    }

    if (
      now - state.windowStartedAt >= config.windowMs
    ) {
      this.store.delete(key);

      return {
        blocked: false,
        reason: null,
        retryAfter: 0,
      };
    }

    if (
      config.cooldownMs > 0 &&
      state.lastRequestAt !== null
    ) {
      const cooldownEndsAt =
        state.lastRequestAt + config.cooldownMs;

      if (now < cooldownEndsAt) {
        return {
          blocked: true,
          reason: "cooldown",
          retryAfter: Math.ceil(
            (cooldownEndsAt - now) / 1000,
          ),
        };
      }
    }

    return {
      blocked: false,
      reason: null,
      retryAfter: 0,
    };
  }

  public isBlocked(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): boolean {
    return this.getRateLimitStatus(
      identifier,
      action,
    ).blocked;
  }

  public recordRequest(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): void {
    const key = this.getKey(identifier, action);
    const config = authRequestRateLimiterConfig[action];
    const now = Date.now();

    let state = this.store.get(key);

  
    if (!state) {
      state = {
        requestCount: 0,
        windowStartedAt: now,
        lockedUntil: null,
        lastRequestAt: null,
      };

      this.store.set(key, state);
    }


    if (
      now - state.windowStartedAt >= config.windowMs
    ) {
      state.requestCount = 0;
      state.windowStartedAt = now;
      state.lockedUntil = null;
      state.lastRequestAt = null;
    }

    if (
      state.lockedUntil !== null &&
      now < state.lockedUntil
    ) {
      return;
    }

    state.requestCount += 1;
    state.lastRequestAt = now;

  
    if (
      state.requestCount >= config.maxRequests
    ) {
      state.lockedUntil =
        now + config.lockDurationMs;
    }
  }

  public getRetryAfter(
    identifier: string,
    action: AuthRequestRateLimitAction,
  ): number {
    return this.getRateLimitStatus(
      identifier,
      action,
    ).retryAfter;
  }
}

export const authRequestRateLimiterService =
  new AuthRequestRateLimiterService();