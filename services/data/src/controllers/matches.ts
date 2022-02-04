import { getMatchesOfTheWeek } from '../requests';
import { insertOrUpdateMatch } from '../db';

export async function checkForMatchesOfTheWeek() {
    let matchesResponse = await getMatchesOfTheWeek();

    let errors = 0;
    let updated = 0;

    for (let i = 0; i < matchesResponse.matches.length; i++) {
        const match = matchesResponse.matches[i];
        let done: boolean;

        try {
            done = await insertOrUpdateMatch(match);
            done ? updated++ : null;
        } catch (error) {
            errors++;
        }
    }

    console.log(`${matchesResponse.matches.length} matches checked, ${updated} updated, ${errors} errors.`);
}