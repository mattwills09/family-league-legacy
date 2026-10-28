import { useEffect, useState } from 'react'
import type { LeagueDashboardData } from '../components/types/league'

type LeagueState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: LeagueDashboardData }

export function useLeagueDashboard() {
  const [state, setState] = useState<LeagueState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [seasonOptions, setSeasonOptions] = useState<{ current: number; available: number[] } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(`/api/standings${selectedSeason === null ? '' : `?season=${selectedSeason}`}`, { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) throw new Error('League standings are unavailable. Please try again shortly.')
        const data: LeagueDashboardData = await response.json()
        if (data.source !== 'espn' || !Array.isArray(data.teams) || data.teams.length === 0) {
          throw new Error('No league standings are available yet.')
        }
        if (!controller.signal.aborted) {
          setState({ status: 'ready', data })
          setSeasonOptions({ current: data.currentSeason, available: data.availableSeasons })
        }
      } catch (error) {
        if (!controller.signal.aborted) setState({ status: 'error', message: error instanceof Error ? error.message : 'League standings are unavailable.' })
      }
    }
    void load()
    return () => controller.abort()
  }, [attempt, selectedSeason])
  function retry() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }
  function selectSeason(season: number) {
    setState({ status: 'loading' })
    setSelectedSeason(season)
  }
  return { state, retry, selectSeason, seasonOptions, selectedSeason }
}
