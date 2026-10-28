import type { LeagueDashboardData, SeasonChampion } from '../src/components/types/league.ts'

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
    currentSeason: season,
    availableSeasons: [season],
    seasonChampion: null,
    fetchedAt: new Date().toISOString(),
    standingsTeamIds: seeds.size === teams.length && new Set(seeds.values()).size === teams.length
      ? [...teams].sort((a, b) => seeds.get(a.id)! - seeds.get(b.id)!).map((team) => team.id)
      : null,
  }
}

/** Require a completed season and a unique championship final, not the regular-season seed. */
export function readSeasonChampion(payload: unknown): SeasonChampion | null {
  try { return parseSeasonChampion(payload) } catch { return null }
}

function parseSeasonChampion(payload: unknown): SeasonChampion | null {
  const league = object(payload)
  const settings = object(league.settings ?? {})
  const scheduleSettings = object(settings.scheduleSettings ?? {})
  const status = object(league.status ?? {})
  if (typeof status.finalScoringPeriod !== 'number' || typeof league.scoringPeriodId !== 'number' || league.scoringPeriodId <= status.finalScoringPeriod) return null
  if (!Array.isArray(league.schedule) || !Array.isArray(league.teams)) return null
  const periods = Object.keys(object(scheduleSettings.matchupPeriods ?? {})).map(Number).filter(Number.isFinite)
  if (!periods.length) return null
  const lastPeriod = Math.max(...periods)
  const finals = league.schedule.map(object).filter((game) => game.playoffTierType === 'WINNERS_BRACKET' && game.matchupPeriodId === lastPeriod)
  if (finals.length !== 1) return null
  const final = finals[0]
  if (final.winner !== 'HOME' && final.winner !== 'AWAY') return null
  const home = object(final.home)
  const away = object(final.away)
  if (home.teamId === away.teamId) return null
  const winner = final.winner === 'HOME' ? home : away
  const runnerUp = final.winner === 'HOME' ? away : home
  const team = league.teams.map(object).find((entry) => entry.id === winner.teamId)
  const opponent = league.teams.map(object).find((entry) => entry.id === runnerUp.teamId)
  if (!team || !opponent) return null
  const name = (entry: JsonObject) => text(entry.name) || [text(entry.location), text(entry.nickname)].filter(Boolean).join(' ') || `Team ${entry.id}`
  return {
    teamId: number(team.id, true), teamName: name(team),
    runnerUpName: name(opponent), runnerUpTeamId: number(opponent.id, true),
    thirdPlaceTeamId: readThirdPlace(league, lastPeriod, [number(team.id, true), number(opponent.id, true)]),
    winningPoints: number(winner.totalPoints), runnerUpPoints: number(runnerUp.totalPoints),
  }
}

/** ESPN's consolation ladder includes several placements. Identify the semifinal losers' game. */
function readThirdPlace(league: JsonObject, finalPeriod: number, finalists: number[]): number | null {
  try {
    if (!Array.isArray(league.schedule) || !Array.isArray(league.teams)) return null
    const games = league.schedule.map(object)
    const earlier = games.filter((game) => game.playoffTierType === 'WINNERS_BRACKET' && typeof game.matchupPeriodId === 'number' && game.matchupPeriodId < finalPeriod)
    const semifinalPeriod = Math.max(...earlier.map((game) => number(game.matchupPeriodId, true)))
    const semifinals = earlier.filter((game) => game.matchupPeriodId === semifinalPeriod)
    if (semifinals.length !== 2) return null
    const losers = semifinals.map((game) => {
      if (game.winner !== 'HOME' && game.winner !== 'AWAY') throw new Error('Undecided semifinal')
      const won = object(game.winner === 'HOME' ? game.home : game.away)
      const lost = object(game.winner === 'HOME' ? game.away : game.home)
      if (!finalists.includes(number(won.teamId, true)) || finalists.includes(number(lost.teamId, true))) throw new Error('Ambiguous semifinal')
      return { winner: number(won.teamId, true), loser: number(lost.teamId, true) }
    })
    if (new Set(losers.map((game) => game.winner)).size !== 2 || new Set(losers.map((game) => game.loser)).size !== 2) return null
    const ids = losers.map((game) => game.loser)
    const bronzeGames = games.filter((game) => {
      if (game.matchupPeriodId !== finalPeriod || game.playoffTierType !== 'WINNERS_CONSOLATION_LADDER') return false
      const home = object(game.home).teamId
      const away = object(game.away).teamId
      return home !== away && ids.includes(number(home, true)) && ids.includes(number(away, true))
    })
    if (bronzeGames.length !== 1) return null
    const game = bronzeGames[0]
    if (game.winner !== 'HOME' && game.winner !== 'AWAY') return null
    const id = number(object(game.winner === 'HOME' ? game.home : game.away).teamId, true)
    return league.teams.map(object).some((team) => team.id === id) ? id : null
  } catch { return null }
}

