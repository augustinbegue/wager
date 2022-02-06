import type { duration, status, winner } from './data'

export interface ApiScore {
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
}

export interface ApiMatchCondensed {
    id: string;
    competition: {
        id: string;
        name: string;
        emblemUrl: string;
    };
    season: {
        id: string;
    };
    matchday: number;
    date: string;
    homeTeam: {
        id: string;
        name: string;
        crestUrl: string;
    };
    awayTeam: {
        id: string;
        name: string;
        crestUrl: string;
    };
    status: status;
    score: ApiScore;
}