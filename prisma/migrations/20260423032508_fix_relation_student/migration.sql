/*
  Warnings:

  - You are about to drop the column `internship` on the `Student` table. All the data in the column will be lost.
  - Made the column `internshipStatus` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "internship",
ALTER COLUMN "internshipStatus" SET NOT NULL,
ALTER COLUMN "internshipStatus" SET DEFAULT 'pending';