function sameOwners(current: unknown, previous: unknown, teamId: number): boolean {
  const owners = (payload: unknown) => {
    const league = object(payload)
    if (!Array.isArray(league.teams)) return []
    const team = league.teams.map(object).find((entry) => entry.id === teamId)
    return Array.isArray(team?.owners) ? team.owners.filter((id): id is string => typeof id === 'string').sort() : []
  }
  const a = owners(current)
  const b = owners(previous)
  return a.length > 0 && a.length === b.length && a.every((id, index) => id === b[index])
}

export async function fetchEspnLeague(env: NodeJS.ProcessEnv, fetcher: typeof fetch = fetch, requestedSeason?: number): Promise<LeagueDashboardData> {
  const leagueId = Number(env.ESPN_LEAGUE_ID)
  const currentSeason = Number(env.ESPN_SEASON)
  if (!Number.isSafeInteger(leagueId) || leagueId <= 0 || !Number.isInteger(currentSeason) || currentSeason < 2019 || currentSeason > 2100) {
    throw new LeagueDataError(503, 'League connection is not configured yet.')
  }
  const s2 = env.ESPN_S2?.trim()
  const availableSeasons = [currentSeason, currentSeason - 1]
  const season = requestedSeason ?? currentSeason
  if (!availableSeasons.includes(season)) throw new LeagueDataError(400, 'Select the current or previous season.')
  const swid = env.ESPN_SWID?.trim()
  if (Boolean(s2) !== Boolean(swid) || [s2, swid].some((value) => value && /[\r\n;]/.test(value))) {
    throw new LeagueDataError(503, 'League credentials need to be configured on the server.')
  }
  async function readSeason(year: number, playoffs: boolean): Promise<unknown> {
    const url = new URL(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${leagueId}`)
    url.searchParams.append('view', 'mTeam')
    url.searchParams.append('view', 'mStandings')
    if (playoffs) {
      url.searchParams.append('view', 'mSettings')
      url.searchParams.append('view', 'mMatchupScore')
    }
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
    normalizeEspnLeague(payload, leagueId, year)
    return payload
  }
  const payload = await readSeason(season, season !== currentSeason)
  const dashboard = normalizeEspnLeague(payload, leagueId, season)
  dashboard.currentSeason = currentSeason
  dashboard.availableSeasons = availableSeasons
  if (season !== currentSeason) {
    dashboard.seasonChampion = readSeasonChampion(payload)
  } else {
    // Optional history cannot take down valid current standings.
    try {
      const previous = await readSeason(currentSeason - 1, true)
      const champion = readSeasonChampion(previous)
      if (champion && sameOwners(payload, previous, champion.teamId)) dashboard.seasonContext.previousSeasonChampionTeamId = champion.teamId
    } catch { /* Unknown history keeps the badge absent. */ }
  }
  return dashboard
}
