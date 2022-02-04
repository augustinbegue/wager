import { insertOrUpdateCompetition } from "../db";
import { getTierCompetitions } from "../requests";

export async function updateCompetitions() {
    let res = await getTierCompetitions();

    for (let i = 0; i < res.competitions.length; i++) {
        const competition = res.competitions[i];

        insertOrUpdateCompetition(competition);
    }
}