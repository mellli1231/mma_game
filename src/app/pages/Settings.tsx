import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '@/app/components'
import { useGameState } from '@/app/store'
import { playSfx } from '@/app/sfx'
import { DEFAULT_STATE } from '@/platform/defaultState'
import { platform } from '@/platform/platform'

type ResetStep = 'closed' | 'first' | 'second'

export default function Settings() {
  const state = useGameState()
  const [step, setStep] = useState<ResetStep>('closed')
  const [busy, setBusy] = useState(false)
  if (!state) return null

  const sessionActive = state.activeSession !== null
  const demo = state.settings.demoMode

  // SET-01 / E21: Demo Mode cannot change during an Adventure.
  const toggleDemo = () =>
    platform.updateState(s => (s.activeSession ? s : { ...s, settings: { ...s.settings, demoMode: !s.settings.demoMode } }))

  // A missing value counts as on, same as SfxSync.
  const soundOn = state.settings.sound !== false
  const toggleSound = () =>
    platform.updateState(s => ({ ...s, settings: { ...s.settings, sound: s.settings.sound === false } }))

  // SET-03: end any session first (the background clears block rules), then wipe the save.
  // The onboarding guard then sends the player back to the welcome screen.
  const resetAll = async () => {
    setBusy(true)
    if (state.activeSession) await platform.abandonSession('gave_up')
    await platform.updateState(() => structuredClone(DEFAULT_STATE))
    setBusy(false)
    setStep('closed')
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="focu-title focu-panel px-5 py-1">Settings</h1>
        <Link to={sessionActive ? '/adventure' : '/'} className="focu-pill text-primary underline">Back</Link>
      </header>

      <section className="focu-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">Demo Mode</h2>
            <p className="text-sm text-muted">Adventures run 60x faster and can be as short as 1 minute.</p>
            {sessionActive && <p className="mt-1 text-sm text-muted">Finish or leave your Adventure to change this.</p>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={demo}
            aria-label="Demo Mode"
            disabled={sessionActive}
            onClick={toggleDemo}
            className="focu-chip"
          >
            {demo ? 'On' : 'Off'}
          </button>
        </div>
        {demo && (
          <p className="mt-3 text-sm">
            <Link to="/dev" className="text-primary underline">Open the dev panel</Link>
          </p>
        )}
      </section>

      <section className="focu-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">Sound effects</h2>
            <p className="text-sm text-muted">Hear attacks, heals and victory jingles in battle.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundOn}
            aria-label="Sound effects"
            onClick={toggleSound}
            className="focu-chip min-h-[44px] min-w-[44px]"
          >
            {soundOn ? 'On' : 'Off'}
          </button>
        </div>
        <div className="mt-3">
          <button type="button" disabled={!soundOn} onClick={() => playSfx('healing')} className="focu-chip">
            Play test sound
          </button>
        </div>
      </section>

      <section className="focu-card p-5">
        <h2 className="font-display text-xl">Reset</h2>
        <p className="mb-3 text-sm text-muted">Erase your Locklings, FP and history and start again.</p>
        <button
          type="button"
          onClick={() => setStep('first')}
          className="focu-btn focu-btn--danger"
        >
          Reset all progress
        </button>
      </section>

      <Modal
        open={step === 'first'}
        title="Reset all progress?"
        onClose={() => setStep('closed')}
        actions={
          <>
            <button type="button" onClick={() => setStep('closed')} className="focu-btn focu-btn--primary">
              Keep my progress
            </button>
            <button type="button" onClick={() => setStep('second')} className="focu-link-danger min-h-tap px-2">
              Continue
            </button>
          </>
        }
      >
        <p>This erases everything{sessionActive ? ' and ends your current Adventure' : ''}.</p>
      </Modal>

      <Modal
        open={step === 'second'}
        title="Are you really sure?"
        onClose={() => setStep('closed')}
        actions={
          <>
            <button type="button" disabled={busy} onClick={() => setStep('closed')} className="focu-btn focu-btn--primary">
              Cancel
            </button>
            <button type="button" disabled={busy} onClick={resetAll} className="focu-link-danger min-h-tap px-2">
              Yes, erase everything
            </button>
          </>
        }
      >
        <p>This cannot be undone.</p>
      </Modal>
    </main>
  )
}
