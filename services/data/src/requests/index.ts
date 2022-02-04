import axios from 'axios';
import moment from 'moment';
import { MatchesResponse } from '../../../types';

if (!process.env.FOOTBALL_DATA_TOKEN)
    throw new Error('Environement variable FOOTBALL_DATA_TOKEN is not defined');

export const fbdata = axios.create({
    baseURL: 'https://api.football-data.org/v2/',
    headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN
    }
});

/**
 * Get matches of the week for all competitions
 */
export async function getMatchesOfTheWeek(): Promise<MatchesResponse> {
    let dateFrom = moment().subtract(1, 'days').format('YYYY-MM-DD');
    let dateTo = moment().add(6, 'days').format('YYYY-MM-DD');

    let res = await fbdata.get('matches', {
        params: {
            dateFrom,
            dateTo
        }
    })

    return res.data;
}