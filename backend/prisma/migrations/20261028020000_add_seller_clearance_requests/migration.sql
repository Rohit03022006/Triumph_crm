-- CreateTable
CREATE TABLE "SellerClearanceRequest" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyTitle" TEXT NOT NULL,
    "dealType" "DealType",
    "locality" TEXT,
    "price" DOUBLE PRECISION,
    "executiveId" TEXT,
    "requestedBy" TEXT NOT NULL,
    "requestedByEmail" TEXT,
    "reason" TEXT NOT NULL,
    "clientName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminFeedback" TEXT,
    "adminActionAt" TIMESTAMP(3),
    "adminName" TEXT,
    "executiveReply" TEXT,
    "executiveRepliedAt" TIMESTAMP(3),
    "dismissedByExecutive" BOOLEAN NOT NULL DEFAULT false,
    "dismissedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "sellerName" TEXT,
    "sellerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerClearanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerClearanceRequest_propertyId_idx" ON "SellerClearanceRequest"("propertyId");

-- CreateIndex
CREATE INDEX "SellerClearanceRequest_executiveId_idx" ON "SellerClearanceRequest"("executiveId");

-- CreateIndex
CREATE INDEX "SellerClearanceRequest_status_idx" ON "SellerClearanceRequest"("status");

-- CreateIndex
CREATE INDEX "SellerClearanceRequest_createdAt_idx" ON "SellerClearanceRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "SellerClearanceRequest" ADD CONSTRAINT "SellerClearanceRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

