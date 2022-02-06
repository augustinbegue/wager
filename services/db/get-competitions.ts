import { getCurrentSeason, pool } from ".";
import { DBCompetition } from "../types/data";

export async function getCompetition(options: { id?: string, name?: string, code?: string }) {
    let comparison = "";

    if (options.id) {
        comparison = "id = $1";
    } else if (options.name) {
        comparison = "name = $1";
    } else if (options.code) {
        comparison = "code = $1";
    }

    let query = {
        text: `SELECT "id", "name", "emblemUrl", "lastUpdated", "data", "code" FROM competitions WHERE ${comparison}`,
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
