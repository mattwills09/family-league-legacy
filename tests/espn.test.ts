import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { fetchEspnLeague, normalizeEspnLeague, readSeasonChampion } from '../server/espn.ts'
import { handleStandings } from '../server/standings-handler.ts'

const fixture = {
  id: 684618, seasonId: 2026,
  members: [{ id: 'owner-1', firstName: 'Example', lastName: 'Owner', email: 'private@example.test' }],
  teams: [
    { id: 7, name: 'Example Team', owners: ['owner-1'], playoffSeed: 2, record: { overall: { wins: 2, losses: 1, ties: 1, pointsFor: 401.25, pointsAgainst: 390.1 } } },
    { id: 12, location: 'Old', nickname: 'Name', owners: ['missing'], playoffSeed: 1, record: { overall: { wins: 3, losses: 1, ties: 0, pointsFor: 420, pointsAgainst: 400 } } },
  ],
}
const env = { ESPN_LEAGUE_ID: '684618', ESPN_SEASON: '2026', ESPN_S2: 'test-only-s2', ESPN_SWID: '{test-only-swid}' }

const historical = {
  ...structuredClone(fixture), seasonId: 2025, scoringPeriodId: 19,
  status: { finalScoringPeriod: 17 },
  settings: { scheduleSettings: { matchupPeriods: { '15': [15], '16': [16], '17': [17] } } },
  schedule: [
    { matchupPeriodId: 16, playoffTierType: 'WINNERS_BRACKET', winner: 'AWAY', home: { teamId: 12, totalPoints: 150 }, away: { teamId: 7, totalPoints: 160 } },
    { matchupPeriodId: 17, playoffTierType: 'WINNERS_BRACKET', winner: 'HOME', home: { teamId: 7, totalPoints: 94.2 }, away: { teamId: 12, totalPoints: 77.3 } },
    { matchupPeriodId: 17, playoffTierType: 'WINNERS_CONSOLATION_LADDER', winner: 'HOME', home: { teamId: 12, totalPoints: 200 }, away: { teamId: 7, totalPoints: 100 } },
  ],
}

test('champion comes from completed winners-bracket final, not regular-season seed or consolation', () => {
  assert.deepEqual(readSeasonChampion(historical), { teamId: 7, teamName: 'Example Team', runnerUpName: 'Old Name', runnerUpTeamId: 12, thirdPlaceTeamId: null, winningPoints: 94.2, runnerUpPoints: 77.3 })
  assert.equal(readSeasonChampion({ ...historical, scoringPeriodId: 17 }), null)
  assert.equal(readSeasonChampion({ ...historical, schedule: [] }), null)
  assert.equal(readSeasonChampion({ ...historical, schedule: [{ ...historical.schedule[1], home: null }] }), null)
  assert.equal(readSeasonChampion({ ...historical, schedule: [...historical.schedule, historical.schedule[1]] }), null)
  assert.equal(readSeasonChampion({ ...historical, schedule: [{ ...historical.schedule[1], winner: 'UNDECIDED' }] }), null)
  const tiedFinal = { ...historical.schedule[1], away: { teamId: 12, totalPoints: 94.2 } }
  assert.equal(readSeasonChampion({ ...historical, schedule: [tiedFinal] })?.teamId, 7)
})

test('season selection and prior champion keep history out of lifetime totals', async () => {
  const fetcher: typeof fetch = async (input) => Response.json(String(input).includes('/2025/') ? historical : fixture)
  const current = await fetchEspnLeague(env, fetcher)
  assert.deepEqual(current.availableSeasons, [2026, 2025])
  assert.equal(current.seasonContext.previousSeasonChampionTeamId, 7)
  assert.equal(current.seasonChampion, null)
  const previous = await fetchEspnLeague(env, fetcher, 2025)
  assert.equal(previous.season, 2025)
  assert.equal(previous.currentSeason, 2026)
  assert.equal(previous.seasonChampion?.teamId, 7)
  assert.equal(previous.seasonContext.previousSeasonChampionTeamId, null)
  assert.ok(previous.teams.every((team) => team.championshipsWon === null))
})

test('bronze comes from the semifinal losers placement game, never seeds or another consolation game', () => {
  const podium = {
    ...structuredClone(historical),
    teams: [...historical.teams, { ...historical.teams[0], id: 20 }, { ...historical.teams[1], id: 30 }],
    schedule: [
      { matchupPeriodId: 16, playoffTierType: 'WINNERS_BRACKET', winner: 'HOME', home: { teamId: 7, totalPoints: 100 }, away: { teamId: 20, totalPoints: 90 } },
      { matchupPeriodId: 16, playoffTierType: 'WINNERS_BRACKET', winner: 'AWAY', home: { teamId: 30, totalPoints: 80 }, away: { teamId: 12, totalPoints: 100 } },
      historical.schedule[1],
      historical.schedule[2],
      { matchupPeriodId: 17, playoffTierType: 'WINNERS_CONSOLATION_LADDER', winner: 'AWAY', home: { teamId: 20, totalPoints: 90 }, away: { teamId: 30, totalPoints: 95 } },
    ],
  }
  assert.equal(readSeasonChampion(podium)?.runnerUpTeamId, 12)
  assert.equal(readSeasonChampion(podium)?.thirdPlaceTeamId, 30)
  const missing = { ...podium, schedule: podium.schedule.slice(0, -1) }
  assert.equal(readSeasonChampion(missing)?.thirdPlaceTeamId, null)
  assert.equal(readSeasonChampion(missing)?.teamId, 7)
  assert.equal(readSeasonChampion({ ...podium, schedule: [...podium.schedule, podium.schedule[4]] })?.thirdPlaceTeamId, null)
  const undecided = structuredClone(podium)
  undecided.schedule[4].winner = 'UNDECIDED'
  assert.equal(readSeasonChampion(undecided)?.thirdPlaceTeamId, null)
  const tied = structuredClone(podium)
  tied.schedule[4].away.totalPoints = 90
  assert.equal(readSeasonChampion(tied)?.thirdPlaceTeamId, 30)
})

