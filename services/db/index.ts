import { Pool } from 'pg';
import { insertOrUpdateCompetition } from './insert-or-update-competition';
import { insertOrUpdateMatch } from './insert-or-update-match';
import { insertOrUpdateTeam } from './insert-or-update-team';
import { insertOrUpdateSeason, updateCurrentMatchday } from './insert-or-update-season';
import { getCurrentSeason } from './get-seasons';
import { getCompetition } from './get-competitions';
import { getTeam, getTeamsByCompetition } from './get-teams';
import { getMatch } from './get-match';

export const pool = new Pool();

export {
    insertOrUpdateSeason,
    updateCurrentMatchday,
    insertOrUpdateMatch,
    insertOrUpdateCompetition,
    insertOrUpdateTeam,
    getCurrentSeason,
    getCompetition,
    getTeamsByCompetition,
    getTeam,
    getMatch,
}