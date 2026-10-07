export interface FantasyTeam {
    id: number;
    name: string;
    owner: string;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number
    pointDifferential: number;
    playoffAppearances: number;
    championshipAppearances: number;
    championshipsWon: number;
}