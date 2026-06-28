import type { Request, Response, NextFunction } from "express";
import { authRateLimiterService } from "../services/authRateLimiter.service.js";

export const authRateLimiterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || "";

  if (authRateLimiterService.isBlocked(ip)) {
    const retryAfter = authRateLimiterService.getRetryAfter(ip);
    res.status(429).json({
      success: false,
      message: "Too many failed login attempts. Please try again later.",
      retryAfter,
    });
    return;
  }

  next();
};
