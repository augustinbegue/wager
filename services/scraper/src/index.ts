import dotenv from 'dotenv';

// Load dotenv before importing anything else
dotenv.config();

import { update } from "./events/update";
import { readFileSync } from 'fs';
import { ScraperConfig } from '../../types/configs';

let config = JSON.parse(readFileSync(__dirname + '/config.json', 'utf8')) as ScraperConfig;

// Scrape every 12h
update(config);
setInterval(() => {
    let config = JSON.parse(readFileSync(__dirname + '/config.json', 'utf8')) as ScraperConfig;
    update(config);
}, 1000 * 60 * 60 * 12);