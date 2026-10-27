import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPropertySchema,
  queryPropertySchema,
  tagUnitSchema
} from "./inventory.validation.js";
import { inventoryService, calculatePropertyDiff } from "./inventory.service.js";
import { logsService } from "../logs/logs.service.js";
import { propertyRepository } from "./inventory.repository.js";
import {
  DEVELOPERS_LIST,
  CATEGORIES,
  SUBCATEGORIES,
  USP_GROUPS,
  AMENITIES_GROUPS
} from "./inventory.constants.js";

describe("Inventory Module - Constants & Data Verification", () => {
  it("should have all 71 developers loaded", () => {
    expect(DEVELOPERS_LIST.length).toBe(71);
    expect(DEVELOPERS_LIST).toContain("DLF");
    expect(DEVELOPERS_LIST).toContain("Godrej Properties");
    expect(DEVELOPERS_LIST).toContain("M3M India");
    expect(DEVELOPERS_LIST).toContain("Whiteland Corporation");
  });

  it("should define residential, commercial, and mixed use categories and subcategories", () => {
    expect(Object.values(CATEGORIES)).toEqual(["Residential", "Commercial"]);
    expect(SUBCATEGORIES.Residential).toContain("Apartment");
    expect(SUBCATEGORIES.Residential).toContain("Villa");
    expect(SUBCATEGORIES.Residential).toContain("Farmhouse");
    expect(SUBCATEGORIES.Commercial).toContain("Office");
    expect(SUBCATEGORIES.Commercial).toContain("Retail Shop");
    expect(SUBCATEGORIES.Commercial).toContain("Mixed Use (Retail+Office)");
  });

  it("should define categorized USPs and Amenities", () => {
    expect(USP_GROUPS.Connectivity).toBeDefined();
    expect(USP_GROUPS.Surrounding).toBeDefined();
    expect(AMENITIES_GROUPS.Security).toBeDefined();
    expect(AMENITIES_GROUPS.Lifestyle).toBeDefined();
    expect(AMENITIES_GROUPS.Lifestyle).toContain("Swimming Pool");
  });
});

