import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

interface TimerRingProps {
  startedAt: number
  endsAt: number
  size?: number
  children?: ReactNode
}

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatRemaining(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function TimerRing({ startedAt, endsAt, size = 320, children }: TimerRingProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [])

  const total = Math.max(1, endsAt - startedAt)
  const remaining = Math.max(0, endsAt - now)
  const progress = Math.min(1, Math.max(0, (total - remaining) / total))
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div
      className="timer-ring relative grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, '--timer-font-size': `${Math.max(18, size * 0.28)}px` } as CSSProperties}
      role="timer"
      aria-label={`${formatRemaining(remaining)} remaining`}
      aria-live="off"
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="timer-ring__track" cx="50" cy="50" r={RADIUS} fill="none" />
        <circle
          className="timer-ring__progress"
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="relative z-10 font-display tabular-nums text-primary" style={{ fontSize: 'var(--timer-font-size)', lineHeight: 1 }}>
        {children ?? formatRemaining(remaining)}
      </div>
    </div>
  )
}
