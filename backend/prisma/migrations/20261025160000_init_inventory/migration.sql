-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('BOOKING', 'RETRADE', 'LEASE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'UNDER_REVIEW', 'SOLD', 'RENT_OUT', 'LOST');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'TAGGED', 'BOOKED', 'SOLD');

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "dealType" "DealType" NOT NULL,
    "title" TEXT NOT NULL,
    "developerId" TEXT,
    "developerName" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "projectSociety" TEXT,
    "bhk" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalSelection" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "furnishing" TEXT,
    "price" DOUBLE PRECISION,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "priceUnit" TEXT,
    "pricePerUnitArea" DOUBLE PRECISION,
    "paymentPlan" TEXT,
    "monthlyRent" DOUBLE PRECISION,
    "securityDeposit" TEXT,
    "maintenanceCharges" DOUBLE PRECISION,
    "maintenanceFrequency" TEXT,
    "availableFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "leaseDuration" INTEGER,
    "lockInPeriod" INTEGER,
    "leaseAvailability" TEXT,
    "availableFromDate" TIMESTAMP(3),
    "facingDirection" TEXT,
    "availabilityStatus" TEXT,
    "possessionDate" TIMESTAMP(3),
    "projectStatus" TEXT,
    "possessionMonth" TEXT,
    "possessionYear" INTEGER,
    "boundaryWall" BOOLEAN,
    "plotShape" TEXT,
    "constructionAllowed" BOOLEAN,
    "plotLength" DOUBLE PRECISION,
    "plotBreadth" DOUBLE PRECISION,
    "numberOfStoreys" INTEGER,
    "numberOfUnits" INTEGER,
    "numberOfRooms" INTEGER,
    "floorNumber" TEXT,
    "totalFloors" INTEGER,
    "propertyAge" TEXT,
    "servantPujaStore" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parkingType" TEXT,
    "numberOfParkings" INTEGER,
    "ceilingHeight" DOUBLE PRECISION,
    "numberOfLifts" INTEGER,
    "numberOfWashrooms" INTEGER,
    "washroomType" TEXT,
    "powerBackup" BOOLEAN,
    "airConditioning" BOOLEAN,
    "connections" TEXT,
    "preLeased" BOOLEAN DEFAULT false,
    "preLeasedDetails" TEXT,
    "roiPercentage" DOUBLE PRECISION,
    "furnishings" JSONB,
    "usps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sellerName" TEXT,
    "sellerPhone" TEXT,
    "developerContactName" TEXT,
    "developerContactNumber" TEXT,
    "developerContactDesignation" TEXT,
    "primaryArea" DOUBLE PRECISION,
    "primaryAreaUnit" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyArea" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "areaType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "minArea" DOUBLE PRECISION,
    "maxArea" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyMedia" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUnit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "areaUnit" TEXT NOT NULL DEFAULT 'sq. ft.',
    "price" DOUBLE PRECISION NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Developer_name_key" ON "Developer"("name");
CREATE INDEX "Developer_name_idx" ON "Developer"("name");

-- CreateIndex
CREATE INDEX "Property_dealType_idx" ON "Property"("dealType");
CREATE INDEX "Property_category_idx" ON "Property"("category");
CREATE INDEX "Property_subcategory_idx" ON "Property"("subcategory");
CREATE INDEX "Property_city_idx" ON "Property"("city");
CREATE INDEX "Property_status_idx" ON "Property"("status");
CREATE INDEX "Property_price_idx" ON "Property"("price");
CREATE INDEX "Property_primaryArea_idx" ON "Property"("primaryArea");

-- CreateIndex
CREATE INDEX "PropertyArea_propertyId_idx" ON "PropertyArea"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyMedia_propertyId_idx" ON "PropertyMedia"("propertyId");

-- CreateIndex
CREATE INDEX "ProjectUnit_propertyId_idx" ON "ProjectUnit"("propertyId");
CREATE INDEX "ProjectUnit_leadId_idx" ON "ProjectUnit"("leadId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyArea" ADD CONSTRAINT "PropertyArea_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

