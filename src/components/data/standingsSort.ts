import type { FantasyTeam } from '../types/league.ts'

export type StandingsColumn = 'rank' | 'name' | 'owner' | 'record' | 'pointsFor' | 'pointsAgainst' | 'pointDifferential'
export type SortDirection = 'ascending' | 'descending'
export interface StandingsSort { column: StandingsColumn; direction: SortDirection }

export function defaultDirection(column: StandingsColumn): SortDirection {
  return column === 'rank' || column === 'name' || column === 'owner' ? 'ascending' : 'descending'
}

/** Table order is independent of official rank and the current-leader summary. */
export function sortStandings(teams: FantasyTeam[], ranks: Map<number, number>, sort: StandingsSort): FantasyTeam[] {
  const multiplier = sort.direction === 'ascending' ? 1 : -1
  const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })
  const winPercentage = (team: FantasyTeam) => {
    const games = team.wins + team.losses + team.ties
    return games === 0 ? 0 : (team.wins + team.ties / 2) / games
  }
  return [...teams].sort((a, b) => {
    let comparison: number
    switch (sort.column) {
      case 'rank': comparison = ranks.get(a.id)! - ranks.get(b.id)!; break
      case 'name': case 'owner': comparison = collator.compare(a[sort.column], b[sort.column]); break
      case 'record':
        comparison = winPercentage(a) - winPercentage(b) || a.wins - b.wins || b.losses - a.losses || a.ties - b.ties
        break
      default: comparison = a[sort.column] - b[sort.column]
    }
    return comparison * multiplier || ranks.get(a.id)! - ranks.get(b.id)!
  })
}
