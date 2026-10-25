import { redis } from "../config/redis.js";
import { AppError } from "../shared/AppError.js";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 5 * 60;

/**
 * Blocks sign-in if the account is locked; tracks failures after Better Auth responds.
 */
export async function loginLockoutGuard(req, res, next) {
  const email = req.body?.email;
  if (!email) return next();

  const lockKey = `login-lock:${email}`;
  const isLocked = await redis.get(lockKey);
  if (isLocked) {
    return next(
      new AppError(
        "Too many failed attempts. Account locked for 5 minutes.",
        429,
        "ACCOUNT_LOCKED",
      ),
    );
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 400) {
      trackFailedAttempt(email).catch(console.error);
    } else {
      redis.del(`login-fail-count:${email}`).catch(console.error);
    }
    return originalJson(body);
  };

  next();
}

async function trackFailedAttempt(email) {
  const countKey = `login-fail-count:${email}`;
  const count = await redis.incr(countKey);
  if (count === 1) await redis.expire(countKey, LOCK_DURATION_SECONDS);
  if (count >= MAX_ATTEMPTS) {
    await redis.set(`login-lock:${email}`, "1", "EX", LOCK_DURATION_SECONDS);
  }
}
