-- CreateTable
CREATE TABLE "PropertyAuditLog" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "propertyTitle" TEXT NOT NULL,
    "dealType" "DealType",
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "userRole" TEXT,
    "changes" JSONB,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyAuditLog_propertyId_idx" ON "PropertyAuditLog"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyAuditLog_userId_idx" ON "PropertyAuditLog"("userId");

-- CreateIndex
CREATE INDEX "PropertyAuditLog_action_idx" ON "PropertyAuditLog"("action");

-- CreateIndex
CREATE INDEX "PropertyAuditLog_createdAt_idx" ON "PropertyAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PropertyAuditLog" ADD CONSTRAINT "PropertyAuditLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

