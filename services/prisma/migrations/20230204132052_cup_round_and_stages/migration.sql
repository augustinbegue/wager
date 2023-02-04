/*
  Warnings:

  - You are about to drop the column `teamIds` on the `competitions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "teamIds";

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "cupRoundId" TEXT;

-- CreateTable
CREATE TABLE "CupStage" (
    "id" TEXT NOT NULL,
    "nextId" TEXT,
    "competitionId" INTEGER NOT NULL,

    CONSTRAINT "CupStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CupRound" (
    "id" TEXT NOT NULL,
    "nextId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,

    CONSTRAINT "CupRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_cupRound_teams" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_cupRound_teams_AB_unique" ON "_cupRound_teams"("A", "B");

-- CreateIndex
CREATE INDEX "_cupRound_teams_B_index" ON "_cupRound_teams"("B");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_cupRoundId_fkey" FOREIGN KEY ("cupRoundId") REFERENCES "CupRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CupStage" ADD CONSTRAINT "CupStage_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "CupStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CupStage" ADD CONSTRAINT "CupStage_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CupRound" ADD CONSTRAINT "CupRound_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "CupRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CupRound" ADD CONSTRAINT "CupRound_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "CupStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cupRound_teams" ADD CONSTRAINT "_cupRound_teams_A_fkey" FOREIGN KEY ("A") REFERENCES "CupRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cupRound_teams" ADD CONSTRAINT "_cupRound_teams_B_fkey" FOREIGN KEY ("B") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
