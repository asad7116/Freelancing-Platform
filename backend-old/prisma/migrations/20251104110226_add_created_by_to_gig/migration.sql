/*
  Warnings:

  - Added the required column `createdBy` to the `Gig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
