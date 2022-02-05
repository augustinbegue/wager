import { pool } from ".";

export async function getCompetition(options: { id?: number, name?: string, code?: string }) {
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
        return result.rows[0];
    }
}
