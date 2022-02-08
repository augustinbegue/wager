import { Standings, winner } from "@prisma/client";
import { prisma } from "../../../prisma";
import { CompetitionFull } from "../../../types/db";

export async function updateStandings() {
    let competitions = await prisma.competition.findMany({
        include: {
            teams: true,
            currentSeason: true,
            matches: true,
        },
    })

    let promises = [];
    for (let i = 0; i < competitions.length; i++) {
        promises.push(updateCompetitionStandings(competitions[i]));
    }

    await Promise.all(promises);
}

async function updateCompetitionStandings(competition: CompetitionFull) {
    let standingsArr: Standings[] = [];

    standingsArr = await prisma.standings.findMany({
        where: {
            competitionId: competition.id,
            seasonId: competition.currentSeason.id,
        },
    });

    let standings: Map<number, any> = new Map();

    for (let i = 0; i < standingsArr.length; i++) {
        standings.set(standingsArr[i].teamId, standingsArr[i]);
    }

    for (let i = 0; i < competition.teams.length; i++) {
        const team = competition.teams[i];

        standings.set(team.id, {
            ...standings.get(team.id),
            teamId: team.id,
            playedGames: 0,
            won: 0,
            draw: 0,
            lost: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            competitionId: competition.id,
            seasonId: competition.currentSeason.id,
        });
    }

    for (let i = 0; i < competition.matches.length; i++) {
        const match = competition.matches[i];

        if (match.status != "FINISHED")
            continue;

        let homeTeam = standings.get(match.homeTeamId);
        let awayTeam = standings.get(match.awayTeamId);

        if (!homeTeam || !awayTeam)
            throw new Error("Team " + homeTeam || awayTeam + " not found in standings");

        homeTeam.playedGames++;
        awayTeam.playedGames++;

        if (match.homeTeamScore) {
            homeTeam.goalsFor += match.homeTeamScore;
            awayTeam.goalsAgainst += match.homeTeamScore;
        }

        if (match.awayTeamScore) {
            homeTeam.goalsAgainst += match.awayTeamScore;
            awayTeam.goalsFor += match.awayTeamScore;
        }

        if (match.winner === winner.HOME_TEAM) {
            homeTeam.won++;
            homeTeam.points += 3;
            awayTeam.lost++;
        } else if (match.winner === winner.AWAY_TEAM) {
            awayTeam.won++;
            awayTeam.points += 3;
            homeTeam.lost++;
        } else {
            homeTeam.points++;
            homeTeam.draw++;
            awayTeam.points++;
            awayTeam.draw++;
        }
    }

    standingsArr = Array.from(standings.values());
    let promises = [];
    for (let i = 0; i < standingsArr.length; i++) {
        const entry = standingsArr[i];

        console.log("Inserting standings for " + entry.teamId, entry);

        promises.push(prisma.standings.upsert({
            where: {
                id: entry.id || -1,
            },
            create: entry,
            update: entry,
        }));
    }

    await Promise.all(promises);

    console.log(`Updated standings for ${competition.name}`);
}