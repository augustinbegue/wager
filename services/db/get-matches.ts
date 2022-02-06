import { pool } from '.';
import { DBMatch, Match, status } from '../types/data';

export async function getMatch(id: string): Promise<Match | undefined> {
    let query = {
        text: `SELECT * FROM matches WHERE id = $1`,
        values: [id]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        return;
    } else {
        return result.rows[0] as Match;
    }
}

/**
 * 
 * @param options Options for the query.
 * @param options.startDate The start date of the query.
 * @param options.endDate The end date of the query.
 * @param options.competitionId The competition id of the query.
 * @param options.teamId The team id of the query.
 * @param options.seasonId The seasonId of the query.
 * @param options.status The status of the query.
 * @param options.limit The limit of the query.
 * @param options.offset The offset of the query.
 */
export async function getMatches(options: {
    startDate: Date,
    endDate: Date,
    competitionId?: string,
    teamId?: string,
    seasonId?: string,
    status?: status,
    limit?: number,
    offset?: number
}): Promise<DBMatch[]> {
    let query = {
        text: `SELECT * FROM matches WHERE date >= $1 AND date <= $2`,
        values: [options.startDate, options.endDate] as any[]
    }

    if (options.competitionId) {
        query.text += ` AND competitionId = $3`;
        query.values.push(options.competitionId);
    }

    if (options.teamId) {
        query.text += ` AND (homeTeamId = $4 OR awayTeamId = $4)`;
        query.values.push(options.teamId);
    }

    if (options.seasonId) {
        query.text += ` AND seasonId = $5`;
        query.values.push(options.seasonId);
    }

    if (options.status) {
        query.text += ` AND status = $6`;
        query.values.push(options.status);
    }

    if (options.limit) {
        query.text += ` LIMIT $6`;
        query.values.push(options.limit);
    }

    if (options.offset) {
        query.text += ` OFFSET $7`;
        query.values.push(options.offset);
    }

    let result = await pool.query(query);
    let matches = result.rows as DBMatch[];

    return matches;
}