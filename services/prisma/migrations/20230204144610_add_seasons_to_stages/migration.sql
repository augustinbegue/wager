/*
  Warnings:

  - Added the required column `seasonId` to the `cupStages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cupStages" ADD COLUMN     "seasonId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "cupStages" ADD CONSTRAINT "cupStages_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
