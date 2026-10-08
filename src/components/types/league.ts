export interface FantasyTeam {
    id: number;
    name: string;
    owner: string;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number
    pointDifferential: number;
    playoffAppearances: number;
    championshipAppearances: number;
    championshipsWon: number;
}

export interface LeagueSeasonContext {
    /** Null until the previous season's champion is supplied. */
    previousSeasonChampionTeamId: FantasyTeam['id'] | null;
}
