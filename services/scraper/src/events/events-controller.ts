import { Match } from '@prisma/client';
import { ScraperConfig } from "../../../types/configs";
import { scrapeData, scrapeLiveData } from "../controllers/scrapers";
import { computeStandings } from '../controllers/standings';
import { EventEmitter } from 'events';
import { prisma } from '../../../prisma';
import { parseScrapedMatches } from '../controllers/parsers';
import { upsertMatch } from '../controllers/db';
import { ScrapedMatch } from '../../../types/scraper';
import { computeBets } from '../controllers/bets';

interface DataEvents {
    'match-start': (matchId: number) => void;
    'match-end': (matchId: number) => void;
    'match-update': (matchId: number, type: 'home-team-score' | 'away-team-score', value: number) => void;
}

declare interface DataEventEmitter {
    on<U extends keyof DataEvents>(
        event: U,
        listener: DataEvents[U]
    ): this;

    emit<U extends keyof DataEvents>(
        event: U,
        ...args: Parameters<DataEvents[U]>
    ): boolean;
}

class DataEventEmitter extends EventEmitter {
    constructor() {
        super();
    }
}

export class EventsController {
    emitter: DataEventEmitter;
    config: ScraperConfig;

    liveCompetitions: number[];
    liveMatches: { matchId: number, code: string }[];
    startedMatches: { matchId: number, code: string }[];

    constructor(config: ScraperConfig) {
        this.emitter = new EventEmitter();
        this.config = config;

        this.liveCompetitions = [];
        this.liveMatches = [];
        this.startedMatches = [];

        this.update();
    }

    async update() {
        // Scrape up to date data
        let matches: Match[] = await scrapeData(this.config);

        // Get all matches in the next 12 hours
        let now = new Date().getTime();
        let cutoff = now + (1000 * 60 * 60 * 12);

        let next12HMatches = matches.filter((match) => {
            let date = match.date.getTime();

            return match.status === 'SCHEDULED' && date < cutoff || match.status === 'IN_PLAY' || match.status === 'PAUSED';
        });

        // Start timers for each match in the next 12 hours
        console.log("Found " + next12HMatches.length + " matches in the next 12 hours:");
        next12HMatches.forEach(match => {
            console.log(`${match.homeTeamId} vs ${match.awayTeamId} - ${match.date.toLocaleString()}`);
            setTimeout(() => {
                this.matchStart(match);
            }, match.date.getTime() - now);
        });

        // Update the standings
        computeStandings();

        // Compute uncomputed bets
        computeBets();

        // Update again in 12 hours
        setTimeout(() => {
            this.update();
        }, 1000 * 60 * 60 * 12);
    }

    async matchStart(match: Match) {
        let competition = await prisma.competition.findUnique({ where: { id: match.competitionId } });
        if (!competition) {
            throw new Error('Competition with id ' + match.competitionId + ' not found');
        }

        // Emit match-start event
        this.emitter.emit('match-start', match.id);

        this.liveMatches.push({
            matchId: match.id,
            code: competition.code
        });

        let prevLen = this.liveCompetitions.length;
        if (this.liveCompetitions.indexOf(competition.id) === -1) {
            this.liveCompetitions.push(competition.id);

            if (prevLen === 0 && this.liveCompetitions.length === 1) {
                // Start live data scraper only if this is the first competition added
                scrapeLiveData(this);
            }
        }
    }

    async matchEnd(obj: { matchId: number, code: string }, scrapedMatch: ScrapedMatch) {
        console.log('Match ended: ' + obj.matchId);

        // Retreive the required data
        let competition = await prisma.competition.findUnique({ where: { code: obj.code }, include: { currentSeason: true, teams: true } });
        if (!competition) {
            console.error('Competition with code ' + obj.code + ' not found.');
            return;
        }
        let teams = competition.teams;
        if (teams.length === 0) {
            console.error('No teams found for competition with id ' + competition.id + '.');
            return;
        }

        // Update match
        let match = parseScrapedMatches([scrapedMatch], competition, teams, 'FINISHED')[0];
        match = await upsertMatch(match, competition.currentSeason.id);

        // Emit match-end event
        this.emitter.emit('match-end', match.id);

        // Remove from live matches
        this.liveMatches.splice(this.liveMatches.indexOf(obj), 1);
        this.startedMatches.splice(this.liveMatches.indexOf(obj), 1);

        // Stop live data scraper if this is the last competition
        if (this.liveMatches.filter(o => o.code === obj.code).length === 0) {
            this.liveCompetitions.splice(this.liveCompetitions.indexOf(competition.id), 1);
        }
    }
}