describe("Inventory Module - Validation Rules", () => {
  it("should validate a valid Booking property payload", () => {
    const bookingPayload = {
      dealType: "BOOKING",
      title: "Godrej Aristocrat",
      developerName: "Godrej Properties",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurugram",
      locality: "Sector 49",
      projectSociety: "Golf Course Extension",
      bhk: ["3 BHK", "4 BHK"],
      additionalSelection: ["Penthouse"],
      furnishing: "Semi Furnished",
      price: 38500000,
      priceUnit: "Total Cost",
      projectStatus: "Under Construction",
      possessionMonth: "December",
      possessionYear: 2027,
      paymentPlan: "Construction Linked (CLP)",
      areas: [
        { areaType: "Super Area", value: 2400, unit: "sq. ft." },
        { areaType: "Carpet Area", value: 1850, unit: "sq. ft." }
      ],
      usps: ["Near Metro", "Prime Location"],
      amenities: ["Swimming Pool", "Clubhouse", "24/7 Security"]
    };

    const parsed = createPropertySchema.parse(bookingPayload);
    expect(parsed.dealType).toBe("BOOKING");
    expect(parsed.areas.length).toBe(2);
    expect(parsed.bhk).toContain("3 BHK");
  });

  it("should validate a valid Retrade property payload", () => {
    const retradePayload = {
      dealType: "RETRADE",
      title: "DLF The Camellias Resale",
      developerName: "DLF",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurugram",
      locality: "Golf Course Road",
      bhk: ["4 BHK"],
      price: 150000000,
      availabilityStatus: "Ready to Move",
      facingDirection: "North-East",
      areas: [{ areaType: "Super Area", value: 7400, unit: "sq. ft." }],
      sellerName: "High Networth Client",
      sellerPhone: "+91 9876543210"
    };

    const parsed = createPropertySchema.parse(retradePayload);
    expect(parsed.dealType).toBe("RETRADE");
    expect(parsed.sellerName).toBe("High Networth Client");
  });

  it("should enforce that Lease lock-in period cannot exceed lease duration", () => {
    const invalidLease = {
      dealType: "LEASE",
      title: "Cyber City Commercial Office",
      category: "Commercial",
      subcategory: "Office Space",
      city: "Gurugram",
      locality: "DLF Cyber City",
      monthlyRent: 250000,
      leaseDuration: 12,
      lockInPeriod: 24, // Invalid: exceeds 12
      areas: [{ areaType: "Carpet Area", value: 2000, unit: "sq. ft." }]
    };

    expect(() => createPropertySchema.parse(invalidLease)).toThrow(
      /Lock-in period cannot exceed lease duration/
    );
  });

  it("should accept valid Lease when lock-in is within lease duration", () => {
    const validLease = {
      dealType: "LEASE",
      title: "Cyber City Commercial Office",
      category: "Commercial",
      subcategory: "Office Space",
      city: "Gurugram",
      locality: "DLF Cyber City",
      monthlyRent: 250000,
      leaseDuration: 36,
      lockInPeriod: 12,
      availableFor: ["Corporate", "MNC"],
      maintenanceCharges: 25000,
      maintenanceFrequency: "Monthly",
      areas: [{ areaType: "Carpet Area", value: 2000, unit: "sq. ft." }]
    };

    const parsed = createPropertySchema.parse(validLease);
    expect(parsed.dealType).toBe("LEASE");
    expect(parsed.lockInPeriod).toBe(12);
  });

  it("should reject properties without area measurements", () => {
    const invalidNoArea = {
      dealType: "BOOKING",
      title: "No Area Project",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurugram",
      locality: "Sector 1",
      areas: [] // Empty
    };

    expect(() => createPropertySchema.parse(invalidNoArea)).toThrow();
  });

  it("should reject negative area or zero area values", () => {
    const negativeArea = {
      dealType: "BOOKING",
      title: "Negative Area Project",
      category: "Residential",
      subcategory: "Apartment",
      city: "Gurugram",
      locality: "Sector 1",
      areas: [{ areaType: "Super Area", value: -500, unit: "sq. ft." }]
    };

    expect(() => createPropertySchema.parse(negativeArea)).toThrow();
  });

  it("should parse query parameters correctly with sorting options", () => {
    const query = {
      page: "2",
      limit: "10",
      search: "Cyber",
      dealType: "LEASE",
      sortBy: "price_desc"
    };

    const parsed = queryPropertySchema.parse(query);
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(10);
    expect(parsed.dealType).toBe("LEASE");
    expect(parsed.sortBy).toBe("price_desc");
  });

  it("should validate lead tagging schema", () => {
    expect(() => tagUnitSchema.parse({ leadId: "" })).toThrow();
    expect(tagUnitSchema.parse({ leadId: "lead_123" })).toEqual({ leadId: "lead_123" });
  });
});

describe("Inventory Module - Service Logic & Access Control", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should mask seller info for EXECUTIVE role", async () => {
    const mockProperty = {
      id: "prop_1",
      title: "Resale Villa",
      dealType: "RETRADE",
      sellerName: "Secret VIP Seller",
      sellerPhone: "+91 9999999999",
      areas: [{ areaType: "Plot Area", value: 500, unit: "sq. yd." }]
    };

    vi.spyOn(propertyRepository, "findById").mockResolvedValue(mockProperty);

    // As Executive
    const execResult = await inventoryService.getPropertyById("prop_1", { role: "EXECUTIVE" });
    expect(execResult.sellerName).toBe("Hidden (Admin Only)");
    expect(execResult.sellerPhone).toBe("Hidden (Admin Only)");

    // As Admin
    const adminResult = await inventoryService.getPropertyById("prop_1", { role: "ADMIN" });
    expect(adminResult.sellerName).toBe("Secret VIP Seller");
    expect(adminResult.sellerPhone).toBe("+91 9999999999");
  });

  it("should mask seller info in list results for non-admin users", async () => {
    vi.spyOn(propertyRepository, "findMany").mockResolvedValue({
      total: 1,
      items: [
        {
          id: "p1",
          title: "Penthouse",
          sellerName: "Confidential Owner",
          sellerPhone: "9876543210"
        }
      ]
    });

    const execList = await inventoryService.listProperties({}, { role: "EXECUTIVE" });
    expect(execList.properties[0].sellerName).toBe("Hidden (Admin Only)");
    expect(execList.properties[0].sellerPhone).toBe("Hidden (Admin Only)");
  });

  it("should mark property as UNDER_REVIEW when created by EXECUTIVE", async () => {
    const createSpy = vi.spyOn(propertyRepository, "create").mockImplementation(async (payload) => ({
      id: "prop_new",
      ...payload
    }));

    await inventoryService.createProperty(
      {
        dealType: "BOOKING",
        title: "Executive Submission",
        category: "Residential",
        subcategory: "Apartment",
        city: "Gurugram",
        locality: "Sector 65",
        areas: [{ areaType: "Super Area", value: 1500, unit: "sq. ft." }]
      },
      { id: "user_exec", role: "EXECUTIVE" }
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "UNDER_REVIEW"
      }),
      "user_exec"
    );
  });
});

