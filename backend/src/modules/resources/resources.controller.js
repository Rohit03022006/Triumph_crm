import { prisma } from "../../config/database.js";
import { asyncHandler } from "../../shared/asyncHandler.js";

// Generates generic CRUD handlers for simple lookup tables
const generateCrud = (modelName) => ({
  getAll: asyncHandler(async (req, res) => {
    const items = await prisma[modelName].findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ success: true, data: items });
  }),
  create: asyncHandler(async (req, res) => {
    const item = await prisma[modelName].create({ data: req.body });
    res.status(201).json({ success: true, data: item });
  }),
  update: asyncHandler(async (req, res) => {
    const item = await prisma[modelName].update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: item });
  }),
  delete: asyncHandler(async (req, res) => {
    await prisma[modelName].delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Deleted successfully" });
  })
});

export const leadSources = generateCrud('leadSource');
export const inventoryCategories = generateCrud('inventoryCategory');
export const pipelineStages = generateCrud('pipelineStage');
