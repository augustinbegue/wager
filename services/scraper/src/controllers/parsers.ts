import moment from "moment";
import { Competition, Match, duration, winner, Team } from "../../../types/data";
import { ScrapedMatch, ScrapedTeam } from "../../../types/scraper";

export function parseScrapedMatches(scrapedMatches: ScrapedMatch[], competition: Competition): Match[] {
    return scrapedMatches.map((scrapedMatch) => {
        let fullTime = {
            homeTeam: parseInt(scrapedMatch.homeScoreFullStr),
            awayTeam: parseInt(scrapedMatch.awayScoreFullStr),
        }
        let halfTime = {
            homeTeam: parseInt(scrapedMatch.homeScoreHalfStr),
            awayTeam: parseInt(scrapedMatch.awayScoreHalfStr),
        }
        let duration: duration = 'REGULAR';

        let date = new Date();
        let [day, month] = scrapedMatch.timeStr.split(" ")[0].split(".");
        date.setFullYear(
            moment(competition.currentSeason.startDate).year(),
            parseInt(month) - 1,
            parseInt(day)
        );
        let [hours, minutes] = scrapedMatch.timeStr.split(" ")[1].split(":");
        date.setHours(parseInt(hours), parseInt(minutes));

        let winner: winner = fullTime.homeTeam > fullTime.awayTeam ? 'HOME_TEAM' : fullTime.homeTeam === fullTime.awayTeam ? 'DRAW' : 'AWAY_TEAM';

        return {
            id: -1,
            competition: {
                id: competition.id,
                name: competition.name,
            },
            season: competition.currentSeason,
            utcDate: date.toUTCString(),
            status: 'FINISHED',
            matchday: scrapedMatch.currentMatchday,
            stage: '',
            group: null,
            lastUpdated: new Date().toUTCString(),
            homeTeam: {
                id: -1,
                name: scrapedMatch.homeTeamName,
            },
            awayTeam: {
                id: -1,
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
            id: -1,
            name: scrapedTeam.name,
            shortName: scrapedTeam.name,
            tla: "",
            crestUrl: scrapedTeam.crestUrl,
            clubColors: "",
            lastUpdated: new Date().toUTCString(),
        }
    });
}