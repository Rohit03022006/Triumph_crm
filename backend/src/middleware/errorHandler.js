
import { AppError } from "../shared/AppError.js";
import { env } from "../config/env.js";

/**
 * Centralized error-handling middleware — must be registered LAST in app.js.
 */
export function errorHandler(err, req, res, next) {
  let { statusCode = 500, message, code = "INTERNAL_ERROR" } = err;

  if (!(err instanceof AppError)) {
    // Handle Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
      statusCode = 409;
      message = "A record with this value already exists.";
      code = "CONFLICT";
    } else {
      console.error("Unexpected error:", err);
      statusCode = 500;
      message = "Something went wrong";
      code = "INTERNAL_ERROR";
    }
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message },
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.originalUrl} not found` },
  });
}
