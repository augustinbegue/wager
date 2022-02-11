/*
  Warnings:

  - You are about to drop the column `odd` on the `bets` table. All the data in the column will be lost.
  - Added the required column `resultAwayTeamOdd` to the `betInfos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultAwayTeamOrDrawOdd` to the `betInfos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultDrawOdd` to the `betInfos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultHomeTeamOdd` to the `betInfos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultHomeTeamOrDrawOdd` to the `betInfos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "betInfos" ADD COLUMN     "goalsAwayTeamOdds" DOUBLE PRECISION[],
ADD COLUMN     "goalsHomeTeamOdds" DOUBLE PRECISION[],
ADD COLUMN     "resultAwayTeamOdd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "resultAwayTeamOrDrawOdd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "resultDrawOdd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "resultHomeTeamOdd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "resultHomeTeamOrDrawOdd" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "bets" DROP COLUMN "odd",
ADD COLUMN     "goals" INTEGER;
