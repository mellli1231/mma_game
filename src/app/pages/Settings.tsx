import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '@/app/components'
import { useGameState } from '@/app/store'
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
        <h1 className="font-display text-3xl">Settings</h1>
        <Link to={sessionActive ? '/adventure' : '/'} className="flex min-h-tap items-center text-primary underline">Back</Link>
      </header>

      <section className="rounded-card bg-surface p-4 shadow-card">
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
            className={`min-h-tap min-w-tap rounded-pill px-4 font-display disabled:opacity-50 ${demo ? 'bg-primary text-white' : 'bg-ring-track text-ink'}`}
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

      <section className="rounded-card bg-surface p-4 shadow-card">
        <h2 className="font-display text-xl">Reset</h2>
        <p className="mb-3 text-sm text-muted">Erase your Locklings, FP and history and start again.</p>
        <button
          type="button"
          onClick={() => setStep('first')}
          className="min-h-tap rounded-card border border-danger px-4 font-display text-danger"
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
            <button type="button" onClick={() => setStep('closed')} className="min-h-tap rounded-card bg-primary px-4 font-display text-white">
              Keep my progress
            </button>
            <button type="button" onClick={() => setStep('second')} className="min-h-tap px-4 text-danger underline">
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
            <button type="button" disabled={busy} onClick={() => setStep('closed')} className="min-h-tap rounded-card bg-primary px-4 font-display text-white">
              Cancel
            </button>
            <button type="button" disabled={busy} onClick={resetAll} className="min-h-tap px-4 text-danger underline">
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
