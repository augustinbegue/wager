-- CreateTable
CREATE TABLE "standings" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playedGames" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "draw" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "goalDifference" INTEGER NOT NULL,
    "competitionId" INTEGER NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
