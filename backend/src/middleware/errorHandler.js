
import { AppError } from "../shared/AppError.js";
import { env } from "../config/env.js";

/**
 * Centralized error-handling middleware — must be registered LAST in app.js.
 */
export function errorHandler(err, req, res, next) {
  let { statusCode = 500, message, code = "INTERNAL_ERROR" } = err;

  if (!(err instanceof AppError)) {
    // Handle Zod Validation Errors
    if (err.name === "ZodError" || Array.isArray(err.issues)) {
      statusCode = 400;
      message = err.issues?.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ") || "Validation error";
      code = "VALIDATION_ERROR";
    } else if (err.code === "P2002") {
      // Handle Prisma Unique Constraint Violation
      statusCode = 409;
      message = "A record with this value already exists.";
      code = "CONFLICT";
    } else if (err.code === "P2025") {
      // Handle Prisma Record Not Found
      statusCode = 404;
      message = "Requested record not found.";
      code = "NOT_FOUND";
    } else if (err.name === "PrismaClientValidationError") {
      // Handle Prisma Validation Error
      statusCode = 400;
      message = "Invalid property data format submitted.";
      code = "VALIDATION_ERROR";
    } else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      // Handle Malformed JSON body
      statusCode = 400;
      message = "Malformed JSON payload.";
      code = "BAD_REQUEST";
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
