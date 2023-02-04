/*
  Warnings:

  - Added the required column `order` to the `cupRounds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `cupStages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cupRounds" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "cupStages" ADD COLUMN     "order" INTEGER NOT NULL;
