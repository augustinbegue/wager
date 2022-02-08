import { ApiMatchCondensed } from '../../../types/api';
import { MatchIncludesTeamsCompetition } from '../../../types/db';

export function parseMatches(matches: MatchIncludesTeamsCompetition[]): ApiMatchCondensed[] {
    return matches.map(match => {
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
            date: match.date.toUTCString(),
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
            }
        };
    });
}
