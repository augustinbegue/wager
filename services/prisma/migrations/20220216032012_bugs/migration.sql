/*
  Warnings:

  - Added the required column `awayTeamAmount` to the `betInfos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drawAmount` to the `betInfos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamAmount` to the `betInfos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "betInfos" ADD COLUMN     "awayTeamAmount" INTEGER NOT NULL,
ADD COLUMN     "drawAmount" INTEGER NOT NULL,
ADD COLUMN     "homeTeamAmount" INTEGER NOT NULL;
