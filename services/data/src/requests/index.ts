import axios from 'axios';
import moment from 'moment';
import { CompetitionsResponse, MatchesResponse, plan } from '../../../types/data';

if (!process.env.FOOTBALL_DATA_TOKEN)
    throw new Error('Environement variable FOOTBALL_DATA_TOKEN is not defined');

export const fbdata = axios.create({
    baseURL: 'https://api.football-data.org/v2/',
    headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN
    }
});

export const tier: plan = 'TIER_ONE';

/**
 * Get matches of the week for all competitions
 */
export async function getMatchesOfTheWeek(): Promise<MatchesResponse> {
    try {
        let dateFrom = moment().subtract(1, 'days').format('YYYY-MM-DD');
        let dateTo = moment().add(6, 'days').format('YYYY-MM-DD');

        let res = await fbdata.get('matches', {
            params: {
                dateFrom,
                dateTo
            }
        })

        return res.data;
    } catch (error) {
        console.error("[getMatchesOfTheWeek] Error: ", error);
        return {
            count: 0,
            matches: [],
            filters: {}
        }
    }
}

/**
 * Get all competitions of a tier
 */
export async function getTierCompetitions(): Promise<CompetitionsResponse> {
    try {
        let res = await fbdata.get(`competitions?plan=${tier}`);

        return res.data;
    } catch (error) {
        console.error("[getTierCompetitions] Error: ", error);

        return {
            count: 0,
            competitions: [],
            filters: {}
        }
    }
}