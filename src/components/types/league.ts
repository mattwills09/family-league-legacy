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
    playoffAppearances: number | null;
    championshipAppearances: number | null;
    championshipsWon: number | null;
}

export interface LeagueDashboardData {
    teams: FantasyTeam[];
    seasonContext: LeagueSeasonContext;
    season: number;
    source: 'espn';
    fetchedAt: string;
    /** ESPN playoff seeds when complete; otherwise the dashboard uses its existing sort. */
    standingsTeamIds: number[] | null;
    currentSeason: number;
    availableSeasons: number[];
    seasonChampion: SeasonChampion | null;
    playoffBracket: PlayoffBracketData | null;
}

export interface PlayoffMatchup {
    home: { teamId: number; points: number };
    away: { teamId: number; points: number };
    winnerTeamId: number;
}

export interface PlayoffBracketData {
    rounds: { period: number; matchups: PlayoffMatchup[] }[];
    thirdPlace: PlayoffMatchup | null;
    hasUnavailableMatchups: boolean;
}

export interface SeasonChampion {
    teamId: number;
    teamName: string;
    runnerUpName: string;
    runnerUpTeamId: number;
    thirdPlaceTeamId: number | null;
    winningPoints: number;
    runnerUpPoints: number;
}

export interface ChampionsRollData {
    finals: Array<Pick<SeasonChampion, 'teamName' | 'runnerUpName' | 'winningPoints' | 'runnerUpPoints'> & { season: number }>;
    unavailableSeasons: number[];
}

export interface LeagueSeasonContext {
    /** Null until the previous season's champion is supplied. */
    previousSeasonChampionTeamId: FantasyTeam['id'] | null;
}
