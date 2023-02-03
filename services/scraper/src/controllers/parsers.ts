import moment from "moment";
import { ScrapedMatch, ScrapedTeam } from "../../../types/scraper";
import { CompetitionIncludesSeason } from "../../../types/db";
import { Team, status, scoreType, Match, winner } from "@prisma/client";

const scoreStatuses: status[] = ["LIVE", "IN_PLAY", "FINISHED", "PAUSED"];
const matchDayStatuses: status[] = ["FINISHED", "SCHEDULED"];

export function parseScrapedMatches(
    scrapedMatches: ScrapedMatch[],
    competition: CompetitionIncludesSeason,
    teams: Team[],
    status: status = "FINISHED",
): Match[] {
    try {
        return scrapedMatches.map((scrapedMatch) => {
            let fullTime = {
                homeTeam: scrapedMatch.homeScoreFullStr
                    ? parseInt(scrapedMatch.homeScoreFullStr)
                    : null,
                awayTeam: scrapedMatch.awayScoreFullStr
                    ? parseInt(scrapedMatch.awayScoreFullStr)
                    : null,
            };
            let duration: scoreType = scoreType.FULL_TIME;

            let date = new Date();

            // Parse date
            if (scrapedMatch.elapsedMinutes) {
                if (scrapedMatch.elapsedMinutes.startsWith("Half Time")) {
                    status = "PAUSED";
                    scrapedMatch.elapsedMinutes = "45";
                } else if (isNaN(parseInt(scrapedMatch.elapsedMinutes))) {
                    scrapedMatch.elapsedMinutes = "90";
                }
                date = new Date(
                    date.getTime() -
                        parseInt(scrapedMatch.elapsedMinutes) * 60000,
                );
                date.setSeconds(0, 0);
            } else if (scrapedMatch.timeStr) {
                let [day, month] = scrapedMatch.timeStr
                    .split(" ")[0]
                    .split(".");

                let year =
                    month > "12"
                        ? moment(competition.currentSeason.startDate).year()
                        : moment(competition.currentSeason.endDate).year();

                date.setFullYear(year, parseInt(month) - 1, parseInt(day));
                let [hours, minutes] = scrapedMatch.timeStr
                    .split(" ")[1]
                    .split(":");
                date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            }

            // Parse Winner
            let matchWinner: winner | null =
                fullTime.homeTeam != null && fullTime.awayTeam != null
                    ? fullTime.homeTeam > fullTime.awayTeam
                        ? "HOME_TEAM"
                        : fullTime.homeTeam === fullTime.awayTeam
                        ? "DRAW"
                        : "AWAY_TEAM"
                    : null;

            let homeTeam = teams.find(
                (team) => team.name === scrapedMatch.homeTeamName,
            );
            let awayTeam = teams.find(
                (team) => team.name === scrapedMatch.awayTeamName,
            );

            if (!homeTeam || !awayTeam) {
                console.log("Teams: " + JSON.stringify(teams));
                console.log("Scraped Match: " + JSON.stringify(scrapedMatch));

                throw new Error(
                    "team not found: " + scrapedMatch.homeTeamName ||
                        scrapedMatch.awayTeamName,
                );
            }

            return {
                id: 0,
                date: date,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                status: status,
                matchday:
                    (matchDayStatuses.includes(status)
                        ? scrapedMatch.currentMatchday
                        : competition.currentSeason.currentMatchday) || 1,
                winner: matchWinner,
                homeTeamScore: fullTime.homeTeam,
                awayTeamScore: fullTime.awayTeam,
                duration: duration,
                minutes: scrapedMatch.elapsedMinutes
                    ? parseInt(scrapedMatch.elapsedMinutes)
                    : null,
                competitionId: competition.id,
                competition: competition,
            };
        });
    } catch (error) {
        throw error;
    }
}

export function parseScrapedTeams(scrapedTeams: ScrapedTeam[]): Team[] {
    return scrapedTeams.map((scrapedTeam) => {
        return {
            id: 0,
            name: scrapedTeam.name,
            shortName: scrapedTeam.name,
            crestUrl: scrapedTeam.crestUrl,
        };
    });
}
