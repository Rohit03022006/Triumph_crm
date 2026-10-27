# Triumph CRM - Backend API & Services

A robust, enterprise-grade backend service powering the **Triumph Real Estate CRM**. Built with **Node.js**, **Express 5**, **Prisma ORM**, **PostgreSQL**, **Redis**, and structured around a modular, domain-driven architecture with strict Role-Based Access Control (RBAC), database-backed clearance workflows, and complete audit trail capabilities.

---

## Table of Contents
1. [Architecture & Design Principles](#architecture--design-principles)
2. [Technology Stack](#technology-stack)
3. [Project Directory Structure](#project-directory-structure)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Core Domain Modules](#core-domain-modules)
6. [Interactive API Documentation (Swagger UI)](#interactive-api-documentation-swagger-ui)
7. [Environment Configuration](#environment-configuration)
8. [Local Development & Database Setup](#local-development--database-setup)
9. [Automated Testing](#automated-testing)
10. [Error Handling & API Envelopes](#error-handling--api-envelopes)

---

## Architecture & Design Principles

The backend is built following a clean, layered service-repository pattern:

```mermaid
flowchart TD
    Client[Web Frontend / Mobile / API Client] -->|HTTP / Cookies| Gateway[Express App & Global Middlewares]
    Gateway -->|CORS, Helmet, RateLimiter| Routes[Modular Routers /api/v1/*]
    Routes -->|requireAuth, requireRole| Controllers[Controllers: Request Validation & Response Envelopes]
    Controllers --> Services[Domain Services: Business Logic, Masking, Audit Logs]
    Services --> Repositories[Repositories: Prisma ORM Queries]
    Services --> Cache[Redis: Session Cache & Login Lockout]
    Repositories --> Database[(PostgreSQL Database)]
```

### Key Architectural Tenets:
- **Separation of Concerns:** Controllers handle HTTP requests and Zod schema validations; Services encapsulate domain business rules; Repositories handle database interactions via Prisma.
- **Session-Based Authentication:** Employs cryptographically secure session IDs stored in Redis and issued to clients via HTTP-only, SameSite cookies (`triumph_session`), eliminating client-side token exposure.
- **Defensive Security & Rate Limiting:** Includes automated login lockout guards (`loginLockoutGuard`) defending against brute-force attacks, IP-based OTP rate limiters, and Helmet headers.
- **Audit Logging by Design:** All critical property mutations (creation, unit tagging, status updates, clearance decisions) automatically produce tamper-evident audit records in the database (`PropertyAuditLog`).
- **PII Protection & Clearance Workflows:** Seller contact information is automatically redacted for standard `EXECUTIVE` users until explicitly cleared through an administrator review workflow.

---

## Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v20+ LTS) | Modern ES Modules (`import`/`export`) |
| **Framework** | Express.js v5 | Fast, minimalist web framework |
| **Database** | PostgreSQL | Relational storage for CRM entities |
| **ORM** | Prisma v6 | Type-safe schema, migrations & query client |
| **Cache & Sessions**| Redis (ioredis) | In-memory session store & brute-force counters |
| **Validation** | Zod | Runtime request body and environment validation |
| **File Storage** | Cloudflare R2 / Local | Media attachments and documents (S3-compatible SDK) |
| **Email Delivery**| Resend | Transactional emails and verification OTPs |
| **API Docs** | OpenAPI 3.0.3 & Swagger UI | Self-documenting interactive API portal |
| **Testing** | Vitest & Supertest | High-performance unit and integration testing suite |

---

## Project Directory Structure

```
backend/
├── src/
│   ├── app.js                   # Express application factory & middleware pipeline
│   ├── server.js                # HTTP server bootstrap & graceful shutdown
│   ├── config/                  # Subsystem configuration
│   │   ├── auth.js              # Authentication configuration
│   │   ├── database.js          # Prisma Client singleton
│   │   ├── env.js               # Zod-validated environment schema
│   │   ├── redis.js             # Redis client and health probes
│   │   ├── s3.js                # Cloudflare R2 / S3 storage client
│   │   └── swagger.js           # OpenAPI 3.0.3 specification & Swagger UI setup
│   ├── middleware/              # Global & route-level middleware
│   │   ├── auth.middleware.js   # requireAuth & requireRole RBAC guards
│   │   ├── errorHandler.js      # Global error & 404 handlers
│   │   ├── loginLockout.middleware.js # Brute-force protection
│   │   └── rateLimiter.js       # IP-based rate limiting
│   ├── modules/                 # Modular domain features
│   │   ├── auth/                # Authentication, sessions, login/logout
│   │   ├── users/               # User administration, profile & password management
│   │   ├── resources/           # System master data (lead sources, categories, stages)
│   │   ├── leads/               # Lead ingestion & CSV bulk import
│   │   ├── inventory/           # Real estate properties, units & clearance requests
│   │   └── logs/                # System audit logs & analytics
│   └── shared/                  # Shared utilities (AppError, asyncHandler, logger)
├── prisma/
│   └── schema.prisma            # Database schema definitions & relations
├── uploads/                     # Temporary staging directory for file uploads
├── API_TESTS.md                 # Comprehensive API testing and edge-case manual
├── package.json                 # Project dependencies and script definitions
└── vitest.config.js             # Vitest test runner configuration
```

---

## Role-Based Access Control (RBAC)

The CRM defines two primary roles with explicit access boundaries:

```mermaid
graph TD
    User([Incoming User Request]) --> Authenticated{Authenticated?}
    Authenticated -- No --> 401[401 Unauthorized]
    Authenticated -- Yes --> RoleCheck{User Role}
    
    RoleCheck -- ADMIN --> AdminAccess[Full System Access: Users, Master Resources, Approvals, Unmasked Seller PII, Audit Logs]
    RoleCheck -- EXECUTIVE --> ExecAccess[Sales Operations: View Inventory, Create Properties 'UNDER_REVIEW', Tag Units, Request Seller Clearance]
    ExecAccess --> Masked[Seller Phone & Details are Masked with '******' unless Clearance Approved]
```

| Action / Capability | ADMIN | EXECUTIVE |
| :--- | :---: | :---: |
| Authenticate & Manage Own Profile | ✅ | ✅ |
| Manage User Accounts & Reset Passwords | ✅ | ❌ |
| Manage Master Resources (Stages, Sources) | ✅ | ❌ |
| Browse Properties & Booking Units | ✅ | ✅ |
| View Unmasked Seller PII (Phone/Details) | ✅ (Always) | ⚠️ (Requires Approved Clearance) |
| Submit New Property Listing | ✅ (Immediate `ACTIVE`) | ✅ (Marked `UNDER_REVIEW`) |
| Approve or Reject Pending Listings | ✅ | ❌ |
| Delete Properties or Units | ✅ | ❌ |
| Request Clearance for Seller Info | N/A (Already visible) | ✅ |
| Approve or Reject Clearance Requests | ✅ | ❌ |
| View System-Wide Audit Logs & Stats | ✅ | ❌ |

---

## Core Domain Modules

### 1. Authentication (`/api/v1/auth`)
- **Login (`POST /login`):** Validates credentials, checks brute-force lockout status, generates a secure 7-day session in Redis, and sets an HTTP-only `triumph_session` cookie.
- **Logout (`POST /logout`):** Destroys the Redis session and clears the client cookie.
- **Session Identity (`GET /me`):** Returns the authenticated user's profile and assigned role.

### 2. User Administration (`/api/v1/users`)
- **Self Management:** Users can view their profile (`GET /me`), update details (`PATCH /me`), or update their password (`PATCH /me/password`).
- **Admin Management:** Administrators can list users (`GET /`), provision accounts (`POST /`), update roles/statuses (`PATCH /:id`), reset user passwords (`PATCH /:id/password`), manually verify email accounts (`POST /:id/verify`), and execute bulk deletions (`DELETE /bulk`).

### 3. Master Resources (`/api/v1/resources`)
- Centralized governance for CRM dropdowns and taxonomy:
  - Lead Sources (`/api/v1/resources/lead-sources`)
  - Inventory Categories (`/api/v1/resources/inventory-categories`)
  - Pipeline Stages (`/api/v1/resources/pipeline-stages`)

### 4. Leads Management (`/api/v1/leads`)
- **Bulk CSV Import (`POST /import`):** Upload CSV spreadsheets of prospective leads with automated column mapping, data sanitization, and duplicate detection.

### 5. Inventory & Units (`/api/v1/inventory`)
- **Comprehensive Real Estate Model:** Supports both single-asset inventory (Resale, Direct Sales) and multi-unit Booking projects (Commercial, Residential Towers).
- **Multi-Area Breakdown:** Calculates Super Area, Carpet Area, and Built-up Area in Sq. Ft, Sq. Yards, or Sq. Meters.
- **Multi-Media Attachments:** Upload up to 10 images, floor plans, and brochures per property (`POST /upload`).
- **Booking Units Management:** Manage individual units within a project (`/units/:unitId`), including price, floor, unit type, and tag them directly to prospective CRM leads (`POST /units/:unitId/tag`).

### 6. Seller Clearance Workflow (`/api/v1/inventory/clearance-requests`)
- Built specifically for privacy governance:
  1. An `EXECUTIVE` requests seller contact information for a property, providing a required business reason (`POST /:id/clearance-request`).
  2. The request is persisted in the database with status `PENDING`.
  3. `ADMIN` users receive the notification, inspect the pending queue (`GET /clearance-requests`), and decide (`POST /:id/clearance-decide` with `APPROVED` or `REJECTED`).
  4. Once approved, the property detail response automatically reveals unmasked seller contact information to that executive.

### 7. Audit Logs & Forensics (`/api/v1/logs`)
- Complete audit trail tracking entity modifications, actor user IDs, IP addresses, timestamps, and structured diffs (`oldValues` vs `newValues`).
- Query aggregate audit statistics (`GET /stats`) or drill down by property ID (`GET /property/:propertyId`).

---

## Interactive API Documentation (Swagger UI)

The backend provides a fully interactive, production-ready OpenAPI 3.0.3 Swagger UI:

- **Swagger UI Interactive Portal:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs) (Alias: [http://localhost:5000/docs](http://localhost:5000/docs))
- **OpenAPI 3.0.3 Raw JSON Specification:** [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

### Authenticating in Swagger UI
All protected endpoints utilize HTTP-only cookie authentication (`cookieAuth`):
1. Navigate to the **Auth** section in Swagger UI.
2. Execute the `POST /api/v1/auth/login` endpoint with your user credentials.
3. Your browser will automatically store the `triumph_session` cookie.
4. All subsequent requests executed through Swagger UI will automatically include this session cookie.

---

## Environment Configuration

Configuration is validated on startup using Zod in [`src/config/env.js`](file:///home/rohit/Downloads/Triumph_crm/backend/src/config/env.js). Missing required variables will prevent the server from starting.

Create a `.env` file in the `backend/` directory based on the template below:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# PostgreSQL Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/triumph_crm?schema=public"

# Redis Connection
REDIS_URL="redis://localhost:6379"

# Session Security & Better Auth
BETTER_AUTH_SECRET="generate-a-secure-random-32-character-secret"
BETTER_AUTH_URL="http://localhost:5000"

# Resend Transactional Email Service
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="Triumph CRM <noreply@yourdomain.com>"

# Cloudflare R2 / S3 Object Storage
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_cloudflare_r2_access_key"
R2_SECRET_ACCESS_KEY="your_cloudflare_r2_secret_key"
R2_BUCKET_NAME="triumph-crm-media"
R2_PUBLIC_URL="https://media.yourdomain.com"
```

> [!IMPORTANT]
> Never commit actual passwords, private API keys, or production connection strings to version control.

---

## Local Development & Database Setup

### Prerequisites
- **Node.js** v20.x or higher
- **PostgreSQL** v14+ (or Docker)
- **Redis** v6+ (or Docker)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis credentials
```

### 3. Setup PostgreSQL & Prisma
Generate the Prisma Client and apply migrations to your local database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Redis & PostgreSQL with Docker (Optional)
If you do not have native database instances installed:
```bash
# Start PostgreSQL
docker run --name triumph_postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=triumph_crm -p 5432:5432 -d postgres:16-alpine

# Start Redis
docker run --name triumph_redis -p 6379:6379 -d redis:7-alpine
```

### 5. Launch Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`. You can verify health at:
- `http://localhost:5000/health`
- `http://localhost:5000/api-docs`

---

## Automated Testing

The backend includes a comprehensive test suite powered by **Vitest** and **Supertest**, verifying business rules, access control, multi-area calculations, and clearance logic.

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### What the Test Suite Validates:
- **Service Logic & Access Control:** Verifies that properties created by Executives start in `UNDER_REVIEW`, seller PII is masked, and non-admins cannot approve listings.
- **Clearance Requests:** Verifies clearance request submission, validation of business reasons, duplicate request handling, and administrative approval decisions.
- **Unit Management & Tagging:** Verifies unit creation, validation of pricing/unit numbers, and tagging units to valid leads.
- **API End-to-End & Boundary Tests:** Verifies HTTP status codes, error payloads, pagination, and multi-area data persistence.

---

## Error Handling & API Envelopes

All API endpoints follow a consistent JSON response envelope:

### Success Response Format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response Format:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Standard HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Entity created successfully.
- `400 Bad Request`: Input validation failed (e.g., missing required fields, invalid format).
- `401 Unauthorized`: Missing or invalid session cookie.
- `403 Forbidden`: Authenticated user lacks required permission (e.g., Executive attempting an Admin action).
- `404 Not Found`: Requested resource does not exist.
- `409 Conflict`: Conflict with current state (e.g., duplicate request or concurrent modification).
- `429 Too Many Requests`: Rate limit or brute-force lockout triggered.
- `500 Internal Server Error`: Unhandled server exception.
- `503 Service Unavailable`: Dependent service (PostgreSQL or Redis) unhealthy during health check.

