import moment from "moment";
import { Competition, Match, duration, winner, Team, status } from "../../../types/data";
import { ScrapedMatch, ScrapedTeam } from "../../../types/scraper";

const scoreStatuses: status[] = ['LIVE', 'IN_PLAY', 'FINISHED', 'PAUSED'];
const matchDayStatuses: status[] = ['FINISHED', 'SCHEDULED'];

export function parseScrapedMatches(scrapedMatches: ScrapedMatch[], competition: Competition, teams: Team[], status: status = 'FINISHED'): Match[] {
    return scrapedMatches.map((scrapedMatch) => {
        let fullTime = {
            homeTeam: scrapedMatch.homeScoreFullStr ? parseInt(scrapedMatch.homeScoreFullStr) : null,
            awayTeam: scrapedMatch.awayScoreFullStr ? parseInt(scrapedMatch.awayScoreFullStr) : null,
        }
        let halfTime = {
            homeTeam: scrapedMatch.homeScoreHalfStr ? parseInt(scrapedMatch.homeScoreHalfStr) : null,
            awayTeam: scrapedMatch.awayScoreHalfStr ? parseInt(scrapedMatch.awayScoreHalfStr) : null,
        }
        let duration: duration = 'REGULAR';

        let date = new Date();

        // Parse date
        if (scrapedMatch.elapsedMinutes) {
            if (scrapedMatch.elapsedMinutes.startsWith('Half Time')) {
                status = 'PAUSED';
                scrapedMatch.elapsedMinutes = '45';
            } else if (isNaN(parseInt(scrapedMatch.elapsedMinutes))) {
                scrapedMatch.elapsedMinutes = '90';
            }
            date = new Date(date.getTime() - (parseInt(scrapedMatch.elapsedMinutes) * 60000));
            date.setSeconds(0, 0);
        } else if (scrapedMatch.timeStr) {
            let [day, month] = scrapedMatch.timeStr.split(" ")[0].split(".");

            let year = month > '12' ? moment(competition.currentSeason.startDate).year() : moment(competition.currentSeason.endDate).year();

            date.setFullYear(
                year,
                parseInt(month) - 1,
                parseInt(day)
            );
            let [hours, minutes] = scrapedMatch.timeStr.split(" ")[1].split(":");
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        // Parse Winner
        let winner: winner = fullTime.homeTeam && fullTime.awayTeam ?
            fullTime.homeTeam > fullTime.awayTeam ? 'HOME_TEAM' : fullTime.homeTeam === fullTime.awayTeam ? 'DRAW' : 'AWAY_TEAM'
            : null;

        return {
            id: "-1",
            competition: {
                id: competition.id,
                name: competition.name,
            },
            season: competition.currentSeason,
            utcDate: date.toUTCString(),
            status: status,
            // scrapedMatch.matchday can be trusted only if the match is not live
            matchday: matchDayStatuses.includes(status) ? scrapedMatch.currentMatchday : competition.currentSeason.currentMatchday,
            stage: '',
            group: null,
            lastUpdated: new Date().toUTCString(),
            homeTeam: {
                id: teams.find((team) => team.name === scrapedMatch.homeTeamName)?.id || "-1",
                name: scrapedMatch.homeTeamName,
            },
            awayTeam: {
                id: teams.find((team) => team.name === scrapedMatch.awayTeamName)?.id || "-1",
                name: scrapedMatch.awayTeamName,
            },
            score: {
                winner: winner,
                duration: duration,
                fullTime: fullTime,
                halfTime: halfTime,
                extraTime: {
                    homeTeam: null,
                    awayTeam: null,
                },
                penalties: {
                    homeTeam: null,
                    awayTeam: null,
                },
            },
        };
    });
}

export function parseScrapedTeams(scrapedTeams: ScrapedTeam[]): Team[] {
    return scrapedTeams.map((scrapedTeam) => {
        return {
            id: "-1",
            name: scrapedTeam.name,
            shortName: scrapedTeam.name,
            tla: "",
            crestUrl: scrapedTeam.crestUrl,
            clubColors: "",
            lastUpdated: new Date().toUTCString(),
        }
    });
}