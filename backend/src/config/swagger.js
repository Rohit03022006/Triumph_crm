import swaggerUi from "swagger-ui-express";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Triumph CRM API",
    version: "1.0.0",
    description:
      "Comprehensive REST API Documentation for Triumph CRM backend services, covering Authentication, User & Staff Management, System Resources, Lead Management, and System Health.",
    contact: {
      name: "Triumph CRM Engineering Team",
      email: "support@triumphcrm.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
    {
      url: "/",
      description: "Current Host Server",
    },
  ],
  tags: [
    { name: "System", description: "Health check and system diagnostics" },
    { name: "Auth", description: "Authentication and session management" },
    { name: "Users", description: "User profiles and Staff management (Admin & Me)" },
    { name: "Resources", description: "System resources: Lead Sources, Inventory Categories, Pipeline Stages" },
    { name: "Leads", description: "Lead processing and data imports" },
    { name: "Inventory", description: "Module 1: Property Inventory Management, Units, and Media" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "triumph_session",
        description: "Session cookie set automatically upon successful login via /api/v1/auth/login",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "cly1234567890" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@triumphcrm.com" },
          emailVerified: { type: "boolean", example: true },
          image: { type: "string", nullable: true, example: "https://example.com/avatar.jpg" },
          phone: { type: "string", nullable: true, example: "+1 555-0199" },
          address: { type: "string", nullable: true, example: "123 Business Way, Suite 100" },
          role: { type: "string", enum: ["ADMIN", "EXECUTIVE"], example: "EXECUTIVE" },
          department: {
            type: "string",
            enum: ["PRE_SALES", "SALES", "LEASING", "CRM"],
            nullable: true,
            example: "SALES",
          },
          officeNumber: { type: "string", nullable: true, example: "OF-402" },
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
          name: { type: "string", example: "Jane Smith" },
          email: { type: "string", format: "email", example: "jane.smith@triumphcrm.com" },
          password: { type: "string", minLength: 8, example: "Executive@1234" },
          role: { type: "string", enum: ["ADMIN", "EXECUTIVE"], default: "EXECUTIVE" },
          department: {
            type: "string",
            enum: ["PRE_SALES", "SALES", "LEASING", "CRM"],
            example: "SALES",
          },
          phone: { type: "string", example: "+1 555-0144" },
          address: { type: "string", example: "45 Market St" },
          officeNumber: { type: "string", example: "B-201" },
          image: { type: "string", nullable: true },
          emailVerified: { type: "boolean", default: true },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Jane Doe" },
          role: { type: "string", enum: ["ADMIN", "EXECUTIVE"] },
          department: { type: "string", enum: ["PRE_SALES", "SALES", "LEASING", "CRM"] },
          officeNumber: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          image: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          emailVerified: { type: "boolean" },
          password: {
            type: "string",
            minLength: 8,
            description: "Optional new password to change/reset for this user (Admin only)",
          },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["password"],
        properties: {
          password: {
            type: "string",
            minLength: 8,
            example: "NewStrongPassword123!",
            description: "New password with minimum 8 characters",
          },
        },
      },
      UpdateMyPasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string", example: "admin123" },
          newPassword: { type: "string", minLength: 8, example: "NewAdminPass123!" },
        },
      },
      UpdateMeRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Executive" },
          phone: { type: "string", example: "+1 555-0100" },
          address: { type: "string", example: "742 Evergreen Terrace" },
          image: { type: "string", nullable: true },
        },
      },
      ResourceItem: {
        type: "object",
        properties: {
          id: { type: "string", example: "clv123456" },
          name: { type: "string", example: "Direct Call" },
          isActive: { type: "boolean", example: true },
          order: { type: "integer", example: 1, description: "Used for pipeline stages" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ResourceCreateRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Social Media" },
          isActive: { type: "boolean", default: true },
          order: { type: "integer", example: 1, description: "Required/used for pipeline stages" },
        },
      },
      ResourceUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Updated Name" },
          isActive: { type: "boolean" },
          order: { type: "integer" },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          message: { type: "string", example: "Operation completed successfully" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              message: { type: "string", example: "Invalid credentials or forbidden access" },
              code: { type: "string", example: "FORBIDDEN" },
            },
          },
        },
      },
      HealthCheck: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          timestamp: { type: "string", format: "date-time" },
          port: { type: "string", example: "5000" },
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
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "System Health & Diagnostic Check",
        description: "Validates connectivity to PostgreSQL (Prisma), Redis, R2 storage, and Resend email service.",
        responses: {
          200: {
            description: "System is healthy",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthCheck" } } },
          },
          503: {
            description: "One or more core services are down",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthCheck" } } },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "User Login",
        description: "Authenticates an Admin or Executive using email and password. Sets the HTTP-only `triumph_session` cookie.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: {
            description: "Login successful. Returns user details and session token.",
            headers: {
              "Set-Cookie": {
                schema: { type: "string", example: "triumph_session=xyz123; Path=/; HttpOnly; SameSite=Lax" },
              },
            },
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "Missing email or password", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Account deactivated or pending verification", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          429: { description: "Too many failed attempts. Temporary lockout.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "User Logout",
        description: "Invalidates the active session in Redis and clears the session cookie.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Successfully logged out",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get Authenticated User Info",
        description: "Returns currently authenticated user profile from the active session.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "User session information",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          401: { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get Current User Profile",
        description: "Returns detailed profile data for the authenticated user (Executive or Admin).",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Profile data",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          401: { description: "Unauthenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Edit Own Profile (Executive & Admin)",
        description: "Allows any authenticated user (including Executives) to update their personal details: name, phone number, address, and profile photo.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMeRequest" } } },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          401: { description: "Unauthenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/me/password": {
      patch: {
        tags: ["Users"],
        summary: "Change Own Password (Admin Only)",
        description: "Allows Administrators to change their own password. Executives cannot change password settings; only Admins can change executive passwords.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateMyPasswordRequest" } } },
        },
        responses: {
          200: {
            description: "Password updated successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "Incorrect current password or invalid new password", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Forbidden - Executives cannot change password settings", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List All Users (Admin Only)",
        description: "Fetches all staff members and users across departments with roles and verification statuses.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "List of users",
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
          403: { description: "Requires ADMIN role", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create User / Staff Member (Admin Only)",
        description: "Creates a new user or executive with an assigned department, role, and temporary password.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateUserRequest" } } },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "Validation error or email already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Requires ADMIN role", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/{id}": {
      patch: {
        tags: ["Users"],
        summary: "Update User / Executive (Admin Only)",
        description: "Updates user details, role, department, status, and optionally changes/resets their password.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateUserRequest" } } },
        },
        responses: {
          200: {
            description: "User updated successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          403: { description: "Requires ADMIN role or self-demotion prevention", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete User (Admin Only)",
        description: "Deletes a user account and removes associated sessions.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
        ],
        responses: {
          200: {
            description: "User deleted successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          403: { description: "Requires ADMIN role or cannot delete self", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/{id}/password": {
      patch: {
        tags: ["Users"],
        summary: "Admin Change / Reset Executive Password",
        description: "Dedicated endpoint allowing an Administrator to reset or assign a new password for any executive or staff member.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
        },
        responses: {
          200: {
            description: "Password reset successfully and old sessions invalidated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "Password must be at least 8 characters long", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Requires ADMIN role", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/{id}/verify": {
      post: {
        tags: ["Users"],
        summary: "Manually Verify / Approve User (Admin Only)",
        description: "Manually sets emailVerified = true for pending executive registrations.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
        ],
        responses: {
          200: {
            description: "User verified successfully",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          403: { description: "Requires ADMIN role", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/users/bulk": {
      delete: {
        tags: ["Users"],
        summary: "Bulk Delete Users (Admin Only)",
        description: "Deletes multiple users at once by passing a list of IDs.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids"],
                properties: {
                  ids: { type: "array", items: { type: "string" }, example: ["id1", "id2"] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Users deleted",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "No IDs provided", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Cannot delete self or requires ADMIN role", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/resources/lead-sources": {
      get: {
        tags: ["Resources"],
        summary: "Get All Lead Sources (Admin Only)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "List of lead sources", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        },
      },
      post: {
        tags: ["Resources"],
        summary: "Create Lead Source (Admin Only)",
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
        summary: "Update Lead Source (Admin Only)",
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
        summary: "Delete Lead Source (Admin Only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted lead source" } },
      },
    },
    "/api/v1/resources/inventory-categories": {
      get: {
        tags: ["Resources"],
        summary: "Get All Inventory Categories (Admin Only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "List of inventory categories" } },
      },
      post: {
        tags: ["Resources"],
        summary: "Create Inventory Category (Admin Only)",
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
        summary: "Update Inventory Category (Admin Only)",
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
        summary: "Delete Inventory Category (Admin Only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted category" } },
      },
    },
    "/api/v1/resources/pipeline-stages": {
      get: {
        tags: ["Resources"],
        summary: "Get All Pipeline Stages (Admin Only)",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "List of pipeline stages ordered by order index" } },
      },
      post: {
        tags: ["Resources"],
        summary: "Create Pipeline Stage (Admin Only)",
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
        summary: "Update Pipeline Stage (Admin Only)",
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
        summary: "Delete Pipeline Stage (Admin Only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted pipeline stage" } },
      },
    },
    "/api/v1/leads/import": {
      post: {
        tags: ["Leads"],
        summary: "Import Leads from CSV/Excel",
        description: "Uploads a CSV or Excel spreadsheet containing leads, parses entries, validates rows, and persists valid records.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "CSV or Excel file to import",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Leads imported with statistics",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
          },
          400: { description: "Invalid file or parsing error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/v1/inventory/master-data": {
      get: {
        tags: ["Inventory"],
        summary: "Get master data for inventory dropdowns",
        description: "Returns lists of 71 developers, categories, subcategories, USPs, amenities, BHK options, and active leads.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Master data retrieved successfully" },
        },
      },
    },
    "/api/v1/inventory/metrics": {
      get: {
        tags: ["Inventory"],
        summary: "Get inventory summary metrics",
        description: "Returns total, booking, retrade, lease, and available counts.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Metrics retrieved successfully" },
        },
      },
    },
    "/api/v1/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "List and filter properties with pagination and sorting",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "dealType", in: "query", schema: { type: "string", enum: ["BOOKING", "RETRADE", "LEASE"] } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "subcategory", in: "query", schema: { type: "string" } },
          { name: "city", in: "query", schema: { type: "string" } },
          { name: "locality", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "minArea", in: "query", schema: { type: "number" } },
          { name: "maxArea", in: "query", schema: { type: "number" } },
          { name: "bhk", in: "query", schema: { type: "string" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["newest", "price_asc", "price_desc", "area_asc", "area_desc"] } },
        ],
        responses: {
          200: { description: "Properties list retrieved successfully" },
        },
      },
      post: {
        tags: ["Inventory"],
        summary: "Create a new property (Booking, Retrade, or Lease)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          201: { description: "Property created successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/inventory/{id}": {
      get: {
        tags: ["Inventory"],
        summary: "Get property details by ID",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Property details retrieved" },
          404: { description: "Property not found" },
        },
      },
      patch: {
        tags: ["Inventory"],
        summary: "Update property by ID",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: { description: "Property updated successfully" },
        },
      },
      delete: {
        tags: ["Inventory"],
        summary: "Delete property (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Property deleted successfully" },
        },
      },
    },
    "/api/v1/inventory/upload": {
      post: {
        tags: ["Inventory"],
        summary: "Upload property media files (Images / Documents)",
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
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Media files uploaded successfully" },
        },
      },
    },
    "/api/v1/inventory/{propertyId}/units": {
      get: {
        tags: ["Inventory"],
        summary: "List project units for a booking property",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "propertyId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Units list retrieved" },
        },
      },
      post: {
        tags: ["Inventory"],
        summary: "Add a project unit to a booking property",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "propertyId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          201: { description: "Unit created" },
        },
      },
    },
    "/api/v1/inventory/units/{unitId}/tag": {
      post: {
        tags: ["Inventory"],
        summary: "Tag project unit to an existing lead",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "unitId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leadId"],
                properties: { leadId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Unit tagged to lead successfully" },
        },
      },
    },
  },
};

const swaggerUiOptions = {
  customSiteTitle: "Triumph CRM - API Documentation",
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin-top: 20px }
    .swagger-ui .info .title { font-family: sans-serif; font-weight: 700; color: #0f172a; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
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

