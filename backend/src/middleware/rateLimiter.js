import rateLimit from "express-rate-limit";

// Lock account (IP based) after 5 failed attempts for 5 minutes
export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 5 minutes)
  message: {
    message: "Too many login attempts. Your account has been temporarily locked for 5 minutes.",
    code: "ACCOUNT_LOCKED"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true // If login is successful, don't count it against the limit
});

export const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per window
  message: {
    message: "Too many OTP requests. Please try again after 5 minutes.",
    code: "TOO_MANY_REQUESTS"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
