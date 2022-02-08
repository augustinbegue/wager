import { ApiCompetitionParams, ApiMatchesParams } from '../../../../types/api';

export function parseMatchesParams(query: any): ApiMatchesParams {
    if (!query.startDate || !query.endDate) {
        throw new Error('Missing required params: startDate, endDate');
    }

    let params = {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
        matchday: query.matchday ? parseInt(query.matchday) : undefined,
        team: query.team ? parseInt(query.team) : undefined,
        homeTeam: query.homeTeam ? parseInt(query.homeTeam) : undefined,
        awayTeam: query.awayTeam ? parseInt(query.awayTeam) : undefined,
        status: query.status ? query.status : undefined,
        limit: query.limit ? parseInt(query.limit) : 10,
        offset: query.offset ? parseInt(query.offset) : 0
    };


    if (params.limit > 100) {
        params.limit = 100;
    }

    return params;
}

export function parseCompetitionsParams(query: any): ApiCompetitionParams {
    let params = {
        id: query.id ? parseInt(query.id) : undefined,
        name: query.name,
    };

    return params;
}
