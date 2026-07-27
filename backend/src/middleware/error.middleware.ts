import type { ErrorRequestHandler } from "express";

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

  console.error("\n================= ERROR =================");
  console.error(`Time       : ${new Date().toISOString()}`);
  console.error(`Method     : ${req.method}`);
  console.error(`Route      : ${req.originalUrl}`);
  console.error(`IP         : ${req.ip}`);
  console.error(`User Agent : ${req.get("user-agent")}`);

  if (req.user?._id) {
    console.error(`User ID    : ${req.user._id}`);
  }

  console.error(`Status     : ${statusCode}`);
  console.error(`Message    : ${message}`);

  if (err.stack) {
    console.error("\nStack Trace:");
    console.error(err.stack);
  }

  console.error("=========================================\n");

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
};