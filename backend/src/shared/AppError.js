/**
 * Standard application error — every thrown error in the app should be
 * (or wrap) an AppError, so the error middleware can respond consistently.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} [code] - machine-readable error code, e.g. 'LEAD_NOT_FOUND'
   */
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
