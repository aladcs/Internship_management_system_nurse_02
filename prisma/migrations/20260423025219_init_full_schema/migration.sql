-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'student');

-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('diploma', 'bachelor', 'master', 'doctorate', 'other');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('form_submitted', 'form_updated_in_progress');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" VARCHAR(255),
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "prefix" VARCHAR(50),
    "firstName" VARCHAR(120),
    "lastName" VARCHAR(120),
    "contactEmail" VARCHAR(255),
    "gender" "Gender",
    "dateOfBirth" DATE,
    "phoneNumber" VARCHAR(50),
    "address" TEXT,
    "parentPhone" VARCHAR(50),
    "educationLevel" "EducationLevel",
    "institution" VARCHAR(255),
    "faculty" VARCHAR(255),
    "major" VARCHAR(255),
    "expectedGraduation" DATE,
    "coOpAdvisorName" VARCHAR(255),
    "coOpAdvisorPhone" VARCHAR(50),
    "submittedAt" TIMESTAMP(3),
    "lastStudentEditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "status" "InternshipStatus",
    "companyName" VARCHAR(255),
    "position" VARCHAR(255),
    "departmentUnit" VARCHAR(255),
    "supervisorName" VARCHAR(255),
    "startDate" DATE,
    "endDate" DATE,
    "additionalDetails" TEXT,
    "statusUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(1024) NOT NULL,
    "mimeType" VARCHAR(100),
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "recipientAdminId" UUID NOT NULL,
    "studentId" UUID,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "targetPath" VARCHAR(512),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdById_idx" ON "User"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_submittedAt_idx" ON "Student"("submittedAt");

-- CreateIndex
CREATE INDEX "Student_updatedAt_idx" ON "Student"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Internship_studentId_key" ON "Internship"("studentId");

-- CreateIndex
CREATE INDEX "Internship_status_idx" ON "Internship"("status");

-- CreateIndex
CREATE INDEX "Internship_startDate_idx" ON "Internship"("startDate");

-- CreateIndex
CREATE INDEX "Internship_endDate_idx" ON "Internship"("endDate");

-- CreateIndex
CREATE INDEX "UploadedFile_studentId_idx" ON "UploadedFile"("studentId");

-- CreateIndex
CREATE INDEX "UploadedFile_createdAt_idx" ON "UploadedFile"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientAdminId_isRead_idx" ON "Notification"("recipientAdminId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_studentId_idx" ON "Notification"("studentId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientAdminId_fkey" FOREIGN KEY ("recipientAdminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
