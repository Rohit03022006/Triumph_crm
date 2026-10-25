import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { leadSources, inventoryCategories, pipelineStages } from "./resources.controller.js";

const router = Router();

// Only ADMIN can manage resources
router.use(requireAuth, requireRole("ADMIN"));

const mapCrudRoutes = (path, controller) => {
  router.get(path, controller.getAll);
  router.post(path, controller.create);
  router.patch(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.delete);
};

mapCrudRoutes('/lead-sources', leadSources);
mapCrudRoutes('/inventory-categories', inventoryCategories);
mapCrudRoutes('/pipeline-stages', pipelineStages);

export default router;
