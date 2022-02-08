import type { Competition, Match, Score, Season, Team } from '@prisma/client';

export type MatchIncludesTeams = Match & {
    homeTeam: Team,
    awayTeam: Team,
}

export type MatchIncludesTeamsCompetition = Match & {
    homeTeam: Team,
    awayTeam: Team,
    competition: Competition,
}

export type CompetitionIncludesSeason = Competition & {
    currentSeason: Season,
}

export type CompetitionFull = Competition & {
    currentSeason: Season,
    teams: Team[],
    matches: Match[],
}