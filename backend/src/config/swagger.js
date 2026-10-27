import swaggerUi from "swagger-ui-express";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Triumph Real Estate CRM - REST API Specification",
    version: "1.0.0",
    description: `
### Overview
Triumph CRM is a production-grade Real Estate Customer Relationship Management backend. It delivers comprehensive services for property inventory management (Booking, Retrade, Lease), project units, lead ingestion, staff administration, system resources, and full audit logging.

### Architecture & Key Subsystems
- **Express.js API Layer**: Modular domain architecture with unified error handling, schema validations, and async route wrappers.
- **PostgreSQL & Prisma ORM**: Relational persistence engine with strong foreign keys, cascading integrity, and transactional audit trails.
- **Redis Cache & Session Store**: Distributed session management, query caching for inventory listings, and brute-force lockout guards.
- **Better Auth & Custom Auth Engine**: Dual-compatible session-based authentication using HTTP-only secure cookies.
- **R2 / Multer Storage**: Multi-file media pipeline for high-resolution property imagery, brochures, layout schematics, and CSV/Excel lead files.

---

### Authentication & Authorization
Most endpoints require an authenticated user session.
1. Authenticate by submitting credentials to \`POST /api/v1/auth/login\`.
2. On success, the server responds with user details and sets an HTTP-only cookie named \`triumph_session\`.
3. Subsequent requests include this cookie automatically.
4. Access control is enforced via Role-Based Access Control (**RBAC**):
   - **ADMIN**: Unrestricted administrative authority. Manages users, settings, system resources, approvals, and full audit history.
   - **EXECUTIVE**: Sales & leasing operations. Can browse, create, and manage inventory, import leads, and request seller contact clearance.

---

### Standard Response Envelope
All API endpoints consistently return responses structured within a predictable JSON envelope:

#### Successful Operation
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation message"
}
\`\`\`

#### Error Operation
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title and locality are required fields.",
    "details": [ ... ]
  }
}
\`\`\`
`, 
    license: {
      name: "Proprietary / Triumph Estates CRM",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
    {
      url: "/",
      description: "Current Host Relative Server",
    },
  ],
  tags: [
    { name: "System", description: "Health diagnostics, subsystem availability checks, and service readiness" },
    { name: "Auth", description: "Session authentication, credentials verification, logout, and current user identity" },
    { name: "Users", description: "Staff and user management, profile updates, password resets, and manual verification" },
    { name: "Resources", description: "System configuration lookups: Lead Sources, Inventory Categories, and Pipeline Stages" },
    { name: "Leads", description: "Lead pipeline ingestion, data parsing, and bulk CSV/Excel spreadsheet uploads" },
    { name: "Inventory", description: "Property management across Booking, Retrade, and Lease deal types, multi-area specs, and media" },
    { name: "Inventory Units", description: "Project units lifecycle for booking developments, pricing, and lead-to-unit tagging" },
    { name: "Inventory Approvals", description: "Executive submission review workflow, administrative property approvals, and revision requests" },
    { name: "Seller Clearance", description: "Confidential seller & landlord contact access requests, query threads, and approval authorizations" },
    { name: "Audit Logs", description: "Compliance logging, deep field-level diff inspection, and administrative audit history" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "triumph_session",
        description: "HTTP-only session cookie set automatically on login via `POST /api/v1/auth/login`.",
      },
    },
    schemas: {
      // -------------------------------------------------------------
      // CORE ENVELOPES & SYSTEM
      // -------------------------------------------------------------
      ApiResponse: {
        type: "object",
        required: ["success"],
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object", description: "Payload returned by the endpoint" },
          message: { type: "string", example: "Operation executed successfully" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            required: ["message"],
            properties: {
              code: { type: "string", example: "UNAUTHENTICATED" },
              message: { type: "string", example: "Authentication required to access this resource" },
              details: { type: "array", items: { type: "object" }, description: "Specific field errors" },
            },
          },
        },
      },
      HealthCheck: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          timestamp: { type: "string", format: "date-time", example: "2026-10-28T02:00:00.000Z" },
          port: { type: "integer", example: 5000 },
          services: {
            type: "object",
            properties: {
              database: { type: "string", example: "healthy" },
              redis: { type: "string", example: "healthy" },
              r2_storage: { type: "string", example: "configured" },
              email: { type: "string", example: "configured" },
            },
          },
        },
      },

      // -------------------------------------------------------------
      // USER & AUTHENTICATION SCHEMAS
      // -------------------------------------------------------------
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "cmv1234567890abcdef" },
          name: { type: "string", example: "Rahul Sharma" },
          email: { type: "string", format: "email", example: "rahul.sharma@triumphcrm.com" },
          emailVerified: { type: "boolean", example: true },
          image: { type: "string", nullable: true, example: "https://media.triumphcrm.com/avatars/user_1.png" },
          phone: { type: "string", nullable: true, example: "+91 98101 23456" },
          address: { type: "string", nullable: true, example: "Golf Course Road, Sector 54, Gurugram" },
          role: { type: "string", enum: ["ADMIN", "EXECUTIVE"], example: "EXECUTIVE" },
          department: {
            type: "string",
            enum: ["PRE_SALES", "SALES", "LEASING", "CRM"],
            nullable: true,
            example: "SALES",
          },
          officeNumber: { type: "string", nullable: true, example: "Tower A, Suite 302" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@triumphcrm.com" },
          password: { type: "string", format: "password", example: "admin123" },
        },
      },
      CreateUserRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Aman Verma" },
          email: { type: "string", format: "email", example: "aman.verma@triumphcrm.com" },
          password: { type: "string", minLength: 8, example: "SecurePass@2026" },
          role: { type: "string", enum: ["ADMIN", "EXECUTIVE"], default: "EXECUTIVE" },
          department: { type: "string", enum: ["PRE_SALES", "SALES", "LEASING", "CRM"], example: "SALES" },
          phone: { type: "string", example: "+91 98765 43210" },
          address: { type: "string", example: "Cyber City, DLF Phase 2, Gurugram" },
          officeNumber: { type: "string", example: "Cabin 4B" },
          image: { type: "string", nullable: true },
          emailVerified: { type: "boolean", default: true },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Aman Verma" },
          role: { type: "string", enum: ["ADMIN", "EXECUTIVE"] },
          department: { type: "string", enum: ["PRE_SALES", "SALES", "LEASING", "CRM"] },
          phone: { type: "string", example: "+91 98765 43210" },
          address: { type: "string", example: "Cyber City, Gurugram" },
          officeNumber: { type: "string", example: "Cabin 4B" },
          image: { type: "string", nullable: true },
          isActive: { type: "boolean", example: true },
          emailVerified: { type: "boolean", example: true },
          password: { type: "string", minLength: 8, description: "Optional new password for user" },
        },
      },
      UpdateMyProfileRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Rahul Sharma" },
          phone: { type: "string", example: "+91 98101 23456" },
          address: { type: "string", example: "Golf Course Road, Gurugram" },
          image: { type: "string", example: "https://media.triumphcrm.com/avatars/user_1.png" },
        },
      },
      UpdatePasswordRequest: {
        type: "object",
        required: ["oldPassword", "newPassword"],
        properties: {
          oldPassword: { type: "string", example: "OldSecret@123" },
          newPassword: { type: "string", minLength: 8, example: "NewSecure@2026" },
        },
      },
      ResetUserPasswordRequest: {
        type: "object",
        required: ["newPassword"],
        properties: {
          newPassword: { type: "string", minLength: 8, example: "TemporaryPass@2026" },
        },
      },
      BulkDeleteUsersRequest: {
        type: "object",
        required: ["ids"],
        properties: {
          ids: {
            type: "array",
            items: { type: "string" },
            example: ["cmv12345abc", "cmv67890def"],
          },
        },
      },

      // -------------------------------------------------------------
      // RESOURCES SCHEMAS
      // -------------------------------------------------------------
      ResourceItem: {
        type: "object",
        properties: {
          id: { type: "string", example: "cly_res_123" },
          name: { type: "string", example: "Digital Marketing Campaign" },
          order: { type: "integer", example: 1 },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceCreateRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Referral Network" },
          order: { type: "integer", example: 4 },
          isActive: { type: "boolean", default: true },
        },
      },
      ResourceUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Channel Partner Network" },
          order: { type: "integer", example: 3 },
          isActive: { type: "boolean", example: true },
        },
      },

      // -------------------------------------------------------------
      // LEADS SCHEMAS
      // -------------------------------------------------------------
      LeadImportResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              importedCount: { type: "integer", example: 142 },
              duplicateCount: { type: "integer", example: 8 },
              failedCount: { type: "integer", example: 2 },
              errors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    row: { type: "integer", example: 15 },
                    reason: { type: "string", example: "Invalid phone number format" },
                  },
                },
              },
            },
          },
        },
      },

      // -------------------------------------------------------------
      // INVENTORY & PROPERTY SCHEMAS
      // -------------------------------------------------------------
      PropertyArea: {
        type: "object",
        required: ["areaType", "value", "unit"],
        properties: {
          id: { type: "string", example: "cly_area_001" },
          areaType: { type: "string", example: "Super Area", enum: ["Super Area", "Carpet Area", "Built-up Area", "Plot Area"] },
          value: { type: "number", example: 2450 },
          unit: { type: "string", example: "sq. ft.", enum: ["sq. ft.", "sq. m.", "sq. yd.", "acre", "kanal"] },
          minArea: { type: "number", nullable: true, example: 2200 },
          maxArea: { type: "number", nullable: true, example: 2600 },
        },
      },
      PropertyMedia: {
        type: "object",
        required: ["type", "url"],
        properties: {
          id: { type: "string", example: "cly_med_001" },
          type: { type: "string", enum: ["IMAGE", "VIDEO", "DOCUMENT", "BROCHURE", "LAYOUT"], example: "IMAGE" },
          url: { type: "string", example: "/uploads/inv-1792996682857-282006632.png" },
          name: { type: "string", nullable: true, example: "Living_Room_Interior.png" },
          size: { type: "integer", nullable: true, example: 1729206 },
          mimeType: { type: "string", nullable: true, example: "image/png" },
        },
      },
      ProjectUnit: {
        type: "object",
        required: ["unitName", "area", "price"],
        properties: {
          id: { type: "string", example: "cly_unit_001" },
          propertyId: { type: "string", example: "prop_dlf_001" },
          unitName: { type: "string", example: "Tower 2 - Unit 1402" },
          area: { type: "number", example: 2150 },
          areaUnit: { type: "string", example: "sq. ft." },
          price: { type: "number", example: 32500000 },
          status: { type: "string", enum: ["AVAILABLE", "TAGGED", "BOOKED", "SOLD"], example: "AVAILABLE" },
          leadId: { type: "string", nullable: true, example: "lead_rahul_99" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Property: {
        type: "object",
        required: ["id", "dealType", "title", "category", "subcategory", "city", "locality", "status"],
        properties: {
          id: { type: "string", example: "prop_dlf_camellias_01" },
          dealType: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"], example: "RETRADE" },
          title: { type: "string", example: "The Camellias Luxury Golf Residence" },
          developerId: { type: "string", nullable: true, example: "dev_dlf" },
          developerName: { type: "string", nullable: true, example: "DLF" },
          category: { type: "string", example: "Residential" },
          subcategory: { type: "string", example: "Apartment" },
          city: { type: "string", example: "Gurugram" },
          locality: { type: "string", example: "Golf Course Road, Sector 42" },
          projectSociety: { type: "string", nullable: true, example: "DLF Golf Links" },
          bhk: { type: "array", items: { type: "string" }, example: ["4 BHK", "5 BHK"] },
          additionalSelection: { type: "array", items: { type: "string" }, example: ["Penthouse", "Study Room"] },
          furnishing: { type: "string", nullable: true, example: "Fully Furnished" },
          price: { type: "number", nullable: true, example: 285000000 },
          minPrice: { type: "number", nullable: true, example: 270000000 },
          maxPrice: { type: "number", nullable: true, example: 300000000 },
          priceUnit: { type: "string", nullable: true, example: "Crores" },
          pricePerUnitArea: { type: "number", nullable: true, example: 38500 },
          monthlyRent: { type: "number", nullable: true, example: 450000 },
          securityDeposit: { type: "string", nullable: true, example: "3 Months Rent" },
          maintenanceCharges: { type: "number", nullable: true, example: 35000 },
          maintenanceFrequency: { type: "string", nullable: true, example: "Per Month" },
          availableFor: { type: "array", items: { type: "string" }, example: ["Family", "Corporate"] },
          leaseDuration: { type: "integer", nullable: true, example: 36 },
          lockInPeriod: { type: "integer", nullable: true, example: 12 },
          leaseAvailability: { type: "string", nullable: true, example: "Immediate" },
          availableFromDate: { type: "string", format: "date-time", nullable: true },
          facingDirection: { type: "string", nullable: true, example: "North-East" },
          availabilityStatus: { type: "string", nullable: true, example: "Ready to Move" },
          possessionDate: { type: "string", format: "date-time", nullable: true },
          projectStatus: { type: "string", nullable: true, example: "Delivered" },
          possessionMonth: { type: "string", nullable: true, example: "December" },
          possessionYear: { type: "integer", nullable: true, example: 2024 },
          boundaryWall: { type: "boolean", nullable: true, example: true },
          plotShape: { type: "string", nullable: true, example: "Regular" },
          constructionAllowed: { type: "boolean", nullable: true, example: true },
          plotLength: { type: "number", nullable: true, example: 80 },
          plotBreadth: { type: "number", nullable: true, example: 45 },
          numberOfStoreys: { type: "integer", nullable: true, example: 32 },
          numberOfUnits: { type: "integer", nullable: true, example: 429 },
          numberOfRooms: { type: "integer", nullable: true, example: 6 },
          floorNumber: { type: "string", nullable: true, example: "18" },
          totalFloors: { type: "integer", nullable: true, example: 32 },
          propertyAge: { type: "string", nullable: true, example: "0-1 Years" },
          servantPujaStore: { type: "array", items: { type: "string" }, example: ["Servant Room", "Puja Room"] },
          parkingType: { type: "string", nullable: true, example: "Covered" },
          numberOfParkings: { type: "integer", nullable: true, example: 4 },
          ceilingHeight: { type: "number", nullable: true, example: 11.5 },
          numberOfLifts: { type: "integer", nullable: true, example: 4 },
          numberOfWashrooms: { type: "integer", nullable: true, example: 5 },
          washroomType: { type: "string", nullable: true, example: "Private" },
          powerBackup: { type: "boolean", nullable: true, example: true },
          airConditioning: { type: "boolean", nullable: true, example: true },
          connections: { type: "string", nullable: true, example: "3 Phase Electric, PNG Pipeline" },
          preLeased: { type: "boolean", nullable: true, example: false },
          preLeasedDetails: { type: "string", nullable: true },
          roiPercentage: { type: "number", nullable: true },
          furnishings: { type: "object", nullable: true },
          usps: { type: "array", items: { type: "string" }, example: ["Golf Course Facing", "Private Lift Lobby"] },
          amenities: { type: "array", items: { type: "string" }, example: ["Clubhouse", "Olympic Pool", "Concierge"] },
          description: { type: "string", nullable: true, example: "Ultra-luxury residence offering panoramic golf course views." },
          status: { type: "string", enum: ["AVAILABLE", "UNDER_REVIEW", "SOLD", "RENT_OUT", "LOST"], example: "AVAILABLE" },
          sellerName: { type: "string", nullable: true, description: "Restricted to Admin role unless executive cleared", example: "Sunita Grover" },
          sellerPhone: { type: "string", nullable: true, description: "Restricted to Admin role unless executive cleared", example: "+91 98101 88765" },
          developerContactName: { type: "string", nullable: true, example: "Vikram Malhotra" },
          developerContactNumber: { type: "string", nullable: true, example: "+91 98111 00223" },
          developerContactDesignation: { type: "string", nullable: true, example: "AVP Sales" },
          primaryArea: { type: "number", nullable: true, example: 7400 },
          primaryAreaUnit: { type: "string", nullable: true, example: "sq. ft." },
          areas: { type: "array", items: { $ref: "#/components/schemas/PropertyArea" } },
          media: { type: "array", items: { $ref: "#/components/schemas/PropertyMedia" } },
          units: { type: "array", items: { $ref: "#/components/schemas/ProjectUnit" } },
          createdById: { type: "string", nullable: true, example: "cmv_exec_001" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreatePropertyRequest: {
        type: "object",
        required: ["dealType", "title", "category", "subcategory", "city", "locality", "areas"],
        properties: {
          dealType: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"], example: "RETRADE" },
          title: { type: "string", example: "Tatvam Villas Luxury Independent Villa" },
          developerName: { type: "string", example: "Vipul" },
          category: { type: "string", example: "Residential" },
          subcategory: { type: "string", example: "Villa" },
          city: { type: "string", example: "Gurugram" },
          locality: { type: "string", example: "Sector 48, Sohna Road" },
          projectSociety: { type: "string", example: "Tatvam Villas" },
          bhk: { type: "array", items: { type: "string" }, example: ["4 BHK", "5 BHK"] },
          furnishing: { type: "string", example: "Semi Furnished" },
          price: { type: "number", example: 115000000 },
          priceUnit: { type: "string", example: "Crores" },
          sellerName: { type: "string", example: "Sunita Grover", description: "Masked for executives until clearance is authorized" },
          sellerPhone: { type: "string", example: "+91 98101 88765", description: "Masked for executives until clearance is authorized" },
          areas: {
            type: "array",
            items: { $ref: "#/components/schemas/PropertyArea" },
            example: [{ areaType: "Super Area", value: 4800, unit: "sq. ft." }],
          },
          units: {
            type: "array",
            items: { $ref: "#/components/schemas/ProjectUnit" },
            description: "Optional initial unit stock for Booking developments",
          },
          usps: { type: "array", items: { type: "string" }, example: ["Private Swimming Pool", "Corner Plot"] },
          amenities: { type: "array", items: { type: "string" }, example: ["Clubhouse", "24/7 Security", "Gymnasium"] },
          description: { type: "string", example: "Prime independent luxury villa with landscaped private garden." },
        },
      },
      UpdatePropertyRequest: {
        type: "object",
        description: "Partial payload for updating an existing property listing",
        properties: {
          title: { type: "string", example: "Updated Property Title" },
          price: { type: "number", example: 120000000 },
          monthlyRent: { type: "number", example: 180000 },
          status: { type: "string", enum: ["AVAILABLE", "UNDER_REVIEW", "SOLD", "RENT_OUT", "LOST"] },
          furnishing: { type: "string", example: "Fully Furnished" },
          sellerName: { type: "string" },
          sellerPhone: { type: "string" },
          areas: { type: "array", items: { $ref: "#/components/schemas/PropertyArea" } },
          units: { type: "array", items: { $ref: "#/components/schemas/ProjectUnit" } },
          description: { type: "string" },
        },
      },
      TagUnitRequest: {
        type: "object",
        required: ["leadId"],
        properties: {
          leadId: { type: "string", example: "lead_cmv_9021", description: "ID of the lead to associate with this unit" },
        },
      },
      InventoryMasterDataResponse: {
        type: "object",
        properties: {
          developers: { type: "array", items: { type: "string" }, description: "71 curated real estate developers (DLF, Godrej, M3M, etc.)" },
          categories: { type: "array", items: { type: "string" }, example: ["Residential", "Commercial"] },
          subcategories: { type: "object", description: "Subcategory mapping grouped by parent category" },
          uspGroups: { type: "object", description: "Grouped USPs (Connectivity, Location, Architecture, etc.)" },
          amenitiesGroups: { type: "object", description: "Grouped Amenities (Security, Lifestyle, Sports, etc.)" },
          bhkOptions: { type: "array", items: { type: "string" }, example: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "Penthouse"] },
          dealTypes: { type: "array", items: { type: "string" }, example: ["BOOKING", "RETRADE", "LEASE"] },
        },
      },
      InventoryMetricsResponse: {
        type: "object",
        properties: {
          total: { type: "integer", example: 248 },
          byDealType: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dealType: { type: "string", example: "RETRADE" },
                _count: { type: "integer", example: 140 },
              },
            },
          },
          byStatus: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string", example: "UNDER_REVIEW" },
                _count: { type: "integer", example: 12 },
              },
            },
          },
        },
      },

      // -------------------------------------------------------------
      // SELLER CLEARANCE SCHEMAS
      // -------------------------------------------------------------
      SellerClearanceRequest: {
        type: "object",
        properties: {
          id: { type: "string", example: "clr_req_101" },
          propertyId: { type: "string", example: "prop_dlf_camellias_01" },
          propertyTitle: { type: "string", example: "The Camellias Luxury Golf Residence" },
          dealType: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"], example: "RETRADE" },
          locality: { type: "string", example: "Golf Course Road, Sector 42" },
          price: { type: "number", example: 285000000 },
          executiveId: { type: "string", example: "cmv_exec_001" },
          requestedBy: { type: "string", example: "Rahul Sharma" },
          requestedByEmail: { type: "string", format: "email", example: "rahul.sharma@triumphcrm.com" },
          reason: {
            type: "string",
            enum: [
              "Client Site Visit Scheduled",
              "Direct Negotiation Required",
              "Documentation / Title Verification",
              "Price & Payment Term Discussion",
            ],
            example: "Client Site Visit Scheduled",
          },
          clientName: { type: "string", nullable: true, example: "Deepak Singhal" },
          notes: { type: "string", nullable: true, example: "Client is flying in for high-net-worth site walkthrough." },
          status: { type: "string", enum: ["PENDING", "APPROVED", "QUERY_ASKED", "REJECTED"], example: "PENDING" },
          adminFeedback: { type: "string", nullable: true, example: "Please provide pre-approval financial document." },
          adminName: { type: "string", nullable: true, example: "Super Admin" },
          adminActionAt: { type: "string", format: "date-time", nullable: true },
          executiveReply: { type: "string", nullable: true, example: "Client pre-approved with HDFC Wealth. Letter attached." },
          executiveRepliedAt: { type: "string", format: "date-time", nullable: true },
          dismissedByExecutive: { type: "boolean", example: false },
          dismissedByAdmin: { type: "boolean", example: false },
          sellerName: { type: "string", nullable: true, example: "Sunita Grover", description: "Unmasked only when status is APPROVED" },
          sellerPhone: { type: "string", nullable: true, example: "+91 98101 88765", description: "Unmasked only when status is APPROVED" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SubmitClearancePayload: {
        type: "object",
        required: ["reason"],
        properties: {
          propertyTitle: { type: "string", example: "Tatvam Villas Luxury Independent Villa" },
          reason: {
            type: "string",
            enum: [
              "Client Site Visit Scheduled",
              "Direct Negotiation Required",
              "Documentation / Title Verification",
              "Price & Payment Term Discussion",
            ],
            example: "Client Site Visit Scheduled",
          },
          clientName: { type: "string", example: "Vikram Singhania" },
          notes: { type: "string", example: "Site visit confirmed for tomorrow at 4 PM." },
        },
      },
      DecideClearancePayload: {
        type: "object",
        required: ["action"],
        properties: {
          action: {
            type: "string",
            enum: ["APPROVE", "REJECT", "QUERY", "REPLY", "REVOKE", "DISMISS", "DELETE"],
            example: "APPROVE",
            description: "APPROVE, REJECT, QUERY are restricted to Admin. REPLY is submitted by Executive.",
          },
          feedback: { type: "string", example: "Please confirm client's budget and purchase timeline." },
          reply: { type: "string", example: "Client budget is ₹12 Cr verified with bank statement." },
        },
      },

      // -------------------------------------------------------------
      // AUDIT LOGS SCHEMAS
      // -------------------------------------------------------------
      PropertyAuditLog: {
        type: "object",
        properties: {
          id: { type: "string", example: "log_cly_0099" },
          module: { type: "string", example: "INVENTORY" },
          propertyId: { type: "string", nullable: true, example: "prop_dlf_camellias_01" },
          propertyTitle: { type: "string", example: "The Camellias Luxury Golf Residence" },
          dealType: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"], example: "RETRADE" },
          action: { type: "string", enum: ["CREATE", "UPDATE", "STATUS_CHANGE", "DELETE", "UNIT_UPDATE"], example: "UPDATE" },
          userId: { type: "string", nullable: true, example: "user_admin_01" },
          userName: { type: "string", example: "Admin User" },
          userEmail: { type: "string", nullable: true, example: "admin@triumphcrm.com" },
          userRole: { type: "string", nullable: true, example: "ADMIN" },
          summary: { type: "string", example: "Price updated from ₹25 Cr to ₹28.5 Cr" },
          changes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "price" },
                label: { type: "string", example: "Listing Price" },
                oldValue: { type: "string", example: "250000000" },
                newValue: { type: "string", example: "285000000" },
              },
            },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AuditLogStatsResponse: {
        type: "object",
        properties: {
          total: { type: "integer", example: 1240 },
          statusChanges: { type: "integer", example: 180 },
          updates: { type: "integer", example: 640 },
          creates: { type: "integer", example: 380 },
          deletes: { type: "integer", example: 40 },
        },
      },
    },
  },
  paths: {
    // =========================================================================
    // SYSTEM HEALTH
    // =========================================================================
    "/health": {
      get: {
        tags: ["System"],
        summary: "System Health & Diagnostic Check",
        description: "Inspects live connectivity across core services: PostgreSQL database via Prisma, Redis distributed cache, R2 Cloudflare media storage, and Resend transactional email API.",
        responses: {
          200: {
            description: "All core subsystems are operating normally",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthCheck" } } },
          },
          503: {
            description: "One or more critical subsystems (Database or Redis) are degraded or offline",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthCheck" } } },
          },
        },
      },
    },

    // =========================================================================
    // AUTHENTICATION & SESSIONS
    // =========================================================================
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate User & Establish Session",
        description: "Validates email and password credentials for Administrators or Executives. Upon verification, generates a Redis-backed session token and sets an HTTP-only `triumph_session` cookie.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: {
            description: "Authentication successful. Returns user profile and session metadata.",
            headers: {
              "Set-Cookie": {
                schema: { type: "string", example: "triumph_session=s_xyz12345; Path=/; HttpOnly; SameSite=Lax" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        session: { type: "object", properties: { token: { type: "string" }, expiresAt: { type: "string", format: "date-time" } } },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Missing email or password in request body", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          401: { description: "Invalid email or password credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Account deactivated or email verification pending", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          429: { description: "Security lockout guard triggered: too many consecutive failed login attempts (5 attempts limit)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Terminate Active Session",
        description: "Invalidates the active session token in the Redis cluster and clears the `triumph_session` HTTP-only cookie.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Session successfully invalidated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get Authenticated Session Context",
        description: "Returns identity, role, and department data of the user currently authenticated via the session cookie.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Session context successfully retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthenticated: Missing or expired session cookie", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // =========================================================================
    // USERS & STAFF MANAGEMENT
    // =========================================================================
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get My Full Profile",
        description: "Fetches complete profile details for the currently authenticated user (Executive or Admin).",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "User profile retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update My Profile Information",
        description: "Allows any authenticated employee (Executive or Admin) to update their personal information: name, phone, address, and profile photo.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMyProfileRequest" } } },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: { description: "Invalid profile data payload", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          401: { description: "Unauthenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/me/password": {
      patch: {
        tags: ["Users"],
        summary: "Change Own Account Password (Admin Only)",
        description: "Changes the authenticated administrator's password after verifying their existing password.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePasswordRequest" } } },
        },
        responses: {
          200: { description: "Password successfully changed", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          400: { description: "Invalid password format (minimum 8 characters required)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          401: { description: "Incorrect existing password supplied", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Forbidden: Endpoint requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List All Staff Members (Admin Only)",
        description: "Retrieves complete directory of staff members and executives with status and contact details.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Staff directory list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/User" } },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create New Staff Member (Admin Only)",
        description: "Provisions a new staff account (Executive or Administrator) with designated department, office, and credentials.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateUserRequest" } } },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: { description: "Missing mandatory fields or password too short", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "User email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/{id}": {
      patch: {
        tags: ["Users"],
        summary: "Update Staff Details (Admin Only)",
        description: "Allows Administrators to edit staff roles, departments, office numbers, deactivation status, or reset credentials.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, description: "Target User ID", schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateUserRequest" } } },
        },
        responses: {
          200: {
            description: "Staff details updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden: Requires role ADMIN or self-demotion prevented", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete Staff Member (Admin Only)",
        description: "Permanently removes a user record and invalidates all associated active sessions.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, description: "Target User ID", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "User successfully deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          403: { description: "Forbidden: Administrators cannot delete their own account", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/{id}/password": {
      patch: {
        tags: ["Users"],
        summary: "Admin Reset User Password",
        description: "Enables an Administrator to directly assign a new password for any staff member, terminating their existing sessions.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, description: "Target User ID", schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetUserPasswordRequest" } } },
        },
        responses: {
          200: { description: "User password reset successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          400: { description: "New password must be at least 8 characters long", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/{id}/verify": {
      post: {
        tags: ["Users"],
        summary: "Manually Verify User Email (Admin Only)",
        description: "Manually marks a staff account's email as verified, bypassing verification OTP requirements.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, description: "Target User ID", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "User email manually marked as verified", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/bulk": {
      delete: {
        tags: ["Users"],
        summary: "Bulk Delete Users (Admin Only)",
        description: "Deletes multiple user accounts in a single atomic transaction while preventing self-deletion.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BulkDeleteUsersRequest" } } },
        },
        responses: {
          200: { description: "Bulk deletion completed", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          400: { description: "IDs array is required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // =========================================================================
    // SYSTEM RESOURCES & SETTINGS (ADMIN ONLY)
    // =========================================================================
    "/api/v1/resources/lead-sources": {
      get: {
        tags: ["Resources"],
        summary: "List Lead Sources",
        description: "Returns all configured lead marketing sources (e.g. Website, Referral, Portal, Social).",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Lead sources list",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/ResourceItem" } } } } } },
          },
        },
      },
      post: {
        tags: ["Resources"],
        summary: "Create Lead Source",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResourceCreateRequest" } } },
        },
        responses: {
          201: { description: "Created lead source", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        },
      },
    },
    "/api/v1/resources/lead-sources/{id}": {
      patch: {
        tags: ["Resources"],
        summary: "Update Lead Source",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResourceUpdateRequest" } } },
        },
        responses: { 200: { description: "Updated lead source" } },
      },
      delete: {
        tags: ["Resources"],
        summary: "Delete Lead Source",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted lead source" } },
      },
    },
    "/api/v1/resources/inventory-categories": {
      get: {
        tags: ["Resources"],
        summary: "List Inventory Categories",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Inventory categories list",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/ResourceItem" } } } } } },
          },
        },
      },
      post: {
        tags: ["Resources"],
        summary: "Create Inventory Category",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResourceCreateRequest" } } },
        },
        responses: { 201: { description: "Created inventory category" } },
      },
    },
    "/api/v1/resources/inventory-categories/{id}": {
      patch: {
        tags: ["Resources"],
        summary: "Update Inventory Category",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResourceUpdateRequest" } } },
        },
        responses: { 200: { description: "Updated category" } },
      },
      delete: {
        tags: ["Resources"],
        summary: "Delete Inventory Category",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted category" } },
      },
    },
    "/api/v1/resources/pipeline-stages": {
      get: {
        tags: ["Resources"],
        summary: "List Pipeline Stages",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Pipeline stages ordered by stage index",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/ResourceItem" } } } } } },
          },
        },
      },
      post: {
        tags: ["Resources"],
        summary: "Create Pipeline Stage",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResourceCreateRequest" } } },
        },
        responses: { 201: { description: "Created pipeline stage" } },
      },
    },
    "/api/v1/resources/pipeline-stages/{id}": {
      patch: {
        tags: ["Resources"],
        summary: "Update Pipeline Stage",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResourceUpdateRequest" } } },
        },
        responses: { 200: { description: "Updated pipeline stage" } },
      },
      delete: {
        tags: ["Resources"],
        summary: "Delete Pipeline Stage",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted pipeline stage" } },
      },
    },

    // =========================================================================
    // LEADS MODULE
    // =========================================================================
    "/api/v1/leads/import": {
      post: {
        tags: ["Leads"],
        summary: "Import Leads from CSV/Excel Spreadsheet",
        description: "Uploads, parses, and persists leads from a CSV or Excel spreadsheet with duplicate detection and validation.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary", description: "Spreadsheet file (.csv, .xlsx, .xls)" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Import completed with row-level statistics",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LeadImportResponse" } } },
          },
          400: { description: "Invalid spreadsheet format or unparseable headers", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          401: { description: "Unauthenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // =========================================================================
    // INVENTORY MODULE: PROPERTIES CRUD
    // =========================================================================
    "/api/v1/inventory/master-data": {
      get: {
        tags: ["Inventory"],
        summary: "Get Master Data for Property Forms & Dropdowns",
        description: "Returns reference lists including all 71 approved developers, categories, subcategories, USPs, amenities, BHK options, and facing directions.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Master dropdown dataset",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/InventoryMasterDataResponse" } } } } },
          },
        },
      },
    },
    "/api/v1/inventory/metrics": {
      get: {
        tags: ["Inventory"],
        summary: "Get Inventory Overview Metrics",
        description: "Calculates live metrics grouped by deal type (Booking, Retrade, Lease) and review status (Available, Under Review, Sold).",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Inventory metrics",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/InventoryMetricsResponse" } } } } },
          },
        },
      },
    },
    "/api/v1/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "List Properties with Filtering & Pagination",
        description: "Retrieves a paginated list of properties. When accessed by an Executive, confidential seller contact details (`sellerName`, `sellerPhone`) are masked.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search on title, project, locality" },
          { name: "dealType", in: "query", schema: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "subcategory", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "locality", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["AVAILABLE", "UNDER_REVIEW", "SOLD", "RENT_OUT", "LOST"] } },
          { name: "developerId", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "minArea", in: "query", schema: { type: "number" } },
          { name: "maxArea", in: "query", schema: { type: "number" } },
          { name: "bhk", in: "query", schema: { type: "string" } },
          { name: "projectStatus", in: "query", schema: { type: "string" } },
          { name: "availabilityStatus", in: "query", schema: { type: "string" } },
          { name: "facingDirection", in: "query", schema: { type: "string" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["newest", "price_asc", "price_desc", "area_asc", "area_desc"], default: "newest" } },
        ],
        responses: {
          200: {
            description: "Paginated property list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        properties: { type: "array", items: { $ref: "#/components/schemas/Property" } },
                        pagination: {
                          type: "object",
                          properties: {
                            total: { type: "integer", example: 120 },
                            page: { type: "integer", example: 1 },
                            limit: { type: "integer", example: 12 },
                            totalPages: { type: "integer", example: 10 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Inventory"],
        summary: "Create Property Listing",
        description: "Creates a new property. When created by an Executive, the property is automatically set to `UNDER_REVIEW` and an audit trail log is recorded.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePropertyRequest" } } },
        },
        responses: {
          201: {
            description: "Property successfully created",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Property" } } } } },
          },
          400: { description: "Validation error: Missing mandatory fields or invalid constraints", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/{id}": {
      get: {
        tags: ["Inventory"],
        summary: "Get Property Details by ID",
        description: "Fetches complete property details. Masks seller contact details for executives unless an active clearance request has been approved.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Property details",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Property" } } } } },
          },
          404: { description: "Property not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      patch: {
        tags: ["Inventory"],
        summary: "Update Property Listing",
        description: "Updates an existing property. Changes are automatically captured in field-level audit logs.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePropertyRequest" } } },
        },
        responses: {
          200: {
            description: "Property successfully updated",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Property" } } } } },
          },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Property not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Inventory"],
        summary: "Delete Property (Admin Only)",
        description: "Permanently deletes a property listing, associated media, unit allocations, and records an audit log.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Property successfully deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          403: { description: "Forbidden: Executives are not permitted to delete properties", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Property not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/upload": {
      post: {
        tags: ["Inventory"],
        summary: "Upload Property Media Files",
        description: "Uploads up to 10 property media assets (images, floor plans, PDF brochures). Returns formatted URLs and metadata for association.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    description: "Up to 10 media files (max 25MB each)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Files uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/PropertyMedia" } },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =========================================================================
    // INVENTORY APPROVALS WORKFLOW
    // =========================================================================
    "/api/v1/inventory/{id}/approve": {
      post: {
        tags: ["Inventory Approvals"],
        summary: "Approve Executive Property Submission (Admin Only)",
        description: "Approves a pending property under review, transitioning its status to `AVAILABLE` and generating an audit event.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Property approved and made available",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Property not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/{id}/reject": {
      post: {
        tags: ["Inventory Approvals"],
        summary: "Request Revisions on Property Submission (Admin Only)",
        description: "Rejects an executive property submission or returns it with feedback requesting necessary revisions.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: { type: "string", example: "Please upload official floor plan and verify Super Area measurements." },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Property returned for revision",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // =========================================================================
    // INVENTORY UNITS & LEAD TAGGING
    // =========================================================================
    "/api/v1/inventory/{propertyId}/units": {
      get: {
        tags: ["Inventory Units"],
        summary: "List Units for a Booking Project",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "propertyId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "List of project units",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/ProjectUnit" } } } } } },
          },
        },
      },
      post: {
        tags: ["Inventory Units"],
        summary: "Add Unit to Booking Project",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "propertyId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["unitName", "area", "price"],
                properties: {
                  unitName: { type: "string", example: "Tower C - Unit 502" },
                  area: { type: "number", example: 1980 },
                  areaUnit: { type: "string", default: "sq. ft." },
                  price: { type: "number", example: 24500000 },
                  status: { type: "string", enum: ["AVAILABLE", "TAGGED", "BOOKED", "SOLD"], default: "AVAILABLE" },
                  leadId: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Unit created successfully", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ProjectUnit" } } } } } },
        },
      },
    },
    "/api/v1/inventory/units/{unitId}": {
      patch: {
        tags: ["Inventory Units"],
        summary: "Update Project Unit",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "unitId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  unitName: { type: "string", example: "Tower C - Unit 502 (Corner)" },
                  area: { type: "number", example: 2050 },
                  price: { type: "number", example: 25500000 },
                  status: { type: "string", enum: ["AVAILABLE", "TAGGED", "BOOKED", "SOLD"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Unit updated successfully", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/ProjectUnit" } } } } } },
        },
      },
      delete: {
        tags: ["Inventory Units"],
        summary: "Delete Project Unit (Admin Only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "unitId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Unit successfully deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/units/{unitId}/tag": {
      post: {
        tags: ["Inventory Units"],
        summary: "Tag Project Unit to Lead",
        description: "Associates a specific unit with an active lead and automatically transitions unit status to `TAGGED`.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "unitId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TagUnitRequest" } } },
        },
        responses: {
          200: {
            description: "Unit successfully tagged to lead",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "Lead ID is required or invalid", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // =========================================================================
    // SELLER INFO CLEARANCE WORKFLOW
    // =========================================================================
    "/api/v1/inventory/clearance-requests": {
      get: {
        tags: ["Seller Clearance"],
        summary: "List Seller Info Clearance Requests",
        description: "Retrieves clearance requests stored in the PostgreSQL database. For Executives, returns their own requests. For Admins, returns requests across the team.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "all", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "Set to true to retrieve full history including dismissed alerts" },
          { name: "status", in: "query", schema: { type: "string", enum: ["ALL", "PENDING", "APPROVED", "QUERY_ASKED", "REJECTED"] } },
        ],
        responses: {
          200: {
            description: "Clearance requests list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/SellerClearanceRequest" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/inventory/{id}/clearance-request": {
      get: {
        tags: ["Seller Clearance"],
        summary: "Get Clearance Request for a Property",
        description: "Checks whether an active clearance request exists for the specified property ID and whether confidential seller contact details are unlocked.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Property ID", schema: { type: "string" } }],
        responses: {
          200: {
            description: "Property clearance status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/SellerClearanceRequest" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Seller Clearance"],
        summary: "Submit Seller Clearance Request",
        description: "Enables an Executive to formally request access to confidential seller/landlord phone and name with purpose and client details.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Property ID", schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SubmitClearancePayload" } } },
        },
        responses: {
          201: {
            description: "Clearance request successfully submitted and saved in database",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/SellerClearanceRequest" },
                  },
                },
              },
            },
          },
          400: { description: "Reason is required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/{id}/clearance-decide": {
      post: {
        tags: ["Seller Clearance"],
        summary: "Decide, Reply, or Dismiss Clearance Request",
        description: "Executes clearance workflow actions. Admins can `APPROVE`, `REJECT`, `QUERY`, or `REVOKE`. Executives can `REPLY` to admin queries. Both roles can `DISMISS` notification bell alerts without deleting the underlying database request data.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, description: "Property ID", schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/DecideClearancePayload" } } },
        },
        responses: {
          200: {
            description: "Clearance request successfully updated in database",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/SellerClearanceRequest" },
                  },
                },
              },
            },
          },
          400: { description: "Invalid action or missing required feedback", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Forbidden: Non-administrators cannot approve, reject, or query requests", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Clearance request not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // =========================================================================
    // AUDIT LOGS MODULE
    // =========================================================================
    "/api/v1/logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "List System Audit Logs (Admin Only)",
        description: "Retrieves paginated audit events with field-level diff inspection, search, and activity filters.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Filter by property title, executive, or event summary" },
          { name: "action", in: "query", schema: { type: "string", enum: ["CREATE", "UPDATE", "STATUS_CHANGE", "DELETE", "UNIT_UPDATE"] } },
          { name: "dealType", in: "query", schema: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"] } },
          { name: "propertyId", in: "query", schema: { type: "string" } },
          { name: "userId", in: "query", schema: { type: "string" } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: {
          200: {
            description: "Paginated audit logs with statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        logs: { type: "array", items: { $ref: "#/components/schemas/PropertyAuditLog" } },
                        pagination: {
                          type: "object",
                          properties: {
                            total: { type: "integer", example: 642 },
                            page: { type: "integer", example: 1 },
                            limit: { type: "integer", example: 20 },
                            totalPages: { type: "integer", example: 33 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/logs/stats": {
      get: {
        tags: ["Audit Logs"],
        summary: "Get Audit Log Metrics (Admin Only)",
        description: "Returns summary counts across actions (creates, updates, status changes, deletes).",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Audit metrics",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AuditLogStatsResponse" } } } } },
          },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/logs/property/{propertyId}": {
      get: {
        tags: ["Audit Logs"],
        summary: "Get Property Audit History (Admin Only)",
        description: "Retrieves complete chronological audit history and diff trail for a specific property ID.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "propertyId", in: "path", required: true, description: "Property ID", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Property audit logs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/PropertyAuditLog" } },
                  },
                },
              },
            },
          },
          403: { description: "Forbidden: Requires role ADMIN", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "List Inventory Audit Logs Alias",
        description: "Convenience alias for retrieving inventory-specific audit logs directly from the inventory module.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "dealType", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Inventory audit logs",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/PropertyAuditLog" } } } } } },
          },
        },
      },
    },
    "/api/v1/inventory/{id}/logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "Get Specific Property Audit Logs Alias",
        description: "Convenience alias for retrieving audit logs for property {id} directly from inventory module.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Property audit logs",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/PropertyAuditLog" } } } } } },
          },
        },
      },
    },
  },
};

