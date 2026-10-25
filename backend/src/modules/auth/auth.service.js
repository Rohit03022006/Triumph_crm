import { prisma } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AppError } from "../../shared/AppError.js";

const SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Temporary fallback: if user has no password yet (migrated from better-auth), they need to be recreated or set
  if (!user.password) {
    throw new AppError("Please contact admin to reset your password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.emailVerified) {
    throw new AppError("Your account is pending admin approval.", 403);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  // Create session
  const sessionId = crypto.randomUUID();
  
  // Store user basic info in redis
  const sessionData = {
    userId: user.id,
    role: user.role
  };
  
  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), "EX", SESSION_EXPIRY);

  return { sessionId, user };
};

export const logoutUser = async (sessionId) => {
  if (sessionId) {
    await redis.del(`session:${sessionId}`);
  }
};
