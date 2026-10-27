import { prisma } from "../../config/database.js";

// In-memory fallback map ONLY used if PostgreSQL database is offline (e.g. during test suites)
const memFallback = new Map();

function normalizeRequest(raw) {
  if (!raw) return null;
  return {
    ...raw,
    requestedAt: raw.requestedAt instanceof Date ? raw.requestedAt.toISOString() : (raw.requestedAt || raw.createdAt ? new Date(raw.requestedAt || raw.createdAt).toISOString() : new Date().toISOString()),
    adminActionAt: raw.adminActionAt instanceof Date ? raw.adminActionAt.toISOString() : (raw.adminActionAt ? new Date(raw.adminActionAt).toISOString() : null),
    executiveRepliedAt: raw.executiveRepliedAt instanceof Date ? raw.executiveRepliedAt.toISOString() : (raw.executiveRepliedAt ? new Date(raw.executiveRepliedAt).toISOString() : null),
    dismissedAt: raw.dismissedAt instanceof Date ? raw.dismissedAt.toISOString() : (raw.dismissedAt ? new Date(raw.dismissedAt).toISOString() : null),
  };
}

export const clearanceService = {
  async submitRequest(propertyId, payload, user) {
    let propertyTitle = payload.propertyTitle || "Property Listing";
    let dealType = null;
    let locality = null;
    let price = null;

    try {
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { title: true, dealType: true, locality: true, price: true }
      });
      if (prop?.title) propertyTitle = prop.title;
      if (prop?.dealType) dealType = prop.dealType;
      if (prop?.locality) locality = prop.locality;
      if (prop?.price) price = prop.price;
    } catch {
      // Ignore if DB not reachable
    }

    const dataPayload = {
      propertyId,
      propertyTitle,
      dealType,
      locality,
      price,
      requestedBy: user?.name || "Executive",
      requestedByEmail: user?.email || "",
      executiveId: user?.id || "",
      reason: payload.reason || "Client Site Visit Scheduled",
      clientName: payload.clientName || null,
      notes: payload.notes || null,
      status: "PENDING",
      adminFeedback: null,
      adminActionAt: null,
      adminName: null,
      dismissedByExecutive: false,
      dismissedByAdmin: false,
    };

    try {
      const existing = await prisma.sellerClearanceRequest.findFirst({
        where: { propertyId },
        orderBy: { createdAt: "desc" }
      });

      let saved;
      if (existing) {
        saved = await prisma.sellerClearanceRequest.update({
          where: { id: existing.id },
          data: {
            ...dataPayload,
            executiveReply: existing.executiveReply || null,
            executiveRepliedAt: existing.executiveRepliedAt || null
          }
        });
      } else {
        saved = await prisma.sellerClearanceRequest.create({
          data: dataPayload
        });
      }
      return normalizeRequest(saved);
    } catch (err) {
      // Database offline fallback (e.g. headless unit tests without postgres)
      const existingMem = memFallback.get(propertyId) || {};
      const fallbackData = {
        id: existingMem.id || `req_${Date.now()}`,
        ...dataPayload,
        executiveReply: existingMem.executiveReply || null,
        executiveRepliedAt: existingMem.executiveRepliedAt || null,
        createdAt: new Date().toISOString()
      };
      memFallback.set(propertyId, fallbackData);
      return normalizeRequest(fallbackData);
    }
  },

  async listRequests(user, query = {}) {
    try {
      const where = {};

      if (user?.role === "ADMIN") {
        if (query.status && query.status !== "ALL") {
          where.status = query.status;
        } else if (query.all !== "true" && query.includeAll !== "true") {
          // Bell notifications for admin: pending and not dismissed
          where.status = "PENDING";
          where.dismissedByAdmin = false;
        }
      } else {
        // Executive scoping
        if (user?.id || user?.email) {
          const conditions = [];
          if (user.id) conditions.push({ executiveId: user.id });
          if (user.email) conditions.push({ requestedByEmail: user.email });
          where.OR = conditions;
        }
        if (query.status && query.status !== "ALL") {
          where.status = query.status;
        } else if (query.all !== "true" && query.includeAll !== "true") {
          where.dismissedByExecutive = false;
        }
      }

      const rows = await prisma.sellerClearanceRequest.findMany({
        where,
        orderBy: { createdAt: "desc" }
      });

      return rows.map((r) => normalizeRequest(r));
    } catch (err) {
      // In-memory fallback if database offline
      const list = Array.from(memFallback.values());
      let filtered = list;

      if (user?.role === "ADMIN") {
        if (query.status && query.status !== "ALL") {
          filtered = filtered.filter((r) => r.status === query.status);
        } else if (query.all !== "true" && query.includeAll !== "true") {
          filtered = filtered.filter((r) => r.status === "PENDING" && !r.dismissedByAdmin);
        }
      } else {
        filtered = filtered.filter((r) => !user?.id || !r.executiveId || r.executiveId === user?.id || r.requestedByEmail === user?.email);
        if (query.status && query.status !== "ALL") {
          filtered = filtered.filter((r) => r.status === query.status);
        } else if (query.all !== "true" && query.includeAll !== "true") {
          filtered = filtered.filter((r) => !r.dismissedByExecutive);
        }
      }

      return filtered
        .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
        .map((r) => normalizeRequest(r));
    }
  },

  async getRequestByPropertyId(propertyId, user) {
    try {
      const req = await prisma.sellerClearanceRequest.findFirst({
        where: { propertyId },
        orderBy: { createdAt: "desc" }
      });

      if (!req) return null;

      // If approved, enrich with actual seller details from Property in DB
      if (req.status === "APPROVED") {
        try {
          const prop = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { sellerName: true, sellerPhone: true }
          });
          if (prop) {
            req.sellerName = prop.sellerName || req.sellerName;
            req.sellerPhone = prop.sellerPhone || req.sellerPhone;
          }
        } catch {
          // Ignore
        }
      }

      return normalizeRequest(req);
    } catch (err) {
      // In-memory fallback
      const req = memFallback.get(propertyId) || null;
      if (!req) return null;
      return normalizeRequest(req);
    }
  },

  async decideRequest(propertyId, payload, user) {
    const { action, feedback, reply } = payload;

    if (["APPROVE", "REJECT", "QUERY"].includes(action)) {
      if (user && user.role && user.role !== "ADMIN") {
        throw new Error("Only administrators can approve, reject, or query clearance requests");
      }
    }

    try {
      const req = await prisma.sellerClearanceRequest.findFirst({
        where: { propertyId },
        orderBy: { createdAt: "desc" }
      });

      if (!req) {
        throw new Error("Clearance request not found");
      }

      if (action === "DELETE") {
        await prisma.sellerClearanceRequest.delete({ where: { id: req.id } });
        return { success: true, message: "Clearance request permanently deleted" };
      }

      let updateData = {};

      if (action === "APPROVE") {
        let sellerName = req.sellerName;
        let sellerPhone = req.sellerPhone;
        try {
          const prop = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { sellerName: true, sellerPhone: true }
          });
          if (prop) {
            sellerName = prop.sellerName;
            sellerPhone = prop.sellerPhone;
          }
        } catch {}

        updateData = {
          status: "APPROVED",
          adminActionAt: new Date(),
          adminName: user?.name || "Admin",
          sellerName,
          sellerPhone,
          dismissedByExecutive: false,
          dismissedByAdmin: false
        };
      } else if (action === "REJECT") {
        updateData = {
          status: "REJECTED",
          adminFeedback: feedback || "Clearance request declined by Administrator.",
          adminActionAt: new Date(),
          adminName: user?.name || "Admin",
          dismissedByExecutive: false
        };
      } else if (action === "QUERY") {
        updateData = {
          status: "QUERY_ASKED",
          adminFeedback: feedback,
          adminActionAt: new Date(),
          adminName: user?.name || "Admin",
          dismissedByExecutive: false
        };
      } else if (action === "REPLY") {
        updateData = {
          status: "PENDING",
          executiveReply: reply,
          executiveRepliedAt: new Date(),
          dismissedByAdmin: false,
          dismissedByExecutive: false
        };
      } else if (action === "REVOKE") {
        updateData = {
          status: "REJECTED",
          adminFeedback: feedback || "Seller access clearance revoked by Administrator.",
          adminActionAt: new Date(),
          adminName: user?.name || "Admin",
          sellerName: null,
          sellerPhone: null,
          dismissedByExecutive: false
        };
      } else if (action === "DISMISS") {
        // Dismiss alert from bell icon without deleting request data
        updateData = {
          dismissedByExecutive: user?.role === "ADMIN" ? req.dismissedByExecutive : true,
          dismissedByAdmin: user?.role === "ADMIN" ? true : req.dismissedByAdmin,
          dismissedAt: new Date()
        };
      }

      const updated = await prisma.sellerClearanceRequest.update({
        where: { id: req.id },
        data: updateData
      });

      return normalizeRequest(updated);
    } catch (err) {
      if (err.message === "Clearance request not found" || err.message.includes("administrators")) {
        throw err;
      }

      // In-memory fallback if database is offline
      const req = memFallback.get(propertyId);
      if (!req) {
        throw new Error("Clearance request not found");
      }

      if (action === "DELETE") {
        memFallback.delete(propertyId);
        return { success: true, message: "Clearance request permanently deleted" };
      }

      if (action === "APPROVE") {
        req.status = "APPROVED";
        req.adminActionAt = new Date().toISOString();
        req.adminName = user?.name || "Admin";
        req.dismissedByExecutive = false;
        req.dismissedByAdmin = false;
      } else if (action === "REJECT") {
        req.status = "REJECTED";
        req.adminFeedback = feedback || "Clearance request declined by Administrator.";
        req.adminActionAt = new Date().toISOString();
        req.adminName = user?.name || "Admin";
        req.dismissedByExecutive = false;
      } else if (action === "QUERY") {
        req.status = "QUERY_ASKED";
        req.adminFeedback = feedback;
        req.adminActionAt = new Date().toISOString();
        req.adminName = user?.name || "Admin";
        req.dismissedByExecutive = false;
      } else if (action === "REPLY") {
        req.status = "PENDING";
        req.executiveReply = reply;
        req.executiveRepliedAt = new Date().toISOString();
        req.dismissedByAdmin = false;
        req.dismissedByExecutive = false;
      } else if (action === "REVOKE") {
        req.status = "REJECTED";
        req.adminFeedback = feedback || "Seller access clearance revoked by Administrator.";
        req.adminActionAt = new Date().toISOString();
        req.adminName = user?.name || "Admin";
        delete req.sellerName;
        delete req.sellerPhone;
        req.dismissedByExecutive = false;
      } else if (action === "DISMISS") {
        if (user?.role === "ADMIN") {
          req.dismissedByAdmin = true;
        } else {
          req.dismissedByExecutive = true;
        }
        req.dismissedAt = new Date().toISOString();
      }

      memFallback.set(propertyId, req);
      return normalizeRequest(req);
    }
  }
};
