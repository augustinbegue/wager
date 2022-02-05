export interface ScrapedMatch {
    timeStr?: string;
    elapsedMinutes?: string;
    homeTeamName: string;
    awayTeamName: string;
    homeScoreFullStr: string;
    awayScoreFullStr: string;
    homeScoreHalfStr: string;
    awayScoreHalfStr: string;
    currentMatchday: number;
}

export interface ScrapedTeam {
    name: string;
    crestUrl: string;
}