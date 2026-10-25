import { asyncHandler } from "../../shared/asyncHandler.js";
import { loginSchema } from "./auth.validation.js";
import { loginUser, logoutUser } from "./auth.service.js";
import { AppError } from "../../shared/AppError.js";

const COOKIE_NAME = "triumph_session";

export const login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.errors[0].message, 400);
  }

  const { email, password } = result.data;
  
  const { sessionId, user } = await loginUser(email, password);

  // Set HTTP Only cookie
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // or strict depending on your needs
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
});

export const logout = asyncHandler(async (req, res) => {
  const getCookie = (name, cookieStr) => {
    if (!cookieStr) return null;
    const match = cookieStr.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  };
  const sessionId = getCookie(COOKIE_NAME, req.headers.cookie);
  await logoutUser(sessionId);

  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req, res) => {
  // If the requireAuth middleware passes, req.user will be attached
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const { password: _, ...userWithoutPassword } = req.user;
  res.json({
    success: true,
    data: userWithoutPassword
  });
});
