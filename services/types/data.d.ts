export type status = 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELED';

export type venue = 'HOME' | 'AWAY';

export type standingType = 'TOTAL' | 'HOME' | 'AWAY';

export type winner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;

export type duration = 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES';

export type plan = 'TIER_ONE' | 'TIER_TWO' | 'TIER_THREE' | 'TIER_FOUR';

export interface Filters {
    competition?: string;
    season?: string;
    stage?: string;
    group?: string;
    dateFrom?: string;
    dateTo?: string;
    matchday?: number;
    team?: string;
    venue?: venue;
    status?: status;
    limit?: number;
    offset?: number;
    standingType?: standingType;
    plan?: plan;
}

export interface Area {
    id: string;
    name: string;
    countryCode: string;
    ensignUrl: string;
}

export interface CompetitionShort {
    id: string;
    name: string;
    area?: Area;
}

export interface DBSeason {
    id: string;
    startDate: string;
    endDate: string;
    competition?: string;
    currentMatchday: number;
    winner: number | null;
}

export interface Match {
    id: string;
    competition: CompetitionShort;
    season: DBSeason;
    utcDate: string;
    status: status;
    matchday: number;
    stage: string;
    group: string | null;
    lastUpdated: string;
    score: {
        winner: winner;
        duration: duration;
        fullTime: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
        halfTime: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
        extraTime: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
        penalties: {
            homeTeam: number | null;
            awayTeam: number | null;
        };
    };
    homeTeam: {
        id: string;
        name: string;
    };
    awayTeam: {
        id: string;
        name: string;
    };
    referees?: {
        id: string;
        name: string;
    }[];
}

export interface DBMatch {
    id: string;
    competitionId: string;
    seasonId: string;
    date: string;
    status: status;
    matchday: number;
    homeTeamId: string;
    awayTeamId: string;
    data: Match;
}

export interface MatchesResponse {
    count: number;
    filters: Filters;
    matches: Match[];
}

export interface Competition {
    id: string;
    area?: Area;
    name: string;
    code: string;
    emblemUrl: string;
    plan?: plan;
    currentSeason: DBSeason;
    numberOfAvailableSeasons: number;
    lastUpdated: string;
    teams: string[];
}

export interface DBCompetition {
    id: string;
    name: string;
    emblemUrl: string;
    lastUpdated: string;
    teams: string[];
    code: string;
    data: Competition;
}

export interface CompetitionsResponse {
    count: number;
    filters: Filters;
    competitions: Competition[];
}

export interface Team {
    id: string;
    area?: Area;
    name: string;
    shortName: string;
    tla: string;
    crestUrl: string;
    clubColors: string;
    lastUpdated: string;
}