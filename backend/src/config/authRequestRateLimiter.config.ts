export const authRequestRateLimiterConfig = {
  forgotPassword: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    lockDurationMs: 60 * 60 * 1000,
    cooldownMs: 0,
  },

  emailVerification: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    lockDurationMs: 60 * 60 * 1000,
    cooldownMs: 60 * 1000,
  },
};

export type AuthRequestRateLimitAction =
  | "forgotPassword"
  | "emailVerification";