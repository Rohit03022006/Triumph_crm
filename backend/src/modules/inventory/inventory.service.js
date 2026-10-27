import { propertyRepository } from "./inventory.repository.js";
import { AppError } from "../../shared/AppError.js";
import { prisma } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import {
  CATEGORIES,
  SUBCATEGORIES,
  USP_GROUPS,
  AMENITIES_GROUPS,
  DEAL_TYPES,
  PROPERTY_STATUSES,
  BHK_OPTIONS,
  FACING_DIRECTIONS,
  AVAILABLE_FOR_OPTIONS,
  MAINTENANCE_FREQUENCIES,
  AREA_TYPES,
  AREA_UNITS,
  CITIES,
  SORT_OPTIONS
} from "./inventory.constants.js";

// Cache Helpers
async function getFromCache(key) {
  try {
    if (!redis || redis.status !== "ready") return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setInCache(key, value, ttlSeconds = 120) {
  try {
    if (!redis || redis.status !== "ready") return;
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Non-fatal cache write error
  }
}

async function invalidateInventoryCache(propertyId = null) {
  try {
    if (!redis || redis.status !== "ready") return;
    if (typeof redis.scanStream === "function") {
      const stream = redis.scanStream({ match: "inventory:list:*", count: 100 });
      const keysToDelete = [];
      for await (const resultKeys of stream) {
        if (resultKeys.length) keysToDelete.push(...resultKeys);
      }
      keysToDelete.push("inventory:metrics");
      keysToDelete.push("inventory:master_data");
      if (propertyId) {
        const propStream = redis.scanStream({ match: `inventory:property:${propertyId}:*`, count: 10 });
        for await (const pKeys of propStream) {
          if (pKeys.length) keysToDelete.push(...pKeys);
        }
      }
      const uniqueKeys = [...new Set(keysToDelete)].filter(Boolean);
      if (uniqueKeys.length > 0 && typeof redis.del === "function") {
        await redis.del(...uniqueKeys);
      }
    } else if (typeof redis.del === "function") {
      await redis.del("inventory:metrics", "inventory:master_data");
    }
  } catch {
    // Non-fatal cache invalidation error
  }
}

import { logsService, calculatePropertyDiff } from "../logs/logs.service.js";
export { calculatePropertyDiff };

export const inventoryService = {
  async createProperty(data, user) {
    const isExecutive = user?.role === "EXECUTIVE";
    // If executive creates property, ALWAYS enforce UNDER_REVIEW for admin approval
    const propertyPayload = {
      ...data,
      status: isExecutive ? "UNDER_REVIEW" : (data.status || "AVAILABLE")
    };

    // If developerId is provided, fill developerName
    if (data.developerId && !data.developerName) {
      const dev = await prisma.developer.findUnique({ where: { id: data.developerId } });
      if (dev) {
        propertyPayload.developerName = dev.name;
      }
    }

    const created = await propertyRepository.create(propertyPayload, user?.id);
    await invalidateInventoryCache();

    // Delegate audit logging to separated logs module
    await logsService.logPropertyCreate(created, user);

    return created;
  },

  async getPropertyById(id, user) {
    const roleKey = user?.role || "GUEST";
    const cacheKey = `inventory:property:${id}:${roleKey}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    let createdByUser = null;
    if (property.createdById) {
      try {
        createdByUser = await prisma.user.findUnique({
          where: { id: property.createdById },
          select: { id: true, name: true, email: true, role: true }
        });
      } catch (e) {
        console.error("Failed to fetch property creator:", e);
      }
    }

    // Mask seller info for executives
    let result = {
      ...property,
      createdByUser,
    };
    if (user?.role !== "ADMIN") {
      result = {
        ...result,
        sellerName: property.sellerName ? "Hidden (Admin Only)" : null,
        sellerPhone: property.sellerPhone ? "Hidden (Admin Only)" : null,
      };
    }

    await setInCache(cacheKey, result, 300);
    return result;
  },

  async listProperties(queryParams, user) {
    const roleKey = user?.role || "GUEST";
    const cacheKey = `inventory:list:${roleKey}:${JSON.stringify(queryParams)}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;
    const {
      page = 1,
      limit = 12,
      search,
      dealType,
      category,
      subcategory,
      city,
      locality,
      status,
      developerId,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bhk,
      projectStatus,
      availabilityStatus,
      facingDirection,
      dateAdded,
      startDate,
      endDate,
      sortBy = "newest"
    } = queryParams;

    const where = {};

    // Deal type filter
    if (dealType) {
      where.dealType = dealType;
    }

    // Search query
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { locality: { contains: term, mode: "insensitive" } },
        { city: { contains: term, mode: "insensitive" } },
        { projectSociety: { contains: term, mode: "insensitive" } },
        { developerName: { contains: term, mode: "insensitive" } },
        { subcategory: { contains: term, mode: "insensitive" } }
      ];
    }

    // Category & Subcategory
    if (category) {
      if (category === "Other") {
        where.category = { notIn: ["Residential", "Commercial"] };
      } else {
        where.category = category;
      }
    }
    if (subcategory) where.subcategory = subcategory;

    // Location
    if (city) {
      if (city === "Other") {
        where.city = { notIn: ["Gurgaon", "Delhi", "Kasauli", "Goa"] };
      } else {
        where.city = { contains: city, mode: "insensitive" };
      }
    }
    if (locality) where.locality = { contains: locality, mode: "insensitive" };

    // Status
    if (status) {
      where.status = status;
    }

    // Developer
    if (developerId) where.developerId = developerId;

    // BHK
    if (bhk) {
      where.bhk = { has: bhk };
    }

    // Status specifics
    if (projectStatus) where.projectStatus = projectStatus;
    if (availabilityStatus) where.availabilityStatus = availabilityStatus;
    if (facingDirection) where.facingDirection = facingDirection;

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceField = dealType === "LEASE" ? "monthlyRent" : "price";
      where[priceField] = {};
      if (minPrice !== undefined) where[priceField].gte = Number(minPrice);
      if (maxPrice !== undefined) where[priceField].lte = Number(maxPrice);
    }

    // Area range
    if (minArea !== undefined || maxArea !== undefined) {
      where.primaryArea = {};
      if (minArea !== undefined) where.primaryArea.gte = Number(minArea);
      if (maxArea !== undefined) where.primaryArea.lte = Number(maxArea);
    }

    // Date Added
    if (dateAdded) {
      const now = new Date();
      if (dateAdded === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfDay };
      } else if (dateAdded === "7days") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: sevenDaysAgo };
      } else if (dateAdded === "30days") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: thirtyDaysAgo };
      } else if (dateAdded === "custom" && (startDate || endDate)) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
    }

    // Sorting
    let orderBy = { createdAt: "desc" };
    if (sortBy === "price_asc") {
      orderBy = dealType === "LEASE" ? { monthlyRent: "asc" } : { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = dealType === "LEASE" ? { monthlyRent: "desc" } : { price: "desc" };
    } else if (sortBy === "area_asc") {
      orderBy = { primaryArea: "asc" };
    } else if (sortBy === "area_desc") {
      orderBy = { primaryArea: "desc" };
    }

    const skip = (page - 1) * limit;
    const { total, items } = await propertyRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy
    });

    // Fetch creator details
    const creatorIds = [...new Set(items.map((p) => p.createdById).filter(Boolean))];
    let userMap = new Map();
    if (creatorIds.length > 0) {
      try {
        const creators = await prisma.user.findMany({
          where: { id: { in: creatorIds } },
          select: { id: true, name: true, email: true, role: true }
        });
        userMap = new Map(creators.map((u) => [u.id, u]));
      } catch (err) {
        console.error("Failed to load property creators:", err);
      }
    }

    const itemsWithCreator = items.map((p) => ({
      ...p,
      createdByUser: p.createdById ? userMap.get(p.createdById) || null : null,
    }));

    // Mask seller info if not admin
    const sanitizedItems = user?.role === "ADMIN" ? itemsWithCreator : itemsWithCreator.map(p => ({
      ...p,
      sellerName: p.sellerName ? "Hidden (Admin Only)" : null,
      sellerPhone: p.sellerPhone ? "Hidden (Admin Only)" : null,
    }));

    const result = {
      properties: sanitizedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    await setInCache(cacheKey, result, 120);
    return result;
  },

  async updateProperty(id, data, user) {
    const existing = await propertyRepository.findById(id);
    if (!existing) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    // Executives cannot directly approve their own or other listings to AVAILABLE
    if (user?.role === "EXECUTIVE" && data.status && data.status !== existing.status) {
      if (data.status === "AVAILABLE") {
        throw new AppError("Only Admins can approve properties to Available status", 403, "FORBIDDEN");
      }
    }

    // If developerId updated, refresh developerName
    const payload = { ...data };
    if (data.developerId && data.developerId !== existing.developerId) {
      const dev = await prisma.developer.findUnique({ where: { id: data.developerId } });
      if (dev) {
        payload.developerName = dev.name;
      }
    }

    // Protect seller info for non-admins: prevent accidental overwrite with masked placeholder or unauthorized edits
    if (user?.role !== "ADMIN") {
      if (payload.sellerName === "Hidden (Admin Only)" || payload.sellerName === undefined) {
        delete payload.sellerName;
      }
      if (payload.sellerPhone === "Hidden (Admin Only)" || payload.sellerPhone === undefined) {
        delete payload.sellerPhone;
      }
      // If property already has seller info, non-admin cannot alter it
      if (existing.sellerName && payload.sellerName && payload.sellerName !== existing.sellerName) {
        delete payload.sellerName;
      }
      if (existing.sellerPhone && payload.sellerPhone && payload.sellerPhone !== existing.sellerPhone) {
        delete payload.sellerPhone;
      }
    }

    const updated = await propertyRepository.update(id, payload);
    await invalidateInventoryCache(id);

    // Delegate audit logging to separated logs module
    await logsService.logPropertyUpdate(existing, payload, updated, user);

    return updated;
  },

  async approveProperty(id, user) {
    const existing = await propertyRepository.findById(id);
    if (!existing) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    const updated = await propertyRepository.update(id, { status: "AVAILABLE" });
    await invalidateInventoryCache(id);

    // Audit log
    await logsService.logPropertyApproval(existing, user);

    return updated;
  },

  async rejectProperty(id, reason, user) {
    const existing = await propertyRepository.findById(id);
    if (!existing) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    const updated = await propertyRepository.update(id, { status: "UNDER_REVIEW" });
    await invalidateInventoryCache(id);

    // Audit log
    await logsService.logPropertyRejection(existing, reason, user);

    return updated;
  },

  async deleteProperty(id, user) {
    const existing = await propertyRepository.findById(id);
    if (!existing) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }

    // Delete property and linked entities via cascade
    const deleted = await propertyRepository.delete(id);
    await invalidateInventoryCache(id);

    // Delegate audit logging to separated logs module
    await logsService.logPropertyDelete(existing, user);

    return deleted;
  },

  // Units
  async listUnits(propertyId) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }
    return property.units;
  },

  async addUnit(propertyId, unitData) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
    }
    const created = await propertyRepository.createUnit(propertyId, unitData);
    await invalidateInventoryCache(propertyId);
    return created;
  },

  async updateUnit(unitId, unitData) {
    const unit = await prisma.projectUnit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new AppError("Project unit not found", 404, "UNIT_NOT_FOUND");
    }
    const updated = await propertyRepository.updateUnit(unitId, unitData);
    await invalidateInventoryCache(unit.propertyId);
    return updated;
  },

  async deleteUnit(unitId) {
    const unit = await prisma.projectUnit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new AppError("Project unit not found", 404, "UNIT_NOT_FOUND");
    }
    const deleted = await propertyRepository.deleteUnit(unitId);
    await invalidateInventoryCache(unit.propertyId);
    return deleted;
  },

  async tagUnitToLead(unitId, leadId, user) {
    const unit = await prisma.projectUnit.findUnique({
      where: { id: unitId },
      include: { property: { select: { id: true, title: true, dealType: true } } }
    });
    if (!unit) {
      throw new AppError("Project unit not found", 404, "UNIT_NOT_FOUND");
    }

    let leadName = "";
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        throw new AppError("Lead not found to tag", 404, "LEAD_NOT_FOUND");
      }
      leadName = `${lead.firstName} ${lead.lastName}`.trim();
    }

    const tagged = await propertyRepository.tagUnitToLead(unitId, leadId || null);
    await invalidateInventoryCache(unit.propertyId);

    // Delegate audit logging to separated logs module
    await logsService.logUnitTag(unit, leadId, leadName, user);

    return tagged;
  },

  // Audit Logs delegation (for backwards compatibility)
  async listAuditLogs(queryParams = {}, user) {
    return logsService.listLogs(queryParams, user);
  },

  async getPropertyAuditLogs(propertyId) {
    return logsService.getPropertyLogs(propertyId);
  },

  // Master Data
  async getMasterData() {
    const cacheKey = "inventory:master_data";
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    let developers = [];
    try {
      developers = await propertyRepository.findAllDevelopers();
    } catch {
      developers = [];
    }

    if (!developers || developers.length === 0) {
      const { DEVELOPERS_LIST } = await import("./inventory.constants.js");
      developers = DEVELOPERS_LIST.map((name, idx) => ({ id: `dev_${idx}`, name, isActive: true }));
    }

    let leads = [];
    try {
      leads = await prisma.lead.findMany({
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        take: 50,
        orderBy: { createdAt: "desc" }
      });
    } catch {
      leads = [];
    }

    const result = {
      developers,
      categories: CATEGORIES,
      subcategories: SUBCATEGORIES,
      usps: USP_GROUPS,
      amenities: AMENITIES_GROUPS,
      dealTypes: DEAL_TYPES,
      propertyStatuses: PROPERTY_STATUSES,
      bhkOptions: BHK_OPTIONS,
      facingDirections: FACING_DIRECTIONS,
      availableForOptions: AVAILABLE_FOR_OPTIONS,
      maintenanceFrequencies: MAINTENANCE_FREQUENCIES,
      areaTypes: AREA_TYPES,
      areaUnits: AREA_UNITS,
      cities: CITIES,
      sortOptions: SORT_OPTIONS,
      leads
    };

    await setInCache(cacheKey, result, 3600);
    return result;
  },

  async getMetrics() {
    const cacheKey = "inventory:metrics";
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    const metrics = await propertyRepository.getMetrics();
    await setInCache(cacheKey, metrics, 60);
    return metrics;
  }
};

