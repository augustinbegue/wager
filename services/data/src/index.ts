import dotenv from 'dotenv';
import { insertOrUpdateMatch } from './db';

// Load dotenv before importing anything else
dotenv.config();

import { getMatchesOfTheWeek } from './requests';

(async function () {
    const matchesResponse = await getMatchesOfTheWeek();

    let matches = matchesResponse.matches;

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        console.log(`Checking ${match.id}: ${match.homeTeam.name} - ${match.awayTeam.name} (${match.utcDate})`);
    }

    insertOrUpdateMatch(matches[0]);
})();