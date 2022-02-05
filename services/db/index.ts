import { Pool } from 'pg';
import { insertOrUpdateCompetition } from './insert-or-update-competition';
import { insertOrUpdateMatch } from './insert-or-update-match';
import { insertOrUpdateTeam } from './insert-or-update-team';

export const pool = new Pool();

export {
    insertOrUpdateMatch,
    insertOrUpdateCompetition,
    insertOrUpdateTeam
}