const swaggerUiOptions = {
  customSiteTitle: "Triumph CRM - API Documentation",
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin-top: 20px; margin-bottom: 24px; }
    .swagger-ui .info .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 800; color: #0f172a; font-size: 2rem; letter-spacing: -0.025em; }
    .swagger-ui .info p { font-size: 0.95rem; line-height: 1.6; color: #334155; }
    .swagger-ui .scheme-container { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 16px 0; margin-bottom: 24px; }
    .swagger-ui .opblock { border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 12px; }
    .swagger-ui .opblock .opblock-summary { padding: 8px 16px; }
    .swagger-ui .opblock.opblock-post { border-color: #38bdf8; background: rgba(56, 189, 248, 0.05); }
    .swagger-ui .opblock.opblock-get { border-color: #34d399; background: rgba(52, 211, 153, 0.05); }
    .swagger-ui .opblock.opblock-patch { border-color: #fbbf24; background: rgba(251, 191, 36, 0.05); }
    .swagger-ui .opblock.opblock-delete { border-color: #f87171; background: rgba(248, 113, 113, 0.05); }
    .swagger-ui .btn.authorize { background: #0284c7; border-color: #0284c7; color: #ffffff; border-radius: 6px; font-weight: 600; }
    .swagger-ui .btn.authorize svg { fill: #ffffff; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    docExpansion: "list",
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};

export const setupSwagger = (app) => {
  // Raw JSON spec endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Convenient alias
  app.get("/docs", (req, res) => res.redirect("/api-docs"));
};
