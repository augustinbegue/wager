export type status = 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELED';

export type venue = 'HOME' | 'AWAY';

export type standingType = 'TOTAL' | 'HOME' | 'AWAY';

export type winner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';

export type duration = 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES';

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
    permission?: string;
}

export interface Competition {
    id: number;
    name: string;
    area: {
        name: string;
        code: string;
        ensignUrl: string;
    };
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
    competition: Competition;
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
    };
    homeTeam: {
        id: number;
        name: string;
    };
    awayTeam: {
        id: number;
        name: string;
    };
    referees: {
        id: number;
        name: string;
    }[];
}

export interface MatchesResponse {
    count: number;
    filters: Filters;
    matches: Match[];
}