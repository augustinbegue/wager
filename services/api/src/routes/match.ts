import express from 'express';
import { getCompetition, getMatches, getTeam } from '../../../db';
import { DBMatch } from '../../../types/data';
import { ApiMatchCondensed } from '../../../types/api';

const router = express.Router();

/**
 * Returns a list of the matches going from the previous day to 6 days after the current date.
 */
router.get('/week', async (req, res) => {
    // Controller
    let startDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    let endDate = new Date(new Date().getTime() + (6 * 24 * 60 * 60 * 1000));

    let matches = await getMatches({
        startDate: startDate,
        endDate: endDate
    })

    let promises = matches.map(async match => {
        return getApiMatchCondensed(match);
    });

    let apiMatches = await Promise.all(promises);

    res.json(apiMatches);
});

export const matchRouter = router;

// Service
export async function getApiMatchCondensed(match: DBMatch): Promise<ApiMatchCondensed> {
    let competition = await getCompetition({ id: match.competitionId });
    let homeTeam = await getTeam({ id: match.homeTeamId });
    let awayTeam = await getTeam({ id: match.awayTeamId });

    if (!competition) {
        throw new Error(`Could not find competition with id ${match.competitionId}`);
    }

    return {
        id: match.id,
        competition: {
            id: competition.id,
            name: competition.name,
            emblemUrl: competition.emblemUrl
        },
        season: {
            id: match.seasonId
        },
        matchday: match.matchday,
        date: match.date,
        homeTeam: {
            id: homeTeam.id,
            name: homeTeam.name,
            crestUrl: homeTeam.crestUrl
        },
        awayTeam: {
            id: awayTeam.id,
            name: awayTeam.name,
            crestUrl: awayTeam.crestUrl
        },
        status: match.status,
        score: match.data.score
    }
}