-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'form_updated';
ALTER TYPE "NotificationType" ADD VALUE 'status_changed';

-- AlterTable
ALTER TABLE "NotificationEvent"
ADD COLUMN "entityId" VARCHAR(191),
ADD COLUMN "entityType" VARCHAR(64);

-- CreateIndex
CREATE INDEX "NotificationEvent_entityType_entityId_idx" ON "NotificationEvent"("entityType", "entityId");