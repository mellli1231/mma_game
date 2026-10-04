import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreatureSprite, FpBadge, Modal, TimerRing } from '@/app/components'
import { useGameState } from '@/app/store'
import { CREATURES } from '@/data/creatures'
import { platform } from '@/platform/platform'

const TICK_MS = 250
const FLAVOR_ROTATE_MS = 20_000
const HALFWAY = 0.5
const ALMOST_DONE = 0.9

const ELEMENT_PLACE = { fire: 'the Ember Caves', water: 'Tidepool Grotto', grass: 'the Mossy Hollow' } as const

function formatRemaining(ms: number) {
  const total = Math.ceil(Math.max(0, ms) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function AdventureActive() {
  const state = useGameState()
  const navigate = useNavigate()
  const session = state?.activeSession ?? null
  const [now, setNow] = useState(() => Date.now())
  const [giveUpOpen, setGiveUpOpen] = useState(false)
  const [showSites, setShowSites] = useState(false)
  const [flavorTick, setFlavorTick] = useState(0)
  const [milestone, setMilestone] = useState<'half' | 'almost' | null>(null)
  const shown = useRef(new Set<string>())

  // RUN-02: remaining time always comes from endsAt - Date.now(), never a counter.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setFlavorTick(t => t + 1), FLAVOR_ROTATE_MS)
    return () => window.clearInterval(id)
  }, [])

  const endsAt = session?.endsAt ?? null
  const remaining = endsAt === null ? 0 : endsAt - now

  // RUN-03: tab title shows the time left.
  useEffect(() => {
    if (endsAt === null) return
    document.title = `${formatRemaining(remaining)} · Focu`
  }, [endsAt, remaining])
  useEffect(() => {
    const original = document.title
    return () => {
      document.title = original
    }
  }, [])

  // RUN-07: at zero ask the background to complete. The route guard then moves us to the result.
  const due = endsAt !== null && remaining <= 0
  useEffect(() => {
    if (!due) return
    let cancelled = false
    const check = async () => {
      await platform.checkSession()
      if (!cancelled) window.setTimeout(check, 1000)
    }
    check()
    return () => {
      cancelled = true
    }
  }, [due])

  // Milestone lines (50% and 90%) each show once, for one rotation window.
  const total = session ? session.endsAt - session.startedAt : 0
  const progress = total > 0 ? 1 - remaining / total : 1
  useEffect(() => {
    const next = progress >= ALMOST_DONE ? 'almost' : progress >= HALFWAY ? 'half' : null
    if (!next || shown.current.has(next)) return
    shown.current.add(next)
    setMilestone(next)
    const id = window.setTimeout(() => setMilestone(null), FLAVOR_ROTATE_MS)
    return () => window.clearTimeout(id)
  }, [progress])

  if (!state || !session) return null

  const lead = state.creatures.find(c => c.uid === state.squad[0]) ?? state.creatures[0]
  const def = lead ? CREATURES[lead.defId] : null
  const name = def?.name ?? 'Your Lockling'

  const lines = [
    `${name} is exploring ${def ? ELEMENT_PLACE[def.element] : 'the trail'}...`,
    'Distractions are getting weaker. Keep going.',
    'Your Locklings can feel your focus.',
    'The Algorithm hates this one simple trick: closing the tab.',
  ]
  const milestoneLine =
    milestone === 'almost' ? 'Almost done. Don’t lose the trail now!' :
    milestone === 'half' ? `Halfway there! ${name} found something shiny.` : null
  const flavor = milestoneLine ?? lines[flavorTick % lines.length]

  const blockedCount = session.siteIds.length + session.customDomains.length

  const giveUp = async () => {
    await platform.abandonSession('gave_up')
    setGiveUpOpen(false)
    navigate('/adventure/result', { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-4 p-4 text-center">
      <span className="focu-tag bg-lavender">
        {session.tierName} · {session.rate} FP/min
      </span>

      <div className="focu-card flex flex-col items-center gap-4 p-6 pb-10">
        <p className="text-soft">{name} is exploring...</p>
        <div className="relative">
          <TimerRing startedAt={session.startedAt} endsAt={session.endsAt} size={320} />
          {lead && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <CreatureSprite defId={lead.defId} uid={lead.uid} size={72} />
            </div>
          )}
        </div>

        <p className="mt-8 min-h-tap" aria-live="polite">{flavor}</p>
        <div className="flex items-center gap-2">
          <FpBadge amount={session.projectedFp} />
          <span className="text-sm text-muted">when you finish</span>
        </div>
      </div>

      <div className="focu-card mt-auto w-full space-y-2 p-4">
        <button
          type="button"
          aria-expanded={showSites}
          onClick={() => setShowSites(v => !v)}
          className="focu-chip text-sm"
        >
          {blockedCount} {blockedCount === 1 ? 'site' : 'sites'} blocked
        </button>
        {showSites && (
          <ul className="flex flex-wrap justify-center gap-2 text-sm">
            {session.siteIds.map(id => (
              <li key={id} className="focu-pill !min-h-0 !py-0.5 text-sm">{id}</li>
            ))}
            {session.customDomains.map(d => (
              <li key={d} className="focu-pill !min-h-0 !py-0.5 text-sm">{d}</li>
            ))}
          </ul>
        )}
        <div>
          <button type="button" onClick={() => setGiveUpOpen(true)} className="min-h-tap text-sm text-muted underline">
            Give up
          </button>
        </div>
      </div>

      <Modal
        open={giveUpOpen}
        title="Give up this Adventure?"
        onClose={() => setGiveUpOpen(false)}
        actions={
          <>
            <button type="button" onClick={() => setGiveUpOpen(false)} className="focu-btn focu-btn--primary">
              Stay locked in
            </button>
            <button type="button" onClick={giveUp} className="focu-link-danger min-h-tap px-2">
              Give up
            </button>
          </>
        }
      >
        <p>You’ll earn 0 FP (you’d lose {session.projectedFp} FP).</p>
      </Modal>
    </main>
  )
}
