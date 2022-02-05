export type status = 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELED';

export type venue = 'HOME' | 'AWAY';

export type standingType = 'TOTAL' | 'HOME' | 'AWAY';

export type winner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';

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
    id: number;
    name: string;
    countryCode: string;
    ensignUrl: string;
}

export interface CompetitionShort {
    id: number;
    name: string;
    area?: Area;
}

export interface Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: null;
}

export interface Match {
    id: number;
    competition: CompetitionShort;
    season: Season;
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
        id: number;
        name: string;
    };
    awayTeam: {
        id: number;
        name: string;
    };
    referees?: {
        id: number;
        name: string;
    }[];
}

export interface MatchesResponse {
    count: number;
    filters: Filters;
    matches: Match[];
}

export interface Competition {
    id: number;
    area?: Area;
    name: string;
    code: string;
    emblemUrl: string;
    plan?: plan;
    currentSeason: Season;
    numberOfAvailableSeasons: number;
    lastUpdated: string;
}
export interface CompetitionsResponse {
    count: number;
    filters: Filters;
    competitions: Competition[];
}

export interface Team {
    id: number;
    area?: Area;
    name: string;
    shortName: string;
    tla: string;
    crestUrl: string;
    clubColors: string;
    lastUpdated: string;
}