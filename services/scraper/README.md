### on start:

-   Set a timeout to `update` each 12h

### on update:

-   scrape results and fixtures
-   **if match is in the next 12h** set a timeout to `match-start`

### on match-start:

-   increment live matches counter
-   **if counter >= 1** set an interval to `live-scrape` for match's competition every 30s

### on live-scrap:

-   **if match is ended** `match-end`

### on match-end:

-   scrape results of competition
