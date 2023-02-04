export interface ScrapedMatch {
    timeStr?: string;
    elapsedMinutes?: string;
    homeTeamName: string;
    awayTeamName: string;
    homeScoreFullStr?: string;
    awayScoreFullStr?: string;
    homeScoreHalfStr?: string;
    awayScoreHalfStr?: string;
    currentMatchday: number;
}

export interface ScrapedTeam {
    name: string;
    crestUrl: string;
}

export interface ScrapedRound {
    team1Name: string;
    team2Name: string;
}

export type ScrapedStage = ScrapedRound[];
