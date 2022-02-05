import { pool } from ".";
import { Competition } from "../types/data";

export async function insertOrUpdateCompetition(competition: Competition) {
    let checkQuery = {
        text: `SELECT * FROM competitions WHERE "id" = $1`,
        values: [competition.id]
    }

    let checkResult = await pool.query(checkQuery);
    let lastUpdated = new Date(competition.lastUpdated);

    if (checkResult.rowCount != 0) {
        // Check if the competition have to be updated
        let update = new Date(checkResult.rows[0].lastUpdated).getTime() != lastUpdated.getTime();

        if (update) {
            let updateQuery = {
                text: `UPDATE competitions SET
                        "emblemUrl" = $1,
                        "lastUpdated" = $1,
                        "data" = $2,
                        WHERE "id" = $3`,

                values: [
                    competition.emblemUrl,
                    new Date(competition.lastUpdated),
                    competition,
                    competition.id
                ]
            }

            await pool.query(updateQuery);

            console.log("Updated competition: " + competition.id);
        }
    } else {
        // Insert the competition
        let insertQuery = {
            text: `INSERT INTO competitions("id", "name", "emblemUrl", "lastUpdated", "data") VALUES ($1, $2, $3, $4, $5)`,
            values: [
                competition.id,
                competition.name,
                competition.emblemUrl,
                new Date(competition.lastUpdated),
                competition
            ]
        }

        await pool.query(insertQuery);

        console.log("Inserted competition: " + competition.id);
    }
}