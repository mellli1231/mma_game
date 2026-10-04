import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

interface TimerRingProps {
  startedAt: number
  endsAt: number
  size?: number
  children?: ReactNode
}

// Drawn on a 170 unit canvas: outer ring r76, inner ring r48, track and progress r62.
const VIEW = 170
const CENTER = VIEW / 2
const RADIUS = 62
const OUTER_RADIUS = 76
const INNER_RADIUS = 48
const FONT_RATIO = 30 / 170
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
      style={{ width: size, height: size, '--timer-font-size': `${Math.max(16, size * FONT_RATIO)}px` } as CSSProperties}
      role="timer"
      aria-label={`${formatRemaining(remaining)} remaining`}
      aria-live="off"
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden="true">
        <circle className="timer-ring__edge" cx={CENTER} cy={CENTER} r={OUTER_RADIUS} fill="none" />
        <circle className="timer-ring__edge" cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="none" />
        <circle className="timer-ring__track" cx={CENTER} cy={CENTER} r={RADIUS} fill="none" />
        <circle
          className="timer-ring__progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="relative z-10 font-display font-bold tabular-nums text-ink" style={{ fontSize: 'var(--timer-font-size)', lineHeight: 1 }}>
        {children ?? formatRemaining(remaining)}
      </div>
    </div>
  )
}
