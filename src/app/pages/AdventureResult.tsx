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
      <div className="focu-card space-y-4 p-6">
        <h1 className="focu-title">Adventure Complete!</h1>
        <div className="victory-stamp inline-block" aria-label={`${session.awardedFp} FP earned`}>
          +{fp} FP
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Summary label="Duration" value={`${session.durationMin} min`} />
          <Summary label="Sites blocked" value={String(sites)} />
          <Summary label="Multiplier" value={`x${session.multiplier}`} />
          <Summary label="Tier" value={session.tierName} />
        </dl>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/gyms" className="focu-btn !bg-fire">Let’s Battle!</Link>
        <Link to="/dojo" className="focu-btn focu-btn--confirm">Visit the Dojo</Link>
        <Link to="/" className="focu-btn focu-btn--primary">Back Home</Link>
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
      <div className="focu-card space-y-3 p-6">
        <h1 className="focu-title !text-3xl">
          {lead ? `${CREATURES[lead.defId].name} sat down.` : 'Lost Adventure'}
        </h1>
        <p className="text-soft">Lost Adventure. No FP this time, but every Trail is a fresh start.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to={`/adventure/setup?minutes=${shorter}`}
          className="focu-btn focu-btn--primary"
        >
          Try a shorter Trail
        </Link>
        <Link to="/" className="focu-btn focu-btn--secondary">Back Home</Link>
      </div>
    </main>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-[2.5px] border-ink bg-points p-3">
      <dd className="font-display text-lg font-semibold">{value}</dd>
      <dt className="text-muted">{label}</dt>
    </div>
  )
}
