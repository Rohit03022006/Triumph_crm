import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../config/database.js";
import { redis } from "../../config/redis.js";

const app = createApp();

describe("Inventory API End-to-End & Boundary Breaking Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & ACCESS CONTROL
  // -------------------------------------------------------------
  describe("Authentication Gatekeeping", () => {
    it("should reject requests without a session cookie (401 UNAUTHENTICATED)", async () => {
      const res = await request(app).get("/api/v1/inventory");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    });

    it("should reject POST requests without session cookie (401)", async () => {
      const res = await request(app)
        .post("/api/v1/inventory")
        .send({ dealType: "BOOKING", title: "Unauthenticated Project" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject DELETE requests without session cookie (401)", async () => {
      const res = await request(app).delete("/api/v1/inventory/some-id");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // Helper to mock an active session for Admin or Executive
  const mockSession = (role = "ADMIN") => {
    const fakeSessionId = `test_session_${role.toLowerCase()}`;
    const fakeUserId = `user_${role.toLowerCase()}_123`;

    vi.spyOn(redis, "get").mockImplementation(async (key) => {
      if (key === `session:${fakeSessionId}`) {
        return JSON.stringify({ userId: fakeUserId });
      }
      return null;
    });

    vi.spyOn(redis, "expire").mockResolvedValue(1);

    vi.spyOn(prisma.user, "findUnique").mockImplementation(async ({ where }) => {
      if (where.id === fakeUserId) {
        return {
          id: fakeUserId,
          name: `Test ${role}`,
          email: `${role.toLowerCase()}@triumphcrm.com`,
          role,
          isActive: true,
          emailVerified: true,
        };
      }
      return null;
    });

    return `triumph_session=${fakeSessionId}`;
  };

  // -------------------------------------------------------------
  // 2. ROLE AUTHORIZATION TESTS
  // -------------------------------------------------------------
  describe("Role Authorization & Confidentiality Protection", () => {
    it("should prevent EXECUTIVE from deleting a property (403 FORBIDDEN)", async () => {
      const execCookie = mockSession("EXECUTIVE");
      const res = await request(app)
        .delete("/api/v1/inventory/prop_123")
        .set("Cookie", execCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should prevent EXECUTIVE from deleting a project unit (403 FORBIDDEN)", async () => {
      const execCookie = mockSession("EXECUTIVE");
      const res = await request(app)
        .delete("/api/v1/inventory/units/unit_456")
        .set("Cookie", execCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });

  // -------------------------------------------------------------
  // 3. BREAKING TESTS: INPUT VALIDATION & FUZZING
  // -------------------------------------------------------------
  describe("Boundary Testing & Error Resilience (Breaking Tests)", () => {
    it("should reject empty payload with 400 VALIDATION_ERROR instead of crashing server", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.message).toContain("dealType");
    });

    it("should reject invalid dealType with 400", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({
          dealType: "ILLEGAL_DEAL_TYPE",
          title: "Invalid Deal Type",
          category: "Residential",
          subcategory: "Apartment",
          city: "Gurugram",
          locality: "Sector 1",
          areas: [{ areaType: "Super Area", value: 1000, unit: "sq. ft." }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject empty areas array with 400", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({
          dealType: "BOOKING",
          title: "No Area Property",
          category: "Residential",
          subcategory: "Apartment",
          city: "Gurugram",
          locality: "Sector 1",
          areas: []
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain("area");
    });

    it("should reject negative or zero area values with 400", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({
          dealType: "BOOKING",
          title: "Negative Area Property",
          category: "Residential",
          subcategory: "Apartment",
          city: "Gurugram",
          locality: "Sector 1",
          areas: [{ areaType: "Super Area", value: -250, unit: "sq. ft." }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject Lease where lockInPeriod exceeds leaseDuration with 400", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({
          dealType: "LEASE",
          title: "Unreasonable Lease",
          category: "Commercial",
          subcategory: "Office Space",
          city: "Gurugram",
          locality: "Cyber Hub",
          monthlyRent: 150000,
          leaseDuration: 12,
          lockInPeriod: 36, // Violation: 36 > 12
          areas: [{ areaType: "Carpet Area", value: 1200, unit: "sq. ft." }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain("Lock-in period cannot exceed lease duration");
    });

    it("should reject negative price or negative rent with 400", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({
          dealType: "RETRADE",
          title: "Negative Price Property",
          category: "Residential",
          subcategory: "Villa",
          city: "Gurugram",
          locality: "Sector 50",
          price: -500000,
          areas: [{ areaType: "Super Area", value: 3000, unit: "sq. ft." }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should handle malformed JSON safely with 400 instead of crashing", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .set("Content-Type", "application/json")
        .send("{ broken json: ");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should handle SQL injection attempts in search queries safely", async () => {
      const adminCookie = mockSession("ADMIN");
      vi.spyOn(prisma.property, "count").mockResolvedValue(0);
      vi.spyOn(prisma.property, "findMany").mockResolvedValue([]);

      const maliciousSearch = "' OR '1'='1'; DROP TABLE \"Property\"; --";
      const res = await request(app)
        .get(`/api/v1/inventory?search=${encodeURIComponent(maliciousSearch)}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties).toEqual([]);
    });

    it("should return 404 when querying a non-existent property ID", async () => {
      const adminCookie = mockSession("ADMIN");
      vi.spyOn(prisma.property, "findUnique").mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/inventory/non_existent_id_9999")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("PROPERTY_NOT_FOUND");
    });
  });

  // -------------------------------------------------------------
  // 4. HAPPY PATH & DATA INTEGRITY TESTS
  // -------------------------------------------------------------
  describe("Happy Path CRUD & Data Persistence", () => {
    it("GET /api/v1/inventory/master-data should return 71 developers and categories", async () => {
      const adminCookie = mockSession("ADMIN");
      const res = await request(app)
        .get("/api/v1/inventory/master-data")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.developers.length).toBeGreaterThanOrEqual(71);
      expect(res.body.data.categories).toBeDefined();
      expect(res.body.data.usps).toBeDefined();
      expect(res.body.data.amenities).toBeDefined();
    });

    it("GET /api/v1/inventory/metrics should return property metrics", async () => {
      const adminCookie = mockSession("ADMIN");
      vi.spyOn(prisma.property, "count")
        .mockResolvedValueOnce(15) // total
        .mockResolvedValueOnce(5)  // booking
        .mockResolvedValueOnce(6)  // retrade
        .mockResolvedValueOnce(4)  // lease
        .mockResolvedValueOnce(12) // available
        .mockResolvedValueOnce(3); // underReview

      const res = await request(app)
        .get("/api/v1/inventory/metrics")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(15);
      expect(res.body.data.booking).toBe(5);
      expect(res.body.data.retrade).toBe(6);
      expect(res.body.data.lease).toBe(4);
    });

    it("POST /api/v1/inventory should create a Booking property with multi-areas", async () => {
      const adminCookie = mockSession("ADMIN");
      const mockCreated = {
        id: "prop_booking_1",
        dealType: "BOOKING",
        title: "Emaar Palm Heights",
        developerName: "Emaar",
        category: "Residential",
        subcategory: "Apartment",
        city: "Gurugram",
        locality: "Sector 77",
        primaryArea: 2000,
        primaryAreaUnit: "sq. ft.",
        areas: [
          { id: "a1", areaType: "Super Area", value: 2000, unit: "sq. ft." },
          { id: "a2", areaType: "Carpet Area", value: 1450, unit: "sq. ft." }
        ],
        units: [],
        media: [],
        status: "AVAILABLE",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.spyOn(prisma.property, "create").mockResolvedValue(mockCreated);

      const res = await request(app)
        .post("/api/v1/inventory")
        .set("Cookie", adminCookie)
        .send({
          dealType: "BOOKING",
          title: "Emaar Palm Heights",
          developerName: "Emaar",
          category: "Residential",
          subcategory: "Apartment",
          city: "Gurugram",
          locality: "Sector 77",
          price: 22000000,
          projectStatus: "Under Construction",
          possessionMonth: "June",
          possessionYear: 2026,
          areas: [
            { areaType: "Super Area", value: 2000, unit: "sq. ft." },
            { areaType: "Carpet Area", value: 1450, unit: "sq. ft." }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Emaar Palm Heights");
      expect(res.body.data.primaryArea).toBe(2000);
    });

    it("GET /api/v1/inventory/:id should mask seller info for EXECUTIVE role", async () => {
      const execCookie = mockSession("EXECUTIVE");
      const mockProp = {
        id: "prop_retrade_1",
        dealType: "RETRADE",
        title: "Luxury Penthouse",
        category: "Residential",
        subcategory: "Apartment",
        city: "Gurugram",
        locality: "Golf Course Road",
        sellerName: "Confidential VIP Owner",
        sellerPhone: "+91 9999999999",
        areas: [{ areaType: "Super Area", value: 5000, unit: "sq. ft." }]
      };

      vi.spyOn(prisma.property, "findUnique").mockResolvedValue(mockProp);

      const res = await request(app)
        .get("/api/v1/inventory/prop_retrade_1")
        .set("Cookie", execCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.sellerName).toBe("Hidden (Admin Only)");
      expect(res.body.data.sellerPhone).toBe("Hidden (Admin Only)");
    });

    it("GET /api/v1/inventory/:id should show unmasked seller info for ADMIN role", async () => {
      const adminCookie = mockSession("ADMIN");
      const mockProp = {
        id: "prop_retrade_1",
        dealType: "RETRADE",
        title: "Luxury Penthouse",
        category: "Residential",
        subcategory: "Apartment",
        city: "Gurugram",
        locality: "Golf Course Road",
        sellerName: "Confidential VIP Owner",
        sellerPhone: "+91 9999999999",
        areas: [{ areaType: "Super Area", value: 5000, unit: "sq. ft." }]
      };

      vi.spyOn(prisma.property, "findUnique").mockResolvedValue(mockProp);

      const res = await request(app)
        .get("/api/v1/inventory/prop_retrade_1")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.sellerName).toBe("Confidential VIP Owner");
      expect(res.body.data.sellerPhone).toBe("+91 9999999999");
    });

    it("POST /api/v1/inventory/units/:unitId/tag should reject non-existent lead with 404", async () => {
      const adminCookie = mockSession("ADMIN");
      vi.spyOn(prisma.projectUnit, "findUnique").mockResolvedValue({ id: "unit_1" });
      vi.spyOn(prisma.lead, "findUnique").mockResolvedValue(null); // Lead not found

      const res = await request(app)
        .post("/api/v1/inventory/units/unit_1/tag")
        .set("Cookie", adminCookie)
        .send({ leadId: "non_existent_lead_999" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("LEAD_NOT_FOUND");
    });

    it("POST /api/v1/inventory/units/:unitId/tag should tag unit to valid lead and set status to TAGGED", async () => {
      const adminCookie = mockSession("ADMIN");
      vi.spyOn(prisma.projectUnit, "findUnique").mockResolvedValue({ id: "unit_1" });
      vi.spyOn(prisma.lead, "findUnique").mockResolvedValue({
        id: "lead_valid_123",
        firstName: "Aarav",
        lastName: "Sharma",
      });
      vi.spyOn(prisma.projectUnit, "update").mockResolvedValue({
        id: "unit_1",
        status: "TAGGED",
        leadId: "lead_valid_123",
        lead: { firstName: "Aarav", lastName: "Sharma" }
      });

      const res = await request(app)
        .post("/api/v1/inventory/units/unit_1/tag")
        .set("Cookie", adminCookie)
        .send({ leadId: "lead_valid_123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("TAGGED");
    });
  });
});

