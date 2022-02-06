import { pool } from ".";
import { Competition } from "../types/data";

export async function insertOrUpdateCompetition(competition: Competition) {
    let checkResult: any;

    if (competition.id === "-1") {
        let checkQuery = {
            text: `SELECT "id", "lastUpdated" FROM competitions WHERE "name" = $1;`,
            values: [competition.name]
        }

        checkResult = await pool.query(checkQuery);
    } else {
        let checkQuery = {
            text: `SELECT "id", "lastUpdated" FROM competitions WHERE "id" = $1;`,
            values: [competition.id]
        }

        checkResult = await pool.query(checkQuery);
    }

    let lastUpdated = new Date(competition.lastUpdated);

    if (checkResult.rowCount != 0) {
        // Check if the competition have to be updated
        let update = new Date(checkResult.rows[0].lastUpdated).getTime() != lastUpdated.getTime();

        if (update) {
            if (competition.teams.length > 0) {
                let updateQuery = {
                    text: `UPDATE competitions SET
                        "emblemUrl" = $1,
                        "lastUpdated" = $2,
                        "data" = $3,
                        "teams" = $4,
                        "code" = $5
                        WHERE "id" = $6`,

                    values: [
                        competition.emblemUrl,
                        new Date(competition.lastUpdated),
                        competition,
                        competition.teams,
                        competition.code,
                        checkResult.rows[0].id
                    ]
                }

                await pool.query(updateQuery);
            } else {
                let updateQuery = {
                    text: `UPDATE competitions SET
                        "emblemUrl" = $1,
                        "lastUpdated" = $2,
                        "data" = $3,
                        "code" = $4
                        WHERE "id" = $5`,

                    values: [
                        competition.emblemUrl,
                        new Date(competition.lastUpdated),
                        competition,
                        competition.code,
                        checkResult.rows[0].id
                    ]
                }

                await pool.query(updateQuery);
            }


            console.log("Updated competition: " + checkResult.rows[0].id);
        }

        return checkResult.rows[0].id as string;
    } else {
        // Insert the competition
        let insertQuery = {
            text: `INSERT INTO competitions("name", "emblemUrl", "lastUpdated", "data") VALUES ($1, $2, $3, $4) RETURNING "id"`,
            values: [
                competition.name,
                competition.emblemUrl,
                new Date(competition.lastUpdated),
                competition
            ]
        }

        let insertResult = await pool.query(insertQuery);

        console.log("Inserted competition: " + insertResult.rows[0].id);

        return insertResult.rows[0].id as string;
    }
}