import {
  ChartNoAxesColumnIncreasing,
  Crown,
  Medal,
  ShieldCheck,
  Trophy,
} from 'lucide-react'

import { DetailCard } from '../DetailCard';
import { teams } from '../data/mockLeagueData';

export function DashboardPage() {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins
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
          value={`${topTeam.wins}-${topTeam.losses}`}
          icon={ChartNoAxesColumnIncreasing}
        />
      </section>

      {/* CURRENT STANDINGS */}

      <section className="standings-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Current Season</span>
            <h2>League Standings</h2>
          </div>
        </div>

        <div className="standings-table">
          <div className="standings-row standings-heading">
            <span>Rank</span>
            <span>Team</span>
            <span>Owner</span>
            <span>Record</span>
            <span>PF</span>
            <span>PA</span>
            <span>Diff</span>
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

              <span>{team.pointsAgainst.toFixed(1)}</span>

              <span
                className={
                  team.pointDifferential > 0
                    ? 'positive-differential'
                    : team.pointDifferential < 0
                      ? 'negative-differential'
                      : ''
                }
              >
                {team.pointDifferential > 0 ? '+' : ''}
                {team.pointDifferential.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

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

                  {team.championshipsWon > 0 && (
                    <Trophy className="icon icon-accent" />
                  )}
                </div>

                <div className="legacy-stats">
                  <div>
                    <span>Championships</span>
                    <strong>{team.championshipsWon}</strong>
                  </div>

                  <div>
                    <span>Championship Appearances</span>
                    <strong>{team.championshipAppearances}</strong>
                  </div>

                  <div>
                    <span>Playoff Appearances</span>
                    <strong>{team.playoffAppearances}</strong>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  )
}