import { useEffect, useState } from 'react'
import type { ChampionsRollData } from './types/league'

type RollState = { status: 'loading' | 'error' } | { status: 'ready'; data: ChampionsRollData }

export function ChampionsRoll() {
  const [requested, setRequested] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<RollState>({ status: 'loading' })

  useEffect(() => {
    if (!requested) return
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/standings?view=champions', { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) throw new Error('Champions Roll unavailable')
        const data: ChampionsRollData = await response.json()
        if (!Array.isArray(data.finals) || !Array.isArray(data.unavailableSeasons)) throw new Error('Invalid results')
        if (!controller.signal.aborted) setState({ status: 'ready', data })
      } catch {
        if (!controller.signal.aborted) setState({ status: 'error' })
      }
    }
    void load()
    return () => controller.abort()
  }, [requested, attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <section className="standings-section" aria-labelledby="champions-roll-title">
      <div className="section-header">
        <div><span className="eyebrow">League History</span><h2 id="champions-roll-title">Champions Roll</h2></div>
      </div>
      <details className="champions-roll" onToggle={(event) => { if (event.currentTarget.open) setRequested(true) }}>
        <summary>Browse championship finals</summary>
        {state.status === 'ready' ? <>
          {state.data.finals.length > 0 && <div className="standings-table" role="region" aria-label="Championship finals, scroll horizontally for all results" tabIndex={0}>
            <table className="standings-data champions-data" aria-label="Completed season championship finals">
              <thead><tr><th scope="col">Season</th><th scope="col">Champion</th><th scope="col">Runner-up</th><th scope="col">Final score</th></tr></thead>
              <tbody>{state.data.finals.map((final) => (
                <tr key={final.season}>
                  <th scope="row"><a href={`?season=${final.season}`} aria-label={`View ${final.season} standings`}>{final.season}</a></th>
                  <td><strong>{final.teamName}</strong></td><td>{final.runnerUpName}</td>
                  <td>{final.winningPoints.toFixed(1)}–{final.runnerUpPoints.toFixed(1)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>}
          {state.data.finals.length === 0 && <p role="status">No verified championship finals are available.</p>}
          {state.data.unavailableSeasons.length > 0 && <div className="league-actions">
            <p role="status">Results unavailable for {state.data.unavailableSeasons.join(', ')}.</p>
            <button type="button" onClick={retry}>Try again</button>
          </div>}
        </> : state.status === 'error' ? <div className="league-actions">
          <p role="status">Championship finals couldn’t be loaded.</p><button type="button" onClick={retry}>Try again</button>
        </div> : <p role="status">Loading championship finals…</p>}
      </details>
    </section>
  )
}
