import type { ErrorRequestHandler } from "express";
import logger from "../lib/logger.js";
import { ApiError } from "../utils/ApiError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next
) => {
  const isApiError = err instanceof ApiError;

  const statusCode = isApiError ? err.statusCode : 500;

  const message = isApiError
    ? err.message
    : "Something went wrong. Please try again";
  logger.error(
    {
      err,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?._id,
      statusCode,
    },
    isApiError ? err.message : "Unhandled internal server error"
  );

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(isApiError && err.errors ? { errors: err.errors } : {}),
    ...(isApiError && typeof err.code === "string"
      ? { code: err.code }
      : {}),
  });
};