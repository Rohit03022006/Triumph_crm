import { prisma } from "../../config/database.js";
import { logsRepository } from "../logs/logs.repository.js";

function sanitizePropertyData(data) {
  if (!data) return {};
  const sanitized = { ...data };

  // 1. Sanitize dates
  if (sanitized.availableFromDate === "" || sanitized.availableFromDate === undefined) {
    sanitized.availableFromDate = null;
  } else if (typeof sanitized.availableFromDate === "string") {
    const d = new Date(sanitized.availableFromDate);
    sanitized.availableFromDate = isNaN(d.getTime()) ? null : d;
  }

  if (sanitized.possessionDate === "" || sanitized.possessionDate === undefined) {
    sanitized.possessionDate = null;
  } else if (typeof sanitized.possessionDate === "string") {
    const d = new Date(sanitized.possessionDate);
    sanitized.possessionDate = isNaN(d.getTime()) ? null : d;
  }

  // 2. Sanitize empty string IDs
  if (sanitized.developerId === "" || sanitized.developerId === undefined) {
    sanitized.developerId = null;
  }

  // 3. Sanitize numeric fields that might be empty strings
  const numericFields = [
    "price", "minPrice", "maxPrice", "pricePerUnitArea",
    "monthlyRent", "maintenanceCharges", "leaseDuration", "lockInPeriod",
    "possessionYear", "plotLength", "plotBreadth",
    "numberOfStoreys", "numberOfUnits", "numberOfRooms", "totalFloors",
    "numberOfParkings", "ceilingHeight", "numberOfLifts", "numberOfWashrooms",
    "roiPercentage"
  ];
  for (const f of numericFields) {
    if (sanitized[f] === "" || sanitized[f] === undefined) {
      sanitized[f] = null;
    } else if (typeof sanitized[f] === "string" && !isNaN(Number(sanitized[f]))) {
      sanitized[f] = Number(sanitized[f]);
    }
  }

  return sanitized;
}

export const propertyRepository = {
  async create(data, userId) {
    const { areas, units, media, ...rawPropertyData } = data;
    const propertyData = sanitizePropertyData(rawPropertyData);

    // Calculate primary area from first area entry
    const primaryArea = areas && areas.length > 0 ? areas[0].value : null;
    const primaryAreaUnit = areas && areas.length > 0 ? areas[0].unit : null;

    return prisma.property.create({
      data: {
        ...propertyData,
        primaryArea,
        primaryAreaUnit,
        createdById: userId || null,
        areas: areas && areas.length > 0 ? {
          create: areas.map(a => ({
            areaType: a.areaType,
            value: a.value,
            unit: a.unit,
            minArea: a.minArea || null,
            maxArea: a.maxArea || null,
          }))
        } : undefined,
        units: units && units.length > 0 ? {
          create: units.map(u => ({
            unitName: u.unitName,
            area: u.area,
            areaUnit: u.areaUnit || "sq. ft.",
            price: u.price,
            status: u.status || "AVAILABLE",
            leadId: u.leadId || null,
          }))
        } : undefined,
        media: media && media.length > 0 ? {
          create: media.map(m => ({
            type: m.type,
            url: m.url,
            name: m.name || null,
            size: m.size || null,
            mimeType: m.mimeType || null,
          }))
        } : undefined,
      },
      include: {
        areas: true,
        units: { include: { lead: true } },
        media: true,
        developer: true,
      }
    });
  },

  async findById(id) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        areas: true,
        units: {
          include: {
            lead: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        media: true,
        developer: true,
      }
    });
  },

  async findMany({ where = {}, skip = 0, take = 12, orderBy = { createdAt: "desc" } }) {
    const [total, items] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          areas: true,
          developer: { select: { id: true, name: true } },
          media: true,
          units: { select: { id: true, unitName: true, status: true, price: true } }
        }
      })
    ]);

    return { total, items };
  },

  async update(id, data) {
    const { areas, units, media, ...rawPropertyData } = data;
    const propertyData = sanitizePropertyData(rawPropertyData);

    // Recalculate primary area if areas provided
    let areaUpdatePayload = {};
    if (areas && Array.isArray(areas)) {
      areaUpdatePayload = {
        primaryArea: areas.length > 0 ? areas[0].value : null,
        primaryAreaUnit: areas.length > 0 ? areas[0].unit : null,
        areas: {
          deleteMany: {},
          create: areas.map(a => ({
            areaType: a.areaType,
            value: a.value,
            unit: a.unit,
            minArea: a.minArea || null,
            maxArea: a.maxArea || null,
          }))
        }
      };
    }

    let mediaUpdatePayload = {};
    if (media && Array.isArray(media)) {
      mediaUpdatePayload = {
        media: {
          deleteMany: {},
          create: media.map(m => ({
            type: m.type,
            url: m.url,
            name: m.name || null,
            size: m.size || null,
            mimeType: m.mimeType || null,
          }))
        }
      };
    }

    return prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        ...areaUpdatePayload,
        ...mediaUpdatePayload,
      },
      include: {
        areas: true,
        units: { include: { lead: true } },
        media: true,
        developer: true,
      }
    });
  },

  async delete(id) {
    return prisma.property.delete({
      where: { id }
    });
  },

  // Units
  async createUnit(propertyId, unitData) {
    return prisma.projectUnit.create({
      data: {
        ...unitData,
        propertyId,
      },
      include: { lead: true }
    });
  },

  async updateUnit(unitId, unitData) {
    return prisma.projectUnit.update({
      where: { id: unitId },
      data: unitData,
      include: { lead: true }
    });
  },

  async deleteUnit(unitId) {
    return prisma.projectUnit.delete({
      where: { id: unitId }
    });
  },

  async tagUnitToLead(unitId, leadId) {
    return prisma.projectUnit.update({
      where: { id: unitId },
      data: {
        leadId,
        status: leadId ? "TAGGED" : "AVAILABLE"
      },
      include: { lead: true }
    });
  },

  // Developers
  async findAllDevelopers() {
    return prisma.developer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  },

  // Summary Metrics
  async getMetrics() {
    const [total, booking, retrade, lease, available, underReview] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { dealType: "BOOKING" } }),
      prisma.property.count({ where: { dealType: "RETRADE" } }),
      prisma.property.count({ where: { dealType: "LEASE" } }),
      prisma.property.count({ where: { status: "AVAILABLE" } }),
      prisma.property.count({ where: { status: "UNDER_REVIEW" } }),
    ]);

    return { total, booking, retrade, lease, available, underReview };
  },

  // Audit Logs (delegated to logs module)
  async createAuditLog(logData) {
    return logsRepository.createAuditLog(logData);
  },

  async findAuditLogs(where = {}, options = {}) {
    return logsRepository.findAuditLogs(where, options);
  },

  async findAuditLogsByProperty(propertyId, options = {}) {
    return logsRepository.findAuditLogsByProperty(propertyId, options);
  }
};

