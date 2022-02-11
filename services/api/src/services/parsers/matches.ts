import { ApiMatchCondensed } from '../../../../types/api';
import { MatchIncludesAll, MatchIncludesTeamsCompetition } from '../../../../types/db';

export function parseMatches(matches: MatchIncludesAll[]): ApiMatchCondensed[] {
    return matches.map(match => {
        if (!match.betInfo) {
            throw new Error('Match ' + match.id + ' has no bet info.');
        }

        return {
            id: match.id,
            competition: {
                id: match.competition.id,
                name: match.competition.name,
                emblemUrl: match.competition.emblemUrl
            },
            season: {
                id: match.competition.currentSeasonId
            },
            matchday: match.matchday,
            date: match.date.toISOString(),
            homeTeam: {
                id: match.homeTeam.id,
                name: match.homeTeam.name,
                crestUrl: match.homeTeam.crestUrl || 'static/images/fallback.png'
            },
            awayTeam: {
                id: match.awayTeam.id,
                name: match.awayTeam.name,
                crestUrl: match.awayTeam.crestUrl || 'static/images/fallback.png'
            },
            status: match.status,
            score: {
                winner: match.winner,
                duration: match.duration,
                fullTime: {
                    homeTeam: match.homeTeamScore,
                    awayTeam: match.awayTeamScore
                }
            },
            betInfo: {
                id: match.betInfo.id,
                opened: match.betInfo.opened,
                finished: match.betInfo.finished,
                resultHomeTeamOdd: match.betInfo.resultHomeTeamOdd,
                resultDrawOdd: match.betInfo.resultDrawOdd,
                resultAwayTeamOdd: match.betInfo.resultAwayTeamOdd,
                resultHomeTeamOrDrawOdd: match.betInfo.resultHomeTeamOrDrawOdd,
                resultAwayTeamOrDrawOdd: match.betInfo.resultAwayTeamOrDrawOdd,
                goalsHomeTeamOdds: match.betInfo.goalsHomeTeamOdds,
                goalsAwayTeamOdds: match.betInfo.goalsAwayTeamOdds
            },
        };
    });
}
