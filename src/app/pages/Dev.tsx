import { useState } from 'react'
import { FIXTURES, SESSION_FIXTURES, SESSION_FIXTURE_SITES } from '@/dev/fixtures'
import { DEFAULT_STATE, type FixtureId } from '@/dev/stubTypes'
import { platform } from '@/platform/platform'

// TODO: hide this page's contents unless settings.demoMode is on, once Settings exists.
export default function Dev() {
  const [error, setError] = useState<string | null>(null)

  async function load(id: FixtureId) {
    setError(null)
    await platform.updateState(() => FIXTURES[id]())
    const sess = SESSION_FIXTURES[id]
    if (sess) {
      const res = await platform.startSession({
        durationMin: sess.durationMin, siteIds: SESSION_FIXTURE_SITES, customDomains: [],
      })
      if (!res.ok) setError(`${id}: ${res.error}`)
    }
  }

  return (
    <div className="p-4 space-y-2">
      <h1>Dev</h1>
      {(Object.keys(FIXTURES) as FixtureId[]).map(id => (
        <div key={id}><button onClick={() => load(id)}>{id}</button></div>
      ))}
      <div><button onClick={() => platform.updateState(s => ({ ...s, fp: s.fp + 1000, lifetimeFp: s.lifetimeFp + 1000 }))}>+1000 FP</button></div>
      <div><button onClick={() => platform.updateState(() => structuredClone(DEFAULT_STATE))}>Reset all</button></div>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
