import { status, winner, scoreType, User } from '@prisma/client';
import { Request, Response } from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
export interface AuthenticatedRequest extends Request {
    decoded: DecodedIdToken;
    user: User;
}

export interface ApiScore {
    winner: winner | null;
    duration: scoreType | null;
    fullTime: {
        homeTeam: number | null;
        awayTeam: number | null;
    };
    halfTime?: {
        homeTeam: number | null;
        awayTeam: number | null;
    };
    extraTime?: {
        homeTeam: number | null;
        awayTeam: number | null;
    };
    penalties?: {
        homeTeam: number | null;
        awayTeam: number | null;
    };
}

export interface ApiMatchCondensed {
    id: number;
    competition: {
        id: number;
        name: string;
        emblemUrl: string;
    };
    season: {
        id: number;
    };
    matchday: number;
    date: string;
    homeTeam: {
        id: number;
        name: string;
        crestUrl: string;
    };
    awayTeam: {
        id: number;
        name: string;
        crestUrl: string;
    };
    status: status;
    score: ApiScore;
}

export interface ApiMatchesParams {
    startDate: Date;
    endDate: Date;
    team?: number;
    competition?: number;
    season?: number;
    matchday?: number;
    homeTeam?: number;
    awayTeam?: number;
    status?: status;
    limit: number;
    offset: number;
}

export interface ApiMatchesResponse {
    start: number;
    end: number;
    total: number;
    matches: ApiMatchCondensed[];
}

export interface ApiCompetitionParams {
    id?: number;
    name?: string;
}