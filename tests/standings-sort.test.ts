import test from 'node:test'
import assert from 'node:assert/strict'
import type { FantasyTeam } from '../src/components/types/league.ts'
import { sortStandings } from '../src/components/data/standingsSort.ts'
import type { StandingsColumn } from '../src/components/data/standingsSort.ts'

const base = { ties: 0, losses: 0, playoffAppearances: null, championshipAppearances: null, championshipsWon: null }
const teams: FantasyTeam[] = [
  { ...base, id: 3, name: 'Team 10', owner: 'Zoe', wins: 2, losses: 2, pointsFor: 100, pointsAgainst: 120, pointDifferential: -20 },
  { ...base, id: 7, name: 'team 2', owner: 'amy', wins: 2, losses: 1, ties: 1, pointsFor: 200, pointsAgainst: 100, pointDifferential: 100 },
  { ...base, id: 9, name: 'Alpha', owner: 'Ben', wins: 0, pointsFor: 100, pointsAgainst: 150, pointDifferential: -50 },
]
const ranks = new Map([[3, 1], [7, 2], [9, 3]])

test('all columns sort values in both directions, preserving ranks and original data', () => {
  const expected: Record<StandingsColumn, number[]> = {
    rank: [3, 7, 9], name: [9, 7, 3], owner: [7, 9, 3], record: [9, 3, 7],
    pointsFor: [3, 9, 7], pointsAgainst: [7, 3, 9], pointDifferential: [9, 3, 7],
  }
  const before = structuredClone(teams)
  for (const column of Object.keys(expected) as StandingsColumn[]) {
    assert.deepEqual(sortStandings(teams, ranks, { column, direction: 'ascending' }).map((team) => team.id), expected[column])
    const descending = column === 'pointsFor' ? [7, 3, 9] : [...expected[column]].reverse()
    assert.deepEqual(sortStandings(teams, ranks, { column, direction: 'descending' }).map((team) => team.id), descending)
  }
  assert.deepEqual(teams, before)
  assert.equal(ranks.get(3), 1)
})

test('record sorting weights ties and uses numeric win percentage rather than record text', () => {
  const records = [
    { ...teams[0], wins: 10, losses: 6, ties: 1 },
    { ...teams[1], wins: 9, losses: 0, ties: 0 },
    { ...teams[2], wins: 0, losses: 0, ties: 0 },
  ]
  assert.deepEqual(sortStandings(records, ranks, { column: 'record', direction: 'descending' }).map((team) => team.id), [7, 3, 9])
})
