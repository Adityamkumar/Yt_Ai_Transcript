export const authRequestRateLimiterConfig  = {
  forgotPassword: {
    MAX_REQUESTS: 3,
    WINDOW_MS: 60 * 60 * 1000,
    LOCK_DURATION_MS: 60 * 60 * 1000,
  },
};

export type AuthRequestRateLimitAction = "forgotPassword"

