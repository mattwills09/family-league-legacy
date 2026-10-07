import { DetailCard } from '../DetailCard';
import { teams } from '../data/mockLeagueData'

export function DashboardPage() {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins
    }

    return b.pointsFor - a.pointsFor
  })

  const topTeam = sortedTeams[0]

  const highestScoringTeam = [...teams].sort(
    (a, b) => b.pointsFor - a.pointsFor
  )[0]

  return (
    <main className="dashboard">
      <section className="stats-grid">
        <DetailCard label="Teams" value={teams.length} />
        <DetailCard
          label="Current Leader"
          value={topTeam.name}
        />
        <DetailCard
          label="Most Points"
          value={`${highestScoringTeam.pointsFor.toFixed(1)}`}
        />
      </section>

      <section className="standings-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">2026 Season</span>
            <h2>League Standings</h2>
          </div>
        </div>

        <div className="standings-table">
          <div className="standings-row standings-heading">
            <span>Rank</span>
            <span>Team</span>
            <span>Owner</span>
            <span>Record</span>
            <span>Points</span>
          </div>

          {sortedTeams.map((team, index) => (
            <div className="standings-row" key={team.id}>
              <span>{index + 1}</span>
              <strong>{team.name}</strong>
              <span>{team.owner}</span>
              <span>
                {team.wins}-{team.losses}
              </span>
              <span>{team.pointsFor.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}