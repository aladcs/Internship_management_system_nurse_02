-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "tosAcceptedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Student_tosAcceptedAt_idx" ON "Student"("tosAcceptedAt");
