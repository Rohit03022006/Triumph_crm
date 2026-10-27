import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import {
  getMasterData,
  getMetrics,
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  listUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  tagUnitToLead,
  uploadMedia,
  listAuditLogs,
  getPropertyAuditLogs
} from "./inventory.controller.js";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `inv-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB
});

const router = Router();

// All inventory endpoints require authentication
router.use(requireAuth);

// Master Data & Metrics
router.get("/master-data", getMasterData);
router.get("/metrics", getMetrics);

// File uploads
router.post("/upload", upload.array("files", 10), uploadMedia);

// Audit Logs (placed before /:id to prevent matching as id)
router.get("/logs", listAuditLogs);

// Units for Booking properties (placed before /:id routes)
router.patch("/units/:unitId", updateUnit);
router.delete("/units/:unitId", requireRole("ADMIN"), deleteUnit);
router.post("/units/:unitId/tag", tagUnitToLead);

// Properties CRUD
router.get("/", listProperties);
router.post("/", createProperty);
router.get("/:propertyId/units", listUnits);
router.post("/:propertyId/units", createUnit);
router.get("/:id", getPropertyById);
router.get("/:id/logs", getPropertyAuditLogs);
router.patch("/:id", updateProperty);
router.post("/:id/approve", requireRole("ADMIN"), approveProperty);
router.post("/:id/reject", requireRole("ADMIN"), rejectProperty);
router.delete("/:id", requireRole("ADMIN"), deleteProperty);

export default router;

