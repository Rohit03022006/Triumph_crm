import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { importLeads } from "./leads.controller.js";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.use(requireAuth);

router.post("/import", upload.single("file"), importLeads);

export default router;
