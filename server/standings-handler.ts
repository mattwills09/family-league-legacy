import type { IncomingMessage, ServerResponse } from 'node:http'
import { fetchEspnLeague, LeagueDataError } from './espn.ts'

export async function handleStandings(req: IncomingMessage, res: ServerResponse, env: NodeJS.ProcessEnv = process.env) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // No shared/CDN cache for private-league data.
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed.' }))
    return
  }
  try {
    const seasons = new URL(req.url ?? '/api/standings', 'http://localhost').searchParams.getAll('season')
    if (seasons.length > 1 || (seasons.length === 1 && !/^\d{4}$/.test(seasons[0]))) {
      throw new LeagueDataError(400, 'Select the current or previous season.')
    }
    res.end(JSON.stringify(await fetchEspnLeague(env, fetch, seasons.length ? Number(seasons[0]) : undefined)))
  } catch (error) {
    res.statusCode = error instanceof LeagueDataError ? error.status : 500
    res.end(JSON.stringify({ error: error instanceof LeagueDataError ? error.message : 'League data is temporarily unavailable.' }))
  }
}
