import type { ErrorRequestHandler } from "express";
import logger from "../lib/logger.js";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  const statusCode =
    typeof err?.statusCode === "number" ? err.statusCode : 500;

  const message =
    err instanceof Error ? err.message : "Internal Server Error";

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
    message
  );

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
};