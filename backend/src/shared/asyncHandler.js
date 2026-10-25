/**
 * Wraps an async route handler so thrown errors/rejected promises
 * are forwarded to Express's error-handling middleware.
 * @param {Function} fn
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
