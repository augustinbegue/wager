import { Match, PrismaClient } from '@prisma/client';
import { MatchIncludesTeams } from '../types/db';

export const prisma = new PrismaClient();