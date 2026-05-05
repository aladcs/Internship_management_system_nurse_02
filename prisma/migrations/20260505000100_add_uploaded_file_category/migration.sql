CREATE TYPE "UploadedFileCategory" AS ENUM ('general_attachment', 'portfolio_attachment');

ALTER TABLE "UploadedFile"
ADD COLUMN "category" "UploadedFileCategory" NOT NULL DEFAULT 'general_attachment';

CREATE INDEX "UploadedFile_studentId_category_idx" ON "UploadedFile"("studentId", "category");
