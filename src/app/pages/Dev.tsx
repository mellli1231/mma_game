import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CREATURES } from '@/data/creatures'
import { DESCRIPTIONS, FIXTURES, SESSION_FIXTURES, SESSION_FIXTURE_SITES } from '@/dev/fixtures'
import { DEFAULT_STATE } from '@/platform/defaultState'
import type { FixtureId } from '@/types'
import { platform } from '@/platform/platform'
import { useGameState } from '@/app/store'

const GYM_LEVELS = [1, 2, 3, 4, 5]

export default function Dev() {
  const state = useGameState()
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function load(id: FixtureId) {
    setError(null)
    setLoaded(null)
    setNotice(null)
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

  // The confirmation is built from the live state, so it shows what actually loaded.
  const demoSummary = state && loaded === 'demoSave'
    ? `Demo save loaded: ${state.creatures.map(c => CREATURES[c.defId]?.name ?? c.defId).join(' + ')}, ` +
      `${state.fp} FP, Gym ${state.currentGymLevel}, Demo Mode ${state.settings.demoMode ? 'on' : 'off'}`
    : null

  async function finishNow() {
    await platform.updateState(s =>
      s.activeSession ? { ...s, activeSession: { ...s.activeSession, endsAt: Date.now() } } : s,
    )
    await platform.checkSession()
  }

  // A quick action changes the save, so no preset can still claim to be loaded.
  async function quick(message: string, action: () => Promise<unknown>) {
    setError(null)
    setLoaded(null)
    await action()
    setNotice(message)
  }

  const btn = 'focu-chip'

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="focu-title focu-panel inline-block px-5 py-1">Dev</h1>
      <p className="focu-card p-4">Developer tools. Every fixture button REPLACES your whole saved game with a preset. Use them to jump to a game state quickly.</p>

      <section className="focu-card space-y-2 p-5">
        <h2>Presets (replace your save)</h2>
        {/* SET-02: stays visible with Demo Mode off, because loading it is how a fresh save gets Demo Mode on. */}
        <div><button className={btn} onClick={() => load('demoSave')}>Load demo save</button></div>
        {demoSummary && <p className="font-bold text-grass-ink">{demoSummary}</p>}
        {(Object.keys(FIXTURES) as FixtureId[]).map(id => (
          <div
            key={id}
            className={`flex items-center gap-3 rounded-card border p-2 ${loaded === id ? 'border-primary bg-lavender' : 'border-transparent'}`}
          >
            <button className={btn} onClick={() => load(id)}>{id}</button>
            <span>{DESCRIPTIONS[id]}{loaded === id && ' (Loaded)'}</span>
          </div>
        ))}
        {loaded && <p className="font-bold text-grass-ink">Loaded fixture: {loaded}</p>}
        {error && <p role="alert" className="font-bold text-danger">{error}</p>}
      </section>

      <section className="focu-card space-y-2 p-5">
        <h2>Quick actions (Demo Mode only)</h2>
        {/* SET-02: only the quick actions are gated. Presets above stay open so a fresh save can load one. */}
        {state?.settings.demoMode ? (
          <>
            <div className="flex items-center gap-3">
              <button
                className={btn}
                onClick={() => quick('Added 1000 FP', () => platform.updateState(s => ({ ...s, fp: s.fp + 1000, lifetimeFp: s.lifetimeFp + 1000 })))}
              >+1000 FP</button>
              <span>Adds 1000 FP to your current save</span>
            </div>
            {state.activeSession && (
              <div className="flex items-center gap-3">
                {/* DEV-ONLY exception to "the background is the only writer of activeSession": it only
                    moves endsAt to now. The FP award itself still happens in the background via checkSession. */}
                <button className={btn} onClick={() => quick('Finished the Adventure', finishNow)}>Finish Adventure now</button>
                <span>Ends your current Adventure now so FP is awarded</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                className={btn}
                onClick={() => quick('Reset to a brand-new save', () => platform.updateState(() => structuredClone(DEFAULT_STATE)))}
              >Reset all</button>
              <span>Wipes everything back to a brand-new save</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                {GYM_LEVELS.map(level => (
                  <button
                    key={level}
                    className={btn}
                    onClick={() => quick(`Gym level set to ${level}`, () => platform.updateState(s => ({ ...s, currentGymLevel: level })))}
                  >Set gym level {level}</button>
                ))}
              </div>
              <p>Jump to a gym to test its battle background.</p>
            </div>
          </>
        ) : (
          <p>
            Turn on Demo Mode in <Link to="/settings" className="text-primary underline">Settings</Link> to use the dev panel.
          </p>
        )}
        {notice && !loaded && <p className="font-bold text-grass-ink">{notice}</p>}
      </section>

      <section className="focu-card space-y-2 p-5">
        <h2>Current save</h2>
        <p>What is saved right now. It updates live.</p>
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
      </section>
    </div>
  )
}
