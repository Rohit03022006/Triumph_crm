import { asyncHandler } from "../../shared/asyncHandler.js";
import { AppError } from "../../shared/AppError.js";
import { inventoryService } from "./inventory.service.js";
import { clearanceService } from "./clearance.service.js";
import {
  createPropertySchema,
  updatePropertySchema,
  queryPropertySchema,
  createUnitSchema,
  updateUnitSchema,
  tagUnitSchema
} from "./inventory.validation.js";

export const getMasterData = asyncHandler(async (req, res) => {
  const masterData = await inventoryService.getMasterData();
  res.json({ success: true, data: masterData });
});

export const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await inventoryService.getMetrics();
  res.json({ success: true, data: metrics });
});

export const listProperties = asyncHandler(async (req, res) => {
  const validatedQuery = queryPropertySchema.parse(req.query);
  const result = await inventoryService.listProperties(validatedQuery, req.user);
  res.json({ success: true, ...result });
});

export const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await inventoryService.getPropertyById(id, req.user);
  res.json({ success: true, data: property });
});

export const createProperty = asyncHandler(async (req, res) => {
  const validatedData = createPropertySchema.parse(req.body);
  const property = await inventoryService.createProperty(validatedData, req.user);
  res.status(201).json({ success: true, data: property, message: "Property created successfully" });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updatePropertySchema.parse(req.body);
  const updated = await inventoryService.updateProperty(id, validatedData, req.user);
  res.json({ success: true, data: updated, message: "Property updated successfully" });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await inventoryService.deleteProperty(id, req.user);
  res.json({ success: true, message: "Property deleted successfully" });
});

export const approveProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await inventoryService.approveProperty(id, req.user);
  res.json({
    success: true,
    data: property,
    message: "Property approved successfully and marked as AVAILABLE"
  });
});

export const rejectProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const property = await inventoryService.rejectProperty(id, reason, req.user);
  res.json({
    success: true,
    data: property,
    message: "Property review status updated with feedback"
  });
});

// Units
export const listUnits = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const units = await inventoryService.listUnits(propertyId);
  res.json({ success: true, data: units });
});

export const createUnit = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const validated = createUnitSchema.parse(req.body);
  const unit = await inventoryService.addUnit(propertyId, validated);
  res.status(201).json({ success: true, data: unit, message: "Unit added successfully" });
});

export const updateUnit = asyncHandler(async (req, res) => {
  const { unitId } = req.params;
  const validated = updateUnitSchema.parse(req.body);
  const unit = await inventoryService.updateUnit(unitId, validated);
  res.json({ success: true, data: unit, message: "Unit updated successfully" });
});

export const deleteUnit = asyncHandler(async (req, res) => {
  const { unitId } = req.params;
  await inventoryService.deleteUnit(unitId);
  res.json({ success: true, message: "Unit removed successfully" });
});

export const tagUnitToLead = asyncHandler(async (req, res) => {
  const { unitId } = req.params;
  const { leadId } = tagUnitSchema.parse(req.body);
  const unit = await inventoryService.tagUnitToLead(unitId, leadId, req.user);
  res.json({ success: true, data: unit, message: "Unit tagged to lead successfully" });
});

// Audit Logs
export const listAuditLogs = asyncHandler(async (req, res) => {
  const result = await inventoryService.listAuditLogs(req.query, req.user);
  res.json({ success: true, ...result });
});

export const getPropertyAuditLogs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const logs = await inventoryService.getPropertyAuditLogs(id, req.user);
  res.json({ success: true, data: logs });
});

// Media upload handler
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files && !req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const files = req.files || [req.file];
  const uploaded = files.map((file) => ({
    name: file.originalname,
    type: file.mimetype.startsWith("image/") ? "IMAGE" : file.mimetype === "application/pdf" ? "DOCUMENT" : "OTHER",
    url: `/uploads/${file.filename}`,
    size: file.size,
    mimeType: file.mimetype
  }));

  res.status(201).json({
    success: true,
    data: uploaded.length === 1 ? uploaded[0] : uploaded,
    message: "File uploaded successfully"
  });
});

// Clearance requests
export const submitClearanceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await clearanceService.submitRequest(id, req.body, req.user);
  res.status(201).json({ success: true, data, message: "Clearance request submitted" });
});

export const listClearanceRequests = asyncHandler(async (req, res) => {
  const data = await clearanceService.listRequests(req.user, req.query);
  res.json({ success: true, data });
});

export const getPropertyClearanceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await clearanceService.getRequestByPropertyId(id, req.user);
  res.json({ success: true, data });
});

export const decideClearanceRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await clearanceService.decideRequest(id, req.body, req.user);
  res.json({ success: true, data, message: "Clearance request updated" });
});


