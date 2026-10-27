import { z } from "zod";

const emptyStringToNull = (val) => {
  if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
    return null;
  }
  return val;
};

const optionalDate = z
  .preprocess(emptyStringToNull, z.union([z.string(), z.date()]).nullable().optional())
  .transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  });

const optionalNumber = (schema = z.number()) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }, schema.nullable().optional());

const optionalString = z.preprocess(emptyStringToNull, z.string().nullable().optional());

const areaSchema = z.object({
  areaType: z.string().min(1, "Area type is required"),
  value: z.coerce.number().positive("Area value must be positive"),
  unit: z.string().min(1, "Area unit is required"),
  minArea: optionalNumber(z.number().positive()),
  maxArea: optionalNumber(z.number().positive())
});

const unitSchema = z.object({
  unitName: z.string().min(1, "Unit name is required"),
  area: z.coerce.number().positive("Unit area must be positive"),
  areaUnit: z.string().default("sq. ft."),
  price: z.coerce.number().nonnegative("Unit price must be non-negative"),
  status: z.enum(["AVAILABLE", "TAGGED", "BOOKED", "SOLD"]).default("AVAILABLE"),
  leadId: optionalString
});

export const basePropertySchema = z.object({
  dealType: z.enum(["BOOKING", "RETRADE", "LEASE"]),
  title: z.string().min(2, "Title / Project name is required"),
  developerId: optionalString,
  developerName: optionalString,
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  projectSociety: optionalString,

  // Configurations
  bhk: z.array(z.string()).default([]),
  additionalSelection: z.array(z.string()).default([]),
  furnishing: optionalString,

  // Pricing
  price: optionalNumber(z.number().nonnegative()),
  minPrice: optionalNumber(z.number().nonnegative()),
  maxPrice: optionalNumber(z.number().nonnegative()),
  priceUnit: optionalString,
  pricePerUnitArea: optionalNumber(z.number().nonnegative()),
  paymentPlan: optionalString,

  // Lease specific
  monthlyRent: optionalNumber(z.number().nonnegative()),
  securityDeposit: optionalString,
  maintenanceCharges: optionalNumber(z.number().nonnegative()),
  maintenanceFrequency: optionalString,
  availableFor: z.array(z.string()).default([]),
  leaseDuration: optionalNumber(z.number().int().nonnegative()),
  lockInPeriod: optionalNumber(z.number().int().nonnegative()),
  leaseAvailability: optionalString,
  availableFromDate: optionalDate,

  // Retrade / Booking
  facingDirection: optionalString,
  availabilityStatus: optionalString,
  possessionDate: optionalDate,
  projectStatus: optionalString,
  possessionMonth: optionalString,
  possessionYear: optionalNumber(z.number().int()),

  // Plot specific
  boundaryWall: z.boolean().optional().nullable(),
  plotShape: optionalString,
  constructionAllowed: z.boolean().optional().nullable(),
  plotLength: optionalNumber(z.number().positive()),
  plotBreadth: optionalNumber(z.number().positive()),

  // Structural
  numberOfStoreys: optionalNumber(z.number().int().nonnegative()),
  numberOfUnits: optionalNumber(z.number().int().nonnegative()),
  numberOfRooms: optionalNumber(z.number().int().nonnegative()),
  floorNumber: optionalString,
  totalFloors: optionalNumber(z.number().int().nonnegative()),
  propertyAge: optionalString,
  servantPujaStore: z.array(z.string()).default([]),
  parkingType: optionalString,
  numberOfParkings: optionalNumber(z.number().int().nonnegative()),
  ceilingHeight: optionalNumber(z.number().positive()),
  numberOfLifts: optionalNumber(z.number().int().nonnegative()),
  numberOfWashrooms: optionalNumber(z.number().int().nonnegative()),
  washroomType: optionalString,
  powerBackup: z.boolean().optional().nullable(),
  airConditioning: z.boolean().optional().nullable(),
  connections: optionalString,

  // Commercial / Pre-leased
  preLeased: z.boolean().optional().nullable(),
  preLeasedDetails: optionalString,
  roiPercentage: optionalNumber(z.number().nonnegative()),

  // Furnishings
  furnishings: z.record(z.any()).optional().nullable(),

  // USP & Amenities
  usps: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),

  // Content & Contact
  description: z.string().optional().nullable(),
  status: z.enum(["AVAILABLE", "UNDER_REVIEW", "SOLD", "RENT_OUT", "LOST"]).default("AVAILABLE"),
  sellerName: z.string().optional().nullable(),
  sellerPhone: z.string().optional().nullable(),
  developerContactName: z.string().optional().nullable(),
  developerContactNumber: z.string().optional().nullable(),
  developerContactDesignation: z.string().optional().nullable(),

  // Multi-area & units
  areas: z.array(areaSchema).min(1, "At least one area measurement is required"),
  units: z.array(unitSchema).optional().default([]),
  media: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string().optional().nullable(),
    size: z.number().optional().nullable(),
    mimeType: z.string().optional().nullable()
  })).optional().default([])
});

const leaseDurationRefinement = (data) => {
  if (data.dealType === "LEASE" && data.leaseDuration && data.lockInPeriod) {
    return data.lockInPeriod <= data.leaseDuration;
  }
  return true;
};

const leaseRefineOptions = {
  message: "Lock-in period cannot exceed lease duration",
  path: ["lockInPeriod"]
};

export const createPropertySchema = basePropertySchema.refine(leaseDurationRefinement, leaseRefineOptions);

export const updatePropertySchema = basePropertySchema.partial().extend({
  areas: z.array(areaSchema).optional(),
  units: z.array(unitSchema).optional()
}).refine(leaseDurationRefinement, leaseRefineOptions);

export const queryPropertySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  dealType: z.enum(["BOOKING", "RETRADE", "LEASE"]).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  status: z.string().optional(),
  developerId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minArea: z.coerce.number().optional(),
  maxArea: z.coerce.number().optional(),
  bhk: z.string().optional(),
  projectStatus: z.string().optional(),
  availabilityStatus: z.string().optional(),
  facingDirection: z.string().optional(),
  dateAdded: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc", "area_asc", "area_desc"]).default("newest")
});

export const createUnitSchema = unitSchema;
export const updateUnitSchema = unitSchema.partial();
export const tagUnitSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required")
});
