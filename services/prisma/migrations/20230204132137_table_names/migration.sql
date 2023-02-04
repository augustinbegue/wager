/*
  Warnings:

  - You are about to drop the `CupRound` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CupStage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CupRound" DROP CONSTRAINT "CupRound_nextId_fkey";

-- DropForeignKey
ALTER TABLE "CupRound" DROP CONSTRAINT "CupRound_stageId_fkey";

-- DropForeignKey
ALTER TABLE "CupStage" DROP CONSTRAINT "CupStage_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "CupStage" DROP CONSTRAINT "CupStage_nextId_fkey";

-- DropForeignKey
ALTER TABLE "_cupRound_teams" DROP CONSTRAINT "_cupRound_teams_A_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_cupRoundId_fkey";

-- DropTable
DROP TABLE "CupRound";

-- DropTable
DROP TABLE "CupStage";

-- CreateTable
CREATE TABLE "cupStages" (
    "id" TEXT NOT NULL,
    "nextId" TEXT,
    "competitionId" INTEGER NOT NULL,

    CONSTRAINT "cupStages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupRounds" (
    "id" TEXT NOT NULL,
    "nextId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,

    CONSTRAINT "cupRounds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_cupRoundId_fkey" FOREIGN KEY ("cupRoundId") REFERENCES "cupRounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupStages" ADD CONSTRAINT "cupStages_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "cupStages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupStages" ADD CONSTRAINT "cupStages_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupRounds" ADD CONSTRAINT "cupRounds_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "cupRounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupRounds" ADD CONSTRAINT "cupRounds_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "cupStages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cupRound_teams" ADD CONSTRAINT "_cupRound_teams_A_fkey" FOREIGN KEY ("A") REFERENCES "cupRounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
