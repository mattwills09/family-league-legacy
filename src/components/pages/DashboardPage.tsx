import {
  ChartNoAxesColumnIncreasing,
  Crown,
  Medal,
  ShieldCheck,
  Trophy,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

import { DetailCard } from '../DetailCard';
import { teams as sampleTeams, seasonContext as sampleSeasonContext } from '../data/mockLeagueData';
import { useLeagueDashboard } from '../../hooks/useLeagueDashboard';
import { defaultDirection, sortStandings } from '../data/standingsSort';
import type { StandingsColumn, StandingsSort } from '../data/standingsSort';

const standingsColumns: { key: StandingsColumn; label: string; title?: string }[] = [
  { key: 'rank', label: 'Rank' },
  { key: 'name', label: 'Team' },
  { key: 'owner', label: 'Owner' },
  { key: 'record', label: 'Record', title: 'Wins-losses-ties; sorted by win percentage' },
  { key: 'pointsFor', label: 'PF', title: 'Points for' },
  { key: 'pointsAgainst', label: 'PA', title: 'Points against' },
  { key: 'pointDifferential', label: 'Diff', title: 'Point differential' },
]

export function DashboardPage() {
  const { state, retry, selectSeason, seasonOptions, selectedSeason } = useLeagueDashboard()
  const [showSample, setShowSample] = useState(false)
  const [tableSort, setTableSort] = useState<StandingsSort>({ column: 'rank', direction: 'ascending' })
  const seasonPicker = seasonOptions && <div className="season-picker">
    <label htmlFor="league-season">Season</label>
    <select id="league-season" value={selectedSeason ?? seasonOptions.current} onChange={(event) => {
      setShowSample(false)
      setTableSort({ column: 'rank', direction: 'ascending' })
      selectSeason(Number(event.target.value))
    }}>
      {seasonOptions.available.map((season) => <option key={season} value={season}>{season}{season === seasonOptions.current ? ' · Current' : ''}</option>)}
    </select>
  </div>
  if (state.status !== 'ready' && !showSample) {
    return (
      <main className="dashboard">
        {seasonPicker}
        <section className="league-status" aria-live="polite" aria-busy={state.status === 'loading'}>
          <span className="eyebrow">{selectedSeason ?? 'ESPN'} Season</span>
          <h2>{state.status === 'loading' ? 'Loading league standings…' : 'League standings unavailable'}</h2>
          {state.status === 'error' && <>
            <p>{state.message}</p>
            <div className="league-actions">
              <button type="button" onClick={retry}>Try again</button>
              <button type="button" onClick={() => setShowSample(true)}>View sample dashboard</button>
            </div>
          </>}
        </section>
      </main>
    )
  }
  const liveData = state.status === 'ready' && !showSample ? state.data : null
  const teams = liveData?.teams ?? sampleTeams
  const seasonContext = liveData?.seasonContext ?? sampleSeasonContext
  const officialOrder = liveData?.standingsTeamIds
  const sortedTeams = [...teams].sort((a, b) => {
    if (officialOrder) return officialOrder.indexOf(a.id) - officialOrder.indexOf(b.id)
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
  const ranks = new Map(sortedTeams.map((team, index) => [team.id, index + 1]))
  const tableTeams = sortStandings(teams, ranks, tableSort)

  function toTitleCase(str: string): string {
    const titleCase = str
      .toLowerCase()
      .split(' ')
      .map((word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    return titleCase;
  }

  function changeSort(column: StandingsColumn) {
    setTableSort((current) => ({
      column,
      direction: current.column === column
        ? current.direction === 'ascending' ? 'descending' : 'ascending'
        : defaultDirection(column),
    }))
  }

  const championshipLeader = [...teams].filter((team) => team.championshipsWon !== null && team.championshipAppearances !== null).sort((a, b) => {
    if (b.championshipsWon !== a.championshipsWon) {
      return (b.championshipsWon ?? 0) - (a.championshipsWon ?? 0)
    }

    return (b.championshipAppearances ?? 0) - (a.championshipAppearances ?? 0)
  })[0]

  return (
    <main className="dashboard">
      {seasonPicker}
      <div className="league-source" role="status">
        {liveData ? `ESPN · ${liveData.season} season · Updated ${new Date(liveData.fetchedAt).toLocaleString()}` : 'Sample dashboard · Illustrative data, not your ESPN league'}
        {!liveData && <button type="button" onClick={() => { setShowSample(false); retry() }}>Reconnect to ESPN</button>}
      </div>

      {/* CURRENT SEASON SUMMARY */}
      <section className="stats-grid current-stats-grid">
        <DetailCard
          label={liveData && liveData.season !== liveData.currentSeason ? 'Regular-Season Leader' : 'Current Leader'}
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
      {liveData?.seasonChampion && <section className="league-status" aria-label={`${liveData.season} championship result`}>
        <span className="eyebrow">{liveData.season} Champion</span>
        <h2>{liveData.seasonChampion.teamName}</h2>
        <p>Defeated {liveData.seasonChampion.runnerUpName} · {liveData.seasonChampion.winningPoints.toFixed(1)}–{liveData.seasonChampion.runnerUpPoints.toFixed(1)}</p>
      </section>}
      <section className="standings-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">{liveData ? `${liveData.season} Season` : 'Sample Season'}</span>
            <h2>{liveData && liveData.season !== liveData.currentSeason ? 'Regular-Season Standings' : 'League Standings'}</h2>
          </div>
        </div>

        <div className="standings-table" role="region" aria-label="League standings, scroll horizontally for all statistics" tabIndex={0}>
          <table className="standings-data" aria-label={`${liveData?.season ?? 'Sample'} season league standings`}>
            <thead>
              <tr>
                {standingsColumns.map((column) => {
                  const active = tableSort.column === column.key
                  const nextDirection = active ? tableSort.direction === 'ascending' ? 'descending' : 'ascending' : defaultDirection(column.key)
                  const SortIcon = active ? tableSort.direction === 'ascending' ? ChevronUp : ChevronDown : ArrowUpDown
                  return <th key={column.key} scope="col" aria-sort={active ? tableSort.direction : undefined}>
                    <button className="standings-sort" type="button" onClick={() => changeSort(column.key)} aria-label={`${column.title ?? column.label}: sort ${nextDirection}`}>
                      {column.title ? <abbr title={column.title}>{column.label}</abbr> : column.label}
                      <SortIcon aria-hidden="true" />
                    </button>
                  </th>
                })}
              </tr>
            </thead>
            <tbody>
              {tableTeams.map((team) => (
                <tr key={team.id} className={team.id === topTeam.id ? 'standings-leader' : undefined}>
                  <td>{ranks.get(team.id)}</td>
                  <td><strong>{toTitleCase(team.name)}</strong></td>
                  <td>{toTitleCase(team.owner)}</td>
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

        {championshipLeader ? <div className="stats-grid legacy-stats-grid">
          <DetailCard
            label="Championship Leader"
            value={championshipLeader.name}
            icon={Crown}
          />

          <DetailCard
            label="League Titles"
            value={championshipLeader.championshipsWon ?? 'Not available'}
            icon={ShieldCheck}
          />

          <DetailCard
            label="Championship Appearances"
            value={championshipLeader.championshipAppearances ?? 'Not available'}
            icon={Medal}
          />
        </div> : <p className="history-note">All-time achievements have not been calculated yet. Verified totals will appear here as historical season coverage expands.</p>}

        <hr className="section-divider" />

        <div className="legacy-grid">
          {teams
            .slice()
            .sort((a, b) => {
              if (b.championshipsWon !== a.championshipsWon) {
                return (b.championshipsWon ?? 0) - (a.championshipsWon ?? 0)
              }

              return (
                (b.championshipAppearances ?? 0) -
                (a.championshipAppearances ?? 0)
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
                    <strong>{team.playoffAppearances ?? 'Not available'}</strong>
                  </div>
                  <div>
                    <span>Championship Appearances</span>
                    <strong>{team.championshipAppearances ?? 'Not available'}</strong>
                  </div>
                  <div>
                    <span>Championships</span>
                    <strong>{team.championshipsWon ?? 'Not available'}</strong>
                  </div>
                </div>
                <details className="team-details">
                  <summary>View team details</summary>
                  <dl className="team-details-grid">
                    <div><dt>{liveData && liveData.season !== liveData.currentSeason ? 'Season Record' : 'Current Record'}</dt><dd>{team.wins}-{team.losses}-{team.ties}</dd></div>
                    <div><dt>Standings Rank</dt><dd>{ranks.get(team.id)}</dd></div>
                    <div><dt>Points For</dt><dd>{team.pointsFor.toFixed(1)}</dd></div>
                    <div><dt>Points Against</dt><dd>{team.pointsAgainst.toFixed(1)}</dd></div>
                    <div><dt>Win Percentage</dt><dd>{team.wins + team.losses + team.ties === 0 ? 'No games played' : `${(((team.wins + team.ties / 2) / (team.wins + team.losses + team.ties)) * 100).toFixed(1)}%`}</dd></div>
                    <div><dt>Championships Won</dt><dd>{team.championshipAppearances === null || team.championshipsWon === null ? 'Not available' : team.championshipAppearances === 0 ? 'No appearances' : `${team.championshipsWon} of ${team.championshipAppearances}`}</dd></div>
                  </dl>
                </details>
              </article>
            ))}
        </div>
      </section>
    </main>
  )
}