test('unavailable history and ownership changes suppress the badge without breaking current standings', async () => {
  const missing: typeof fetch = async (input) => String(input).includes('/2025/') ? new Response('', { status: 404 }) : Response.json(fixture)
  assert.equal((await fetchEspnLeague(env, missing)).seasonContext.previousSeasonChampionTeamId, null)
  const changed = structuredClone(historical)
  changed.teams[0].owners = ['new-owner']
  const reassigned: typeof fetch = async (input) => Response.json(String(input).includes('/2025/') ? changed : fixture)
  assert.equal((await fetchEspnLeague(env, reassigned)).seasonContext.previousSeasonChampionTeamId, null)
  await assert.rejects(fetchEspnLeague(env, missing, 2024), /current or previous/)
})

test('maps actual IDs, ties, scores, names, co-owners, seeds; leaves history unknown', () => {
  const data = normalizeEspnLeague(fixture, 684618, 2026)
  assert.deepEqual(data.standingsTeamIds, [12, 7])
  assert.deepEqual(data.teams[0], { id: 7, name: 'Example Team', owner: 'Example Owner', wins: 2, losses: 1, ties: 1, pointsFor: 401.25, pointsAgainst: 390.1, pointDifferential: 11.15, playoffAppearances: null, championshipAppearances: null, championshipsWon: null })
  assert.equal(data.teams[1].name, 'Old Name')
  assert.equal(data.teams[1].owner, 'Owner unavailable')
  assert.equal(data.seasonContext.previousSeasonChampionTeamId, null)
  assert.ok(!JSON.stringify(data).includes('private@example.test'))
})

test('rejects absent records, mismatched seasons, empty or duplicate teams rather than fabricating standings', () => {
  for (const payload of [{ ...fixture, seasonId: 2025 }, { ...fixture, teams: [] }, { ...fixture, teams: [{ id: 7 }] }, { ...fixture, teams: [fixture.teams[0], fixture.teams[0]] }]) {
    assert.throws(() => normalizeEspnLeague(payload, 684618, 2026))
  }
  const preseason = structuredClone(fixture)
  preseason.teams[0].record.overall = { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 }
  preseason.teams[0].playoffSeed = 0
  assert.equal(normalizeEspnLeague(preseason, 684618, 2026).standingsTeamIds, null)
})

test('sends cookies only upstream to fixed ESPN host; normalized response excludes credentials', async () => {
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(new URL(String(url)).hostname, 'lm-api-reads.fantasy.espn.com')
    assert.equal(new Headers(options?.headers).get('Cookie'), 'espn_s2=test-only-s2; SWID={test-only-swid}')
    assert.equal(options?.redirect, 'error')
    return Response.json(fixture)
  }
  const result = await fetchEspnLeague(env, fetcher)
  assert.ok(!JSON.stringify(result).includes('test-only'))
})

test('auth, timeout, invalid JSON, and upstream errors expose only safe messages', async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    await assert.rejects(fetchEspnLeague(env, async () => new Response('test-only-s2', { status })), (error: Error) => !error.message.includes('test-only'))
  }
  await assert.rejects(fetchEspnLeague(env, async () => { throw new Error('test-only-s2') }), /temporarily unavailable/)
  await assert.rejects(fetchEspnLeague(env, async () => new Response('<html>Login</html>')), /incomplete/)
  await assert.rejects(fetchEspnLeague({ ...env, ESPN_S2: 'bad;cookie' }), /credentials/)
  await assert.rejects(fetchEspnLeague({}), /not configured/)
})

test('HTTP boundary rejects POST and never echoes credentials in configuration errors', async () => {
  const server = createServer((req, res) => { void handleStandings(req, res, {}) })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const url = `http://127.0.0.1:${address.port}/api/standings`
    const post = await fetch(url, { method: 'POST' })
    assert.equal(post.status, 405)
    assert.equal(post.headers.get('allow'), 'GET')
    const response = await fetch(url)
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { error: 'League connection is not configured yet.' })
    for (const query of ['?season=hello', '?season=2025&season=2026']) {
      const invalid = await fetch(url + query)
      assert.equal(invalid.status, 400)
    }
  } finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) }
})
