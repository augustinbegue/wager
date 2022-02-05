import { pool } from ".";

export async function getCompetition(options: { id?: number, name?: string }) {
    let query = {
        text: `SELECT "id", "name", "emblemUrl", "lastUpdated", "data" FROM competitions WHERE "${options.id ? 'id' : 'name'}" = $1`,
        values: [
            options.id || options.name
        ]
    }

    let result = await pool.query(query);

    console.log(result);

    if (result.rowCount === 0) {
        return null;
    } else {
        return result.rows;
    }
}
