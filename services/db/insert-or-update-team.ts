import { pool } from ".";
import { Team } from "../types/data";

export async function insertOrUpdateTeam(team: Team) {
    let checkResult: any;

    if (team.id === -1) {
        let checkQuery = {
            text: `SELECT "id", "lastUpdated" FROM teams WHERE "name" = $1`,
            values: [team.name]
        }

        checkResult = await pool.query(checkQuery);
    } else {
        let checkQuery = {
            text: `SELECT "id", "lastUpdated" FROM teams WHERE "id" = $1`,
            values: [team.id]
        }

        console.log(checkQuery);

        checkResult = await pool.query(checkQuery);
    }

    let lastUpdated = new Date(team.lastUpdated);

    if (checkResult.rowCount != 0) {
        // Check if the team have to be updated
        let update = new Date(checkResult.rows[0].lastUpdated).getTime() != lastUpdated.getTime();

        if (update) {
            let updateQuery = {
                text: `UPDATE teams SET
                        "crestUrl" = $1,
                        "lastUpdated" = $2,
                        "data" = $3
                        WHERE "id" = $4`,

                values: [
                    team.crestUrl,
                    new Date(team.lastUpdated),
                    team,
                    checkResult.rows[0].id
                ]
            }

            await pool.query(updateQuery);

            console.log("Updated team: " + checkResult.rows[0].id);
        }

        return checkResult.rows[0].id as number;
    } else {
        // Insert the team
        let insertQuery = {
            text: `INSERT INTO teams("name", "crestUrl", "lastUpdated", "data") VALUES ($1, $2, $3, $4) RETURNING "id"`,
            values: [
                team.name,
                team.crestUrl,
                new Date(team.lastUpdated),
                team
            ]
        }

        let insertResult = await pool.query(insertQuery);

        console.log("Inserted team: " + insertResult.rows[0].id);

        return insertResult.rows[0].id as number;
    }
}