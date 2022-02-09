-- CreateEnum
CREATE TYPE "betType" AS ENUM ('RESULT_HOME_TEAM', 'RESULT_AWAY_TEAM', 'RESULT_HOME_TEAM_OR_DRAW', 'RESULT_AWAY_TEAM_OR_DRAW', 'RESULT_DRAW', 'GOALS_HOME_TEAM', 'GOALS_AWAY_TEAM');

-- CreateTable
CREATE TABLE "betInfos" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "opened" BOOLEAN NOT NULL,
    "finished" BOOLEAN NOT NULL,

    CONSTRAINT "betInfos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" SERIAL NOT NULL,
    "betInfoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "betType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "odd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "betInfos_matchId_key" ON "betInfos"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "betInfos" ADD CONSTRAINT "betInfos_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_betInfoId_fkey" FOREIGN KEY ("betInfoId") REFERENCES "betInfos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
