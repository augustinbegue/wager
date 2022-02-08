import type { Competition, Match, Score, Season, Team } from '@prisma/client';

export type MatchIncludesTeams = Match & {
    homeTeam: Team,
    awayTeam: Team,
}

export type CompetitionIncludesSeason = Competition & {
    currentSeason: Season,
}