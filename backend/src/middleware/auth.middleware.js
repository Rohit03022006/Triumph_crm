import { redis } from "../config/redis.js";
import { prisma } from "../config/database.js";
import { AppError } from "../shared/AppError.js";
import { asyncHandler } from "../shared/asyncHandler.js";

const COOKIE_NAME = "triumph_session";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const getCookie = (name, cookieStr) => {
    if (!cookieStr) return null;
    const match = cookieStr.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  };
  const sessionId = getCookie(COOKIE_NAME, req.headers.cookie);
  if (!sessionId) {
    throw new AppError("Not authenticated", 401, "UNAUTHENTICATED");
  }

  const sessionDataStr = await redis.get(`session:${sessionId}`);
  if (!sessionDataStr) {
    throw new AppError("Session expired", 401, "UNAUTHENTICATED");
  }

  const sessionData = JSON.parse(sessionDataStr);
  const user = await prisma.user.findUnique({ where: { id: sessionData.userId } });

  if (!user) {
    throw new AppError("User not found", 401, "UNAUTHENTICATED");
  }

  if (!user.isActive) {
    throw new AppError("Account deactivated", 403, "ACCOUNT_DEACTIVATED");
  }

  if (!user.emailVerified) {
    throw new AppError("Your account is pending admin approval.", 403, "PENDING_APPROVAL");
  }

  // Remove password before attaching
  const { password: _, ...userWithoutPassword } = user;
  req.user = userWithoutPassword;
  
  // Extend session
  await redis.expire(`session:${sessionId}`, 7 * 24 * 60 * 60);
  
  next();
});

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401, "UNAUTHENTICATED"));
    }
    if (req.user.role !== role) {
      return next(new AppError(`Requires ${role} role`, 403, "FORBIDDEN"));
    }
    next();
  };
};