describe("Inventory Module - Audit Logging & Diff Detection", () => {
  it("should detect edited fields and status changes in calculatePropertyDiff", () => {
    const existing = {
      title: "Palm Meadows",
      status: "AVAILABLE",
      price: 15000000,
      furnishing: "Semi-Furnished",
      bhk: ["3 BHK"],
      usps: ["Metro Station Nearby"]
    };

    const incoming = {
      title: "Palm Meadows Phase 2",
      status: "SOLD",
      price: 18000000,
      furnishing: "Semi-Furnished", // Unchanged
      bhk: ["3 BHK", "4 BHK"], // Array changed
      usps: ["Metro Station Nearby"] // Unchanged
    };

    const diff = calculatePropertyDiff(existing, incoming);
    expect(diff.length).toBe(4);

    const titleChange = diff.find(c => c.field === "title");
    expect(titleChange).toBeDefined();
    expect(titleChange.oldValue).toBe("Palm Meadows");
    expect(titleChange.newValue).toBe("Palm Meadows Phase 2");

    const statusChange = diff.find(c => c.field === "status");
    expect(statusChange).toBeDefined();
    expect(statusChange.oldValue).toBe("AVAILABLE");
    expect(statusChange.newValue).toBe("SOLD");

    const priceChange = diff.find(c => c.field === "price");
    expect(priceChange).toBeDefined();
    expect(priceChange.oldValue).toBe(15000000);
    expect(priceChange.newValue).toBe(18000000);

    const bhkChange = diff.find(c => c.field === "bhk");
    expect(bhkChange).toBeDefined();
  });

  it("should delegate to logsService when property is updated", async () => {
    const mockExisting = {
      id: "prop_100",
      title: "Trump Tower",
      dealType: "BOOKING",
      status: "AVAILABLE",
      price: 25000000
    };

    vi.spyOn(propertyRepository, "findById").mockResolvedValue(mockExisting);
    vi.spyOn(propertyRepository, "update").mockImplementation(async (id, data) => ({
      ...mockExisting,
      ...data
    }));
    const logSpy = vi.spyOn(logsService, "logPropertyUpdate").mockResolvedValue({ id: "audit_1" });

    const executiveUser = {
      id: "usr_exec_12",
      name: "Rohit Sharma",
      email: "rohit@triumph.com",
      role: "EXECUTIVE"
    };

    await inventoryService.updateProperty(
      "prop_100",
      {
        status: "SOLD",
        price: 28000000
      },
      executiveUser
    );

    expect(logSpy).toHaveBeenCalledWith(
      mockExisting,
      { status: "SOLD", price: 28000000 },
      expect.objectContaining({ status: "SOLD", price: 28000000 }),
      executiveUser
    );
  });

  it("should delegate to logsService when querying audit logs", async () => {
    const mockLogs = [
      {
        id: "log_1",
        propertyId: "prop_100",
        propertyTitle: "Trump Tower",
        action: "STATUS_CHANGE",
        userName: "Rohit Sharma",
        summary: "Status changed from AVAILABLE to SOLD",
        createdAt: new Date()
      }
    ];

    vi.spyOn(logsService, "listLogs").mockResolvedValue({
      logs: mockLogs,
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });

    const result = await inventoryService.listAuditLogs({ page: 1, limit: 10, action: "STATUS_CHANGE" });
    expect(result.logs.length).toBe(1);
    expect(result.pagination.total).toBe(1);
    expect(result.logs[0].userName).toBe("Rohit Sharma");
  });
});
