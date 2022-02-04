import { Pool } from 'pg';
import { Match } from '../../../types';

const pool = new Pool();

export async function insertOrUpdateMatch(match: Match) {
    let query = {
        text: `SELECT "id", "lastUpdated" FROM matches WHERE "id" = $1`,
        values: [match.id]
    }

    let checkResult = await pool.query(query);

    if (checkResult.rowCount != 0) {
        console.log(checkResult.rows[0]);

        // Match already exists, we check if it needs to be updated
        let lastUpdated = new Date(checkResult.rows[0].lastUpdated);

        if (lastUpdated.toUTCString() === new Date(match.lastUpdated).toUTCString()) {
            console.log(`Match ${match.id} is already up to date`);
            return;
        }
    } else {
        let insertQuery = {
            text: `INSERT INTO matches "id", "competitionId", "seasonId", "date", "lastUpdated", "homeTeamId", "awayTeamId", "data" VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,

            values: [
                match.id,
                match.competition.id,
                match.season.id,
                new Date(match.utcDate),
                new Date(match.lastUpdated),
                match.homeTeam.id,
                match.awayTeam.id,
                match
            ]
        }

        await pool.query(insertQuery);

        console.log("Inserted match: " + match.id);
    }
}
