export interface ScraperConfig {
    // string containing the paths to scrape
    leagues: string[];
    // string containing the base urls
    staticPaths: {
        results: string;
        fixtures: string;
        standings: string;
    };
    // debug mode
    debug: boolean;
}