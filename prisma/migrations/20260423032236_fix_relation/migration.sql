/*
  Warnings:

  - You are about to drop the column `companyName` on the `Internship` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Internship` table. All the data in the column will be lost.
  - You are about to drop the column `statusUpdatedAt` on the `Internship` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `expectedGraduation` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_recipientAdminId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_studentId_fkey";

-- DropIndex
DROP INDEX "Internship_status_idx";

-- AlterTable
ALTER TABLE "Internship" DROP COLUMN "companyName",
DROP COLUMN "status",
DROP COLUMN "statusUpdatedAt";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "contactEmail",
DROP COLUMN "expectedGraduation",
ADD COLUMN     "internship" "InternshipStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "internshipStatus" "InternshipStatus";

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" UUID NOT NULL,
    "studentId" UUID,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "targetPath" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotificationReceipt" (
    "id" UUID NOT NULL,
    "notificationEventId" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotificationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationEvent_studentId_idx" ON "NotificationEvent"("studentId");

-- CreateIndex
CREATE INDEX "NotificationEvent_createdAt_idx" ON "NotificationEvent"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationEvent_updatedAt_idx" ON "NotificationEvent"("updatedAt");

-- CreateIndex
CREATE INDEX "AdminNotificationReceipt_adminUserId_isRead_idx" ON "AdminNotificationReceipt"("adminUserId", "isRead");

-- CreateIndex
CREATE INDEX "AdminNotificationReceipt_notificationEventId_idx" ON "AdminNotificationReceipt"("notificationEventId");

-- CreateIndex
CREATE INDEX "AdminNotificationReceipt_createdAt_idx" ON "AdminNotificationReceipt"("createdAt");

-- CreateIndex
CREATE INDEX "AdminNotificationReceipt_updatedAt_idx" ON "AdminNotificationReceipt"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminNotificationReceipt_notificationEventId_adminUserId_key" ON "AdminNotificationReceipt"("notificationEventId", "adminUserId");

-- CreateIndex
CREATE INDEX "Internship_createdAt_idx" ON "Internship"("createdAt");

-- CreateIndex
CREATE INDEX "Internship_updatedAt_idx" ON "Internship"("updatedAt");

-- CreateIndex
CREATE INDEX "Student_internshipStatus_idx" ON "Student"("internshipStatus");

-- CreateIndex
CREATE INDEX "Student_createdAt_idx" ON "Student"("createdAt");

-- CreateIndex
CREATE INDEX "UploadedFile_updatedAt_idx" ON "UploadedFile"("updatedAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_updatedAt_idx" ON "User"("updatedAt");

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotificationReceipt" ADD CONSTRAINT "AdminNotificationReceipt_notificationEventId_fkey" FOREIGN KEY ("notificationEventId") REFERENCES "NotificationEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotificationReceipt" ADD CONSTRAINT "AdminNotificationReceipt_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
