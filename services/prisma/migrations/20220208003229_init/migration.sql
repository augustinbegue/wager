-- CreateEnum
CREATE TYPE "status" AS ENUM ('SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "scoreType" AS ENUM ('FULL_TIME', 'HALF_TIME', 'EXTRA_TIME', 'PENALTIES');

-- CreateEnum
CREATE TYPE "winner" AS ENUM ('HOME_TEAM', 'AWAY_TEAM', 'DRAW');

-- CreateTable
CREATE TABLE "competitions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emblemUrl" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "teamIds" INTEGER[],
    "currentSeasonId" INTEGER NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "currentMatchday" INTEGER,
    "winnerId" INTEGER,
    "pastCompetitionId" INTEGER,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "status" "status" NOT NULL,
    "matchday" INTEGER NOT NULL,
    "winner" "winner",
    "homeTeamScore" INTEGER,
    "awayTeamScore" INTEGER,
    "duration" "scoreType",
    "competitionId" INTEGER NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "crestUrl" TEXT,

    CONSTRAINT "teamss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompetitionToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "competitions_name_key" ON "competitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_code_key" ON "competitions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_currentSeasonId_key" ON "competitions"("currentSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CompetitionToTeam_AB_unique" ON "_CompetitionToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_CompetitionToTeam_B_index" ON "_CompetitionToTeam"("B");

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_currentSeasonId_fkey" FOREIGN KEY ("currentSeasonId") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_pastCompetitionId_fkey" FOREIGN KEY ("pastCompetitionId") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "fk_homeTeam_id" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "fk_awayTeam_id" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_CompetitionToTeam" ADD FOREIGN KEY ("A") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionToTeam" ADD FOREIGN KEY ("B") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
