-- CreateEnum
CREATE TYPE "competitionType" AS ENUM ('CUP', 'LEAGUE');

-- CreateEnum
CREATE TYPE "competitionStage" AS ENUM ('REGULAR_SEASON', 'PLAY_OFFS', 'GROUP_STAGE', 'ELIMINATION_STAGE', 'FINAL_STAGE');

-- AlterTable
ALTER TABLE "competitions" ADD COLUMN     "type" "competitionType" NOT NULL DEFAULT E'LEAGUE';
