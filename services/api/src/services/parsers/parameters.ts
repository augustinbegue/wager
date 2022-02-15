import { ApiCompetitionParams, ApiMatchesParams } from '../../../../types/api';

export function parseMatchesParams(query: any, dateMendatory = true): ApiMatchesParams {
    if (dateMendatory && (!query.startDate || !query.endDate) && !(query.competition && query.matchday)) {
        throw new Error('Missing required params: startDate, endDate');
    }

    let params = {
        startDate: new Date(query.startDate ?? '1970-01-01'),
        endDate: new Date(query.endDate ?? '2100-01-01'),
        matchday: query.matchday ? parseInt(query.matchday) : undefined,
        team: query.team ? parseInt(query.team) : undefined,
        homeTeam: query.homeTeam ? parseInt(query.homeTeam) : undefined,
        awayTeam: query.awayTeam ? parseInt(query.awayTeam) : undefined,
        competition: query.competition ? parseInt(query.competition) : undefined,
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
