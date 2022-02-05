import { pool } from ".";
import { Competition, DBSeason } from "../types/data";

export async function insertOrUpdateSeason(season: DBSeason) {
    let checkResult: any;

    if (season.id === "-1" && season.competition) {
        let checkQuery = {
            text: `SELECT "id" FROM seasons WHERE "startDate" = $1 AND "endDate" = $2 AND "competition" = $3;`,
            values: [new Date(season.startDate), new Date(season.endDate), season.competition]
        }

        checkResult = await pool.query(checkQuery);
    } else {
        let checkQuery = {
            text: `SELECT "id" FROM seasons WHERE "id" = $1;`,
            values: [season.id]
        }

        checkResult = await pool.query(checkQuery);
    }

    if (checkResult.rowCount === 0) {
        let query = {
            text: `INSERT INTO seasons ("startDate", "endDate", "competition") VALUES ($1, $2, $3) RETURNING "id";`,
            values: [new Date(season.startDate), new Date(season.endDate), season.competition]
        }

        let insertQuery = await pool.query(query);

        return insertQuery.rows[0].id;
    } else {
        // Force correct id
        season.id = checkResult.rows[0].id;

        let query = {
            text: `UPDATE seasons SET "currentMatchday" = $1, "winner" = $2 WHERE "id" = $3 RETURNING "id";`,
            values: [season.currentMatchday, season.winner, season.id]
        }

        await pool.query(query);

        return season.id;
    }
}

export async function updateCurrentMatchday(season: DBSeason) {
    let query = {
        text: `SELECT "matchday" FROM matches WHERE "seasonId" = $1 AND ("status" = 'FINISHED' OR "status" = 'IN_PLAY') ORDER BY "matchday" DESC LIMIT 1;`,
        values: [season.id]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        season.currentMatchday = 1;
    } else {
        season.currentMatchday = result.rows[0].matchday;
    }

    let updateQuery = {
        text: `UPDATE seasons SET "currentMatchday" = $1 WHERE "id" = $2;`,
        values: [season.currentMatchday, season.id]
    }

    await pool.query(updateQuery);

    return season.currentMatchday;
}