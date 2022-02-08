/*
  Warnings:

  - You are about to drop the column `position` on the `standings` table. All the data in the column will be lost.
  - Added the required column `seasonId` to the `standings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "standings" DROP COLUMN "position",
ADD COLUMN     "seasonId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
