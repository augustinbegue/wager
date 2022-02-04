import { Match, status } from '../../../types';
import { pool } from "./index";

export async function insertOrUpdateMatch(match: Match): Promise<boolean> {
    try {
        let query = {
            text: `SELECT "id", "date", "lastUpdated", "status" FROM matches WHERE "id" = $1`,
            values: [match.id]
        }

        let checkResult = await pool.query(query);

        if (checkResult.rowCount != 0) {
            let status = checkResult.rows[0].status as status;
            // Match already exists, we check if it needs to be updated
            let lastUpdated = new Date(checkResult.rows[0].lastUpdated);
            let update = lastUpdated.getTime() != new Date(match.lastUpdated).getTime();

            // Update the status if the match has begun
            if (new Date(match.utcDate).getTime() < new Date().getTime() && status === 'SCHEDULED') {
                update = true;

                match.status = "IN_PLAY";
                match.score.fullTime.homeTeam = match.score.fullTime.homeTeam || 0;
                match.score.fullTime.awayTeam = match.score.fullTime.awayTeam || 0;
            }

            if (update) {
                let updateQuery = {
                    text: `UPDATE matches SET
                        "date" = $1,
                        "lastUpdated" = $2,
                        "status" = $3,
                        "data" = $4
                        WHERE "id" = $5`,

                    values: [
                        new Date(match.utcDate),
                        new Date(match.lastUpdated),
                        match.status,
                        match,
                        match.id
                    ]
                }

                await pool.query(updateQuery);

                console.log("Updated match: " + match.id);

                return true;
            } else {
                return false;
            }
        } else {
            let insertQuery = {
                text: `INSERT INTO matches("id", "competitionId", "seasonId", "date", "lastUpdated", "homeTeamId", "awayTeamId", "status", "data") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,

                values: [
                    match.id,
                    match.competition.id,
                    match.season.id,
                    new Date(match.utcDate),
                    new Date(match.lastUpdated),
                    match.homeTeam.id,
                    match.awayTeam.id,
                    match.status,
                    match
                ]
            }

            await pool.query(insertQuery);

            console.log("Inserted match: " + match.id);

            return true;
        }
    } catch (error) {
        console.error("Error when inserting match: " + match.id);
        console.error(error);
        return false;
    }
}