import { useEffect, useState } from 'react'
import type { LeagueDashboardData } from '../components/types/league'

type LeagueState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'sample' }
  | { status: 'ready'; data: LeagueDashboardData }

function readSeasonFromUrl() {
  const values = new URLSearchParams(window.location.search).getAll('season')
  return values.length === 1 && /^\d{4}$/.test(values[0]) ? Number(values[0]) : null
}

export function useLeagueDashboard() {
  const [state, setState] = useState<LeagueState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [selectedSeason, setSelectedSeason] = useState(readSeasonFromUrl)
  const [seasonOptions, setSeasonOptions] = useState<{ current: number; available: number[] } | null>(null)
  useEffect(() => {
    function restoreSeason() {
      const season = readSeasonFromUrl()
      if (season !== selectedSeason) {
        setState({ status: 'loading' })
        setSelectedSeason(season)
      }
    }
    window.addEventListener('popstate', restoreSeason)
    return () => window.removeEventListener('popstate', restoreSeason)
  }, [selectedSeason])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(`/api/standings${selectedSeason === null ? '' : `?season=${selectedSeason}`}`, { signal: controller.signal, cache: 'no-store' })
        if (controller.signal.aborted || readSeasonFromUrl() !== selectedSeason) return
        if (response.status === 400 && selectedSeason !== null) {
          const url = new URL(window.location.href)
          url.searchParams.delete('season')
          window.history.replaceState(window.history.state, '', url)
          setSelectedSeason(null)
          return
        }
        if (!response.ok) throw new Error('League standings are unavailable. Please try again shortly.')
        const data: LeagueDashboardData = await response.json()
        if (data.source !== 'espn' || !Array.isArray(data.teams) || data.teams.length === 0) {
          throw new Error('No league standings are available yet.')
        }
        if (!controller.signal.aborted && readSeasonFromUrl() === selectedSeason) {
          const url = new URL(window.location.href)
          if (selectedSeason === null && url.searchParams.has('season')) {
            url.searchParams.delete('season')
            window.history.replaceState(window.history.state, '', url)
          }
          setState({ status: 'ready', data })
          setSeasonOptions({ current: data.currentSeason, available: data.availableSeasons })
        }
      } catch (error) {
        if (!controller.signal.aborted && readSeasonFromUrl() === selectedSeason) setState({ status: 'error', message: error instanceof Error ? error.message : 'League standings are unavailable.' })
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
    if (season === selectedSeason) return
    const url = new URL(window.location.href)
    url.searchParams.set('season', String(season))
    window.history.pushState(window.history.state, '', url)
    setState({ status: 'loading' })
    setSelectedSeason(season)
  }
  return { state, retry, selectSeason, seasonOptions, selectedSeason, showSample: () => setState({ status: 'sample' }) }
}
