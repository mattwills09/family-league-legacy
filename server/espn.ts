import type { LeagueDashboardData } from '../src/components/types/league.ts'

type JsonObject = Record<string, unknown>

export class LeagueDataError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function object(value: unknown): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new LeagueDataError(502, 'ESPN returned incomplete league data. Try again later.')
  }
  return value as JsonObject
}

function number(value: unknown, integer = false): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
    throw new LeagueDataError(502, 'ESPN returned incomplete league data. Try again later.')
  }
  return value
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Whitelist dashboard fields. Never forward raw ESPN data or member contact details. */
export function normalizeEspnLeague(payload: unknown, leagueId: number, season: number): LeagueDashboardData {
  const league = object(payload)
  if (league.id !== leagueId || league.seasonId !== season || !Array.isArray(league.teams) || league.teams.length === 0) {
    throw new LeagueDataError(502, 'ESPN returned incomplete league data. Try again later.')
  }
  const members = new Map<string, string>()
  if (Array.isArray(league.members)) {
    for (const entry of league.members) {
      const member = object(entry)
      const name = [text(member.firstName), text(member.lastName)].filter(Boolean).join(' ') || text(member.displayName)
      if (typeof member.id === 'string' && name) members.set(member.id, name)
    }
  }
  const seeds = new Map<number, number>()
  const teams = league.teams.map((entry) => {
    const team = object(entry)
    const id = number(team.id, true)
    const record = object(object(team.record).overall)
    const pointsFor = number(record.pointsFor)
    const pointsAgainst = number(record.pointsAgainst)
    if (typeof team.playoffSeed === 'number' && Number.isInteger(team.playoffSeed) && team.playoffSeed > 0) {
      seeds.set(id, team.playoffSeed)
    }
    const owners = Array.isArray(team.owners)
      ? team.owners.flatMap((owner) => typeof owner === 'string' && members.has(owner) ? [members.get(owner)!] : [])
      : []
    return {
      id,
      name: text(team.name) || [text(team.location), text(team.nickname)].filter(Boolean).join(' ') || `Team ${id}`,
      owner: owners.join(' & ') || 'Owner unavailable',
      wins: number(record.wins, true),
      losses: number(record.losses, true),
      ties: number(record.ties, true),
      pointsFor,
      pointsAgainst,
      pointDifferential: Math.round((pointsFor - pointsAgainst) * 100) / 100,
      // A current-season response cannot establish lifetime achievements.
      playoffAppearances: null,
      championshipAppearances: null,
      championshipsWon: null,
    }
  })
  if (new Set(teams.map((team) => team.id)).size !== teams.length) {
    throw new LeagueDataError(502, 'ESPN returned incomplete league data. Try again later.')
  }
  return {
    teams,
    seasonContext: { previousSeasonChampionTeamId: null },
    season,
    source: 'espn',
    fetchedAt: new Date().toISOString(),
    standingsTeamIds: seeds.size === teams.length && new Set(seeds.values()).size === teams.length
      ? [...teams].sort((a, b) => seeds.get(a.id)! - seeds.get(b.id)!).map((team) => team.id)
      : null,
  }
}

export async function fetchEspnLeague(env: NodeJS.ProcessEnv, fetcher: typeof fetch = fetch): Promise<LeagueDashboardData> {
  const leagueId = Number(env.ESPN_LEAGUE_ID)
  const season = Number(env.ESPN_SEASON)
  if (!Number.isSafeInteger(leagueId) || leagueId <= 0 || !Number.isInteger(season) || season < 2018 || season > 2100) {
    throw new LeagueDataError(503, 'League connection is not configured yet.')
  }
  const s2 = env.ESPN_S2?.trim()
  const swid = env.ESPN_SWID?.trim()
  if (Boolean(s2) !== Boolean(swid) || [s2, swid].some((value) => value && /[\r\n;]/.test(value))) {
    throw new LeagueDataError(503, 'League credentials need to be configured on the server.')
  }
  const url = new URL(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}`)
  url.searchParams.append('view', 'mTeam')
  url.searchParams.append('view', 'mStandings')
  let response: Response
  try {
    response = await fetcher(url, {
      headers: s2 && swid ? { Cookie: `espn_s2=${s2}; SWID=${swid}`, Accept: 'application/json' } : { Accept: 'application/json' },
      signal: AbortSignal.timeout(12_000),
      redirect: 'error',
    })
  } catch {
    throw new LeagueDataError(502, 'ESPN is temporarily unavailable. Try again later.')
  }
  if (response.status === 401 || response.status === 403) {
    throw new LeagueDataError(503, 'ESPN access needs attention. Check the server-side league credentials.')
  }
  if (response.status === 404) {
    throw new LeagueDataError(503, 'The configured ESPN league or season was not found.')
  }
  if (!response.ok) throw new LeagueDataError(502, 'ESPN is temporarily unavailable. Try again later.')
  let payload: unknown
  try { payload = await response.json() } catch {
    throw new LeagueDataError(502, 'ESPN returned incomplete league data. Try again later.')
  }
  return normalizeEspnLeague(payload, leagueId, season)
}
