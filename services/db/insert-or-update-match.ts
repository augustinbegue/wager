import { Match, status } from '../types/data';
import { pool } from ".";

export async function insertOrUpdateMatch(match: Match): Promise<string> {
    try {
        let query: any;
        let selected = `"id", "date", "lastUpdated", "status", "matchday"`

        if (match.id != "-1") {
            query = {
                text: `SELECT ${selected} FROM matches WHERE "id" = $1`,
                values: [match.id]
            }
        } else {
            query = {
                text: `SELECT ${selected} FROM matches
                WHERE "matchday" = $1
                AND "homeTeamId" = $2
                AND "awayTeamId" = $3`,
                values: [match.matchday, match.homeTeam.id, match.awayTeam.id]
            }
        }

        let checkResult = await pool.query(query);

        if (checkResult.rowCount != 0) {
            // Ensure the id is not -1
            match.id = checkResult.rows[0].id;

            let storedStatus = checkResult.rows[0].status as status;
            // Match already exists, we check if it needs to be updated
            let storedLastUpdated = new Date(checkResult.rows[0].lastUpdated);
            let update = storedLastUpdated.getTime() != new Date(match.lastUpdated).getTime();

            // Update the status if the match has begun
            if (new Date(match.utcDate).getTime() < new Date().getTime() && storedStatus === 'SCHEDULED') {
                update = true;

                match.status = "IN_PLAY";
                match.score.fullTime.homeTeam = match.score.fullTime.homeTeam || 0;
                match.score.fullTime.awayTeam = match.score.fullTime.awayTeam || 0;
            }

            // Override wrong values if the match is live
            if (match.status === 'IN_PLAY') {
                match.matchday = checkResult.rows[0].matchday;
            }

            // Notify that the match is now live
            if (storedStatus === 'SCHEDULED' && (match.status === 'IN_PLAY' || match.status === 'PAUSED')) {
                console.log(`Live match: ${match.id} (${match.homeTeam.name} vs ${match.awayTeam.name}, ${match.utcDate})`)
            }

            if (storedStatus != 'FINISHED' && match.status === 'FINISHED') {
                console.log(`Finished Match: ${match.id} (${match.homeTeam.name} vs ${match.awayTeam.name}, ${match.utcDate})`)
            }

            if (update) {
                let updateQuery = {
                    text: `UPDATE matches SET
                        "date" = $1,
                        "lastUpdated" = $2,
                        "status" = $3,
                        "matchday" = $4,
                        "data" = $5
                        WHERE "id" = $6`,

                    values: [
                        new Date(match.utcDate),
                        new Date(match.lastUpdated),
                        match.status,
                        match.matchday,
                        match,
                        match.id
                    ]
                }

                await pool.query(updateQuery);

                return match.id;
            } else {
                return match.id;
            }
        } else {
            let insertQuery = {
                text: `INSERT INTO matches("competitionId", "seasonId", "date", "matchday", "lastUpdated", "homeTeamId", "awayTeamId", "status", "data") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING "id"`,

                values: [
                    match.competition.id,
                    match.season.id,
                    new Date(match.utcDate),
                    match.matchday,
                    new Date(match.lastUpdated),
                    match.homeTeam.id,
                    match.awayTeam.id,
                    match.status,
                    match
                ]
            }

            let insertResult = await pool.query(insertQuery);

            console.log("Inserted match: " + insertResult.rows[0].id);

            return insertResult.rows[0].id;
        }
    } catch (error) {
        console.error(`Error inserting or updating match ${match.id} (${match.homeTeam.name} vs ${match.awayTeam.name}, ${match.utcDate})`);
        console.error(error);
        return match.id;
    }
}