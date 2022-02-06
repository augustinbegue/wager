import { pool } from ".";
import { Team } from "../types/data";

export async function getTeam(options: { id?: string, name?: string }) {
    let column = "";

    if (options.id) {
        column = "id";
    } else if (options.name) {
        column = "name";
    }

    let query = {
        text: `SELECT "id", "name", "crestUrl", "lastUpdated", "data" FROM teams WHERE ${column} = $1`,
        values: [
            options.name || parseInt(options.id as string)
        ]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        return null;
    } else {
        return result.rows[0];
    }
}

export async function getTeamsByCompetition(competitionId: string) {
    let competitionQuery = {
        text: `SELECT "teams" FROM competitions WHERE "id" = cast($1 as bigint)`,
        values: [
            competitionId
        ]
    }

    let competitionResult = await pool.query(competitionQuery);

    let teams: Team[] = [];
    if (competitionResult.rowCount === 0) {
        return teams;
    } else {
        let teamIds = competitionResult.rows[0].teams;

        for (let i = 0; i < teamIds.length; i++) {
            const teamId = teamIds[i];

            let res = await getTeam({ id: teamId });

            let l = teams.push(res?.data);
            teams[l - 1].id = res.id;
        }

        return teams;
    }
}

export async function getTeamCrestUrl(teamId: number) {
    let query = {
        text: `SELECT "crestUrl" FROM teams WHERE "id" = cast($1 as bigint)`,
        values: [
            teamId
        ]
    }

    let result = await pool.query(query);

    if (result.rowCount === 0) {
        return null;
    } else {
        return result.rows[0].crestUrl;
    }
}