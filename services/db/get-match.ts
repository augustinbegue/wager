import { pool } from '.';
import { Match } from '../types/data';

export async function getMatch(id: string): Promise<Match | null> {
    let query = {
        text: `SELECT * FROM matches WHERE id = $1`,
        values: [id]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        return null;
    } else {
        return result.rows[0] as Match;
    }
}