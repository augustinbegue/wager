import { Match } from '@prisma/client';
import { ScraperConfig } from "../../../types/configs";
import { scrapeData } from "../controllers/scrapers";
import { scrapedMatchStart } from './scraping';
import { computeStandings } from '../controllers/standings';

export async function update(config: ScraperConfig) {
    console.log('Update started...');

    // Scrape up to date data
    let matches: Match[] = await scrapeData(config);

    // Get all matches in the next 12 hours
    let now = new Date().getTime();
    let cutoff = now + (1000 * 60 * 60 * 12);

    let next12HMatches = matches.filter((match) => {
        let date = match.date.getTime();

        return match.status === 'SCHEDULED' && date < cutoff || match.status === 'IN_PLAY';
    });

    // Start timers for each match in the next 12 hours
    console.log("Found " + next12HMatches.length + " matches in the next 12 hours:");
    next12HMatches.forEach(match => {
        console.log(`${match.homeTeamId} vs ${match.awayTeamId} - ${match.date.toLocaleString()}`);
        setTimeout(scrapedMatchStart, match.date.getTime() - now, match);
    });

    // Update the standings
    computeStandings();
}