import { useState } from 'react'
import { FIXTURES, SESSION_FIXTURES, SESSION_FIXTURE_SITES } from '@/dev/fixtures'
import { DEFAULT_STATE } from '@/platform/defaultState'
import type { FixtureId } from '@/types'
import { platform } from '@/platform/platform'
import { useGameState } from '@/app/store'

// TODO: hide this page's contents unless settings.demoMode is on, once Settings exists.
export default function Dev() {
  const state = useGameState()
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<string | null>(null)

  async function load(id: FixtureId) {
    setError(null)
    setLoaded(null)
    await platform.updateState(() => FIXTURES[id]())
    const sess = SESSION_FIXTURES[id]
    if (sess) {
      const res = await platform.startSession({
        durationMin: sess.durationMin, siteIds: SESSION_FIXTURE_SITES, customDomains: [],
      })
      if (!res.ok) setError(`${id}: ${res.error}`)
    }
    setLoaded(id)
  }

  return (
    <div className="p-4 space-y-2">
      <h1>Dev</h1>
      {(Object.keys(FIXTURES) as FixtureId[]).map(id => (
        <div key={id}><button onClick={() => load(id)}>{id}</button></div>
      ))}
      <div><button onClick={() => platform.updateState(s => ({ ...s, fp: s.fp + 1000, lifetimeFp: s.lifetimeFp + 1000 }))}>+1000 FP</button></div>
      <div><button onClick={() => platform.updateState(() => structuredClone(DEFAULT_STATE))}>Reset all</button></div>
      {loaded && <p className="text-green-600">Loaded fixture: {loaded}</p>}
      {state ? (
        <ul>
          <li>Trainer: {state.trainerName || '(none)'}</li>
          <li>FP: {state.fp}</li>
          <li>Creatures: {state.creatures.length}</li>
          <li>Squad: {state.squad.map(uid => state.creatures.find(c => c.uid === uid)?.defId ?? uid).join(', ') || '(empty)'}</li>
          <li>Gym level: {state.currentGymLevel}</li>
          <li>Demo mode: {String(state.settings.demoMode)}</li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
      {error && <p role="alert" className="text-red-600">{error}</p>}
    </div>
  )
}
