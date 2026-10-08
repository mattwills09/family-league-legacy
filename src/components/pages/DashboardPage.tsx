import {
  ChartNoAxesColumnIncreasing,
  Crown,
  Medal,
  ShieldCheck,
  Trophy,
} from 'lucide-react'

import { DetailCard } from '../DetailCard';
import { teams, seasonContext } from '../data/mockLeagueData';

export function DashboardPage() {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins
    }

    if (b.ties !== a.ties) {
      return b.ties - a.ties
    }

    if (b.pointDifferential !== a.pointDifferential) {
      return b.pointDifferential - a.pointDifferential
    }

    return b.pointsFor - a.pointsFor
  })

  const topTeam = sortedTeams[0]

  const championshipLeader = [...teams].sort((a, b) => {
    if (b.championshipsWon !== a.championshipsWon) {
      return b.championshipsWon - a.championshipsWon
    }

    return b.championshipAppearances - a.championshipAppearances
  })[0]

  return (
    <main className="dashboard">
      {/* CURRENT SEASON SUMMARY */}

      <section className="stats-grid current-stats-grid">
        <DetailCard
          label="Current Leader"
          value={topTeam.name}
          icon={Trophy}
        />

        <DetailCard
          label="Record"
          value={`${topTeam.wins}-${topTeam.losses}-${topTeam.ties}`}
          icon={ChartNoAxesColumnIncreasing}
        />
      </section>

      <hr className="section-divider" />

      {/* CURRENT STANDINGS */}

      <section className="standings-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Current Season</span>
            <h2>League Standings</h2>
          </div>
        </div>

        <div className="standings-table" role="region" aria-label="League standings, scroll horizontally for all statistics" tabIndex={0}>
          <table className="standings-data" aria-label="Current season league standings">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Team</th>
                <th scope="col">Owner</th>
                <th scope="col"><abbr title="Wins-losses-ties">Record</abbr></th>
                <th scope="col"><abbr title="Points for">PF</abbr></th>
                <th scope="col"><abbr title="Points against">PA</abbr></th>
                <th scope="col"><abbr title="Point differential">Diff</abbr></th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr key={team.id}>
                  <td>{index + 1}</td>
                  <td><strong>{team.name}</strong></td>
                  <td>{team.owner}</td>
                  <td>{team.wins}-{team.losses}-{team.ties}</td>
                  <td>{team.pointsFor.toFixed(1)}</td>
                  <td>{team.pointsAgainst.toFixed(1)}</td>
                  <td className={team.pointDifferential > 0 ? 'positive-differential' : team.pointDifferential < 0 ? 'negative-differential' : ''}>
                    {team.pointDifferential > 0 ? '+' : ''}{team.pointDifferential.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ALL-TIME HIGHLIGHTS */}

      <section className="standings-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">League Legacy</span>
            <h2>All-Time Highlights</h2>
          </div>
        </div>

        <div className="stats-grid legacy-stats-grid">
          <DetailCard
            label="Championship Leader"
            value={championshipLeader.name}
            icon={Crown}
          />

          <DetailCard
            label="League Titles"
            value={championshipLeader.championshipsWon}
            icon={ShieldCheck}
          />

          <DetailCard
            label="Championship Appearances"
            value={championshipLeader.championshipAppearances}
            icon={Medal}
          />
        </div>

        <hr className="section-divider" />

        <div className="legacy-grid">
          {teams
            .slice()
            .sort((a, b) => {
              if (b.championshipsWon !== a.championshipsWon) {
                return b.championshipsWon - a.championshipsWon
              }

              return (
                b.championshipAppearances -
                a.championshipAppearances
              )
            })
            .map((team) => (
              <article className="legacy-card" key={team.id}>
                <div className="legacy-card-header">
                  <div>
                    <span className="eyebrow">{team.owner}</span>
                    <h3>{team.name}</h3>
                  </div>

                  {team.id === seasonContext.previousSeasonChampionTeamId && (
                    <span role="img" aria-label="Previous season champion" title="Previous season champion">
                      <Trophy className="icon icon-accent" aria-hidden="true" />
                    </span>
                  )}
                </div>

                <div className="legacy-stats">
                  <div>
                    <span>Playoff Appearances</span>
                    <strong>{team.playoffAppearances}</strong>
                  </div>
                  <div>
                    <span>Championship Appearances</span>
                    <strong>{team.championshipAppearances}</strong>
                  </div>
                  <div>
                    <span>Championships</span>
                    <strong>{team.championshipsWon}</strong>
                  </div>
                </div>
                <details className="team-details">
                  <summary>View team details</summary>
                  <dl className="team-details-grid">
                    <div><dt>Current Record</dt><dd>{team.wins}-{team.losses}-{team.ties}</dd></div>
                    <div><dt>Standings Rank</dt><dd>{sortedTeams.findIndex((entry) => entry.id === team.id) + 1}</dd></div>
                    <div><dt>Points For</dt><dd>{team.pointsFor.toFixed(1)}</dd></div>
                    <div><dt>Points Against</dt><dd>{team.pointsAgainst.toFixed(1)}</dd></div>
                    <div><dt>Win Percentage</dt><dd>{team.wins + team.losses + team.ties === 0 ? 'No games played' : `${(((team.wins + team.ties / 2) / (team.wins + team.losses + team.ties)) * 100).toFixed(1)}%`}</dd></div>
                    <div><dt>Championships Won</dt><dd>{team.championshipAppearances === 0 ? 'No appearances' : `${team.championshipsWon} of ${team.championshipAppearances}`}</dd></div>
                  </dl>
                </details>
              </article>
            ))}
        </div>
      </section>
    </main>
  )
}
