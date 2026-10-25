import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { getAllUsers, createUser, updateUser, deactivateUser, manuallyVerifyUser, deleteUser, bulkDeleteUsers, updateMe, updatePassword } from "./users.controller.js";

const router = Router();

// "Me" endpoint (Any authenticated user)
router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, data: req.user });
});
router.patch("/me", requireAuth, updateMe);
router.patch("/me/password", requireAuth, updatePassword);

// Admin endpoints
router.get("/", requireAuth, requireRole("ADMIN"), getAllUsers);
router.post("/", requireAuth, requireRole("ADMIN"), createUser);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateUser);
router.post("/:id/verify", requireAuth, requireRole("ADMIN"), manuallyVerifyUser);
router.delete("/bulk", requireAuth, requireRole("ADMIN"), bulkDeleteUsers);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteUser);

export default router;
