import type { FantasyTeam, LeagueSeasonContext } from "../types/league";

export const teams: FantasyTeam[] = [
    {
        id: 1,
        name: "Team Alpha",
        owner: "Owner A",
        wins: 10,
        losses: 6,
        ties: 1,
        pointsFor: 450,
        pointsAgainst: 400,
        pointDifferential: 50,
        playoffAppearances: 3,
        championshipAppearances: 3,
        championshipsWon: 1
    },
    {
        id: 2,
        name: "Team Beta",
        owner: "Owner B",
        wins: 8,
        losses: 8,
        ties: 1,
        pointsFor: 420,
        pointsAgainst: 410,
        pointDifferential: 10,
        playoffAppearances: 2,
        championshipAppearances: 1,
        championshipsWon: 0
    }
]

export const seasonContext: LeagueSeasonContext = {
    previousSeasonChampionTeamId: null,
}
