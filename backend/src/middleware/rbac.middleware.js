import { AppError } from "../shared/AppError.js";

/**
 * Restricts a route to specific roles.
 * @param {('ADMIN'|'EXECUTIVE')[]} allowedRoles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401, "UNAUTHENTICATED"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
    }
    next();
  };
}

// Usage examples (used in later modules):
// router.get('/admin-only', requireAuth, requireRole('ADMIN'), handler)
// router.get('/any-logged-in-user', requireAuth, handler)
