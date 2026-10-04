import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLockup from '@/app/BrandLockup'
import { CreatureSprite, ElementBadge, useToast } from '@/app/components'
import { STARTER_IDS, WELCOME_FP } from '@/data/config'
import { CREATURES } from '@/data/creatures'
import { MOVES } from '@/data/moves'
import { completeOnboarding } from '@/engine/onboarding'
import { platform } from '@/platform/platform'

// TODO: move to src/data/config.ts (B) as TRAINER_NAME_MAX.
const TRAINER_NAME_MAX = 16
const DEFAULT_TRAINER_NAME = 'Trainer'

type Step = 'welcome' | 'name' | 'companion'
type StarterId = (typeof STARTER_IDS)[number]

export default function Onboarding() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [starter, setStarter] = useState<StarterId | null>(null)
  const [saving, setSaving] = useState(false)

  const trainer = name.trim() || DEFAULT_TRAINER_NAME

  async function confirm() {
    if (!starter || saving) return
    setSaving(true)
    await platform.updateState(s => completeOnboarding(s, trainer, starter))
    toast(`Welcome, ${trainer}! Here are ${WELCOME_FP} FP to get started.`)
    navigate('/', { replace: true })
  }

  if (step === 'welcome') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
        <BrandLockup size="lg" />
        <div className="focu-card flex gap-4 px-6 py-3 text-5xl" aria-hidden="true">
          {STARTER_IDS.map(id => <span key={id}>{CREATURES[id].emoji}</span>)}
        </div>
        <button
          className="focu-btn focu-btn--primary"
          onClick={() => setStep('name')}
        >
          Start
        </button>
      </main>
    )
  }

  if (step === 'name') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="focu-card flex w-full flex-col items-center gap-6 p-8">
        <h1 className="focu-title !text-3xl">What should we call you?</h1>
        <input
          value={name}
          maxLength={TRAINER_NAME_MAX}
          placeholder={DEFAULT_TRAINER_NAME}
          aria-label="Trainer name"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setStep('companion')}
          className="focu-input w-full text-center"
        />
        <button
          className="focu-btn focu-btn--primary"
          onClick={() => setStep('companion')}
        >
          Next
        </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-6">
      <h1 className="focu-title focu-panel px-6 py-1">Pick your companion</h1>
      <div className="grid w-full gap-4 sm:grid-cols-3">
        {STARTER_IDS.map(id => {
          const def = CREATURES[id]
          const selected = starter === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setStarter(id)}
              className={`focu-card flex flex-col items-center gap-2 p-4 text-center transition-transform duration-short ease-airy motion-reduce:transition-none ${
                selected ? 'creature-card--selected -translate-y-1' : ''
              }`}
            >
              <CreatureSprite defId={id} size={96} state={selected ? 'hop' : 'idle'} />
              <span className="font-display text-xl">{def.name}</span>
              <ElementBadge element={def.element} />
              <p className="text-sm text-muted">{def.description}</p>
              <ul className="text-sm">
                {def.defaultMoveIds.map(moveId => <li key={moveId}>{MOVES[moveId].name}</li>)}
              </ul>
            </button>
          )
        })}
      </div>
      <button
        disabled={!starter || saving}
        onClick={confirm}
        className="focu-btn focu-btn--primary"
      >
        {starter ? `Choose ${CREATURES[starter].name}!` : 'Choose a companion'}
      </button>
    </main>
  )
}
