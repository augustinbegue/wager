-- DropForeignKey
ALTER TABLE "cupRounds" DROP CONSTRAINT "cupRounds_stageId_fkey";

-- DropForeignKey
ALTER TABLE "cupStages" DROP CONSTRAINT "cupStages_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "cupStages" DROP CONSTRAINT "cupStages_seasonId_fkey";

-- AddForeignKey
ALTER TABLE "cupStages" ADD CONSTRAINT "cupStages_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupStages" ADD CONSTRAINT "cupStages_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupRounds" ADD CONSTRAINT "cupRounds_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "cupStages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
