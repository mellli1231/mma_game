import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Confetti, CreatureSprite } from '@/app/components'
import { unseenEndedSession } from '@/app/sessionRoutes'
import { useGameState } from '@/app/store'
import { SESSION_MIN_MIN } from '@/background/constants'
import { CREATURES } from '@/data/creatures'
import { platform } from '@/platform/platform'
import type { FocusSession } from '@/types'

const COUNT_UP_MS = 1500
const SHORTER_STEP = 5

export default function AdventureResult() {
  const state = useGameState()
  // Captured once so marking the session seen does not make the screen disappear.
  const [session, setSession] = useState<FocusSession | null>(null)
  const [empty, setEmpty] = useState(false)
  const captured = useRef(false)

  useEffect(() => {
    if (!state || captured.current) return
    captured.current = true
    const unseen = unseenEndedSession(state)
    if (!unseen) {
      setEmpty(true)
      return
    }
    setSession(unseen)
    // DONE-05: mark seen on mount so a reload or revisit does not replay the screen.
    platform.updateState(s => ({ ...s, lastSeenSessionId: unseen.id }))
  }, [state])

  if (!state) return null
  if (!session) return empty ? <Navigate to="/" replace /> : null

  return session.status === 'completed'
    ? <Complete session={session} />
    : <Lost session={session} />
}

function useCountUp(target: number) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_MS)
      setValue(Math.round(target * t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value
}

function Complete({ session }: { session: FocusSession }) {
  const state = useGameState()
  const fp = useCountUp(session.awardedFp)
  const lead = state?.creatures.find(c => c.uid === state.squad[0])
  const sites = session.siteIds.length + session.customDomains.length
  return (
    <main className="mx-auto max-w-xl space-y-6 p-4 text-center">
      <Confetti fire />
      {lead && <CreatureSprite defId={lead.defId} uid={lead.uid} size={120} state="celebrate" />}
      <h1 className="font-display text-4xl">Adventure Complete!</h1>
      <div className="font-display text-6xl text-fp-gold tabular-nums" aria-label={`${session.awardedFp} FP earned`}>
        +{fp} FP
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Summary label="Duration" value={`${session.durationMin} min`} />
        <Summary label="Sites blocked" value={String(sites)} />
        <Summary label="Multiplier" value={`x${session.multiplier}`} />
        <Summary label="Tier" value={session.tierName} />
      </dl>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/gyms" className="flex min-h-tap items-center justify-center rounded-card bg-fire p-3 font-display text-white">Let’s Battle!</Link>
        <Link to="/dojo" className="flex min-h-tap items-center justify-center rounded-card bg-grass p-3 font-display text-white">Visit the Dojo</Link>
        <Link to="/" className="flex min-h-tap items-center justify-center rounded-card bg-primary p-3 font-display text-white">Back Home</Link>
      </div>
    </main>
  )
}

function Lost({ session }: { session: FocusSession }) {
  const state = useGameState()
  const lead = state?.creatures.find(c => c.uid === state.squad[0])
  // DONE-03: half the previous duration, rounded down to the nearest 5, minimum 5.
  const shorter = Math.max(SESSION_MIN_MIN, Math.floor(session.durationMin / 2 / SHORTER_STEP) * SHORTER_STEP)
  return (
    <main className="mx-auto max-w-xl space-y-6 p-4 text-center">
      {lead && <CreatureSprite defId={lead.defId} uid={lead.uid} size={120} state="sleepy" showParticles={false} />}
      <h1 className="font-display text-3xl text-muted">
        {lead ? `${CREATURES[lead.defId].name} sat down.` : 'Lost Adventure'}
      </h1>
      <p className="text-muted">Lost Adventure. No FP this time, but every Trail is a fresh start.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to={`/adventure/setup?minutes=${shorter}`}
          className="flex min-h-tap items-center justify-center rounded-card bg-primary p-3 font-display text-white"
        >
          Try a shorter Trail
        </Link>
        <Link to="/" className="flex min-h-tap items-center justify-center rounded-card bg-ring-track p-3 font-display">Back Home</Link>
      </div>
    </main>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-surface p-3 shadow-card">
      <dd className="font-display text-lg">{value}</dd>
      <dt className="text-muted">{label}</dt>
    </div>
  )
}
