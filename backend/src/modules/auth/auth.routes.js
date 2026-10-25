import { Router } from "express";
import { login, logout, getMe } from "./auth.controller.js";
import { loginLockoutGuard } from "../../middleware/loginLockout.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginLockoutGuard, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
