import type { ReactNode } from 'react'

interface TimerRingProps {
  startedAt: number
  endsAt: number
  size?: number
  children?: ReactNode
}

export function TimerRing({ startedAt, endsAt, size = 320, children }: TimerRingProps) {
  const total = Math.max(1, endsAt - startedAt)
  const remaining = Math.max(0, endsAt - Date.now())
  const frac = 1 - remaining / total
  return (
    <div
      className="relative flex items-center justify-center rounded-full border-8 border-ring-track"
      style={{ width: size, height: size, borderColor: 'var(--color-ring-track)' }}
    >
      <div
        className="absolute inset-0 rounded-full border-8 border-primary"
        style={{ clipPath: `inset(0 ${Math.max(0, (1 - frac) * 100)}% 0 0)` }}
      />
      <div className="relative z-10 font-display text-timer tabular-nums text-primary">{children}</div>
    </div>
  )
}
