import type { FantasyTeam, PlayoffBracketData, PlayoffMatchup } from './types/league'

function Matchup({ matchup, names }: { matchup: PlayoffMatchup; names: Map<number, string> }) {
  return <ul className="playoff-matchup">
    {[matchup.home, matchup.away].map((team) => {
      const won = team.teamId === matchup.winnerTeamId
      return <li key={team.teamId} className={won ? 'playoff-winner' : undefined}>
        <span>{names.get(team.teamId) ?? `Team ${team.teamId}`}{won && <small>Winner</small>}</span>
        <strong>{team.points.toFixed(1)}</strong>
      </li>
    })}
  </ul>
}

export function PlayoffBracket({ season, bracket, teams }: { season: number; bracket: PlayoffBracketData | null; teams: FantasyTeam[] }) {
  const names = new Map(teams.map((team) => [team.id, team.name]))
  return <section className="standings-section" aria-labelledby="playoff-bracket-title">
    <div className="section-header">
      <div><span className="eyebrow">{season} Postseason</span><h2 id="playoff-bracket-title">Playoff Bracket</h2></div>
    </div>
    {bracket ? <>
      <div className="playoff-rounds">
        {bracket.rounds.map((round, index) => {
          const remaining = bracket.rounds.length - index - 1
          const title = remaining === 0 ? 'Championship' : remaining === 1 && round.matchups.length === 2 ? 'Semifinals' : remaining === 2 && round.matchups.length === 4 ? 'Quarterfinals' : `Round ${index + 1}`
          return <section className="playoff-round" key={round.period} aria-label={title}>
            <h3>{title}</h3>
            <div className="playoff-matchups">
              {round.matchups.map((matchup, gameIndex) => <Matchup key={gameIndex} matchup={matchup} names={names} />)}
              {round.matchups.length === 0 && <p className="history-note">No verified matchups for this round.</p>}
            </div>
          </section>
        })}
      </div>
      {bracket.hasUnavailableMatchups && <p className="history-note">Some playoff matchups couldn’t be verified.</p>}
      {bracket.thirdPlace && <section className="playoff-third-place" aria-label="Third-place game">
        <h3>Third-place game</h3><Matchup matchup={bracket.thirdPlace} names={names} />
      </section>}
    </> : <p className="history-note">A verified playoff bracket is unavailable for this season.</p>}
  </section>
}
