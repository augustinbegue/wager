import { pool } from ".";
import { Competition, DBSeason } from "../types/data";

export async function getCurrentSeason(competition: Competition) {
    let query = {
        text: `SELECT "id", "startDate", "endDate", "currentMatchday", "winner" FROM seasons WHERE competition = $1 ORDER BY "startDate" DESC LIMIT 1`,
        values: [competition.id]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        return null;
    } else {
        return result.rows[0] as DBSeason;
    }
}