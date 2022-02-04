import dotenv from 'dotenv';

// Load dotenv before importing anything else
dotenv.config();

import { checkForMatchesOfTheWeek, updateCompetitions } from './controllers';

setInterval(async () => {
    await checkForMatchesOfTheWeek();
    await updateCompetitions();
}, 1000 * 30);