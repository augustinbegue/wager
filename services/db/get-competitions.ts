import { getCurrentSeason, pool } from ".";
import { DBCompetition } from "../types/data";

export async function getCompetition(options: { id?: string, name?: string, code?: string }) {
    let column = "";

    if (options.id) {
        column = "id";
    } else if (options.name) {
        column = "name";
    } else if (options.code) {
        column = `"data"->>'code'`;
    }

    let query = {
        text: `SELECT "id", "name", "emblemUrl", "lastUpdated", "data" FROM competitions WHERE ${column} = $1`,
        values: [
            options.id || options.name || options.code
        ]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        return null;
    } else {
        let competition = result.rows[0] as DBCompetition;
        competition.data.id = competition.id;

        let cs = await getCurrentSeason(competition.data);
        if (cs) {
            competition.data.currentSeason = cs;
        }

        competition.data.teams = competition.teams;

        return competition;
    }
}
